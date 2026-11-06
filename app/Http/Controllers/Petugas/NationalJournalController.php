<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\JournalVisitor;
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

        // Statistik Pengunjung & Civitas Yang Mengakses Halaman Publikasi Ilmiah
        $visitorStats = [
            'total_all' => JournalVisitor::count(),
            'today_all' => JournalVisitor::whereDate('visited_at', today())->count(),
            'civitas_all' => JournalVisitor::whereNotNull('user_id')->count(),
            'nasional' => JournalVisitor::getStats('nasional'),
            'internasional' => JournalVisitor::getStats('internasional'),
            'prosiding' => JournalVisitor::getStats('prosiding'),
        ];

        // 50 Log Kunjungan Terkini untuk Pemantauan Civitas
        $recentVisitors = JournalVisitor::with(['user:id,name,username,role,prodi'])
            ->latest('visited_at')
            ->take(50)
            ->get();

        return Inertia::render('Petugas/NationalJournals/Index', [
            'journals' => $journals,
            'filters' => $request->only(['search', 'type', 'prodi', 'sinta', 'status']),
            'prodiList' => $this->prodiList,
            'nationalIndexings' => $this->nationalIndexings,
            'internationalIndexings' => $this->internationalIndexings,
            'stats' => $stats,
            'visitorStats' => $visitorStats,
            'recentVisitors' => $recentVisitors,
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
     * Impor Masal Publikasi Ilmiah via File (CSV / XLSX / TXT / XLS)
     * Mendukung deteksi header otomatis, file Excel langsung (.xlsx/.xlsm), dan berbagai variasi kolom.
     */
    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx,xls,xlsm,zip', 'max:20480'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $filePath = $file->getRealPath();

        $rowsData = [];

        // 1. Parsing File (XLSX / XLSM atau CSV / TXT)
        if (in_array($extension, ['xlsx', 'xlsm', 'zip'])) {
            $rowsData = $this->parseExcelXml($filePath);
        } else {
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
                }
                fclose($handle);
            }
        }

        if (empty($rowsData)) {
            return back()->with('error', 'File yang diunggah kosong atau formatnya tidak didukung.');
        }

        // 2. Deteksi Kolom Berdasarkan Header (Header-based Mapping)
        $headerMap = [];
        $hasHeader = false;
        $firstRow = $rowsData[0];
        $firstRowStr = strtolower(implode(' ', $firstRow));

        if (
            str_contains($firstRowStr, 'judul') ||
            str_contains($firstRowStr, 'title') ||
            str_contains($firstRowStr, 'program_studi') ||
            str_contains($firstRowStr, 'prodi') ||
            str_contains($firstRowStr, 'jenis_publikasi') ||
            str_contains($firstRowStr, 'jenis_jurnal') ||
            str_contains($firstRowStr, 'penerbit') ||
            str_contains($firstRowStr, 'publisher') ||
            str_contains($firstRowStr, 'issn')
        ) {
            $hasHeader = true;
            foreach ($firstRow as $idx => $headerName) {
                $h = strtolower(trim((string)$headerName));
                $hNorm = preg_replace('/[^a-z0-9]/', '', $h);

                if (in_array($hNorm, ['jenispublikasi', 'jenisterbitan', 'tipepublikasi', 'kategori', 'jenis', 'tipe', 'type', 'journaltype'])) {
                    $headerMap['journal_type'] = $idx;
                } elseif (in_array($hNorm, ['programstudi', 'prodi', 'jurusan', 'departemen', 'department', 'studi'])) {
                    $headerMap['prodi'] = $idx;
                } elseif (in_array($hNorm, ['judul', 'judulpublikasi', 'namajurnal', 'juduljurnal', 'title', 'jurnal', 'prosiding', 'nama', 'journaltitle'])) {
                    $headerMap['title'] = $idx;
                } elseif (in_array($hNorm, ['penerbit', 'publisher', 'lppm', 'lembaga', 'institusi', 'penyelenggara'])) {
                    $headerMap['publisher'] = $idx;
                } elseif (in_array($hNorm, ['tahun', 'tahunterbit', 'year', 'publishyear', 'thn'])) {
                    $headerMap['publish_year'] = $idx;
                } elseif (in_array($hNorm, ['linkakses', 'link', 'url', 'website', 'web', 'laman', 'linkjurnal', 'aksesurl', 'accessurl'])) {
                    $headerMap['access_url'] = $idx;
                } elseif (in_array($hNorm, ['akreditasiindeksasi', 'akreditasi', 'sinta', 'indeksasi', 'indeks', 'indexing', 'peringkat', 'statusakreditasi'])) {
                    $headerMap['sinta'] = $idx;
                } elseif (in_array($hNorm, ['eissn', 'issnelektronik', 'issnonline', 'eissnno'])) {
                    $headerMap['e_issn'] = $idx;
                } elseif (in_array($hNorm, ['issn', 'issncetak', 'pissn', 'issnprint', 'pissnno', 'noissn'])) {
                    if (!isset($headerMap['issn'])) {
                        $headerMap['issn'] = $idx;
                    }
                } elseif (in_array($hNorm, ['frekuensiterbit', 'frekuensi', 'frekuensiterbitan', 'frequency', 'periode', 'periodeterbit'])) {
                    $headerMap['frequency'] = $idx;
                } elseif (in_array($hNorm, ['doiprefix', 'doi', 'prefixdoi'])) {
                    $headerMap['doi_prefix'] = $idx;
                } elseif (in_array($hNorm, ['fokusruanglingkup', 'fokus', 'ruanglingkup', 'deskripsi', 'description', 'scope', 'sinopsis', 'abstrak', 'keterangan', 'ket'])) {
                    $headerMap['description'] = $idx;
                }
            }
            array_shift($rowsData);
        }

        $importedCount = 0;

        foreach ($rowsData as $cols) {
            if (count($cols) < 2) continue;

            $col0 = strtolower(trim((string)($cols[0] ?? '')));
            $col1 = strtolower(trim((string)($cols[1] ?? '')));
            if ($col0 === 'no' || $col0 === 'judul' || $col1 === 'judul' || $col1 === 'program_studi' || $col1 === 'prodi') continue;

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

            // JIKA MAPPING HEADER BERHASIL MENEMUKAN MINIMAL JUDUL / PRODI:
            if (!empty($headerMap) && (isset($headerMap['title']) || isset($headerMap['prodi']))) {
                if (isset($headerMap['title'])) $title = trim((string)($cols[$headerMap['title']] ?? ''));
                if (isset($headerMap['prodi'])) $prodi = trim((string)($cols[$headerMap['prodi']] ?? ''));
                if (isset($headerMap['publisher'])) $publisher = trim((string)($cols[$headerMap['publisher']] ?? ''));
                if (isset($headerMap['journal_type'])) $journalType = trim((string)($cols[$headerMap['journal_type']] ?? ''));
                if (isset($headerMap['access_url'])) $accessUrl = trim((string)($cols[$headerMap['access_url']] ?? ''));
                if (isset($headerMap['sinta'])) $indexing = trim((string)($cols[$headerMap['sinta']] ?? ''));
                if (isset($headerMap['issn'])) $issn = trim((string)($cols[$headerMap['issn']] ?? ''));
                if (isset($headerMap['e_issn'])) $eIssn = trim((string)($cols[$headerMap['e_issn']] ?? ''));
                if (isset($headerMap['frequency'])) $frequency = trim((string)($cols[$headerMap['frequency']] ?? ''));
                if (isset($headerMap['doi_prefix'])) $doiPrefix = trim((string)($cols[$headerMap['doi_prefix']] ?? ''));
                if (isset($headerMap['description'])) $description = trim((string)($cols[$headerMap['description']] ?? ''));
                if (isset($headerMap['publish_year'])) {
                    $rawYear = trim((string)($cols[$headerMap['publish_year']] ?? ''));
                    $publishYear = is_numeric($rawYear) && (int)$rawYear > 1900 ? (int)$rawYear : (int)date('Y');
                }
            } else {
                // FALLBACK POSISIONAL HEURISTIK:
                // Kasus A: Format Template Baru (NO, JENIS, PRODI, JUDUL, PENERBIT, TAHUN, LINK, INDEKS, ISSN, E_ISSN, FREQ, DOI, SCOPE)
                if (count($cols) >= 11 && in_array(strtolower(trim($cols[1] ?? '')), ['nasional', 'internasional', 'prosiding', 'proceeding'])) {
                    $journalType = trim($cols[1]);
                    $prodi = trim($cols[2] ?? 'D4-Manajemen Informasi Kesehatan');
                    $title = trim($cols[3] ?? '');
                    $publisher = trim($cols[4] ?? 'Politeknik Indonusa Surakarta');
                    $rawYear = trim($cols[5] ?? '');
                    $publishYear = is_numeric($rawYear) && (int)$rawYear > 1900 ? (int)$rawYear : (int)date('Y');
                    $accessUrl = trim($cols[6] ?? '');
                    $indexing = trim($cols[7] ?? '');
                    $issn = trim($cols[8] ?? '');
                    $eIssn = trim($cols[9] ?? '');
                    $frequency = trim($cols[10] ?? '');
                    $doiPrefix = trim($cols[11] ?? '');
                    $description = trim($cols[12] ?? '');
                }
                // Kasus B: Format Prodi di Kolom 1 dan Jenis di Kolom 2: (NO, PRODI, JENIS, JUDUL, PENERBIT, [TAHUN], LINK, INDEKS, ISSN...)
                elseif (count($cols) >= 8 && in_array(strtolower(trim($cols[2] ?? '')), ['nasional', 'internasional', 'prosiding', 'proceeding', 'jurnal nasional', 'jurnal internasional', 'prosiding seminar'])) {
                    $prodi = trim($cols[1] ?? 'D4-Manajemen Informasi Kesehatan');
                    $journalType = trim($cols[2] ?? 'Nasional');
                    $title = trim($cols[3] ?? '');
                    $publisher = trim($cols[4] ?? 'Politeknik Indonusa Surakarta');
                    
                    // Kolom 5 bisa berupa Tahun atau Link Akses
                    $col5 = trim($cols[5] ?? '');
                    if (is_numeric($col5) && (int)$col5 > 1900) {
                        $publishYear = (int)$col5;
                        $accessUrl = trim($cols[6] ?? '');
                        $indexing = trim($cols[7] ?? '');
                        $issn = trim($cols[8] ?? '');
                        $eIssn = trim($cols[9] ?? '');
                        $frequency = trim($cols[10] ?? '');
                        $doiPrefix = trim($cols[11] ?? '');
                        $description = trim($cols[12] ?? '');
                    } else {
                        // Tidak ada kolom tahun di tengah
                        $accessUrl = str_starts_with($col5, 'http') ? $col5 : trim($cols[6] ?? '');
                        $indexing = trim($cols[6] ?? '');
                        $issn = trim($cols[7] ?? '');
                        $eIssn = trim($cols[8] ?? '');
                        $frequency = trim($cols[9] ?? '');
                        $doiPrefix = trim($cols[10] ?? '');
                        $description = trim($cols[11] ?? '');
                    }
                }
                // Kasus C: Format Prosiding Sederhana (NO, JUDUL, PENERBIT, TAHUN, LINK, PRODI)
                elseif (count($cols) <= 7 && (str_contains(strtolower($cols[1] ?? $cols[0]), 'prosiding') || str_contains(strtolower($cols[1] ?? $cols[0]), 'seminar') || str_contains(strtolower($cols[1] ?? $cols[0]), 'conference') || is_numeric(trim($cols[3] ?? '')))) {
                    $journalType = 'Prosiding';
                    $title = is_numeric($cols[0]) ? trim($cols[1] ?? '') : trim($cols[0] ?? '');
                    $publisher = is_numeric($cols[0]) ? trim($cols[2] ?? 'Politeknik Indonusa Surakarta') : trim($cols[1] ?? 'Politeknik Indonusa Surakarta');
                    $rawYear = is_numeric($cols[0]) ? trim($cols[3] ?? '') : trim($cols[2] ?? '');
                    $publishYear = is_numeric($rawYear) && (int)$rawYear > 1900 ? (int)$rawYear : (int)date('Y');
                    $accessUrl = is_numeric($cols[0]) ? trim($cols[4] ?? '') : trim($cols[3] ?? '');
                    $prodi = is_numeric($cols[0]) ? trim($cols[5] ?? 'Institusi / LPPM') : trim($cols[4] ?? 'Institusi / LPPM');
                    $indexing = 'Prosiding Seminar';
                }
                // Kasus D: Format Legacy Jurnal: [0]NO, [1]PROGRAM_STUDI, [2]JUDUL_JURNAL, [3]PENERBIT, [4]LINK_AKSES, [5]SINTA/INDEKSASI, [6]ISSN, [7]E_ISSN, [8]FREKUENSI, [9]DOI, [10]SCOPE
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
                }
            }

            // Sanitasi nilai tanda strip '-' atau kosong
            $cleanVal = fn($val) => in_array(trim((string)$val), ['-', '--', 'N/A', 'n/a', 'null', 'NULL', 'None', 'none', '']) ? null : trim((string)$val);
            
            $title = trim((string)$title);
            $publisher = $cleanVal($publisher) ?? 'LPPM Politeknik Indonusa Surakarta';
            $prodi = $cleanVal($prodi) ?? 'D4-Manajemen Informasi Kesehatan';
            $accessUrl = $cleanVal($accessUrl) ?? 'https://ojs.poltekindonusa.ac.id';
            $indexing = $cleanVal($indexing);
            $issn = $cleanVal($issn);
            $eIssn = $cleanVal($eIssn);
            $frequency = $cleanVal($frequency);
            $doiPrefix = $cleanVal($doiPrefix);
            $description = $cleanVal($description);

            // Deteksi cerdas jika URL masuk ke kolom ISSN / Indeksasi karena pergeseran kolom
            foreach ([$issn, $eIssn, $indexing, $publisher] as $checkCandidate) {
                if (!empty($checkCandidate) && (str_starts_with($checkCandidate, 'http://') || str_starts_with($checkCandidate, 'https://'))) {
                    if ($accessUrl === 'https://ojs.poltekindonusa.ac.id' || empty($accessUrl)) {
                        $accessUrl = $checkCandidate;
                    }
                }
            }

            // Bersihkan ISSN jika tertukar dengan URL
            if (!empty($issn) && (str_starts_with($issn, 'http://') || str_starts_with($issn, 'https://') || strlen($issn) > 50)) {
                $issn = null;
            }
            if (!empty($eIssn) && (str_starts_with($eIssn, 'http://') || str_starts_with($eIssn, 'https://') || strlen($eIssn) > 50)) {
                $eIssn = null;
            }

            // Normalisasi Jenis Publikasi
            $rawType = strtolower(trim((string)$journalType));
            if (str_contains($rawType, 'prosiding') || str_contains($rawType, 'proceeding') || str_contains($rawType, 'seminar')) {
                $journalType = 'Prosiding';
            } elseif (str_contains($rawType, 'internasional') || str_contains($rawType, 'international')) {
                $journalType = 'Internasional';
            } else {
                $journalType = 'Nasional';
            }

            // Auto-detect tipe publikasi tambahan jika indexing / judul mengindikasikan prosiding/internasional
            $titleLower = strtolower($title);
            $idxLower = strtolower($indexing ?? '');
            if ($journalType === 'Nasional') {
                if (str_contains($titleLower, 'prosiding') || str_contains($titleLower, 'proceeding') || str_contains($titleLower, 'seminar nasional') || str_contains($titleLower, 'conference')) {
                    $journalType = 'Prosiding';
                } elseif (str_contains($idxLower, 'scopus') || str_contains($idxLower, 'wos') || str_contains($idxLower, 'doaj') || str_contains($idxLower, 'copernicus') || str_contains($idxLower, 'ebsco') || str_contains($idxLower, 'internasional') || str_contains($idxLower, 'q1') || str_contains($idxLower, 'q2') || str_contains($idxLower, 'q3') || str_contains($idxLower, 'q4')) {
                    $journalType = 'Internasional';
                }
            }

            if (empty($indexing)) {
                $indexing = $journalType === 'Prosiding' ? 'Prosiding Seminar' : 'Non-SINTA';
            }

            if (empty($frequency)) {
                $frequency = $journalType === 'Prosiding' ? 'Tahunan (Annual)' : '2 Kali Setahun';
            }

            if (empty($title)) continue;

            // Potong string agar sesuai dengan batas kolom database
            $safeTitle = mb_substr($title, 0, 500);
            $safeProdi = mb_substr($prodi, 0, 255);
            $safePublisher = mb_substr($publisher, 0, 500);
            $safeIndexing = mb_substr($indexing, 0, 255);
            $safeIssn = $issn ? mb_substr($issn, 0, 50) : null;
            $safeEIssn = $eIssn ? mb_substr($eIssn, 0, 50) : null;
            $safeFrequency = $frequency ? mb_substr($frequency, 0, 255) : null;
            $safeDoi = $doiPrefix ? mb_substr($doiPrefix, 0, 255) : null;

            try {
                NationalJournal::updateOrCreate(
                    [
                        'title' => $safeTitle,
                        'prodi' => $safeProdi,
                        'publish_year' => $publishYear,
                        'journal_type' => $journalType,
                    ],
                    [
                        'publisher' => $safePublisher,
                        'access_url' => $accessUrl,
                        'sinta' => $safeIndexing,
                        'issn' => $safeIssn,
                        'e_issn' => $safeEIssn,
                        'frequency' => $safeFrequency,
                        'doi_prefix' => $safeDoi,
                        'description' => $description,
                        'is_active' => true,
                    ]
                );

                $importedCount++;
            } catch (\Throwable $e) {
                Log::warning("Gagal mengimpor baris publikasi: " . $e->getMessage(), [
                    'title' => $safeTitle,
                    'prodi' => $safeProdi,
                ]);
            }
        }

        return redirect()->route('petugas.national-journals.index')->with('success', "Berhasil mengimpor {$importedCount} data publikasi ilmiah (Jurnal & Prosiding)!");
    }

    /**
     * Ekspor Log Kunjungan Civitas & Pengunjung Halaman Jurnal ke Format CSV
     */
    public function exportVisitorsCsv(Request $request): StreamedResponse
    {
        $type = $request->input('type');
        $query = JournalVisitor::with(['user:id,name,username,role,prodi'])->latest('visited_at');

        if ($type && in_array(strtolower($type), ['nasional', 'internasional', 'prosiding'])) {
            $query->where('journal_type', strtolower($type));
        }

        $filename = "rekap-kunjungan-jurnal-" . ($type ?: 'semua') . "-" . now()->format('Y-m-d') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM
            fputcsv($handle, ['No', 'Waktu Akses', 'Halaman Jurnal', 'Kategori Pengunjung', 'NIM / NIDN', 'Nama Civitas', 'Peran', 'Program Studi', 'IP Address'], ',', '"', "\\");

            $no = 1;
            $query->chunk(200, function ($rows) use ($handle, &$no) {
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $no++,
                        $row->visited_at ? $row->visited_at->format('Y-m-d H:i:s') : '-',
                        $row->journal_type_label,
                        $row->user_id ? 'Civitas Terdaftar' : 'Pengunjung Umum',
                        $row->user?->username ?? '-',
                        $row->user?->name ?? 'Tamu / Umum',
                        $row->user?->role ? ucfirst($row->user->role) : 'Umum',
                        $row->user?->prodi ?? '-',
                        $row->ip_address ?? '-',
                    ], ',', '"', "\\");
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Konversi referensi sel Excel (seperti 'A1', 'B2', 'AA1') menjadi index kolom berbasis 0
     */
    private function cellRefToColIndex($cellRef)
    {
        if (empty($cellRef)) {
            return -1;
        }
        $colLetters = preg_replace('/[0-9]/', '', strtoupper($cellRef));
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
     * Parser XML bawaan untuk membaca sheet file Excel (.xlsx / .xlsm)
     */
    private function parseExcelXml($filePath)
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

