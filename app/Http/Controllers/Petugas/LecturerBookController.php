<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\LecturerBook;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LecturerBookController extends Controller
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
    ];

    /**
     * Daftar Jenis Publikasi Buku Dosen
     */
    protected array $publicationTypes = [
        'Buku Ajar',
        'Monograf',
        'Buku Referensi',
        'Modul Praktikum',
        'Book Chapter',
        'Bunga Rampai',
        'Diktat Kuliah',
        'Karya Ilmiah Lainnya',
    ];

    /**
     * Tampilkan Halaman Daftar Karya Buku Dosen
     */
    public function index(Request $request): Response
    {
        $query = LecturerBook::with('user')
            ->search($request->search);

        if ($request->filled('prodi')) {
            $query->ofProdi($request->prodi);
        }

        if ($request->filled('publication_type')) {
            $query->ofType($request->publication_type);
        }

        if ($request->filled('publish_year')) {
            $query->where('publish_year', $request->publish_year);
        }

        if ($request->boolean('featured_only')) {
            $query->where('is_featured', true);
        }

        $lecturerBooks = $query->latest('id')->paginate(10)->withQueryString();

        // Statistik Ringkas
        $stats = [
            'total' => LecturerBook::count(),
            'buku_ajar' => LecturerBook::where('publication_type', 'Buku Ajar')->count(),
            'monograf' => LecturerBook::where('publication_type', 'Monograf')->count(),
            'buku_referensi' => LecturerBook::where('publication_type', 'Buku Referensi')->count(),
            'modul_praktikum' => LecturerBook::where('publication_type', 'Modul Praktikum')->count(),
            'with_hki' => LecturerBook::whereNotNull('hki_number')->where('hki_number', '!=', '')->count(),
        ];

        // Daftar tahun yang ada
        $availableYears = LecturerBook::whereNotNull('publish_year')
            ->distinct()
            ->orderBy('publish_year', 'desc')
            ->pluck('publish_year');

        return Inertia::render('Petugas/LecturerBooks/Index', [
            'lecturerBooks' => $lecturerBooks,
            'filters' => $request->only(['search', 'prodi', 'publication_type', 'publish_year', 'featured_only']),
            'prodiList' => $this->prodiList,
            'publicationTypes' => $this->publicationTypes,
            'availableYears' => $availableYears,
            'stats' => $stats,
        ]);
    }

    /**
     * Ambil data seluruh Dosen dari database/API SIAKAD
     */
    protected function getSiakadLecturers()
    {
        try {
            return DB::connection('siakad')
                ->table('wsia_dosen')
                ->leftJoin('viewDosenPt', 'wsia_dosen.nidn', '=', 'viewDosenPt.nidn')
                ->select(
                    'wsia_dosen.nidn',
                    'wsia_dosen.nm_ptk',
                    'wsia_dosen.gelar_depan',
                    'wsia_dosen.gelar_belakang',
                    'viewDosenPt.nm_prodi'
                )
                ->whereNotNull('wsia_dosen.nidn')
                ->where('wsia_dosen.nidn', '!=', '')
                ->groupBy('wsia_dosen.nidn', 'wsia_dosen.nm_ptk', 'wsia_dosen.gelar_depan', 'wsia_dosen.gelar_belakang', 'viewDosenPt.nm_prodi')
                ->orderBy('wsia_dosen.nm_ptk', 'asc')
                ->get()
                ->unique('nidn')
                ->values()
                ->map(function ($d) {
                    $fullName = trim(($d->gelar_depan ? $d->gelar_depan . ' ' : '') . $d->nm_ptk . ($d->gelar_belakang ? ', ' . $d->gelar_belakang : ''));
                    return [
                        'nidn' => $d->nidn,
                        'name' => $fullName,
                        'prodi' => $d->nm_prodi,
                        'label' => $fullName . ' - ' . $d->nidn,
                    ];
                });
        } catch (\Throwable $e) {
            return collect([]);
        }
    }

    /**
     * Form Tambah Karya Buku Dosen
     */
    public function create(): Response
    {
        $siakadLecturers = $this->getSiakadLecturers();

        return Inertia::render('Petugas/LecturerBooks/Create', [
            'prodiList' => $this->prodiList,
            'publicationTypes' => $this->publicationTypes,
            'siakadLecturers' => $siakadLecturers,
        ]);
    }

    /**
     * Simpan Data Karya Buku Dosen Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:lecturer_books,slug'],
            'authors' => ['required', 'string', 'max:255'],
            'nidn' => ['nullable', 'string', 'max:50'],
            'user_id' => ['nullable', 'exists:users,id'],
            'prodi' => ['required', 'string', 'max:100'],
            'publication_type' => ['required', 'string', 'max:50'],
            'isbn' => ['nullable', 'string', 'max:50'],
            'publisher' => ['nullable', 'string', 'max:150'],
            'publish_year' => ['nullable', 'integer', 'min:1980', 'max:2099'],
            'city' => ['nullable', 'string', 'max:100'],
            'edition' => ['nullable', 'string', 'max:50'],
            'pages' => ['nullable', 'integer', 'min:1'],
            'synopsis' => ['nullable', 'string'],
            'cover_file' => ['nullable', 'image', 'max:4096'],
            'cover_url' => ['nullable', 'string', 'max:500'],
            'document_file' => ['nullable', 'file', 'mimes:pdf,doc,docx,epub', 'max:30720'],
            'document_url' => ['nullable', 'string', 'max:500'],
            'doi_url' => ['nullable', 'string', 'max:255'],
            'hki_number' => ['nullable', 'string', 'max:100'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        // Auto Generate Unique Slug
        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        while (LecturerBook::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        // Upload Cover Image
        $coverPath = null;
        if ($request->hasFile('cover_file')) {
            $coverPath = '/storage/' . $request->file('cover_file')->store('lecturer_books/covers', 'public');
        } elseif ($request->filled('cover_url')) {
            $coverPath = $request->cover_url;
        }

        // Upload Document PDF
        $documentPath = null;
        if ($request->hasFile('document_file')) {
            $documentPath = '/storage/' . $request->file('document_file')->store('lecturer_books/docs', 'public');
        } elseif ($request->filled('document_url')) {
            $documentPath = $request->document_url;
        }

        LecturerBook::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'authors' => $validated['authors'],
            'nidn' => $validated['nidn'] ?? null,
            'user_id' => $validated['user_id'] ?? null,
            'prodi' => $validated['prodi'],
            'publication_type' => $validated['publication_type'],
            'isbn' => $validated['isbn'] ?? null,
            'publisher' => $validated['publisher'] ?? null,
            'publish_year' => $validated['publish_year'] ?? null,
            'city' => $validated['city'] ?? null,
            'edition' => $validated['edition'] ?? null,
            'pages' => $validated['pages'] ?? null,
            'synopsis' => $validated['synopsis'] ?? null,
            'cover_image' => $coverPath,
            'document_url' => $documentPath,
            'doi_url' => $validated['doi_url'] ?? null,
            'hki_number' => $validated['hki_number'] ?? null,
            'is_featured' => $request->boolean('is_featured'),
        ]);

        return redirect()->route('petugas.lecturer-books.index')->with('success', 'Karya buku dosen berhasil ditambahkan!');
    }

    /**
     * Detail Karya Buku Dosen
     */
    public function show(LecturerBook $lecturerBook): Response
    {
        $lecturerBook->load('user');

        return Inertia::render('Petugas/LecturerBooks/Show', [
            'book' => $lecturerBook,
        ]);
    }

    /**
     * Form Edit Karya Buku Dosen
     */
    public function edit(LecturerBook $lecturerBook): Response
    {
        $siakadLecturers = $this->getSiakadLecturers();

        return Inertia::render('Petugas/LecturerBooks/Edit', [
            'book' => $lecturerBook,
            'prodiList' => $this->prodiList,
            'publicationTypes' => $this->publicationTypes,
            'siakadLecturers' => $siakadLecturers,
        ]);
    }

    /**
     * Update Data Karya Buku Dosen
     */
    public function update(Request $request, LecturerBook $lecturerBook): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:lecturer_books,slug,' . $lecturerBook->id],
            'authors' => ['required', 'string', 'max:255'],
            'nidn' => ['nullable', 'string', 'max:50'],
            'user_id' => ['nullable', 'exists:users,id'],
            'prodi' => ['required', 'string', 'max:100'],
            'publication_type' => ['required', 'string', 'max:50'],
            'isbn' => ['nullable', 'string', 'max:50'],
            'publisher' => ['nullable', 'string', 'max:150'],
            'publish_year' => ['nullable', 'integer', 'min:1980', 'max:2099'],
            'city' => ['nullable', 'string', 'max:100'],
            'edition' => ['nullable', 'string', 'max:50'],
            'pages' => ['nullable', 'integer', 'min:1'],
            'synopsis' => ['nullable', 'string'],
            'cover_file' => ['nullable', 'image', 'max:4096'],
            'cover_url' => ['nullable', 'string', 'max:500'],
            'document_file' => ['nullable', 'file', 'mimes:pdf,doc,docx,epub', 'max:30720'],
            'document_url' => ['nullable', 'string', 'max:500'],
            'doi_url' => ['nullable', 'string', 'max:255'],
            'hki_number' => ['nullable', 'string', 'max:100'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        $coverPath = $lecturerBook->cover_image;
        if ($request->hasFile('cover_file')) {
            if ($coverPath && Str::startsWith($coverPath, '/storage/lecturer_books/covers/')) {
                $oldFile = str_replace('/storage/', '', $coverPath);
                Storage::disk('public')->delete($oldFile);
            }
            $coverPath = '/storage/' . $request->file('cover_file')->store('lecturer_books/covers', 'public');
        } elseif ($request->filled('cover_url')) {
            $coverPath = $request->cover_url;
        }

        $documentPath = $lecturerBook->document_url;
        if ($request->hasFile('document_file')) {
            if ($documentPath && Str::startsWith($documentPath, '/storage/lecturer_books/docs/')) {
                $oldDoc = str_replace('/storage/', '', $documentPath);
                Storage::disk('public')->delete($oldDoc);
            }
            $documentPath = '/storage/' . $request->file('document_file')->store('lecturer_books/docs', 'public');
        } elseif ($request->filled('document_url')) {
            $documentPath = $request->document_url;
        }

        $lecturerBook->update([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['slug']),
            'authors' => $validated['authors'],
            'nidn' => $validated['nidn'] ?? null,
            'user_id' => $validated['user_id'] ?? null,
            'prodi' => $validated['prodi'],
            'publication_type' => $validated['publication_type'],
            'isbn' => $validated['isbn'] ?? null,
            'publisher' => $validated['publisher'] ?? null,
            'publish_year' => $validated['publish_year'] ?? null,
            'city' => $validated['city'] ?? null,
            'edition' => $validated['edition'] ?? null,
            'pages' => $validated['pages'] ?? null,
            'synopsis' => $validated['synopsis'] ?? null,
            'cover_image' => $coverPath,
            'document_url' => $documentPath,
            'doi_url' => $validated['doi_url'] ?? null,
            'hki_number' => $validated['hki_number'] ?? null,
            'is_featured' => $request->boolean('is_featured'),
        ]);

        return redirect()->route('petugas.lecturer-books.index')->with('success', 'Data karya buku dosen berhasil diperbarui!');
    }

    /**
     * Hapus Data Karya Buku Dosen
     */
    public function destroy(LecturerBook $lecturerBook): RedirectResponse
    {
        if ($lecturerBook->cover_image && Str::startsWith($lecturerBook->cover_image, '/storage/lecturer_books/covers/')) {
            $oldFile = str_replace('/storage/', '', $lecturerBook->cover_image);
            Storage::disk('public')->delete($oldFile);
        }

        if ($lecturerBook->document_url && Str::startsWith($lecturerBook->document_url, '/storage/lecturer_books/docs/')) {
            $oldDoc = str_replace('/storage/', '', $lecturerBook->document_url);
            Storage::disk('public')->delete($oldDoc);
        }

        $lecturerBook->delete();

        return redirect()->route('petugas.lecturer-books.index')->with('success', 'Data karya buku dosen berhasil dihapus.');
    }

    /**
     * Toggle status Featured (Karya Unggulan)
     */
    public function toggleFeatured(LecturerBook $lecturerBook): RedirectResponse
    {
        $lecturerBook->update([
            'is_featured' => !$lecturerBook->is_featured,
        ]);

        return back()->with('success', 'Status Karya Unggulan berhasil diperbarui.');
    }

    /**
     * Export Rekapitulasi Karya Buku Dosen ke CSV
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $query = LecturerBook::search($request->search);

        if ($request->filled('prodi')) {
            $query->ofProdi($request->prodi);
        }

        if ($request->filled('publication_type')) {
            $query->ofType($request->publication_type);
        }

        if ($request->filled('publish_year')) {
            $query->where('publish_year', $request->publish_year);
        }

        $books = $query->orderBy('prodi')->orderBy('publish_year', 'desc')->get();

        $filename = 'rekap_karya_buku_dosen_' . date('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($books) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'No',
                'Judul Karya / Buku',
                'Nama Dosen / Tim Penulis',
                'NIDN',
                'Program Studi Homebase',
                'Jenis Publikasi',
                'ISBN',
                'Penerbit',
                'Tahun Terbit',
                'Kota Terbit',
                'Edisi',
                'Halaman',
                'Nomor HKI / Hak Cipta',
                'Tautan DOI / Repositori',
                'Karya Unggulan',
            ]);

            foreach ($books as $idx => $b) {
                fputcsv($handle, [
                    $idx + 1,
                    $b->title,
                    $b->authors,
                    $b->nidn ?? '-',
                    $b->prodi,
                    $b->publication_type,
                    $b->isbn ?? '-',
                    $b->publisher ?? '-',
                    $b->publish_year ?? '-',
                    $b->city ?? '-',
                    $b->edition ?? '-',
                    $b->pages ?? '-',
                    $b->hki_number ?? '-',
                    $b->doi_url ?? '-',
                    $b->is_featured ? 'Ya' : 'Tidak',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Unduh Template CSV Impor Masal Karya Buku Dosen
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template_impor_karya_buku_dosen.csv"',
        ];

        return response()->stream(function () {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF"); // UTF-8 BOM
            fputcsv($file, ['NO', 'JUDUL_BUKU', 'PENGARANG', 'NIDN', 'PROGRAM_STUDI', 'JENIS_KARYA', 'ISBN', 'PENERBIT', 'TAHUN_TERBIT', 'KOTA_TERBIT', 'EDISI', 'HALAMAN', 'NOMOR_HKI', 'LINK_DOI', 'SINOPSIS']);
            
            // Contoh baris 1
            fputcsv($file, [
                '1',
                'Pengembangan Rekam Medis Elektronik Berbasis Standar HL7 FHIR',
                'Dr. Indah Permata, M.Kom; Sinta Novratilova, M.Kes',
                '0624068701',
                'D4-Manajemen Informasi Kesehatan',
                'Buku Referensi',
                '978-623-01-2345-6',
                'Poltek Indonusa Surakarta Press',
                '2024',
                'Surakarta',
                'Cetakan Ke-1',
                '248',
                'EC00202419823',
                'https://doi.org/10.5281/zenodo.1089234',
                'Buku referensi arsitektur rekam medis elektronik dan integrasi SATUSEHAT Kemenkes.'
            ]);

            // Contoh baris 2
            fputcsv($file, [
                '2',
                'Rekayasa Perangkat Lunak Modern: Microservices & Docker',
                'Wasis Waluyo, S.Kom',
                '202202001',
                'D4-Teknologi Rekayasa Perangkat Lunak',
                'Buku Ajar',
                '978-602-401-889-1',
                'Deepublish',
                '2024',
                'Yogyakarta',
                'Edisi Revisi',
                '312',
                'EC00202409812',
                'https://doi.org/10.1016/j.procs.2024.03.11',
                'Buku ajar kurikulum vokasi rekayasa perangkat lunak dan pipeline CI/CD.'
            ]);

            fclose($file);
        }, 200, $headers);
    }

    /**
     * Impor Masal Karya Buku Dosen via File (CSV / XLSX / TXT)
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
            // Deteksi Delimiter
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
        if (str_contains($firstRowStr, 'judul') || str_contains($firstRowStr, 'title') || str_contains($firstRowStr, 'pengarang') || str_contains($firstRowStr, 'authors') || str_contains($firstRowStr, 'program_studi')) {
            array_shift($rowsData);
        }

        $importedCount = 0;

        foreach ($rowsData as $cols) {
            if (count($cols) < 2) continue;

            $col0 = strtolower(trim($cols[0] ?? ''));
            $col1 = strtolower(trim($cols[1] ?? ''));
            if ($col0 === 'no' || $col0 === 'judul' || $col1 === 'judul' || $col1 === 'title') continue;

            // Format Mapping:
            // [0]NO, [1]JUDUL_BUKU, [2]PENGARANG, [3]NIDN, [4]PROGRAM_STUDI, [5]JENIS_KARYA, [6]ISBN, [7]PENERBIT, [8]TAHUN_TERBIT, [9]KOTA_TERBIT, [10]EDISI, [11]HALAMAN, [12]NOMOR_HKI, [13]LINK_DOI, [14]SINOPSIS
            $title = !empty($cols[1]) && is_numeric($cols[0]) ? trim($cols[1]) : trim($cols[0]);
            $authors = !empty($cols[2]) && is_numeric($cols[0]) ? trim($cols[2]) : trim($cols[1] ?? '');
            $nidn = !empty($cols[3]) && is_numeric($cols[0]) ? trim($cols[3]) : trim($cols[2] ?? '');
            $prodi = !empty($cols[4]) && is_numeric($cols[0]) ? trim($cols[4]) : trim($cols[3] ?? 'D4-Manajemen Informasi Kesehatan');
            $type = !empty($cols[5]) && is_numeric($cols[0]) ? trim($cols[5]) : trim($cols[4] ?? 'Buku Ajar');
            $isbn = !empty($cols[6]) && is_numeric($cols[0]) ? trim($cols[6]) : trim($cols[5] ?? '');
            $publisher = !empty($cols[7]) && is_numeric($cols[0]) ? trim($cols[7]) : trim($cols[6] ?? 'Poltek Indonusa Surakarta Press');
            $rawYear = !empty($cols[8]) && is_numeric($cols[0]) ? trim($cols[8]) : trim($cols[7] ?? '');
            $city = !empty($cols[9]) && is_numeric($cols[0]) ? trim($cols[9]) : trim($cols[8] ?? 'Surakarta');
            $edition = !empty($cols[10]) && is_numeric($cols[0]) ? trim($cols[10]) : trim($cols[9] ?? 'Cetakan Ke-1');
            $pages = !empty($cols[11]) && is_numeric($cols[0]) ? trim($cols[11]) : trim($cols[10] ?? '');
            $hki = !empty($cols[12]) && is_numeric($cols[0]) ? trim($cols[12]) : trim($cols[11] ?? '');
            $doi = !empty($cols[13]) && is_numeric($cols[0]) ? trim($cols[13]) : trim($cols[12] ?? '');
            $synopsis = !empty($cols[14]) && is_numeric($cols[0]) ? trim($cols[14]) : trim($cols[13] ?? '');

            if (empty($title)) continue;

            $slug = Str::slug($title);
            $originalSlug = $slug;
            $counter = 1;
            while (LecturerBook::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }

            $publishYear = is_numeric($rawYear) && (int)$rawYear > 1900 ? (int)$rawYear : (int)date('Y');
            $pageCount = is_numeric($pages) && (int)$pages > 0 ? (int)$pages : null;

            LecturerBook::create([
                'title' => $title,
                'slug' => $slug,
                'authors' => !empty($authors) ? $authors : 'Tim Dosen Politeknik Indonusa',
                'nidn' => !empty($nidn) ? $nidn : null,
                'prodi' => !empty($prodi) ? $prodi : 'D4-Manajemen Informasi Kesehatan',
                'publication_type' => !empty($type) ? $type : 'Buku Ajar',
                'isbn' => !empty($isbn) ? $isbn : null,
                'publisher' => !empty($publisher) ? $publisher : 'Poltek Indonusa Surakarta Press',
                'publish_year' => $publishYear,
                'city' => !empty($city) ? $city : 'Surakarta',
                'edition' => !empty($edition) ? $edition : 'Cetakan Ke-1',
                'pages' => $pageCount,
                'synopsis' => !empty($synopsis) ? $synopsis : null,
                'doi_url' => !empty($doi) ? $doi : null,
                'hki_number' => !empty($hki) ? $hki : null,
                'is_featured' => false,
            ]);

            $importedCount++;
        }

        return redirect()->route('petugas.lecturer-books.index')->with('success', "Berhasil mengimpor {$importedCount} data karya buku dosen!");
    }
}
