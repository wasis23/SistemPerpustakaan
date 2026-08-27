<?php

namespace App\Console\Commands;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\Rack;
use App\Services\BarcodeService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportStockOpnameCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'simpus:import-stock-opname {file : Path ke file CSV Stock Opname}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Impor data buku & eksemplar fisik massal dari file Stock Opname CSV ke sistem SIMPUS';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');

        if (!file_exists($filePath)) {
            $this->error("File tidak ditemukan: {$filePath}");
            return 1;
        }

        $this->info("Membaca dan memproses file: {$filePath}...");

        $handle = fopen($filePath, 'r');
        if (!$handle) {
            $this->error("Gagal membuka file: {$filePath}");
            return 1;
        }

        $defaultCat = Category::first();
        $defaultRack = Rack::first();

        if (!$defaultCat || !$defaultRack) {
            $this->error("Tabel categories atau racks masih kosong. Jalankan db:seed terlebih dahulu.");
            fclose($handle);
            return 1;
        }

        $rows = [];
        $header = null;
        $lineNum = 0;

        // Auto detect delimiter
        $firstLine = fgets($handle);
        rewind($handle);
        $delimiter = ',';
        if ($firstLine !== false) {
            $countSemicolon = substr_count($firstLine, ';');
            $countComma = substr_count($firstLine, ',');
            $countTab = substr_count($firstLine, "\t");
            if ($countSemicolon > $countComma && $countSemicolon > $countTab) {
                $delimiter = ';';
            } elseif ($countTab > $countComma && $countTab > $countSemicolon) {
                $delimiter = "\t";
            }
        }

        while (($data = fgetcsv($handle, 8192, $delimiter)) !== false) {
            $lineNum++;
            if ($lineNum === 1) {
                // Check if first row is header
                $firstRowStr = strtolower(implode(' ', $data));
                if (str_contains($firstRowStr, 'judul') || str_contains($firstRowStr, 'title') || str_contains($firstRowStr, 'inventaris') || str_contains($firstRowStr, 'pengarang')) {
                    continue;
                }
            }

            if (count($data) < 2) continue;

            // Mapping kolom berdasarkan urutan Stock Opname (NO, JUDUL, KODE, PENGARANG, PENERBIT, KOTA TERBIT, TAHUN, ASAL, ISBN, EKS, INVENTARIS, BARCODE, KET)
            $title = trim($data[1] ?? $data[0] ?? '');
            if (empty($title) || strtolower($title) === 'judul' || strtolower($title) === 'no') continue;

            $kode = trim($data[2] ?? '');
            $author = trim($data[3] ?? '');
            $publisher = trim($data[4] ?? '');
            // Kota Terbit (data[5]) diabaikan
            $rawYear = trim($data[6] ?? '');
            $publishYear = is_numeric($rawYear) && (int)$rawYear > 1000 && (int)$rawYear <= ((int)date('Y') + 1) ? (int)$rawYear : (int)date('Y');
            $asal = trim($data[7] ?? '');
            $rawIsbn = trim($data[8] ?? '');
            $isbn = !empty($rawIsbn) ? preg_replace('/[^0-9X]/i', '', $rawIsbn) : null;
            $inventaris = trim($data[10] ?? '');
            $barcode = trim($data[11] ?? '');
            $ket = trim($data[12] ?? '');

            // Ekstraksi Tahun Pengadaan dari BARCODE atau ASAL
            $procurementYear = (int)date('Y');
            if (preg_match('/INDO(\d{2})/i', $barcode, $matches)) {
                $procurementYear = 2000 + (int)$matches[1];
            } elseif (preg_match('/20\d{2}/', $asal, $matches)) {
                $procurementYear = (int)$matches[0];
            } else {
                $procurementYear = $publishYear;
            }

            $rows[] = [
                'title' => $title,
                'kode' => $kode,
                'author' => !empty($author) ? $author : 'Penulis Tidak Diketahui',
                'publisher' => !empty($publisher) ? $publisher : 'Penerbit Impor',
                'publish_year' => $publishYear,
                'procurement_year' => $procurementYear,
                'isbn' => $isbn ?: null,
                'inventaris' => $inventaris,
                'barcode' => $barcode,
                'ket' => $ket,
            ];
        }

        fclose($handle);

        $this->info("Berhasil membaca " . count($rows) . " baris eksemplar. Mengelompokkan berdasarkan Judul/ISBN...");

        // Grouping berdasarkan ISBN (jika ada) atau Gabungan (Judul + Penulis)
        $grouped = [];
        foreach ($rows as $row) {
            if (!empty($row['isbn'])) {
                $groupKey = 'ISBN_' . $row['isbn'];
            } else {
                $cleanTitle = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $row['title']));
                $cleanAuthor = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $row['author']));
                $groupKey = 'TITLE_' . md5($cleanTitle . '_' . $cleanAuthor);
            }
            $grouped[$groupKey][] = $row;
        }

        $this->info("Ditemukan " . count($grouped) . " judul buku unik. Memulai transaksi database...");

        DB::beginTransaction();

        $importedBooks = 0;
        $importedCopies = 0;
        $usedCopyCodes = [];
        $usedBarcodes = [];

        try {
            foreach ($grouped as $groupKey => $itemRows) {
                $firstRow = $itemRows[0];
                
                // Cari/Buat Category berdasarkan DDC dari kolom KODE (misal: "621.8 Sum a" -> DDC "621.8" atau "621")
                $ddcCode = '000';
                if (!empty($firstRow['kode']) && preg_match('/^(\d{3}(?:\.\d+)?)/', $firstRow['kode'], $matches)) {
                    $ddcCode = $matches[1];
                }

                $category = Category::where('code', $ddcCode)->first();
                if (!$category) {
                    $mainDdc = substr(preg_replace('/[^0-9]/', '', $ddcCode), 0, 3);
                    if (!empty($mainDdc)) {
                        $category = Category::where('code', $mainDdc)->first();
                    }
                }

                if (!$category) {
                    $category = Category::create([
                        'code' => $ddcCode,
                        'name' => "Kategori DDC " . $ddcCode,
                        'description' => "Otomatis dibuat dari impor massal Stock Opname",
                    ]);
                }

                // Generasi Call Number jika belum ada
                $callNumber = !empty($firstRow['kode']) ? $firstRow['kode'] : null;
                if (empty($callNumber)) {
                    $cleanAuthor = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $firstRow['author']), 0, 3));
                    if (strlen($cleanAuthor) < 3) $cleanAuthor = str_pad($cleanAuthor, 3, 'X');
                    $cleanTitle = strtolower(substr(preg_replace('/[^A-Za-z]/', '', $firstRow['title']), 0, 1));
                    if (empty($cleanTitle)) $cleanTitle = 'a';
                    $callNumber = "{$category->code} {$cleanAuthor} {$cleanTitle}";
                }

                // URL Cover dari Open Library (jika ISBN tersedia)
                $coverUrl = null;
                if (!empty($firstRow['isbn'])) {
                    $coverUrl = "https://covers.openlibrary.org/b/isbn/{$firstRow['isbn']}-L.jpg";
                }

                // Cari apakah buku induk sudah ada di DB
                $book = null;
                if (!empty($firstRow['isbn'])) {
                    $book = Book::where('isbn', $firstRow['isbn'])->first();
                }
                if (!$book) {
                    $book = Book::where('title', $firstRow['title'])
                        ->where('author', $firstRow['author'])
                        ->first();
                }

                if (!$book) {
                    $book = Book::create([
                        'isbn' => $firstRow['isbn'],
                        'title' => $firstRow['title'],
                        'author' => $firstRow['author'],
                        'publisher' => $firstRow['publisher'],
                        'publish_year' => $firstRow['publish_year'],
                        'procurement_year' => $firstRow['procurement_year'],
                        'category_id' => $category->id,
                        'rack_id' => $defaultRack->id,
                        'call_number' => $callNumber,
                        'cover_image' => $coverUrl,
                        'total_copies' => 0,
                    ]);
                    $importedBooks++;
                } else {
                    if (empty($book->call_number) && !empty($callNumber)) {
                        $book->call_number = $callNumber;
                    }
                    if (empty($book->cover_image) && !empty($coverUrl)) {
                        $book->cover_image = $coverUrl;
                    }
                    $book->save();
                }

                // Simpan setiap baris fisik sebagai BookCopy
                foreach ($itemRows as $idx => $r) {
                    $rawCopyCode = !empty($r['inventaris']) ? trim($r['inventaris']) : '';
                    $rawBarcode = !empty($r['barcode']) ? trim($r['barcode']) : '';

                    $condition = 'good';
                    $ketLower = strtolower($r['ket'] ?? '');
                    if (str_contains($ketLower, 'rusak berat')) {
                        $condition = 'damaged';
                    } elseif (str_contains($ketLower, 'rusak')) {
                        $condition = 'slightly_damaged';
                    }
                    $status = ($condition === 'damaged') ? 'damaged' : 'available';

                    // 1. Tentukan Barcode yang unik
                    $barcodeHash = $rawBarcode;
                    if (empty($barcodeHash)) {
                        $yy = substr((string)$book->procurement_year, -2);
                        $barcodeHash = BarcodeService::generateCopyBarcode($yy);
                        while (isset($usedBarcodes[$barcodeHash]) || BookCopy::where('barcode_hash', $barcodeHash)->exists()) {
                            $barcodeHash = "INDO{$yy}" . str_pad((string)mt_rand(1000, 999999), 5, '0', STR_PAD_LEFT);
                        }
                    }

                    // Cek apakah eksemplar sudah ada
                    $existingCopy = BookCopy::where('barcode_hash', $barcodeHash)->first();
                    if ($existingCopy) {
                        $existingCopy->update([
                            'condition' => $condition,
                            'status' => $status,
                        ]);
                        $usedBarcodes[$barcodeHash] = true;
                        $usedCopyCodes[$existingCopy->copy_code] = true;
                        $importedCopies++;
                        continue;
                    }

                    // 2. Tentukan Nomor Inventaris (copy_code) yang Unik
                    $copyCode = $rawCopyCode;
                    if (empty($copyCode)) {
                        $copyCode = "INV-{$book->id}-" . ($idx + 1);
                    }

                    if (isset($usedCopyCodes[$copyCode]) || BookCopy::where('copy_code', $copyCode)->exists()) {
                        $baseCopyCode = $copyCode;
                        $counter = 2;
                        $copyCode = "{$baseCopyCode}-{$counter}";
                        while (isset($usedCopyCodes[$copyCode]) || BookCopy::where('copy_code', $copyCode)->exists()) {
                            $counter++;
                            $copyCode = "{$baseCopyCode}-{$counter}";
                        }
                    }

                    BookCopy::create([
                        'book_id' => $book->id,
                        'copy_code' => $copyCode,
                        'barcode_hash' => $barcodeHash,
                        'condition' => $condition,
                        'status' => $status,
                    ]);

                    $usedBarcodes[$barcodeHash] = true;
                    $usedCopyCodes[$copyCode] = true;
                    $importedCopies++;
                }

                // Sinkronkan total_copies
                $book->update([
                    'total_copies' => $book->copies()->count(),
                ]);
            }

            DB::commit();

            $this->info("SUCCESS! Berhasil mengimpor {$importedBooks} data induk buku dan {$importedCopies} eksemplar fisik.");
            return 0;

        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error("Gagal mengimpor data: " . $e->getMessage());
            return 1;
        }
    }
}
