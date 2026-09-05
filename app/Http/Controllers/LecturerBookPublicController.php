<?php

namespace App\Http\Controllers;

use App\Models\LecturerBook;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LecturerBookPublicController extends Controller
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
     * Tampilkan Halaman Publik Katalog Karya Buku Dosen
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

        $perPageInput = $request->input('per_page', '12');
        if ($perPageInput === 'all') {
            $totalCount = (clone $query)->count();
            $perPage = max(1, $totalCount);
        } else {
            $perPage = in_array((int)$perPageInput, [12, 24, 48, 96]) ? (int)$perPageInput : 12;
        }

        $lecturerBooks = $query->orderByDesc('is_featured')->latest('id')->paginate($perPage)->withQueryString();

        // Statistik Ringkas Publik
        $stats = [
            'total' => LecturerBook::count(),
            'buku_ajar' => LecturerBook::where('publication_type', 'Buku Ajar')->count(),
            'monograf' => LecturerBook::where('publication_type', 'Monograf')->count(),
            'buku_referensi' => LecturerBook::where('publication_type', 'Buku Referensi')->count(),
            'modul_praktikum' => LecturerBook::where('publication_type', 'Modul Praktikum')->count(),
        ];

        // Daftar tahun yang ada
        $availableYears = LecturerBook::whereNotNull('publish_year')
            ->distinct()
            ->orderBy('publish_year', 'desc')
            ->pluck('publish_year');

        return Inertia::render('KaryaDosen/Index', [
            'lecturerBooks' => $lecturerBooks,
            'filters' => [
                'search' => $request->search ?? '',
                'prodi' => $request->prodi ?? '',
                'publication_type' => $request->publication_type ?? '',
                'publish_year' => $request->publish_year ?? '',
                'featured_only' => $request->boolean('featured_only'),
                'per_page' => (string)$perPageInput,
            ],
            'prodiList' => $this->prodiList,
            'publicationTypes' => $this->publicationTypes,
            'availableYears' => $availableYears,
            'stats' => $stats,
        ]);
    }

    /**
     * Tampilkan Halaman Detail Publik Karya Buku Dosen
     */
    public function show(LecturerBook $lecturer_book): Response
    {
        $lecturer_book->load('user');

        // Rekomendasi buku lain dari prodi atau penulis yang sama
        $relatedBooks = LecturerBook::where('id', '!=', $lecturer_book->id)
            ->where(function ($q) use ($lecturer_book) {
                $q->where('prodi', $lecturer_book->prodi)
                  ->orWhere('authors', 'like', "%{$lecturer_book->authors}%");
            })
            ->latest('id')
            ->take(4)
            ->get();

        return Inertia::render('KaryaDosen/Show', [
            'book' => $lecturer_book,
            'relatedBooks' => $relatedBooks,
        ]);
    }
}
