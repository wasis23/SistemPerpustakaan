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
     * Pencarian Katalog Buku Interaktif untuk Anggota
     */
    public function index(Request $request): Response
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

        $books = $query->latest('id')->paginate(12)->withQueryString();

        return Inertia::render('Anggota/Catalog/Index', [
            'books' => $books,
            'categories' => Category::select('id', 'code', 'name')->get(),
            'racks' => Rack::select('id', 'code_rack', 'location')->get(),
            'filters' => $request->only(['search', 'category_id', 'rack_id']),
        ]);
    }

    /**
     * Detail Buku & Eksemplar Fisik di Rak
     */
    public function show(Book $book): Response
    {
        $book->load(['category', 'rack', 'copies']);

        $copies = $book->copies->map(function ($copy) {
            return [
                'id' => $copy->id,
                'copy_code' => $copy->copy_code,
                'barcode_hash' => $copy->barcode_hash,
                'barcode_svg' => BarcodeService::generateSvg($copy->barcode_hash),
                'condition' => $copy->condition,
                'status' => $copy->status,
            ];
        });

        return Inertia::render('Anggota/Catalog/Show', [
            'book' => $book,
            'copies' => $copies,
        ]);
    }
}
