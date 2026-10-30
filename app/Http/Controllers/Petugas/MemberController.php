<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    /**
     * Daftar Resmi Program Studi Politeknik Indonusa Surakarta
     */
    public const PRODI_LIST = [
        'D4 Teknologi Rekayasa Otomotif',
        'D4 Teknologi Rekayasa Perangkat Lunak',
        'D4 Produksi Media',
        'D3 Perhotelan',
        'D3 Farmasi',
        'D4 Manajemen Informasi Kesehatan',
        'D4 Teknologi Laboratorium Medis',
        'D4 Bisnis Manajemen Ritel',
        'D4 Akuntansi Perpajakan',
        'Anggota External',
    ];

    /**
     * Tampilkan Daftar Seluruh Anggota Perpustakaan (Mahasiswa & Dosen)
     */
    public function index(Request $request): Response
    {
        $query = User::where('role', 'anggota')->withCount([
            'borrowings as active_borrowings_count' => function ($q) {
                $q->where('status', 'active');
            },
            'borrowings as total_borrowings_count',
        ]);

        // Filter Pencarian (NIM/Username, Nama, Email, No. HP, Prodi)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('prodi', 'like', "%{$search}%");
            });
        }

        // Filter Program Studi
        if ($request->filled('prodi')) {
            $query->where('prodi', $request->prodi);
        }

        // Filter Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $members = $query->latest('id')->paginate(12)->withQueryString();

        // Gabungkan list prodi resmi dengan prodi unik yang ada di DB
        $dbProdis = User::where('role', 'anggota')
            ->whereNotNull('prodi')
            ->where('prodi', '!=', '')
            ->distinct()
            ->pluck('prodi')
            ->toArray();

        $prodiList = array_values(array_unique(array_merge(self::PRODI_LIST, $dbProdis)));

        // Statistik
        $stats = [
            'total_members' => User::where('role', 'anggota')->count(),
            'active_members' => User::where('role', 'anggota')->where('status', 'active')->count(),
            'suspended_members' => User::where('role', 'anggota')->where('status', 'suspended')->count(),
            'borrowing_now' => User::where('role', 'anggota')->whereHas('borrowings', fn($q) => $q->where('status', 'active'))->count(),
        ];

        return Inertia::render('Petugas/Members/Index', [
            'members' => $members,
            'prodiList' => $prodiList,
            'filters' => $request->only(['search', 'prodi', 'status']),
            'stats' => $stats,
        ]);
    }

    /**
     * Tambah Akun Anggota Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'prodi' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'status' => ['required', Rule::in(['active', 'suspended'])],
        ], [
            'username.required' => 'NIM / NIDN / Username wajib diisi.',
            'username.unique' => 'NIM / Username ini sudah terdaftar.',
            'name.required' => 'Nama lengkap anggota wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
        ]);

        User::create([
            'username' => trim($validated['username']),
            'name' => trim($validated['name']),
            'email' => !empty($validated['email']) ? trim($validated['email']) : null,
            'password' => Hash::make($validated['password']),
            'role' => 'anggota',
            'prodi' => !empty($validated['prodi']) ? trim($validated['prodi']) : 'Anggota External',
            'phone' => !empty($validated['phone']) ? trim($validated['phone']) : null,
            'status' => $validated['status'],
        ]);

        return back()->with('success', "Akun anggota {$validated['name']} ({$validated['username']}) berhasil ditambahkan.");
    }

    /**
     * Update Data Diri Anggota Perpustakaan
     */
    public function update(Request $request, User $member): RedirectResponse
    {
        if ($member->role !== 'anggota') {
            return back()->with('error', 'Hanya akun anggota yang dapat diedit melalui menu ini.');
        }

        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', Rule::unique('users')->ignore($member->id)],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users')->ignore($member->id)],
            'prodi' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'status' => ['required', Rule::in(['active', 'suspended'])],
        ], [
            'username.required' => 'NIM / Username wajib diisi.',
            'username.unique' => 'NIM / Username sudah digunakan oleh akun lain.',
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan oleh akun lain.',
        ]);

        $member->update([
            'username' => trim($validated['username']),
            'name' => trim($validated['name']),
            'email' => $validated['email'] ? trim($validated['email']) : null,
            'prodi' => $validated['prodi'] ? trim($validated['prodi']) : null,
            'phone' => $validated['phone'] ? trim($validated['phone']) : null,
            'status' => $validated['status'],
        ]);

        return back()->with('success', "Data anggota {$member->name} berhasil diperbarui.");
    }

    /**
     * Ganti / Reset Password Anggota oleh Pustakawan
     */
    public function updatePassword(Request $request, User $member): RedirectResponse
    {
        if ($member->role !== 'anggota') {
            return back()->with('error', 'Hanya password akun anggota yang dapat diganti.');
        }

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password baru minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak sesuai.',
        ]);

        $member->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', "Password untuk anggota {$member->name} ({$member->username}) berhasil diubah.");
    }

    /**
     * Hapus Akun Anggota
     */
    public function destroy(User $member): RedirectResponse
    {
        if ($member->role !== 'anggota') {
            return back()->with('error', 'Hanya akun anggota yang dapat dihapus.');
        }

        // Cek jika anggota masih memiliki pinjaman aktif
        $hasActive = $member->borrowings()->where('status', 'active')->exists();
        if ($hasActive) {
            return back()->with('error', "Tidak dapat menghapus anggota {$member->name} karena masih memiliki buku yang sedang dipinjam.");
        }

        $name = $member->name;
        $member->delete();

        return back()->with('success', "Akun anggota {$name} berhasil dihapus.");
    }

    /**
     * Sinkronisasi Massal Mahasiswa Aktif (21-26) dan Dosen Aktif dari Database SIAKAD
     */
    public function syncSiakad(Request $request): RedirectResponse
    {
        try {
            set_time_limit(300);
            \Illuminate\Support\Facades\Artisan::call('siakad:sync-members');
            return back()->with('success', 'Sinkronisasi data mahasiswa aktif (angkatan 21-26) dan dosen aktif dari SIAKAD berhasil diselesaikan tanpa duplikasi!');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Error sync SIAKAD via web: ' . $e->getMessage());
            return back()->with('error', 'Gagal menyinkronkan data dari SIAKAD: ' . $e->getMessage());
        }
    }

    /**
     * Unduh Template CSV Impor Massal Data Anggota (UTF-8 BOM Support)
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template_impor_anggota_simpus.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF"); // UTF-8 BOM untuk kompatibilitas Microsoft Excel
            fputcsv($file, ['NO', 'NIM_NIDN', 'NAMA_LENGKAP', 'PROGRAM_STUDI', 'NO_HP', 'EMAIL', 'PASSWORD', 'STATUS']);
            fputcsv($file, ['1', '202401001', 'Ahmad Dahlan', 'D4 Teknologi Rekayasa Perangkat Lunak', '081234567890', 'ahmad@poltekindonusa.ac.id', '123456', 'active']);
            fputcsv($file, ['2', '0612088501', 'Dr. Siti Rahmawati M.Kom', 'D4 Manajemen Informasi Kesehatan', '081398765432', 'siti@poltekindonusa.ac.id', '123456', 'active']);
            fputcsv($file, ['3', '202402005', 'Budi Santoso', 'D3 Farmasi', '085678901234', '', '', 'active']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Impor Massal Data Anggota via File Upload (CSV, XLSX, XLSM, XLS, TXT)
     */
    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx,xls,xlsm', 'max:20480'],
        ], [
            'file.required' => 'Silakan pilih file Excel atau CSV yang akan diunggah.',
            'file.mimes' => 'Format file harus berupa .xlsx, .xls, .xlsm, .csv, atau .txt.',
            'file.max' => 'Ukuran file maksimal 20 MB.',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $filePath = $file->getRealPath();

        $rowsData = [];

        if (in_array($extension, ['xlsx', 'xlsm', 'zip'])) {
            $rowsData = $this->parseExcelXml($filePath);
        } else {
            // Processing CSV / TXT / XLS
            $handle = fopen($filePath, 'r');
            if ($handle) {
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
                    if (!empty(array_filter($data, fn($x) => trim((string)$x) !== ''))) {
                        $rowsData[] = array_map(fn($v) => trim((string)$v), $data);
                    }
                }
                fclose($handle);
            }
        }

        if (empty($rowsData)) {
            return back()->with('error', 'File yang diunggah kosong atau formatnya tidak didukung.');
        }

        // Deteksi header kolom
        $nimCol = 1;
        $nameCol = 2;
        $prodiCol = 3;
        $phoneCol = 4;
        $emailCol = 5;
        $passCol = 6;
        $statusCol = 7;

        $firstRow = $rowsData[0];
        $firstRowLower = array_map('strtolower', $firstRow);
        $hasHeader = false;

        foreach ($firstRowLower as $idx => $headerText) {
            $headerText = preg_replace('/[^a-z0-9_]/', '', $headerText);
            if (in_array($headerText, ['nim', 'nidn', 'username', 'nimnidn', 'nim_nidn', 'no_anggota', 'noanggota'])) {
                $nimCol = $idx;
                $hasHeader = true;
            } elseif (in_array($headerText, ['nama', 'name', 'nama_lengkap', 'namalengkap', 'namamahasiswa', 'nama_anggota'])) {
                $nameCol = $idx;
                $hasHeader = true;
            } elseif (in_array($headerText, ['prodi', 'program_studi', 'programstudi', 'jurusan'])) {
                $prodiCol = $idx;
                $hasHeader = true;
            } elseif (in_array($headerText, ['phone', 'no_hp', 'nohp', 'hp', 'telepon', 'telp', 'wa', 'no_wa'])) {
                $phoneCol = $idx;
                $hasHeader = true;
            } elseif (in_array($headerText, ['email', 'surel', 'e_mail'])) {
                $emailCol = $idx;
                $hasHeader = true;
            } elseif (in_array($headerText, ['password', 'sandi', 'pass', 'kata_sandi'])) {
                $passCol = $idx;
                $hasHeader = true;
            } elseif (in_array($headerText, ['status', 'status_akun', 'statusakun', 'aktif'])) {
                $statusCol = $idx;
                $hasHeader = true;
            }
        }

        if ($hasHeader) {
            array_shift($rowsData);
        } else {
            // Jika baris pertama bukan header bernama tapi kolom pertama langsung NIM
            if (!empty($firstRow[0]) && !is_numeric($firstRow[0]) && strlen($firstRow[0]) > 4) {
                $nimCol = 0;
                $nameCol = 1;
                $prodiCol = 2;
                $phoneCol = 3;
                $emailCol = 4;
                $passCol = 5;
                $statusCol = 6;
            }
        }

        if (empty($rowsData)) {
            return back()->with('error', 'Tidak ada baris data anggota yang valid untuk diimpor.');
        }

        set_time_limit(300);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $createdCount = 0;
            $updatedCount = 0;

            foreach ($rowsData as $row) {
                $username = isset($row[$nimCol]) ? trim((string)$row[$nimCol]) : '';
                $name = isset($row[$nameCol]) ? trim((string)$row[$nameCol]) : '';

                if (empty($username) || empty($name)) {
                    // Coba fallback jika format kolom bergeser
                    if (!empty($row[0]) && !empty($row[1]) && !is_numeric($row[0])) {
                        $username = trim((string)$row[0]);
                        $name = trim((string)$row[1]);
                    } elseif (!empty($row[1]) && !empty($row[2])) {
                        $username = trim((string)$row[1]);
                        $name = trim((string)$row[2]);
                    } else {
                        continue;
                    }
                }

                // Abaikan jika ternyata masih baris judul/header
                $uLower = strtolower($username);
                if ($uLower === 'no' || $uLower === 'nim' || $uLower === 'username' || $uLower === 'nim_nidn') {
                    continue;
                }

                $rawProdi = isset($row[$prodiCol]) ? trim((string)$row[$prodiCol]) : '';
                $rawPhone = isset($row[$phoneCol]) ? trim((string)$row[$phoneCol]) : '';
                $rawEmail = isset($row[$emailCol]) ? trim((string)$row[$emailCol]) : '';
                $rawPassword = isset($row[$passCol]) ? trim((string)$row[$passCol]) : '';
                $rawStatus = isset($row[$statusCol]) ? strtolower(trim((string)$row[$statusCol])) : 'active';

                // Normalisasi Prodi
                $prodi = !empty($rawProdi) ? $rawProdi : 'Anggota External';

                // Normalisasi Phone
                $phone = !empty($rawPhone) ? preg_replace('/[^0-9+]/', '', $rawPhone) : null;

                // Normalisasi Email
                $email = (!empty($rawEmail) && filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) ? $rawEmail : null;

                // Normalisasi Status
                $status = in_array($rawStatus, ['suspended', 'nonaktif', 'tidak aktif', 'blokir', '0', 'false', 'suspend']) ? 'suspended' : 'active';

                $existingUser = User::where('username', $username)->first();

                if ($existingUser) {
                    // Jangan timpa jika akun adalah petugas/admin
                    if ($existingUser->role !== 'anggota') {
                        continue;
                    }

                    $updatePayload = [
                        'name' => $name,
                        'prodi' => $prodi,
                        'status' => $status,
                    ];

                    if (!empty($phone)) {
                        $updatePayload['phone'] = $phone;
                    }

                    if (!empty($email)) {
                        $isEmailUsed = User::where('email', $email)->where('id', '!=', $existingUser->id)->exists();
                        if (!$isEmailUsed) {
                            $updatePayload['email'] = $email;
                        }
                    }

                    if (!empty($rawPassword)) {
                        $passVal = strlen($rawPassword) < 6 ? str_pad($rawPassword, 6, '0', STR_PAD_RIGHT) : $rawPassword;
                        $updatePayload['password'] = Hash::make($passVal);
                    }

                    $existingUser->update($updatePayload);
                    $updatedCount++;
                } else {
                    // Akun Baru
                    $finalEmail = null;
                    if (!empty($email)) {
                        $isEmailUsed = User::where('email', $email)->exists();
                        if (!$isEmailUsed) {
                            $finalEmail = $email;
                        }
                    }

                    $passVal = !empty($rawPassword) ? $rawPassword : $username;
                    if (strlen($passVal) < 6) {
                        $passVal = str_pad($passVal, 6, '0', STR_PAD_RIGHT);
                    }

                    User::create([
                        'username' => $username,
                        'name' => $name,
                        'email' => $finalEmail,
                        'password' => Hash::make($passVal),
                        'role' => 'anggota',
                        'prodi' => $prodi,
                        'phone' => $phone,
                        'status' => $status,
                    ]);
                    $createdCount++;
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return back()->with('success', "Proses impor selesai! {$createdCount} anggota baru berhasil ditambahkan, dan {$updatedCount} data anggota diperbarui.");

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Error pada impor anggota: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Gagal memproses impor file anggota: ' . $e->getMessage());
        }
    }

    /**
     * Helper untuk mengonversi referensi sel Excel (misal "A1", "K10", "AB5") ke indeks kolom 0-based
     */
    private function cellRefToColIndex(string $cellRef): int
    {
        $colLetters = preg_replace('/[^A-Za-z]/', '', strtoupper($cellRef));
        if (empty($colLetters)) {
            return -1;
        }
        $col = 0;
        $len = strlen($colLetters);
        for ($i = 0; $i < $len; $i++) {
            $col = $col * 26 + (ord($colLetters[$i]) - 64);
        }
        return $col - 1;
    }

    /**
     * Parser XML bawaan untuk membaca sheet file Excel (.xlsx / .xlsm) tanpa pergeseran kolom
     */
    private function parseExcelXml($filePath): array
    {
        $rows = [];
        $zip = new \ZipArchive();
        if ($zip->open($filePath) === true) {
            $sharedStrings = [];
            if (($index = $zip->locateName('xl/sharedStrings.xml')) !== false) {
                $xmlStr = $zip->getFromIndex($index);
                if ($xmlStr) {
                    $xml = @simplexml_load_string($xmlStr);
                    if ($xml && isset($xml->si)) {
                        foreach ($xml->si as $si) {
                            $text = '';
                            if (isset($si->t)) {
                                $text = (string)$si->t;
                            } elseif (isset($si->r)) {
                                foreach ($si->r as $r) {
                                    $text .= (string)$r->t;
                                }
                            }
                            $sharedStrings[] = $text;
                        }
                    }
                }
            }

            $sheetXmlStr = null;
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $stat = $zip->statIndex($i);
                if (str_contains($stat['name'], 'xl/worksheets/sheet')) {
                    $sheetXmlStr = $zip->getFromIndex($i);
                    break;
                }
            }

            if ($sheetXmlStr) {
                $xml = @simplexml_load_string($sheetXmlStr);
                if ($xml && isset($xml->sheetData->row)) {
                    foreach ($xml->sheetData->row as $row) {
                        $rowMap = [];
                        $maxCol = 0;

                        foreach ($row->c as $c) {
                            $ref = (string)($c['r'] ?? '');
                            $colIdx = $this->cellRefToColIndex($ref);
                            if ($colIdx < 0) {
                                continue;
                            }
                            if ($colIdx > $maxCol) {
                                $maxCol = $colIdx;
                            }

                            $cellType = (string)($c['t'] ?? '');
                            $v = '';
                            if ($cellType === 'inlineStr' && isset($c->is->t)) {
                                $v = (string)$c->is->t;
                            } elseif ($cellType === 's' && isset($c->v)) {
                                $strIdx = (int)(string)$c->v;
                                $v = $sharedStrings[$strIdx] ?? '';
                            } elseif (isset($c->v)) {
                                $v = (string)$c->v;
                            }

                            $rowMap[$colIdx] = trim($v);
                        }

                        if (!empty($rowMap)) {
                            $rowVals = [];
                            for ($k = 0; $k <= $maxCol; $k++) {
                                $rowVals[$k] = $rowMap[$k] ?? '';
                            }
                            if (!empty(array_filter($rowVals, fn($val) => $val !== ''))) {
                                $rows[] = $rowVals;
                            }
                        }
                    }
                }
            }
            $zip->close();
        }
        return $rows;
    }
}
