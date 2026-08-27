<?php

namespace App\Http\Controllers\Anggota;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use App\Models\Rack;
use App\Services\BarcodeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    /**
     * Pencarian Katalog Buku untuk Anggota (dengan layout Dashboard Anggota)
     */
    public function index(Request $request): Response
    {
        $books = $this->getFilteredBooks($request);

        return Inertia::render('Anggota/Catalog/Index', [
            'books' => $books,
            'categories' => Category::select('id', 'code', 'name')->get(),
            'racks' => Rack::select('id', 'code_rack', 'location')->get(),
            'filters' => [
                'search' => $request->search ?? '',
                'category_id' => $request->category_id ?? '',
                'rack_id' => $request->rack_id ?? '',
                'per_page' => (string)$request->input('per_page', '12'),
            ],
        ]);
    }

    /**
     * Detail Buku & Eksemplar Fisik di Rak untuk Anggota
     */
    public function show(Book $book): Response
    {
        $copies = $this->getBookCopies($book);

        return Inertia::render('Anggota/Catalog/Show', [
            'book' => $book,
            'copies' => $copies,
        ]);
    }

    /**
     * Pencarian Katalog Koleksi Publik (untuk Pengunjung / Landing)
     */
    public function indexPublic(Request $request): Response
    {
        $books = $this->getFilteredBooks($request);

        return Inertia::render('Katalog/Index', [
            'books' => $books,
            'categories' => Category::select('id', 'code', 'name')->get(),
            'racks' => Rack::select('id', 'code_rack', 'location')->get(),
            'filters' => [
                'search' => $request->search ?? '',
                'category_id' => $request->category_id ?? '',
                'rack_id' => $request->rack_id ?? '',
                'per_page' => (string)$request->input('per_page', '12'),
            ],
        ]);
    }

    /**
     * Detail Buku Publik (untuk Pengunjung / Landing)
     */
    public function showPublic(Book $book): Response
    {
        $copies = $this->getBookCopies($book);

        return Inertia::render('Katalog/Show', [
            'book' => $book,
            'copies' => $copies,
        ]);
    }

    /**
     * Helper query filter buku
     */
    private function getFilteredBooks(Request $request)
    {
        $query = Book::with(['category', 'rack'])
            ->withCount(['copies', 'availableCopies']);

        // Pencarian Kata Kunci
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        // Filter Kategori
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter Rak
        if ($request->filled('rack_id')) {
            $query->where('rack_id', $request->rack_id);
        }

        // Pilihan per halaman (12, 24, 48, 96, atau semua)
        $perPageInput = $request->input('per_page', '12');
        if ($perPageInput === 'all') {
            $totalCount = (clone $query)->count();
            $perPage = max(1, $totalCount);
        } else {
            $perPage = in_array((int)$perPageInput, [12, 24, 48, 96]) ? (int)$perPageInput : 12;
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    /**
     * Helper mapping eksemplar buku
     */
    private function getBookCopies(Book $book)
    {
        $book->load(['category', 'rack', 'copies']);

        return $book->copies->map(function ($copy) {
            return [
                'id' => $copy->id,
                'copy_code' => $copy->copy_code,
                'barcode_hash' => $copy->barcode_hash,
                'barcode_svg' => BarcodeService::generateSvg($copy->barcode_hash),
                'condition' => $copy->condition,
                'status' => $copy->status,
            ];
        });
    }
}
