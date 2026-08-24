<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\Rack;
use App\Services\BarcodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * Tampilkan Daftar Katalog Buku untuk Petugas
     */
    public function index(Request $request): Response
    {
        $query = Book::with(['category', 'rack'])
            ->withCount(['copies', 'availableCopies']);

        // Filter Pencarian (Judul, Pengarang, ISBN)
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

        $books = $query->latest('id')->paginate(10)->withQueryString();

        return Inertia::render('Petugas/Books/Index', [
            'books' => $books,
            'categories' => Category::select('id', 'code', 'name')->get(),
            'racks' => Rack::with('laboratory')->get(),
            'filters' => $request->only(['search', 'category_id', 'rack_id']),
        ]);
    }

    /**
     * Tampilkan Form Tambah Katalog Buku
     */
    public function create(): Response
    {
        return Inertia::render('Petugas/Books/Create', [
            'categories' => Category::select('id', 'code', 'name')->get(),
            'racks' => Rack::with('laboratory')->get(),
        ]);
    }

    /**
     * Simpan Data Induk Buku & Generasi Eksemplar Fisik
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'isbn' => ['nullable', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'publisher' => ['nullable', 'string', 'max:255'],
            'publish_year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'category_id' => ['required', 'exists:categories,id'],
            'rack_id' => ['required', 'exists:racks,id'],
            'initial_copies' => ['required', 'integer', 'min:1', 'max:50'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('covers', 'public');
        }

        $book = Book::create([
            'isbn' => $validated['isbn'],
            'title' => $validated['title'],
            'author' => $validated['author'],
            'publisher' => $validated['publisher'],
            'publish_year' => $validated['publish_year'],
            'category_id' => $validated['category_id'],
            'rack_id' => $validated['rack_id'],
            'cover_image' => $coverPath ? '/storage/' . $coverPath : null,
            'total_copies' => $validated['initial_copies'],
        ]);

        // Auto-generate eksemplar fisik
        $category = Category::find($validated['category_id']);
        $catCode = $category ? $category->code : 'GEN';
        $shortTitle = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $validated['title']), 0, 4));

        for ($i = 1; $i <= $validated['initial_copies']; $i++) {
            $suffix = chr(64 + $i);
            $copyCode = "IND-{$catCode}-{$shortTitle}-{$book->id}-{$suffix}";
            $barcode = "BC-" . strtoupper(Str::random(8));

            BookCopy::create([
                'book_id' => $book->id,
                'copy_code' => $copyCode,
                'barcode_hash' => $barcode,
                'condition' => 'good',
                'status' => 'available',
            ]);
        }

        return redirect()->route('petugas.books.show', $book->id)
            ->with('success', 'Buku baru dan ' . $validated['initial_copies'] . ' eksemplar fisik berhasil ditambahkan!');
    }

    /**
     * Detail Buku & Eksemplar Fisik
     */
    public function show(Book $book): Response
    {
        $book->load(['category', 'rack', 'copies']);

        // Lampirkan string Barcode SVG untuk setiap eksemplar
        $copiesWithBarcode = $book->copies->map(function ($copy) {
            return [
                'id' => $copy->id,
                'copy_code' => $copy->copy_code,
                'barcode_hash' => $copy->barcode_hash,
                'barcode_svg' => BarcodeService::generateSvg($copy->barcode_hash),
                'condition' => $copy->condition,
                'status' => $copy->status,
                'created_at' => $copy->created_at->format('d M Y'),
            ];
        });

        return Inertia::render('Petugas/Books/Show', [
            'book' => $book,
            'copies' => $copiesWithBarcode,
        ]);
    }

    /**
     * Form Edit Buku
     */
    public function edit(Book $book): Response
    {
        return Inertia::render('Petugas/Books/Edit', [
            'book' => $book,
            'categories' => Category::select('id', 'code', 'name')->get(),
            'racks' => Rack::select('id', 'code_rack', 'location')->get(),
        ]);
    }

    /**
     * Update Data Buku
     */
    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'isbn' => ['nullable', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'publisher' => ['nullable', 'string', 'max:255'],
            'publish_year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'category_id' => ['required', 'exists:categories,id'],
            'rack_id' => ['required', 'exists:racks,id'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('covers', 'public');
            $validated['cover_image'] = '/storage/' . $coverPath;
        }

        $book->update($validated);

        return redirect()->route('petugas.books.show', $book->id)
            ->with('success', 'Data katalog buku berhasil diperbarui!');
    }

    /**
     * Hapus Buku & Eksemplar
     */
    public function destroy(Book $book)
    {
        $book->delete();
        return redirect()->route('petugas.books.index')
            ->with('success', 'Buku beserta seluruh eksemplarnya berhasil dihapus.');
    }

    /**
     * Tambah Eksemplar Fisik Tambahan
     */
    public function addCopies(Request $request, Book $book)
    {
        $request->validate([
            'count' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $currentCount = $book->copies()->count();
        $newTotal = $currentCount + $request->count;

        $category = $book->category;
        $catCode = $category ? $category->code : 'GEN';
        $shortTitle = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $book->title), 0, 4));

        for ($i = 1; $i <= $request->count; $i++) {
            $num = $currentCount + $i;
            $suffix = $num <= 26 ? chr(64 + $num) : "X{$num}";
            $copyCode = "IND-{$catCode}-{$shortTitle}-{$book->id}-{$suffix}";
            $barcode = "BC-" . strtoupper(Str::random(8));

            BookCopy::create([
                'book_id' => $book->id,
                'copy_code' => $copyCode,
                'barcode_hash' => $barcode,
                'condition' => 'good',
                'status' => 'available',
            ]);
        }

        $book->update(['total_copies' => $newTotal]);

        return back()->with('success', $request->count . ' eksemplar fisik baru berhasil ditambahkan.');
    }

    /**
     * Halaman Cetak Barcode Label Fisik Buku
     */
    public function printBarcodes(Book $book): Response
    {
        $book->load(['category', 'rack', 'copies']);

        $labels = $book->copies->map(function ($copy) use ($book) {
            return [
                'copy_code' => $copy->copy_code,
                'barcode_hash' => $copy->barcode_hash,
                'barcode_svg' => BarcodeService::generateSvg($copy->barcode_hash),
                'title' => $book->title,
                'rack_code' => $book->rack->code_rack ?? 'RAK-01',
                'rack_location' => $book->rack->location ?? 'Perpustakaan',
            ];
        });

        return Inertia::render('Petugas/Books/PrintBarcodes', [
            'book' => $book,
            'labels' => $labels,
        ]);
    }

    /**
     * Impor Massal Buku via CSV / Text Input
     */
    public function importCsv(Request $request)
    {
        $request->validate([
            'csv_data' => ['required', 'string'],
        ]);

        $lines = explode("\n", trim($request->csv_data));
        $importedCount = 0;

        $defaultCat = Category::first();
        $defaultRack = Rack::first();

        foreach ($lines as $line) {
            $cols = str_getcsv(trim($line));
            if (count($cols) < 2) continue;

            $title = trim($cols[0]);
            // Skip CSV Header if present
            if (strtolower($title) === 'judul') continue;

            $author = trim($cols[1]);
            $isbn = isset($cols[2]) && trim($cols[2]) !== '' ? trim($cols[2]) : null;
            $publisher = isset($cols[3]) && trim($cols[3]) !== '' ? trim($cols[3]) : 'Penerbit Impor';
            $publishYear = isset($cols[4]) && is_numeric(trim($cols[4])) ? (int)trim($cols[4]) : (int)date('Y');

            $categoryCode = isset($cols[5]) ? trim($cols[5]) : null;
            $category = null;
            if ($categoryCode) {
                $category = Category::where('code', $categoryCode)->orWhere('id', $categoryCode)->first();
            }
            $categoryId = $category ? $category->id : ($defaultCat ? $defaultCat->id : 1);

            $rackCode = isset($cols[6]) ? trim($cols[6]) : null;
            $rack = null;
            if ($rackCode) {
                $rack = Rack::where('code_rack', $rackCode)->orWhere('id', $rackCode)->first();
            }
            $rackId = $rack ? $rack->id : ($defaultRack ? $defaultRack->id : 1);

            $copiesCount = isset($cols[7]) && is_numeric(trim($cols[7])) ? (int)trim($cols[7]) : 1;

            if (empty($title) || empty($author)) continue;

            $book = Book::create([
                'isbn' => $isbn,
                'title' => $title,
                'author' => $author,
                'publisher' => $publisher,
                'publish_year' => $publishYear,
                'category_id' => $categoryId,
                'rack_id' => $rackId,
                'total_copies' => $copiesCount,
            ]);

            $shortTitle = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $title), 0, 4));

            for ($i = 1; $i <= $copiesCount; $i++) {
                $suffix = chr(64 + $i);
                $copyCode = "IMP-{$shortTitle}-{$book->id}-{$suffix}";
                $barcode = "BC-" . strtoupper(Str::random(8));

                BookCopy::create([
                    'book_id' => $book->id,
                    'copy_code' => $copyCode,
                    'barcode_hash' => $barcode,
                    'condition' => 'good',
                    'status' => 'available',
                ]);
            }

            $importedCount++;
        }

        return back()->with('success', "Berhasil mengimpor {$importedCount} judul buku massal!");
    }

    /**
     * Unduh Template CSV Impor Massal
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_impor_buku_simpus.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Judul', 'Pengarang', 'ISBN', 'Penerbit', 'TahunTerbit', 'KodeKategoriDDC', 'KodeRak', 'JumlahEksemplar']);
            fputcsv($file, ['Pemrograman Web dengan Laravel 11', 'Budi Santoso M.Kom', '978-602-8765-43-2', 'Informatika Press', '2024', '000', 'RAK-01', '3']);
            fputcsv($file, ['Panduan Rekam Medis Modern', 'Dr. Hendra Wijaya', '978-602-1234-56-7', 'Airlangga Press', '2023', '600', 'RAK-02', '2']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

