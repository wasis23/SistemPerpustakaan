<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\Rack;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StockOpnameController extends Controller
{
    /**
     * Halaman Dashboard Audit Stock Opname
     */
    public function index(Request $request): Response
    {
        $query = BookCopy::with(['book.category', 'book.rack']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('copy_code', 'like', "%{$search}%")
                  ->orWhere('barcode_hash', 'like', "%{$search}%")
                  ->orWhereHas('book', function ($bq) use ($search) {
                      $bq->where('title', 'like', "%{$search}%")
                         ->orWhere('author', 'like', "%{$search}%")
                         ->orWhere('isbn', 'like', "%{$search}%")
                         ->orWhere('call_number', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('collection_type')) {
            $query->whereHas('book', function ($bq) use ($request) {
                $bq->where('collection_type', $request->collection_type);
            });
        }

        $copies = $query->latest('id')->paginate(15)->withQueryString();

        $stats = [
            'total_titles' => Book::count(),
            'total_copies' => BookCopy::count(),
            'available_copies' => BookCopy::where('status', 'available')->count(),
            'borrowed_copies' => BookCopy::where('status', 'borrowed')->count(),
            'missing_copies' => BookCopy::where('status', 'missing')->count(),
            'damaged_copies' => BookCopy::where('status', 'damaged')->count(),
        ];

        return Inertia::render('Petugas/StockOpname/Index', [
            'copies' => $copies,
            'filters' => $request->only(['search', 'status', 'collection_type']),
            'stats' => $stats,
        ]);
    }

    /**
     * Unduh Laporan Lengkap Seluruh Koleksi (Stock Opname CSV)
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $filename = 'stock_opname_koleksi_perpustakaan_' . date('Ymd_His') . '.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            // BOM untuk kompatibilitas Microsoft Excel
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header Kolom CSV
            fputcsv($handle, [
                'No',
                'Kode Eksemplar',
                'Barcode Hash',
                'Tipe Koleksi',
                'Nomor Panggil (Call Number)',
                'Judul Buku',
                'Pengarang / Penulis',
                'Penerbit',
                'Tahun Terbit',
                'Tahun Pengadaan',
                'Bulan Pengadaan',
                'ISBN',
                'Kode DDC',
                'Kategori DDC',
                'Lokasi Rak Fisik',
                'Status Eksemplar',
                'Kondisi Fisik',
                'Tgl Registrasi'
            ]);

            $counter = 1;
            BookCopy::with(['book.category', 'book.rack'])
                ->chunk(200, function ($copies) use ($handle, &$counter) {
                    foreach ($copies as $copy) {
                        $book = $copy->book;
                        fputcsv($handle, [
                            $counter++,
                            $copy->copy_code,
                            $copy->barcode_hash,
                            $book->collection_type ?? 'Buku Teks',
                            $book->call_number ?? '-',
                            $book->title ?? '-',
                            $book->author ?? '-',
                            $book->publisher ?? '-',
                            $book->publish_year ?? '-',
                            $book->procurement_year ?? '-',
                            $book->procurement_month ?? '-',
                            $book->isbn ?? '-',
                            $book->category?->code ?? '-',
                            $book->category?->name ?? '-',
                            $book->rack?->code_rack ?? '-',
                            $copy->status,
                            $copy->condition ?? 'good',
                            $copy->created_at ? $copy->created_at->format('Y-m-d H:i:s') : '-',
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }
}
