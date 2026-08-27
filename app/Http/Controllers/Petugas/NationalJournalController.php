<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\NationalJournal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NationalJournalController extends Controller
{
    /**
     * Daftar Program Studi Resmi
     */
    protected array $prodiList = [
        'D4-Manajemen Informasi Kesehatan',
        'D4-Teknologi Rekayasa Perangkat Lunak',
        'D4-Teknologi Rekayasa Otomotif',
        'D4-Teknologi Laboratorium Medis',
        'D4-Produksi Media',
        'D4-Bisnis dan Manajemen Ritel',
        'D4-Akuntansi Perpajakan',
        'D3-Farmasi',
        'D3-Sistem Informasi',
        'D3-Teknologi Otomotif',
        'D3-Komunikasi Massa',
        'D3-Perhotelan',
        'Institusi / LPPM',
    ];

    /**
     * Tingkatan Akreditasi Jurnal Nasional (SINTA)
     */
    protected array $nationalIndexings = [
        'SINTA 1',
        'SINTA 2',
        'SINTA 3',
        'SINTA 4',
        'SINTA 5',
        'SINTA 6',
        'Non-SINTA',
        'Proses Akreditasi',
    ];

    /**
     * Tingkatan Indeksasi Jurnal Internasional
     */
    protected array $internationalIndexings = [
        'Scopus (Q1)',
        'Scopus (Q2)',
        'Scopus (Q3)',
        'Scopus (Q4)',
        'Web of Science (WoS)',
        'DOAJ Indexed',
        'Index Copernicus',
        'EBSCO',
        'Internasional Bereputasi',
        'Internasional Terindeks',
        'Internasional Non-Bereputasi',
    ];

    /**
     * Tampilkan Halaman Daftar Publikasi Ilmiah (Jurnal & Prosiding)
     */
    public function index(Request $request): Response
    {
        $query = NationalJournal::search($request->search);

        if ($request->filled('type') && in_array(strtolower($request->type), ['nasional', 'internasional', 'prosiding'])) {
            $query->ofType($request->type);
        }

        if ($request->filled('prodi')) {
            $query->ofProdi($request->prodi);
        }

        if ($request->filled('sinta')) {
            $query->ofSinta($request->sinta);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $journals = $query->orderBy('journal_type')->orderBy('prodi')->orderBy('title')->paginate(10)->withQueryString();

        // Statistik Ringkas
        $stats = [
            'total' => NationalJournal::count(),
            'nasional' => NationalJournal::where('journal_type', 'Nasional')->count(),
            'internasional' => NationalJournal::where('journal_type', 'Internasional')->count(),
            'prosiding' => NationalJournal::where('journal_type', 'Prosiding')->count(),
            'sinta_accredited' => NationalJournal::where('sinta', 'like', 'SINTA%')->count(),
            'active_count' => NationalJournal::where('is_active', true)->count(),
        ];

        return Inertia::render('Petugas/NationalJournals/Index', [
            'journals' => $journals,
            'filters' => $request->only(['search', 'type', 'prodi', 'sinta', 'status']),
            'prodiList' => $this->prodiList,
            'nationalIndexings' => $this->nationalIndexings,
            'internationalIndexings' => $this->internationalIndexings,
            'stats' => $stats,
        ]);
    }

    /**
     * Form Tambah Publikasi Ilmiah Baru
     */
    public function create(): Response
    {
        return Inertia::render('Petugas/NationalJournals/Create', [
            'prodiList' => $this->prodiList,
            'nationalIndexings' => $this->nationalIndexings,
            'internationalIndexings' => $this->internationalIndexings,
        ]);
    }

    /**
     * Simpan Data Publikasi Ilmiah Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'journal_type' => ['required', 'string', 'in:Nasional,Internasional,Prosiding'],
            'prodi' => ['required', 'string', 'max:100'],
            'publisher' => ['required', 'string', 'max:200'],
            'access_url' => ['required', 'url', 'max:500'],
            'sinta' => ['nullable', 'string', 'max:100'],
            'issn' => ['nullable', 'string', 'max:50'],
            'e_issn' => ['nullable', 'string', 'max:50'],
            'frequency' => ['nullable', 'string', 'max:100'],
            'publish_year' => ['nullable', 'integer', 'min:1990', 'max:' . (date('Y') + 1)],
            'description' => ['nullable', 'string'],
            'cover_file' => ['nullable', 'image', 'max:4096'],
            'cover_url' => ['nullable', 'string', 'max:500'],
            'doi_prefix' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $coverPath = null;
        if ($request->hasFile('cover_file')) {
            $coverPath = '/storage/' . $request->file('cover_file')->store('journals/covers', 'public');
        } elseif ($request->filled('cover_url')) {
            $coverPath = $request->cover_url;
        }

        $sintaValue = $validated['sinta'] ?? null;
        if (empty($sintaValue)) {
            $sintaValue = $validated['journal_type'] === 'Prosiding' ? 'Prosiding Seminar' : 'Non-SINTA';
        }

        NationalJournal::create([
            'title' => $validated['title'],
            'journal_type' => $validated['journal_type'],
            'prodi' => $validated['prodi'],
            'publisher' => $validated['publisher'],
            'access_url' => $validated['access_url'],
            'sinta' => $sintaValue,
            'issn' => $validated['issn'] ?? null,
            'e_issn' => $validated['e_issn'] ?? null,
            'frequency' => $validated['frequency'] ?? null,
            'publish_year' => $validated['publish_year'] ?? null,
            'description' => $validated['description'] ?? null,
            'cover_image' => $coverPath,
            'doi_prefix' => $validated['doi_prefix'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('petugas.national-journals.index')->with('success', 'Data publikasi ilmiah berhasil ditambahkan!');
    }

    /**
     * Form Edit Publikasi Ilmiah
     */
    public function edit(NationalJournal $nationalJournal): Response
    {
        return Inertia::render('Petugas/NationalJournals/Edit', [
            'journal' => $nationalJournal,
            'prodiList' => $this->prodiList,
            'nationalIndexings' => $this->nationalIndexings,
            'internationalIndexings' => $this->internationalIndexings,
        ]);
    }

    /**
     * Update Data Publikasi Ilmiah
     */
    public function update(Request $request, NationalJournal $nationalJournal): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'journal_type' => ['required', 'string', 'in:Nasional,Internasional,Prosiding'],
            'prodi' => ['required', 'string', 'max:100'],
            'publisher' => ['required', 'string', 'max:200'],
            'access_url' => ['required', 'url', 'max:500'],
            'sinta' => ['nullable', 'string', 'max:100'],
            'issn' => ['nullable', 'string', 'max:50'],
            'e_issn' => ['nullable', 'string', 'max:50'],
            'frequency' => ['nullable', 'string', 'max:100'],
            'publish_year' => ['nullable', 'integer', 'min:1990', 'max:' . (date('Y') + 1)],
            'description' => ['nullable', 'string'],
            'cover_file' => ['nullable', 'image', 'max:4096'],
            'cover_url' => ['nullable', 'string', 'max:500'],
            'doi_prefix' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $coverPath = $nationalJournal->cover_image;
        if ($request->hasFile('cover_file')) {
            if ($coverPath && Str::startsWith($coverPath, '/storage/journals/covers/')) {
                $oldFile = str_replace('/storage/', '', $coverPath);
                Storage::disk('public')->delete($oldFile);
            }
            $coverPath = '/storage/' . $request->file('cover_file')->store('journals/covers', 'public');
        } elseif ($request->filled('cover_url')) {
            $coverPath = $request->cover_url;
        }

        $sintaValue = $validated['sinta'] ?? null;
        if (empty($sintaValue)) {
            $sintaValue = $validated['journal_type'] === 'Prosiding' ? 'Prosiding Seminar' : 'Non-SINTA';
        }

        $nationalJournal->update([
            'title' => $validated['title'],
            'journal_type' => $validated['journal_type'],
            'prodi' => $validated['prodi'],
            'publisher' => $validated['publisher'],
            'access_url' => $validated['access_url'],
            'sinta' => $sintaValue,
            'issn' => $validated['issn'] ?? null,
            'e_issn' => $validated['e_issn'] ?? null,
            'frequency' => $validated['frequency'] ?? null,
            'publish_year' => $validated['publish_year'] ?? null,
            'description' => $validated['description'] ?? null,
            'cover_image' => $coverPath,
            'doi_prefix' => $validated['doi_prefix'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('petugas.national-journals.index')->with('success', 'Data publikasi ilmiah berhasil diperbarui!');
    }

    /**
     * Hapus Data Publikasi Ilmiah
     */
    public function destroy(NationalJournal $nationalJournal): RedirectResponse
    {
        if ($nationalJournal->cover_image && Str::startsWith($nationalJournal->cover_image, '/storage/journals/covers/')) {
            $oldFile = str_replace('/storage/', '', $nationalJournal->cover_image);
            Storage::disk('public')->delete($oldFile);
        }

        $nationalJournal->delete();

        return redirect()->route('petugas.national-journals.index')->with('success', 'Data publikasi ilmiah berhasil dihapus.');
    }

    /**
     * Toggle Status Terbit / Aktif
     */
    public function toggleStatus(NationalJournal $nationalJournal): RedirectResponse
    {
        $nationalJournal->update([
            'is_active' => !$nationalJournal->is_active,
        ]);

        return back()->with('success', 'Status aktif publikasi berhasil diperbarui.');
    }

    /**
     * Export Rekap Publikasi Ilmiah ke CSV
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $query = NationalJournal::search($request->search);

        if ($request->filled('type') && in_array(strtolower($request->type), ['nasional', 'internasional', 'prosiding'])) {
            $query->ofType($request->type);
        }

        if ($request->filled('prodi')) {
            $query->ofProdi($request->prodi);
        }

        if ($request->filled('sinta')) {
            $query->ofSinta($request->sinta);
        }

        $journals = $query->orderBy('journal_type')->orderBy('prodi')->orderBy('title')->get();
        $filename = 'rekap_publikasi_ilmiah_' . date('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($journals) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($handle, [
                'No',
                'Jenis Publikasi',
                'Program Studi',
                'Judul Publikasi / Jurnal / Prosiding',
                'Penerbit / Penyelenggara',
                'Tahun',
                'Link Akses',
                'Akreditasi / Indeksasi',
                'ISSN',
                'e-ISSN',
                'Frekuensi Terbit',
                'Status',
            ]);

            foreach ($journals as $idx => $j) {
                fputcsv($handle, [
                    $idx + 1,
                    $j->journal_type ?? 'Nasional',
                    $j->prodi,
                    $j->title,
                    $j->publisher,
                    $j->publish_year ?? '-',
                    $j->access_url,
                    $j->sinta,
                    $j->issn ?? '-',
                    $j->e_issn ?? '-',
                    $j->frequency ?? '-',
                    $j->is_active ? 'Aktif' : 'Non-Aktif',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Unduh Template CSV Impor Masal (Mendukung Jurnal Nasional, Internasional, dan Prosiding)
     */
    public function downloadTemplate(Request $request)
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template_impor_publikasi_ilmiah.csv"',
        ];

        return response()->stream(function () {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF"); // UTF-8 BOM
            
            // Header All-in-One yang bersahabat untuk Jurnal & Prosiding
            fputcsv($file, [
                'NO',
                'JENIS_PUBLIKASI',
                'PROGRAM_STUDI',
                'JUDUL',
                'PENERBIT',
                'TAHUN',
                'LINK_AKSES',
                'AKREDITASI_INDEKSASI',
                'ISSN',
                'E_ISSN',
                'FREKUENSI_TERBIT',
                'DOI_PREFIX',
                'FOKUS_RUANG_LINGKUP'
            ]);
            
            // Contoh baris 1 (Jurnal Nasional)
            fputcsv($file, [
                '1',
                'Nasional',
                'D4-Manajemen Informasi Kesehatan',
                'INFOKES: Jurnal Ilmiah Rekam Medis dan Informatika Kesehatan',
                'LPPM Politeknik Indonusa Surakarta',
                '2024',
                'https://ojs.poltekindonusa.ac.id/index.php/infokes',
                'SINTA 3',
                '2086-2628',
                '2541-5476',
                '2 Kali Setahun (Maret & September)',
                '10.47701/infokes',
                'Jurnal riset terapan bidang manajemen informasi kesehatan dan rekam medis elektronik.'
            ]);

            // Contoh baris 2 (Jurnal Internasional)
            fputcsv($file, [
                '2',
                'Internasional',
                'D4-Teknologi Rekayasa Perangkat Lunak',
                'International Journal of Applied Computer Science and Software Engineering',
                'Indonusa Academic Press & IEEE Section',
                '2024',
                'https://ijacse.poltekindonusa.ac.id',
                'Scopus (Q3)',
                '2721-9988',
                '2721-9996',
                '4 Kali Setahun (Triwulan)',
                '10.1109/ijacse',
                'Peer-reviewed international journal focusing on applied AI, software architecture, and distributed systems.'
            ]);

            // Contoh baris 3 (Prosiding Seminar)
            fputcsv($file, [
                '3',
                'Prosiding',
                'D4-Teknologi Rekayasa Otomotif',
                'Prosiding Seminar Nasional Vokasi & Rekayasa Teknologi Terapan (SNV-RTT)',
                'LPPM Politeknik Indonusa Surakarta',
                '2024',
                'https://prosiding.poltekindonusa.ac.id/index.php/snvrtt',
                'Prosiding Seminar',
                '2809-1234',
                '2809-5678',
                'Tahunan (Annual Conference)',
                '10.47701/snvrtt',
                'Kumpulan makalah seminar nasional hasil riset dosen vokasi bidang rekayasa dan otomotif.'
            ]);

            fclose($file);
        }, 200, $headers);
    }

    /**
     * Impor Masal Publikasi Ilmiah via File (CSV / XLSX / TXT)
     * Mendukung format Full All-in-One maupun format ringkas khusus Prosiding (NO, JUDUL, PENERBIT, TAHUN, LINK AKSES, PRODI)
     */
    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx,xls,xlsm', 'max:20480'],
        ]);

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        $rowsData = [];
        $handle = fopen($filePath, 'r');
        if ($handle) {
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

        if (empty($rowsData)) {
            return back()->with('error', 'File yang diunggah kosong atau formatnya tidak didukung.');
        }

        // Buang baris header jika terdeteksi
        $firstRowStr = strtolower(implode(' ', $rowsData[0]));
        if (str_contains($firstRowStr, 'judul') || str_contains($firstRowStr, 'title') || str_contains($firstRowStr, 'program_studi') || str_contains($firstRowStr, 'prodi') || str_contains($firstRowStr, 'jenis_publikasi') || str_contains($firstRowStr, 'jenis_jurnal')) {
            array_shift($rowsData);
        }

        $importedCount = 0;

        foreach ($rowsData as $cols) {
            if (count($cols) < 2) continue;

            $col0 = strtolower(trim($cols[0] ?? ''));
            $col1 = strtolower(trim($cols[1] ?? ''));
            if ($col0 === 'no' || $col0 === 'judul' || $col1 === 'judul' || $col1 === 'program_studi') continue;

            $journalType = 'Nasional';
            $prodi = 'D4-Manajemen Informasi Kesehatan';
            $title = '';
            $publisher = 'Politeknik Indonusa Surakarta';
            $publishYear = (int)date('Y');
            $accessUrl = 'https://ojs.poltekindonusa.ac.id';
            $indexing = 'Non-SINTA';
            $issn = null;
            $eIssn = null;
            $frequency = null;
            $doiPrefix = null;
            $description = null;

            // KASUS 1: Format Standar Baru (13 Kolom):
            // [0]NO, [1]JENIS_PUBLIKASI, [2]PROGRAM_STUDI, [3]JUDUL, [4]PENERBIT, [5]TAHUN, [6]LINK_AKSES, [7]AKREDITASI_INDEKSASI, [8]ISSN, [9]E_ISSN, [10]FREKUENSI, [11]DOI, [12]SCOPE
            if (count($cols) >= 11 && in_array(strtolower(trim($cols[1])), ['nasional', 'internasional', 'prosiding', 'proceeding'])) {
                $rawType = strtolower(trim($cols[1]));
                if ($rawType === 'proceeding' || $rawType === 'prosiding') {
                    $journalType = 'Prosiding';
                } elseif ($rawType === 'internasional') {
                    $journalType = 'Internasional';
                } else {
                    $journalType = 'Nasional';
                }

                $prodi = trim($cols[2] ?? 'D4-Manajemen Informasi Kesehatan');
                $title = trim($cols[3] ?? '');
                $publisher = trim($cols[4] ?? 'Politeknik Indonusa Surakarta');
                $rawYear = trim($cols[5] ?? '');
                $publishYear = is_numeric($rawYear) && (int)$rawYear > 1900 ? (int)$rawYear : null;
                $accessUrl = trim($cols[6] ?? '');
                $indexing = trim($cols[7] ?? '');
                $issn = trim($cols[8] ?? '');
                $eIssn = trim($cols[9] ?? '');
                $frequency = trim($cols[10] ?? '');
                $doiPrefix = trim($cols[11] ?? '');
                $description = trim($cols[12] ?? '');
            }
            // KASUS 2: Format Khusus Prosiding Sederhana (NO, JUDUL, PENERBIT, TAHUN, LINK AKSES, PRODI):
            elseif (count($cols) <= 7 && (str_contains(strtolower($cols[1] ?? $cols[0]), 'prosiding') || str_contains(strtolower($cols[1] ?? $cols[0]), 'seminar') || str_contains(strtolower($cols[1] ?? $cols[0]), 'conference') || is_numeric(trim($cols[3] ?? '')))) {
                $journalType = 'Prosiding';
                // [0]NO, [1]JUDUL, [2]PENERBIT, [3]TAHUN, [4]LINK_AKSES, [5]PRODI (opsional)
                $title = is_numeric($cols[0]) ? trim($cols[1] ?? '') : trim($cols[0] ?? '');
                $publisher = is_numeric($cols[0]) ? trim($cols[2] ?? 'Politeknik Indonusa Surakarta') : trim($cols[1] ?? 'Politeknik Indonusa Surakarta');
                $rawYear = is_numeric($cols[0]) ? trim($cols[3] ?? '') : trim($cols[2] ?? '');
                $publishYear = is_numeric($rawYear) && (int)$rawYear > 1900 ? (int)$rawYear : (int)date('Y');
                $accessUrl = is_numeric($cols[0]) ? trim($cols[4] ?? '') : trim($cols[3] ?? '');
                $prodi = is_numeric($cols[0]) ? trim($cols[5] ?? 'Institusi / LPPM') : trim($cols[4] ?? 'Institusi / LPPM');
                $indexing = 'Prosiding Seminar';
            }
            // KASUS 3: Format Legacy Jurnal: [0]NO, [1]PROGRAM_STUDI, [2]JUDUL_JURNAL, [3]PENERBIT, [4]LINK_AKSES, [5]SINTA/INDEKSASI, [6]ISSN, [7]E_ISSN, [8]FREKUENSI, [9]DOI, [10]SCOPE
            else {
                $prodi = !empty($cols[1]) && is_numeric($cols[0]) ? trim($cols[1]) : trim($cols[0]);
                $title = !empty($cols[2]) && is_numeric($cols[0]) ? trim($cols[2]) : trim($cols[1] ?? '');
                $publisher = !empty($cols[3]) && is_numeric($cols[0]) ? trim($cols[3]) : trim($cols[2] ?? 'Politeknik Indonusa Surakarta');
                $accessUrl = !empty($cols[4]) && is_numeric($cols[0]) ? trim($cols[4]) : trim($cols[3] ?? '');
                $indexing = !empty($cols[5]) && is_numeric($cols[0]) ? trim($cols[5]) : trim($cols[4] ?? 'Non-SINTA');
                $issn = !empty($cols[6]) && is_numeric($cols[0]) ? trim($cols[6]) : trim($cols[5] ?? '');
                $eIssn = !empty($cols[7]) && is_numeric($cols[0]) ? trim($cols[7]) : trim($cols[6] ?? '');
                $frequency = !empty($cols[8]) && is_numeric($cols[0]) ? trim($cols[8]) : trim($cols[7] ?? '');
                $doiPrefix = !empty($cols[9]) && is_numeric($cols[0]) ? trim($cols[9]) : trim($cols[8] ?? '');
                $description = !empty($cols[10]) && is_numeric($cols[0]) ? trim($cols[10]) : trim($cols[9] ?? '');

                // Auto-detect tipe
                $titleLower = strtolower($title);
                $idxLower = strtolower($indexing);
                if (str_contains($titleLower, 'prosiding') || str_contains($titleLower, 'proceeding') || str_contains($titleLower, 'seminar nasional') || str_contains($titleLower, 'conference')) {
                    $journalType = 'Prosiding';
                    $indexing = 'Prosiding Seminar';
                } elseif (str_contains($idxLower, 'scopus') || str_contains($idxLower, 'wos') || str_contains($idxLower, 'doaj') || str_contains($idxLower, 'copernicus') || str_contains($idxLower, 'ebsco') || str_contains($idxLower, 'internasional') || str_contains($idxLower, 'q1') || str_contains($idxLower, 'q2') || str_contains($idxLower, 'q3') || str_contains($idxLower, 'q4')) {
                    $journalType = 'Internasional';
                } else {
                    $journalType = 'Nasional';
                }
            }

            if (empty($title)) continue;
            if (empty($accessUrl)) $accessUrl = 'https://ojs.poltekindonusa.ac.id';

            NationalJournal::updateOrCreate(
                [
                    'title' => $title,
                    'prodi' => !empty($prodi) ? $prodi : 'D4-Manajemen Informasi Kesehatan',
                    'publish_year' => $publishYear,
                    'journal_type' => $journalType,
                ],
                [
                    'publisher' => !empty($publisher) ? $publisher : 'LPPM Politeknik Indonusa Surakarta',
                    'access_url' => $accessUrl,
                    'sinta' => !empty($indexing) ? $indexing : ($journalType === 'Prosiding' ? 'Prosiding Seminar' : 'Non-SINTA'),
                    'issn' => !empty($issn) ? $issn : null,
                    'e_issn' => !empty($eIssn) ? $eIssn : null,
                    'frequency' => !empty($frequency) ? $frequency : ($journalType === 'Prosiding' ? 'Tahunan (Annual)' : '2 Kali Setahun'),
                    'doi_prefix' => !empty($doiPrefix) ? $doiPrefix : null,
                    'description' => !empty($description) ? $description : null,
                    'is_active' => true,
                ]
            );

            $importedCount++;
        }

        return redirect()->route('petugas.national-journals.index')->with('success', "Berhasil mengimpor {$importedCount} data publikasi ilmiah (Jurnal & Prosiding)!");
    }
}
