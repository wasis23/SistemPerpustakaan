<?php

namespace App\Http\Controllers;

use App\Models\NationalJournal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JournalPublicController extends Controller
{
    /**
     * Daftar Program Studi Resmi Politeknik Indonusa
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
     * Tampilkan Halaman Khusus Jurnal Ilmiah Nasional (SINTA)
     */
    public function nasional(Request $request): Response
    {
        $query = NationalJournal::where('is_active', true)
            ->where('journal_type', 'Nasional')
            ->search($request->search);

        if ($request->filled('prodi')) {
            $query->ofProdi($request->prodi);
        }

        if ($request->filled('sinta')) {
            $query->ofSinta($request->sinta);
        }

        if ($request->filled('publish_year')) {
            $query->where('publish_year', $request->publish_year);
        }

        $perPageInput = $request->input('per_page', '12');
        if ($perPageInput === 'all') {
            $totalCount = (clone $query)->count();
            $perPage = max(1, $totalCount);
        } else {
            $perPage = in_array((int)$perPageInput, [12, 24, 48, 96]) ? (int)$perPageInput : 12;
        }

        $journals = $query->latest('id')->paginate($perPage)->withQueryString();

        $stats = [
            'total' => NationalJournal::where('is_active', true)->where('journal_type', 'Nasional')->count(),
            'sinta_top' => NationalJournal::where('is_active', true)->where('journal_type', 'Nasional')->whereIn('sinta', ['SINTA 1', 'SINTA 2', 'SINTA 3'])->count(),
            'sinta_all' => NationalJournal::where('is_active', true)->where('journal_type', 'Nasional')->where('sinta', 'like', 'SINTA%')->count(),
            'total_prodi' => NationalJournal::where('is_active', true)->where('journal_type', 'Nasional')->whereNotNull('prodi')->distinct('prodi')->count(),
        ];

        $availableYears = NationalJournal::where('is_active', true)
            ->where('journal_type', 'Nasional')
            ->whereNotNull('publish_year')
            ->distinct()
            ->orderBy('publish_year', 'desc')
            ->pluck('publish_year');

        $sintaList = ['SINTA 1', 'SINTA 2', 'SINTA 3', 'SINTA 4', 'SINTA 5', 'SINTA 6', 'Non SINTA', 'Google Scholar', 'Garuda'];

        return Inertia::render('Jurnal/Nasional', [
            'journals' => $journals,
            'filters' => [
                'search' => $request->search ?? '',
                'prodi' => $request->prodi ?? '',
                'sinta' => $request->sinta ?? '',
                'publish_year' => $request->publish_year ?? '',
                'per_page' => $perPageInput,
            ],
            'stats' => $stats,
            'prodiList' => $this->prodiList,
            'sintaList' => $sintaList,
            'availableYears' => $availableYears,
        ]);
    }

    /**
     * Tampilkan Halaman Khusus Jurnal Ilmiah Internasional
     */
    public function internasional(Request $request): Response
    {
        $query = NationalJournal::where('is_active', true)
            ->where('journal_type', 'Internasional')
            ->search($request->search);

        if ($request->filled('prodi')) {
            $query->ofProdi($request->prodi);
        }

        if ($request->filled('sinta')) {
            $query->ofSinta($request->sinta);
        }

        if ($request->filled('publish_year')) {
            $query->where('publish_year', $request->publish_year);
        }

        $perPageInput = $request->input('per_page', '12');
        if ($perPageInput === 'all') {
            $totalCount = (clone $query)->count();
            $perPage = max(1, $totalCount);
        } else {
            $perPage = in_array((int)$perPageInput, [12, 24, 48, 96]) ? (int)$perPageInput : 12;
        }

        $journals = $query->latest('id')->paginate($perPage)->withQueryString();

        $stats = [
            'total' => NationalJournal::where('is_active', true)->where('journal_type', 'Internasional')->count(),
            'scopus_wos' => NationalJournal::where('is_active', true)->where('journal_type', 'Internasional')->where(function ($q) {
                $q->where('sinta', 'like', '%Scopus%')->orWhere('sinta', 'like', '%WoS%')->orWhere('sinta', 'like', '%Web of Science%');
            })->count(),
            'doaj_copernicus' => NationalJournal::where('is_active', true)->where('journal_type', 'Internasional')->where(function ($q) {
                $q->where('sinta', 'like', '%DOAJ%')->orWhere('sinta', 'like', '%Copernicus%');
            })->count(),
            'total_prodi' => NationalJournal::where('is_active', true)->where('journal_type', 'Internasional')->whereNotNull('prodi')->distinct('prodi')->count(),
        ];

        $availableYears = NationalJournal::where('is_active', true)
            ->where('journal_type', 'Internasional')
            ->whereNotNull('publish_year')
            ->distinct()
            ->orderBy('publish_year', 'desc')
            ->pluck('publish_year');

        $indexList = ['Scopus', 'Web of Science (WoS)', 'DOAJ', 'Copernicus', 'Google Scholar', 'EBSCO', 'IEEE Xplore'];

        return Inertia::render('Jurnal/Internasional', [
            'journals' => $journals,
            'filters' => [
                'search' => $request->search ?? '',
                'prodi' => $request->prodi ?? '',
                'sinta' => $request->sinta ?? '',
                'publish_year' => $request->publish_year ?? '',
                'per_page' => $perPageInput,
            ],
            'stats' => $stats,
            'prodiList' => $this->prodiList,
            'indexList' => $indexList,
            'availableYears' => $availableYears,
        ]);
    }

    /**
     * Tampilkan Halaman Khusus Prosiding Seminar
     */
    public function prosiding(Request $request): Response
    {
        $query = NationalJournal::where('is_active', true)
            ->where('journal_type', 'Prosiding')
            ->search($request->search);

        if ($request->filled('prodi')) {
            $query->ofProdi($request->prodi);
        }

        if ($request->filled('publish_year')) {
            $query->where('publish_year', $request->publish_year);
        }

        $perPageInput = $request->input('per_page', '12');
        if ($perPageInput === 'all') {
            $totalCount = (clone $query)->count();
            $perPage = max(1, $totalCount);
        } else {
            $perPage = in_array((int)$perPageInput, [12, 24, 48, 96]) ? (int)$perPageInput : 12;
        }

        $journals = $query->latest('id')->paginate($perPage)->withQueryString();

        $stats = [
            'total' => NationalJournal::where('is_active', true)->where('journal_type', 'Prosiding')->count(),
            'with_issn' => NationalJournal::where('is_active', true)->where('journal_type', 'Prosiding')->whereNotNull('issn')->count(),
            'with_url' => NationalJournal::where('is_active', true)->where('journal_type', 'Prosiding')->whereNotNull('access_url')->count(),
            'total_prodi' => NationalJournal::where('is_active', true)->where('journal_type', 'Prosiding')->whereNotNull('prodi')->distinct('prodi')->count(),
        ];

        $availableYears = NationalJournal::where('is_active', true)
            ->where('journal_type', 'Prosiding')
            ->whereNotNull('publish_year')
            ->distinct()
            ->orderBy('publish_year', 'desc')
            ->pluck('publish_year');

        return Inertia::render('Jurnal/Prosiding', [
            'journals' => $journals,
            'filters' => [
                'search' => $request->search ?? '',
                'prodi' => $request->prodi ?? '',
                'publish_year' => $request->publish_year ?? '',
                'per_page' => $perPageInput,
            ],
            'stats' => $stats,
            'prodiList' => $this->prodiList,
            'availableYears' => $availableYears,
        ]);
    }
}
