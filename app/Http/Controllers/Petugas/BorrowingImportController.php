<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Borrowing;
use App\Models\Setting;
use App\Models\User;
use App\Services\FineCalculator;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BorrowingImportController extends Controller
{
    /**
     * Download template CSV import data peminjaman
     */
    public function downloadTemplate(): StreamedResponse
    {
        $filename = 'template-import-peminjaman.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');

            // BOM agar kompatibel dengan Excel (UTF-8)
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header fleksibel:
            // Dapat menggunakan NIM/NIDN atau Nama, Kode Eksemplar / Barcode / Judul Buku, dst.
            fputcsv($file, [
                'nim_atau_nidn',
                'nama_peminjam',
                'kode_eksemplar_barcode_atau_judul',
                'tgl_pinjam',
                'tgl_jatuh_tempo',
                'tgl_kembali',
                'denda',
                'status_denda',
                'catatan',
            ]);

            // Contoh 1: Data mentah mahasiswa (cukup NIM & Barcode/Kode eksemplar, tanggal pinjam)
            fputcsv($file, [
                '2141010001',
                'Ahmad Fauzi',
                'BC-000123',
                '2026-10-20',
                '', // Kosongkan jika ingin dihitung otomatis sesuai durasi peminjam
                '', // Kosongkan jika masih dipinjam
                '',
                '',
                'Peminjaman tugas akhir',
            ]);

            // Contoh 2: Data mentah dosen (cukup NIDN atau Nama & Judul Buku jika belum tahu kodenya)
            fputcsv($file, [
                '0615028801',
                'Dr. Budi Santoso, M.Kom.',
                'Pemrograman Web Modern dengan Laravel',
                '2026-10-15',
                '',
                '2026-10-28', // Sudah dikembalikan
                '0',
                'paid',
                'Peminjaman riset dosen',
            ]);

            // Contoh 3: Hanya punya Nama peminjam & Barcode (user baru akan dibuatkan otomatis jika belum ada)
            fputcsv($file, [
                '22010199',
                'Siti Nurhaliza',
                '9786020001',
                '2026-10-25',
                '2026-11-01',
                '',
                '',
                '',
                'Peminjaman kelas reguler',
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Proses import CSV data peminjaman mentah & terstruktur
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'], // max 5MB
        ], [
            'file.required' => 'File CSV wajib diunggah.',
            'file.mimes' => 'Format file harus berupa .CSV atau .TXT',
            'file.max' => 'Ukuran file maksimal 5MB',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();

        $rowsData = [];

        if (($handle = fopen($path, 'r')) !== false) {
            $firstLine = true;
            $delimiter = ',';

            while (($data = fgetcsv($handle, 0, $delimiter)) !== false) {
                // Deteksi delimiter jika satu baris dibaca utuh dengan titik koma
                if (count($data) === 1 && str_contains($data[0], ';')) {
                    $data = str_getcsv($data[0], ';');
                }

                if ($firstLine) {
                    $firstLine = false;
                    continue; // Skip header
                }

                if (empty(array_filter($data, fn($v) => trim((string)$v) !== ''))) {
                    continue;
                }

                $cleanRow = array_map(function ($v) {
                    $val = (string)$v;
                    if (!mb_check_encoding($val, 'UTF-8')) {
                        $val = mb_convert_encoding($val, 'UTF-8', 'Windows-1252, ISO-8859-1, ASCII');
                    }
                    $val = str_replace(["\x92", "\x91", '’', '‘', '`'], "'", $val);
                    $val = str_replace(["\x93", "\x94", '“', '”'], '"', $val);
                    return trim($val);
                }, $data);

                $rowsData[] = $cleanRow;
            }
            fclose($handle);
        }

        if (empty($rowsData)) {
            return back()->with('error', 'File kosong atau tidak ada data yang bisa diproses.');
        }

        $imported = 0;
        $skipped = 0;
        $errors = [];
        $officerId = Auth::id() ?? 1;

        DB::beginTransaction();

        try {
            foreach ($rowsData as $index => $cols) {
                $rowNumber = $index + 2;

                // Parsing kolom:
                // Mendukung format baru mentah:
                // [0] nim_atau_nidn / username / borrowing_code (jika format lama)
                // [1] nama_peminjam / username
                // [2] kode_eksemplar_barcode_atau_judul
                // [3] tgl_pinjam
                // [4] tgl_jatuh_tempo
                // [5] tgl_kembali
                // [6] denda / officer
                // [7] status_denda / catatan
                // [8] catatan / denda
                // [9] status_denda (format lama)

                $col0 = $cols[0] ?? '';
                $col1 = $cols[1] ?? '';
                $col2 = $cols[2] ?? '';
                $col3 = $cols[3] ?? '';
                $col4 = $cols[4] ?? '';
                $col5 = $cols[5] ?? '';
                $col6 = $cols[6] ?? '';
                $col7 = $cols[7] ?? '';
                $col8 = $cols[8] ?? '';
                $col9 = $cols[9] ?? '';

                $borrowingCode = null;
                $userIdentifier = null;
                $userName = null;
                $bookIdentifier = null;
                $borrowedAt = null;
                $dueDate = null;
                $returnedAt = null;
                $fineAmountInput = null;
                $fineStatusInput = null;
                $notes = null;

                // Cek apakah format lama (dimulai dengan TRX-...)
                if (str_starts_with(strtoupper($col0), 'TRX-')) {
                    $borrowingCode = $col0;
                    $userIdentifier = $col1;
                    $bookIdentifier = $col2;
                    $borrowedAt = $col3;
                    $dueDate = $col4;
                    $returnedAt = $col5;
                    $notes = $col7;
                    $fineAmountInput = $col8;
                    $fineStatusInput = $col9;
                } else {
                    // Format baru yang fleksibel
                    $userIdentifier = $col0;
                    $userName = $col1;
                    $bookIdentifier = $col2;
                    $borrowedAt = $col3;
                    $dueDate = $col4;
                    $returnedAt = $col5;
                    $fineAmountInput = $col6;
                    $fineStatusInput = $col7;
                    $notes = $col8;
                }

                // 1. CARI ATAU BUAT USER (PEMINJAM)
                $user = null;
                if (!empty($userIdentifier)) {
                    $user = User::where('username', $userIdentifier)->first();
                }

                if (!$user && !empty($userName)) {
                    // Coba cari berdasarkan nama
                    $user = User::where('name', 'like', "%{$userName}%")->first();
                }

                // Jika user tetap tidak ada, auto-create user baru dengan status aktif
                if (!$user) {
                    if (empty($userIdentifier) && empty($userName)) {
                        $skipped++;
                        $errors[] = "Baris {$rowNumber}: Data peminjam (NIM/NIDN atau Nama) tidak boleh kosong.";
                        continue;
                    }

                    $newUsername = !empty($userIdentifier) ? preg_replace('/[^a-zA-Z0-9_\-\.]/', '', $userIdentifier) : 'user_' . Str::lower(Str::random(6));
                    $newDisplayName = !empty($userName) ? $userName : $newUsername;

                    // Pastikan username unik
                    if (User::where('username', $newUsername)->exists()) {
                        $newUsername = $newUsername . '_' . rand(10, 99);
                    }

                    // Tentukan role apakah dosen atau mahasiswa
                    $isLecturer = str_contains(strtolower($newDisplayName), 'dr.') || 
                                  str_contains(strtolower($newDisplayName), 'prof.') || 
                                  str_contains(strtolower($newDisplayName), 'm.') || 
                                  str_contains(strtolower($newDisplayName), 's.t') || 
                                  str_contains(strtolower($newDisplayName), 's.kom');

                    $user = User::create([
                        'username' => $newUsername,
                        'name' => $newDisplayName,
                        'email' => $newUsername . '@mail.indonusa.ac.id',
                        'password' => Hash::make('password123'),
                        'role' => 'anggota',
                        'prodi' => $isLecturer ? 'Dosen' : 'Umum',
                        'status' => 'active',
                    ]);
                }

                // 2. CARI BUKU / EKSEMPLAR
                if (empty($bookIdentifier)) {
                    $skipped++;
                    $errors[] = "Baris {$rowNumber}: Judul buku, barcode, atau kode eksemplar wajib diisi.";
                    continue;
                }

                // Cari berdasarkan copy_code atau barcode_hash
                $bookCopy = BookCopy::with('book')
                    ->where('copy_code', $bookIdentifier)
                    ->orWhere('barcode_hash', $bookIdentifier)
                    ->first();

                // Jika tidak ketemu berdasarkan kode copy, coba cari berdasarkan judul buku
                if (!$bookCopy) {
                    $book = Book::where('title', 'like', "%{$bookIdentifier}%")
                        ->orWhere('isbn', $bookIdentifier)
                        ->first();

                    if ($book) {
                        // Cari copy yang tersedia atau ambil copy pertama
                        $bookCopy = BookCopy::where('book_id', $book->id)
                            ->where('status', 'available')
                            ->first() ?? BookCopy::where('book_id', $book->id)->first();

                        // Jika buku belum punya copy sama sekali, buatkan satu eksemplar
                        if (!$bookCopy) {
                            $copyCode = 'BC-' . str_pad($book->id, 5, '0', STR_PAD_LEFT) . '-01';
                            $bookCopy = BookCopy::create([
                                'book_id' => $book->id,
                                'copy_code' => $copyCode,
                                'barcode_hash' => $book->isbn ?: Str::upper(Str::random(10)),
                                'condition' => 'good',
                                'status' => 'available',
                            ]);
                            $book->increment('total_copies');
                        }
                    }
                }

                if (!$bookCopy) {
                    $skipped++;
                    $errors[] = "Baris {$rowNumber}: Buku atau Eksemplar '{$bookIdentifier}' tidak ditemukan di sistem.";
                    continue;
                }

                // 3. TENTUKAN TANGGAL PINJAM & JATUH TEMPO OTOMATIS
                try {
                    $borrowedAtCarbon = !empty($borrowedAt) ? Carbon::parse($borrowedAt) : Carbon::now();
                } catch (\Throwable $e) {
                    $borrowedAtCarbon = Carbon::now();
                }

                try {
                    if (!empty($dueDate)) {
                        $dueDateCarbon = Carbon::parse($dueDate);
                    } else {
                        // Hitung durasi otomatis sesuai role (Dosen: 14 hari, Mahasiswa: 7 hari)
                        $durationDays = $user->getBorrowDurationDays();
                        $dueDateCarbon = (clone $borrowedAtCarbon)->addDays($durationDays);
                    }
                } catch (\Throwable $e) {
                    $durationDays = $user->getBorrowDurationDays();
                    $dueDateCarbon = (clone $borrowedAtCarbon)->addDays($durationDays);
                }

                // Tanggal kembali
                $returnedAtCarbon = null;
                if (!empty($returnedAt)) {
                    try {
                        $returnedAtCarbon = Carbon::parse($returnedAt);
                    } catch (\Throwable $e) {
                        $returnedAtCarbon = null;
                    }
                }

                // 4. GENERATE KODE TRANSAKSI TRX
                if (empty($borrowingCode)) {
                    $borrowingCode = 'TRX-' . $borrowedAtCarbon->format('Ymd') . '-' . Str::upper(Str::random(4));
                }

                // Pastikan kode transaksi unik
                $counter = 1;
                $originalCode = $borrowingCode;
                while (Borrowing::where('borrowing_code', $borrowingCode)->exists()) {
                    $borrowingCode = $originalCode . '-' . $counter;
                    $counter++;
                }

                // 5. HITUNG DENDA & STATUS
                $fineAmount = 0.0;
                $fineStatus = 'none';
                $status = 'active';

                if ($returnedAtCarbon) {
                    $finePerDay = (float) Setting::get('fine_per_day', 1000);
                    $calc = FineCalculator::calculate($dueDateCarbon, $returnedAtCarbon, $finePerDay);
                    $fineAmount = $calc['fine_amount'];

                    // Jika diisi manual pada file
                    if (is_numeric($fineAmountInput) && (float)$fineAmountInput >= 0 && $fineAmountInput !== '') {
                        $fineAmount = (float)$fineAmountInput;
                    }

                    if ($fineAmount > 0) {
                        $fineStatus = in_array(strtolower((string)$fineStatusInput), ['paid', 'unpaid', 'lunas', 'belum_lunas']) ? 
                            (in_array(strtolower((string)$fineStatusInput), ['paid', 'lunas']) ? 'paid' : 'unpaid') : 'unpaid';
                    } else {
                        $fineStatus = 'none';
                    }

                    $status = 'returned';
                } else {
                    // Belum dikembalikan
                    if ($dueDateCarbon->isPast()) {
                        $status = 'overdue';
                        $finePerDay = (float) Setting::get('fine_per_day', 1000);
                        $calc = FineCalculator::calculate($dueDateCarbon, Carbon::now(), $finePerDay);
                        $fineAmount = $calc['fine_amount'];
                        $fineStatus = $fineAmount > 0 ? 'unpaid' : 'none';
                    } else {
                        $status = 'active';
                        $fineStatus = 'none';
                        $fineAmount = 0.0;
                    }
                }

                // 6. SIMPAN DATA TRANSAKSI PEMINJAMAN
                Borrowing::create([
                    'borrowing_code' => $borrowingCode,
                    'user_id' => $user->id,
                    'book_copy_id' => $bookCopy->id,
                    'ticket_id' => null,
                    'officer_id' => $officerId,
                    'borrowed_at' => $borrowedAtCarbon,
                    'due_date' => $dueDateCarbon,
                    'returned_at' => $returnedAtCarbon,
                    'fine_amount' => $fineAmount,
                    'fine_status' => $fineStatus,
                    'status' => $status,
                    'notes' => !empty($notes) ? $notes : 'Diimpor dari data mentah/CSV',
                ]);

                // Update status eksemplar buku
                if ($returnedAtCarbon) {
                    if ($bookCopy->status !== 'available') {
                        $bookCopy->update(['status' => 'available']);
                    }
                } else {
                    if ($bookCopy->status === 'available') {
                        $bookCopy->update(['status' => 'borrowed']);
                    }
                }

                $imported++;
            }

            DB::commit();

            $message = "Berhasil mengimpor {$imported} data peminjaman.";
            if ($skipped > 0) {
                $message .= " {$skipped} baris dilewati karena data tidak lengkap/buku tidak ditemukan.";
            }

            if (!empty($errors) && count($errors) <= 5) {
                session()->flash('import_errors', $errors);
            } elseif (!empty($errors)) {
                session()->flash('import_errors', array_slice($errors, 0, 5));
                session()->flash('import_errors_more', count($errors) - 5);
            }

            return back()->with('success', $message);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan saat import data: ' . $e->getMessage());
        }
    }
}
