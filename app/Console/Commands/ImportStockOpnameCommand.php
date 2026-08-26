<?php

namespace App\Console\Commands;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\Rack;
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

        while (($data = fgetcsv($handle, 4096, ',')) !== false) {
            $lineNum++;
            if ($lineNum === 1) {
                // Check if first row is header
                if (isset($data[1]) && in_array(strtolower(trim($data[1])), ['judul', 'title'])) {
                    $header = array_map('strtolower', array_map('trim', $data));
                    continue;
                }
            }

            if (count($data) < 2) continue;

            // Mapping kolom berdasarkan urutan Stock Opname (NO, JUDUL, KODE, PENGARANG, PENERBIT, KOTA TERBIT, TAHUN, ASAL, ISBN, EKS, INVENTARIS, BARCODE, KET)
            $title = trim($data[1] ?? $data[0] ?? '');
            if (empty($title) || strtolower($title) === 'judul') continue;

            $kode = trim($data[2] ?? '');
            $author = trim($data[3] ?? '');
            $publisher = trim($data[4] ?? '');
            // Kota Terbit (data[5]) sengaja diabaikan sesuai aturan
            $publishYear = trim($data[6] ?? '');
            $asal = trim($data[7] ?? '');
            $isbn = trim($data[8] ?? '');
            $eks = trim($data[9] ?? '');
            $inventaris = trim($data[10] ?? '');
            $barcode = trim($data[11] ?? '');
            $ket = trim($data[12] ?? '');

            // Ekstraksi Tahun Pengadaan dari BARCODE (2 angka setelah kata INDO, misal INDO12001 -> 2012)
            $procurementYear = (int)date('Y');
            if (preg_match('/INDO(\d{2})/i', $barcode, $matches)) {
                $procurementYear = 2000 + (int)$matches[1];
            } elseif (preg_match('/20\d{2}/', $asal, $matches)) {
                $procurementYear = (int)$matches[0];
            }

            // Bersihkan ISBN
            $cleanIsbn = preg_replace('/[^0-9X]/i', '', $isbn);

            $rows[] = [
                'title' => $title,
                'kode' => $kode,
                'author' => !empty($author) ? $author : 'Penulis Tidak Diketahui',
                'publisher' => !empty($publisher) ? $publisher : 'Penerbit Impor',
                'publish_year' => is_numeric($publishYear) ? (int)$publishYear : (int)date('Y'),
                'procurement_year' => $procurementYear,
                'isbn' => $cleanIsbn ?: null,
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
                $groupKey = 'TITLE_' . strtolower(preg_replace('/[^A-Za-z0-9]/', '', $row['title'] . $row['author']));
            }
            $grouped[$groupKey][] = $row;
        }

        $this->info("Ditemukan " . count($grouped) . " judul buku unik. Memulai transaksi database...");

        DB::beginTransaction();

        $importedBooks = 0;
        $importedCopies = 0;

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
                    $cleanTitle = strtolower(substr(preg_replace('/[^A-Za-z]/', '', $firstRow['title']), 0, 1));
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
                        'total_copies' => count($itemRows),
                    ]);
                    $importedBooks++;
                } else {
                    $book->update([
                        'total_copies' => $book->total_copies + count($itemRows),
                    ]);
                }

                // Simpan setiap baris fisik sebagai BookCopy
                foreach ($itemRows as $idx => $r) {
                    $copyCode = !empty($r['inventaris']) ? $r['inventaris'] : "INV-{$book->id}-" . ($idx + 1);
                    $barcodeHash = !empty($r['barcode']) ? $r['barcode'] : "BC-{$book->id}-" . str_pad($idx + 1, 4, '0', STR_PAD_LEFT);

                    $condition = 'good';
                    if (str_contains(strtolower($r['ket']), 'rusak berat')) {
                        $condition = 'damaged';
                    } elseif (str_contains(strtolower($r['ket']), 'rusak')) {
                        $condition = 'slightly_damaged';
                    }

                    // Hindari duplikasi barcode_hash
                    BookCopy::firstOrCreate(
                        ['barcode_hash' => $barcodeHash],
                        [
                            'book_id' => $book->id,
                            'copy_code' => $copyCode,
                            'condition' => $condition,
                            'status' => $condition === 'damaged' ? 'damaged' : 'available',
                        ]
                    );

                    $importedCopies++;
                }
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
