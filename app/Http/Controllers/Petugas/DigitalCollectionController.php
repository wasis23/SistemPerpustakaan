<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\DigitalCollection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DigitalCollectionController extends Controller
{
    /**
     * Daftar Program Studi Resmi.
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
        'Anggota Eksternal',
    ];

    /**
     * Metadata setiap jenis koleksi digital.
     */
    public static function types(): array
    {
        return [
            DigitalCollection::TYPE_MAGAZINE => [
                'key' => DigitalCollection::TYPE_MAGAZINE,
                'path' => 'magazines',
                'menu_key' => 'magazines',
                'label' => 'Majalah',
                'plural' => 'Majalah',
                'singular' => 'Majalah',
                'description' => 'Kelola koleksi majalah ilmiah, majalah populer, dan terbitan berkala perpustakaan.',
                'title_label' => 'Judul Majalah',
                'author_label' => 'Penerbit / Redaksi',
                'accent' => 'rose',
                'has_issue' => true,
                'is_proposal' => false,
            ],
            DigitalCollection::TYPE_NEWSPAPER => [
                'key' => DigitalCollection::TYPE_NEWSPAPER,
                'path' => 'newspapers',
                'menu_key' => 'newspapers',
                'label' => 'Surat Kabar',
                'plural' => 'Surat Kabar & Koran',
                'singular' => 'Surat Kabar',
                'description' => 'Kelola koleksi surat kabar, koran harian, dan kliping berita perpustakaan.',
                'title_label' => 'Nama Surat Kabar',
                'author_label' => 'Penerbit / Redaksi',
                'accent' => 'sky',
                'has_issue' => true,
                'is_proposal' => false,
            ],
            DigitalCollection::TYPE_EBOOK => [
                'key' => DigitalCollection::TYPE_EBOOK,
                'path' => 'ebooks',
                'menu_key' => 'ebooks',
                'label' => 'E-Book',
                'plural' => 'E-Book',
                'singular' => 'E-Book',
                'description' => 'Kelola koleksi buku elektronik, tautan akses baca, dan arsip digital perpustakaan.',
                'title_label' => 'Judul E-Book',
                'author_label' => 'Penulis',
                'accent' => 'emerald',
                'has_issue' => false,
                'is_proposal' => false,
            ],
            DigitalCollection::TYPE_BOOK_PROPOSAL => [
                'key' => DigitalCollection::TYPE_BOOK_PROPOSAL,
                'path' => 'book-proposals',
                'menu_key' => 'book-proposals',
                'label' => 'Usulan Buku',
                'plural' => 'Usulan Buku',
                'singular' => 'Usulan Buku',
                'description' => 'Kelola daftar usulan pembelian buku dari dosen, mahasiswa, dan anggota perpustakaan.',
                'title_label' => 'Judul Buku yang Diusulkan',
                'author_label' => 'Penulis Buku',
                'accent' => 'amber',
                'has_issue' => false,
                'is_proposal' => true,
            ],
        ];
    }

    /**
     * Ambil metadata jenis koleksi dari route.
     */
    protected function meta(Request $request): array
    {
        $type = $request->route('type') ?: DigitalCollection::TYPE_MAGAZINE;
        $types = self::types();

        return $types[$type] ?? $types[DigitalCollection::TYPE_MAGAZINE];
    }

    /**
     * Tampilkan daftar koleksi digital sesuai jenisnya.
     */
    public function index(Request $request): Response
    {
        $meta = $this->meta($request);
        $query = DigitalCollection::ofType($meta['key'])->search($request->search);

        if ($request->filled('prodi')) {
            $query->where('prodi', $request->prodi);
        }

        if ($request->filled('publish_year')) {
            $query->where('publish_year', $request->publish_year);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        if ($request->filled('review_status') && $meta['is_proposal']) {
            $query->where('review_status', $request->review_status);
        }

        $items = $query->latest('id')->paginate(10)->withQueryString();

        $baseQuery = DigitalCollection::ofType($meta['key']);

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'active' => (clone $baseQuery)->where('is_active', true)->count(),
            'this_year' => (clone $baseQuery)->where('publish_year', date('Y'))->count(),
            'prodi_count' => (clone $baseQuery)->whereNotNull('prodi')->distinct('prodi')->count(),
            'pending' => (clone $baseQuery)->where('review_status', 'pending')->count(),
            'approved' => (clone $baseQuery)->where('review_status', 'approved')->count(),
            'rejected' => (clone $baseQuery)->where('review_status', 'rejected')->count(),
        ];

        $availableYears = (clone $baseQuery)
            ->whereNotNull('publish_year')
            ->distinct()
            ->orderBy('publish_year', 'desc')
            ->pluck('publish_year');

        return Inertia::render('Petugas/DigitalCollections/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'prodi', 'publish_year', 'status', 'review_status']),
            'stats' => $stats,
            'typeMeta' => $meta,
            'prodiList' => $this->prodiList,
            'availableYears' => $availableYears,
        ]);
    }

    /**
     * Form tambah koleksi digital.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Petugas/DigitalCollections/Form', [
            'item' => null,
            'typeMeta' => $this->meta($request),
            'prodiList' => $this->prodiList,
        ]);
    }

    /**
     * Simpan koleksi digital baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $meta = $this->meta($request);
        $validated = $this->validatePayload($request, $meta);

        $coverPath = $this->resolveCoverPath($request);

        DigitalCollection::create([
            'collection_type' => $meta['key'],
            'title' => $validated['title'],
            'author' => $validated['author'] ?? null,
            'publisher' => $validated['publisher'] ?? null,
            'prodi' => $validated['prodi'] ?? null,
            'issn' => $validated['issn'] ?? null,
            'e_issn' => $validated['e_issn'] ?? null,
            'frequency' => $validated['frequency'] ?? null,
            'edition' => $validated['edition'] ?? null,
            'publish_year' => $validated['publish_year'] ?? null,
            'description' => $validated['description'] ?? null,
            'access_url' => $validated['access_url'] ?? null,
            'cover_image' => $coverPath,
            'proposer_name' => $validated['proposer_name'] ?? null,
            'proposer_prodi' => $validated['proposer_prodi'] ?? null,
            'proposer_contact' => $validated['proposer_contact'] ?? null,
            'estimated_price' => $validated['estimated_price'] ?? null,
            'review_status' => $validated['review_status'] ?? 'pending',
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('petugas.' . $meta['path'] . '.index')
            ->with('success', "Data {$meta['singular']} berhasil ditambahkan!");
    }

    /**
     * Form edit koleksi digital.
     */
    public function edit(Request $request, DigitalCollection $digitalCollection): Response
    {
        $meta = $this->meta($request);

        abort_unless($digitalCollection->collection_type === $meta['key'], 404);

        return Inertia::render('Petugas/DigitalCollections/Form', [
            'item' => $digitalCollection,
            'typeMeta' => $meta,
            'prodiList' => $this->prodiList,
        ]);
    }

    /**
     * Perbarui koleksi digital.
     */
    public function update(Request $request, DigitalCollection $digitalCollection): RedirectResponse
    {
        $meta = $this->meta($request);
        abort_unless($digitalCollection->collection_type === $meta['key'], 404);

        $validated = $this->validatePayload($request, $meta);
        $coverPath = $this->resolveCoverPath($request, $digitalCollection);

        $digitalCollection->update([
            'title' => $validated['title'],
            'author' => $validated['author'] ?? null,
            'publisher' => $validated['publisher'] ?? null,
            'prodi' => $validated['prodi'] ?? null,
            'issn' => $validated['issn'] ?? null,
            'e_issn' => $validated['e_issn'] ?? null,
            'frequency' => $validated['frequency'] ?? null,
            'edition' => $validated['edition'] ?? null,
            'publish_year' => $validated['publish_year'] ?? null,
            'description' => $validated['description'] ?? null,
            'access_url' => $validated['access_url'] ?? null,
            'cover_image' => $coverPath,
            'proposer_name' => $validated['proposer_name'] ?? null,
            'proposer_prodi' => $validated['proposer_prodi'] ?? null,
            'proposer_contact' => $validated['proposer_contact'] ?? null,
            'estimated_price' => $validated['estimated_price'] ?? null,
            'review_status' => $validated['review_status'] ?? 'pending',
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('petugas.' . $meta['path'] . '.index')
            ->with('success', "Data {$meta['singular']} berhasil diperbarui!");
    }

    /**
     * Hapus koleksi digital.
     */
    public function destroy(Request $request, DigitalCollection $digitalCollection): RedirectResponse
    {
        $meta = $this->meta($request);
        abort_unless($digitalCollection->collection_type === $meta['key'], 404);

        if ($digitalCollection->cover_image && Str::startsWith($digitalCollection->cover_image, '/storage/digital-collections/covers/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $digitalCollection->cover_image));
        }

        $digitalCollection->delete();

        return redirect()->route('petugas.' . $meta['path'] . '.index')
            ->with('success', "Data {$meta['singular']} berhasil dihapus.");
    }

    /**
     * Toggle status tampil koleksi.
     */
    public function toggleStatus(Request $request, DigitalCollection $digitalCollection): RedirectResponse
    {
        $meta = $this->meta($request);
        abort_unless($digitalCollection->collection_type === $meta['key'], 404);

        $digitalCollection->update(['is_active' => ! $digitalCollection->is_active]);

        return back()->with('success', 'Status tampil koleksi berhasil diperbarui.');
    }

    /**
     * Unduh template CSV impor massal.
     */
    public function downloadTemplate(Request $request)
    {
        $meta = $this->meta($request);
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template_impor_' . $meta['path'] . '.csv"',
        ];

        return response()->stream(function () use ($meta) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF");

            fputcsv($file, [
                'NO',
                'JUDUL',
                $meta['is_proposal'] ? 'PENGUSUL' : 'PENULIS',
                'PENERBIT',
                'TAHUN',
                'PROGRAM_STUDI',
                'ISSN',
                'E_ISSN',
                'FREKUENSI',
                'EDISI',
                'LINK_AKSES',
                'DESKRIPSI',
                'STATUS_USULAN',
            ]);

            fputcsv($file, [
                '1',
                $meta['is_proposal'] ? 'Metodologi Penelitian Terapan' : 'Contoh Judul ' . $meta['singular'],
                $meta['is_proposal'] ? 'Nama Dosen / Mahasiswa' : 'Nama Penulis / Redaksi',
                'Politeknik Indonusa Surakarta',
                date('Y'),
                'D4-Teknologi Rekayasa Perangkat Lunak',
                '2086-2628',
                '2541-5476',
                'Tahunan',
                'Vol. 1 No. 1',
                'https://poltekindonusa.ac.id',
                'Deskripsi singkat koleksi.',
                'pending',
            ]);

            fclose($file);
        }, 200, $headers);
    }

    /**
     * Impor massal koleksi digital via CSV.
     */
    public function importCsv(Request $request): RedirectResponse
    {
        $meta = $this->meta($request);

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        if (! $handle) {
            return back()->with('error', 'File tidak dapat dibaca.');
        }

        $rows = [];
        while (($data = fgetcsv($handle, 8192, ',')) !== false) {
            if (! empty(array_filter($data, fn ($value) => trim((string) $value) !== ''))) {
                $rows[] = array_map(fn ($value) => trim((string) $value), $data);
            }
        }
        fclose($handle);

        if (empty($rows)) {
            return back()->with('error', 'File yang diunggah kosong atau formatnya tidak didukung.');
        }

        $firstRow = strtolower(implode(' ', $rows[0]));
        if (str_contains($firstRow, 'judul') || str_contains($firstRow, 'title')) {
            array_shift($rows);
        }

        $imported = 0;

        foreach ($rows as $cols) {
            if (count($cols) < 2) {
                continue;
            }

            $title = trim($cols[1] ?? '');
            if ($title === '' || strtolower($title) === 'judul') {
                continue;
            }

            $publishYear = is_numeric($cols[4] ?? null) ? (int) $cols[4] : null;

            DigitalCollection::updateOrCreate(
                [
                    'collection_type' => $meta['key'],
                    'title' => $title,
                    'publish_year' => $publishYear,
                ],
                [
                    'author' => $cols[2] ?: null,
                    'publisher' => $cols[3] ?: 'Politeknik Indonusa Surakarta',
                    'prodi' => $cols[5] ?: null,
                    'issn' => $cols[6] ?: null,
                    'e_issn' => $cols[7] ?: null,
                    'frequency' => $cols[8] ?: null,
                    'edition' => $cols[9] ?: null,
                    'access_url' => $cols[10] ?: null,
                    'description' => $cols[11] ?: null,
                    'proposer_name' => $meta['is_proposal'] ? ($cols[2] ?: null) : null,
                    'review_status' => $meta['is_proposal'] ? ($cols[12] ?: 'pending') : 'pending',
                    'is_active' => true,
                ]
            );

            $imported++;
        }

        return redirect()->route('petugas.' . $meta['path'] . '.index')
            ->with('success', "Berhasil mengimpor {$imported} data {$meta['singular']}.");
    }

    /**
     * Ekspor data koleksi digital ke CSV.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $meta = $this->meta($request);
        $query = DigitalCollection::ofType($meta['key'])->search($request->search);

        if ($request->filled('prodi')) {
            $query->where('prodi', $request->prodi);
        }

        if ($request->filled('publish_year')) {
            $query->where('publish_year', $request->publish_year);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $items = $query->latest('id')->get();
        $filename = 'rekap_' . $meta['path'] . '_' . date('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($items, $meta) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, [
                'No',
                'Jenis Koleksi',
                'Judul',
                $meta['is_proposal'] ? 'Pengusul' : 'Penulis / Redaksi',
                'Penerbit',
                'Tahun',
                'Program Studi',
                'ISSN',
                'E-ISSN',
                'Frekuensi',
                'Edisi',
                'Link Akses',
                'Deskripsi',
                'Status Usulan',
                'Status Tampil',
            ]);

            foreach ($items as $index => $item) {
                fputcsv($handle, [
                    $index + 1,
                    $item->type_label,
                    $item->title,
                    $meta['is_proposal'] ? ($item->proposer_name ?? $item->author) : $item->author,
                    $item->publisher,
                    $item->publish_year,
                    $item->prodi,
                    $item->issn,
                    $item->e_issn,
                    $item->frequency,
                    $item->edition,
                    $item->access_url,
                    $item->description,
                    $meta['is_proposal'] ? $item->review_status_label : '-',
                    $item->is_active ? 'Aktif' : 'Non-Aktif',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Validasi payload tambah/edit.
     */
    protected function validatePayload(Request $request, array $meta): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:200'],
            'publisher' => ['nullable', 'string', 'max:200'],
            'prodi' => ['nullable', 'string', 'max:100'],
            'issn' => ['nullable', 'string', 'max:50'],
            'e_issn' => ['nullable', 'string', 'max:50'],
            'frequency' => ['nullable', 'string', 'max:100'],
            'edition' => ['nullable', 'string', 'max:100'],
            'publish_year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'description' => ['nullable', 'string'],
            'access_url' => ['nullable', 'url', 'max:500'],
            'cover_file' => ['nullable', 'image', 'max:4096'],
            'cover_url' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
        ];

        if ($meta['is_proposal']) {
            $rules['proposer_name'] = ['required', 'string', 'max:200'];
            $rules['proposer_prodi'] = ['nullable', 'string', 'max:100'];
            $rules['proposer_contact'] = ['nullable', 'string', 'max:100'];
            $rules['estimated_price'] = ['nullable', 'numeric', 'min:0'];
            $rules['review_status'] = ['nullable', Rule::in(['pending', 'approved', 'rejected'])];
        }

        return $request->validate($rules, [
            'title.required' => 'Judul wajib diisi.',
            'proposer_name.required' => 'Nama pengusul wajib diisi.',
            'access_url.url' => 'Format tautan akses tidak valid.',
            'cover_file.image' => 'Berkas sampul harus berupa gambar.',
        ]);
    }

    /**
     * Resolve path sampul dari upload atau URL manual.
     */
    protected function resolveCoverPath(Request $request, ?DigitalCollection $existing = null): ?string
    {
        $coverPath = $existing?->cover_image;

        if ($request->hasFile('cover_file')) {
            if ($coverPath && Str::startsWith($coverPath, '/storage/digital-collections/covers/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $coverPath));
            }

            $coverPath = '/storage/' . $request->file('cover_file')->store('digital-collections/covers', 'public');
        } elseif ($request->filled('cover_url')) {
            $coverPath = $request->cover_url;
        }

        return $coverPath;
    }
}
