<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\Rack;
use App\Services\BarcodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
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
     * Fetch Data Katalog Global via ISBN (Open Library API -> Indonesia OneSearch Fallback)
     */
    public function fetchExternalMetadata(Request $request)
    {
        $query = trim($request->input('query', ''));
        if (empty($query)) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor ISBN tidak boleh kosong.'
            ], 400);
        }

        // HANYA MENDUKUNG PENCARIAN BERDASARKAN ISBN
        $cleanIsbn = preg_replace('/[^0-9X]/i', '', $query);
        $isIsbn = (bool) preg_match('/^[0-9]{9}[0-9X]$|^[0-9]{13}$/i', $cleanIsbn);

        if (!$isIsbn && strlen($cleanIsbn) < 9) {
            return response()->json([
                'success' => false,
                'message' => 'Pencarian katalog otomatis hanya mendukung scan barcode / nomor ISBN valid (10 atau 13 digit angka).'
            ], 422);
        }

        $classifyDdc = function ($text) {
            $text = strtolower($text);
            if (preg_match('/fiction|novel|literature|sastra|cerpen|komik|poetry|drama|fiksi|bumi|hujan|matahari|bintang|komet|negeri/i', $text)) {
                return '800';
            } elseif (preg_match('/computer|programming|software|coding|web development|database|python|javascript|php|informatics|rekayasa perangkat lunak|laravel|java|react/i', $text)) {
                return '004';
            } elseif (preg_match('/health|medical|kedokteran|kesehatan|rekam medis|nursing|pharmacy|farmasi|mental health|medicine|anatomi|kebidanan|gizi/i', $text)) {
                return '610';
            } elseif (preg_match('/business|management|accounting|akuntansi|ekonomi|marketing|manajemen|finance|keuangan|bisnis/i', $text)) {
                return '650';
            } elseif (preg_match('/social|law|hukum|politik|sosiologi|education|pendidikan|kriminologi|pancasila|kewarganegaraan/i', $text)) {
                return '300';
            } elseif (preg_match('/technology|engineering|teknik|mesin|industri|arsitektur|elektro|otomotif|sipil/i', $text)) {
                return '600';
            } elseif (preg_match('/religion|agama|islam|kristen|hindu|buddha|teologi|fiqih|hadis|al-quran|tasawuf/i', $text)) {
                return '200';
            } elseif (preg_match('/psychology|psikologi|filsafat|philosophy|etika|stoik|teras/i', $text)) {
                return '100';
            } elseif (preg_match('/history|geography|sejarah|geografi|biography|biografi|pahlawan/i', $text)) {
                return '900';
            } elseif (preg_match('/art|music|seni|musik|desain|fotografi|gambar/i', $text)) {
                return '700';
            } elseif (preg_match('/science|matematika|math|fisika|kimia|biologi|kalkulus/i', $text)) {
                return '500';
            } elseif (preg_match('/language|bahasa|linguistik|kamus|english|indonesia/i', $text)) {
                return '400';
            }
            return '000';
        };

        $bookData = null;
        $source = '';

        // 1. CARI PERTAMA: Open Library API menggunakan ISBN
        try {
            $olUrl = "https://openlibrary.org/search.json?isbn=" . urlencode($cleanIsbn);
            $response = Http::timeout(6)->get($olUrl);

            if ($response->successful()) {
                $json = $response->json();
                if (!empty($json['docs'][0])) {
                    $doc = $json['docs'][0];
                    $title = $doc['title'] ?? null;
                    $authors = isset($doc['author_name']) && is_array($doc['author_name']) ? implode(', ', $doc['author_name']) : ($doc['author_name'] ?? '');
                    $publisher = isset($doc['publisher']) && is_array($doc['publisher']) ? $doc['publisher'][0] : ($doc['publisher'] ?? '');
                    $publishYear = $doc['first_publish_year'] ?? ($doc['publish_year'][0] ?? null);
                    $isbn = isset($doc['isbn']) && is_array($doc['isbn']) ? $doc['isbn'][0] : $cleanIsbn;

                    $ddc = !empty($doc['ddc'][0]) ? (string)$doc['ddc'][0] : (!empty($doc['dewey_decimal_class'][0]) ? (string)$doc['dewey_decimal_class'][0] : null);

                    // Ambil detail edisi jika Penerbit, ISBN, atau DDC belum lengkap
                    $editionKey = $doc['cover_edition_key'] ?? ($doc['edition_key'][0] ?? null);
                    if ($editionKey && (empty($publisher) || empty($isbn) || empty($ddc))) {
                        try {
                            $edRes = Http::timeout(3)->get("https://openlibrary.org/books/{$editionKey}.json");
                            if ($edRes->successful()) {
                                $edJson = $edRes->json();
                                if (empty($publisher) && !empty($edJson['publishers'])) {
                                    $publisher = is_array($edJson['publishers']) ? $edJson['publishers'][0] : (string)$edJson['publishers'];
                                }
                                if (empty($isbn)) {
                                    $isbn = $edJson['isbn_13'][0] ?? ($edJson['isbn_10'][0] ?? $cleanIsbn);
                                }
                                if (empty($ddc) && !empty($edJson['dewey_decimal_class'][0])) {
                                    $ddc = (string)$edJson['dewey_decimal_class'][0];
                                }
                            }
                        } catch (\Throwable $e) {}
                    }

                    if (empty($ddc)) {
                        $subjects = is_array($doc['subject'] ?? null) ? array_map('strtolower', $doc['subject']) : [];
                        if (empty($subjects) && !empty($doc['key'])) {
                            try {
                                $workRes = Http::timeout(3)->get("https://openlibrary.org{$doc['key']}.json");
                                if ($workRes->successful()) {
                                    $workJson = $workRes->json();
                                    $subjects = is_array($workJson['subjects'] ?? null) ? array_map('strtolower', $workJson['subjects']) : [];
                                }
                            } catch (\Throwable $e) {}
                        }
                        $ddc = $classifyDdc(implode(' ', $subjects) . ' ' . $title);
                    }

                    $coverUrl = !empty($doc['cover_i'])
                        ? "https://covers.openlibrary.org/b/id/{$doc['cover_i']}-L.jpg"
                        : "https://covers.openlibrary.org/b/isbn/{$cleanIsbn}-L.jpg";

                    if ($title) {
                        $bookData = [
                            'title' => $title,
                            'author' => $authors ?: 'Penulis Tidak Diketahui',
                            'publisher' => $publisher ?: '',
                            'publish_year' => $publishYear ?: (int)date('Y'),
                            'isbn' => $isbn ?: $cleanIsbn,
                            'ddc' => $ddc,
                            'cover_url' => $coverUrl,
                        ];
                        $source = 'Open Library API';
                    }
                }
            }
        } catch (\Throwable $e) {}

        // 2. CARI KEDUA: Indonesia OneSearch (onesearch.id) jika tidak ada di Open Library
        if (!$bookData) {
            try {
                $osUrl = "https://onesearch.id/Search/Results?lookfor=" . urlencode($cleanIsbn) . "&view=rss";
                $osResponse = Http::timeout(6)->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                ])->get($osUrl);

                if ($osResponse->successful()) {
                    $xml = @simplexml_load_string($osResponse->body());
                    if ($xml && !empty($xml->channel->item[0])) {
                        $item = $xml->channel->item[0];
                        $namespaces = $item->getNamespaces(true);
                        $dc = $item->children($namespaces['dc'] ?? 'http://purl.org/dc/elements/1.1/');

                        $rawTitle = (string)$item->title;
                        if (strpos($rawTitle, ' / ') !== false) {
                            $rawTitle = explode(' / ', $rawTitle)[0];
                        }

                        $author = (string)($dc->creator ?: $item->author);
                        $year = (string)$dc->date;
                        $link = (string)$item->link;
                        $publisher = '';

                        // Tarik metadata detail RIS Export untuk nama penerbit & pengarang lengkap
                        if (!empty($link)) {
                            try {
                                $exportUrl = rtrim($link, '/') . '/Export?style=RIS';
                                $expRes = Http::timeout(3)->withHeaders([
                                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                                ])->get($exportUrl);

                                if ($expRes->successful()) {
                                    $lines = explode("\n", $expRes->body());
                                    foreach ($lines as $line) {
                                        $line = trim($line);
                                        if (str_starts_with($line, 'TI  - ') && empty($rawTitle)) {
                                            $rawTitle = substr($line, 6);
                                        } elseif (str_starts_with($line, 'AU  - ') && (empty($author) || str_contains($author, ','))) {
                                            $author = substr($line, 6);
                                        } elseif (str_starts_with($line, 'PB  - ')) {
                                            $publisher = substr($line, 6);
                                        } elseif (str_starts_with($line, 'PY  - ') && empty($year)) {
                                            $year = substr($line, 6);
                                        }
                                    }
                                }
                            } catch (\Throwable $e) {}
                        }

                        // Format penulisan jika nama pengarang 'NamaBelakang, NamaDepan'
                        if (strpos($author, ',') !== false) {
                            $parts = explode(',', $author);
                            $author = trim($parts[1] ?? '') . ' ' . trim($parts[0] ?? '');
                        }

                        if (!empty($rawTitle)) {
                            $ddc = $classifyDdc($rawTitle . ' ' . $author . ' ' . $publisher);

                            $bookData = [
                                'title' => trim($rawTitle),
                                'author' => trim($author) ?: 'Penulis Tidak Diketahui',
                                'publisher' => trim($publisher) ?: '',
                                'publish_year' => is_numeric(trim($year)) ? (int)trim($year) : (int)date('Y'),
                                'isbn' => $cleanIsbn,
                                'ddc' => $ddc,
                                'cover_url' => "https://covers.openlibrary.org/b/isbn/{$cleanIsbn}-L.jpg",
                            ];
                            $source = 'Indonesia OneSearch (onesearch.id)';
                        }
                    }
                }
            } catch (\Throwable $e) {}
        }

        if (!$bookData) {
            return response()->json([
                'success' => false,
                'message' => 'Buku dengan nomor ISBN ' . $query . ' tidak ditemukan di Open Library maupun Indonesia OneSearch. Silakan lengkapi form manual.'
            ], 404);
        }

        // Process DDC & Auto-register Category if not exists
        $ddcCode = !empty($bookData['ddc']) ? $bookData['ddc'] : '000';
        $category = Category::where('code', $ddcCode)->first();

        if (!$category) {
            $mainDdc = substr(preg_replace('/[^0-9]/', '', $ddcCode), 0, 3);
            if ($mainDdc !== '') {
                $category = Category::where('code', $mainDdc)->first();
            }
        }

        if (!$category) {
            $standardNames = [
                '000' => 'Karya Umum & Komputer',
                '004' => 'Pemrograman & Rekayasa Perangkat Lunak',
                '100' => 'Filsafat & Psikologi',
                '200' => 'Agama & Kepercayaan',
                '300' => 'Ilmu Sosial & Hukum',
                '400' => 'Bahasa & Linguistik',
                '500' => 'Sains & Matematika',
                '600' => 'Teknologi & Ilmu Terapan',
                '610' => 'Kesehatan & Rekam Medis',
                '650' => 'Manajemen & Akuntansi',
                '700' => 'Kesenian & Olahraga',
                '800' => 'Kesusastraan & Novel',
                '900' => 'Sejarah & Geografi',
            ];
            $categoryName = $standardNames[$ddcCode] ?? "Kategori DDC " . $ddcCode;
            $category = Category::create([
                'code' => $ddcCode,
                'name' => $categoryName,
                'description' => "Otomatis terdaftar dari pencarian katalog global API",
            ]);
        }

        // Generate Call Number: [DDC] [3-Letter Author] [1-Letter Title (lower)]
        $cleanAuthor = preg_replace('/[^A-Za-z]/', '', $bookData['author']);
        $authorCode = strtoupper(substr($cleanAuthor, 0, 3));
        if (strlen($authorCode) < 3) {
            $authorCode = str_pad($authorCode, 3, 'X');
        }

        $cleanTitle = preg_replace('/[^A-Za-z]/', '', $bookData['title']);
        $titleCode = strtolower(substr($cleanTitle, 0, 1));
        if (empty($titleCode)) {
            $titleCode = 'a';
        }

        $callNumber = "{$category->code} {$authorCode} {$titleCode}";

        return response()->json([
            'success' => true,
            'source' => $source,
            'data' => [
                'title' => $bookData['title'],
                'author' => $bookData['author'],
                'publisher' => $bookData['publisher'] ?: '',
                'publish_year' => $bookData['publish_year'] ?: (int)date('Y'),
                'isbn' => $bookData['isbn'] ?: '',
                'cover_url' => $bookData['cover_url'] ?: '',
                'category_id' => $category->id,
                'ddc_code' => $category->code,
                'call_number' => $callNumber,
            ],
            'categories' => Category::select('id', 'code', 'name')->get(),
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
            'procurement_year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'category_id' => ['required', 'exists:categories,id'],
            'rack_id' => ['required', 'exists:racks,id'],
            'call_number' => ['nullable', 'string', 'max:100'],
            'initial_copies' => ['required', 'integer', 'min:1', 'max:50'],
            'cover_image' => ['nullable'],
            'cover_url' => ['nullable', 'string'],
        ]);

        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $coverPath = '/storage/' . $request->file('cover_image')->store('covers', 'public');
        } elseif ($request->filled('cover_url')) {
            $coverPath = $request->cover_url;
        } elseif (is_string($request->cover_image) && !empty($request->cover_image)) {
            $coverPath = $request->cover_image;
        }

        // Auto-generate call_number if not supplied
        $callNumber = $validated['call_number'] ?? null;
        if (empty($callNumber)) {
            $category = Category::find($validated['category_id']);
            $catCode = $category ? $category->code : '000';

            $cleanAuthor = preg_replace('/[^A-Za-z]/', '', $validated['author']);
            $authorCode = strtoupper(substr($cleanAuthor, 0, 3));
            if (strlen($authorCode) < 3) $authorCode = str_pad($authorCode, 3, 'X');

            $cleanTitle = preg_replace('/[^A-Za-z]/', '', $validated['title']);
            $titleCode = strtolower(substr($cleanTitle, 0, 1));
            if (empty($titleCode)) $titleCode = 'a';

            $callNumber = "{$catCode} {$authorCode} {$titleCode}";
        }

        $procurementYear = !empty($validated['procurement_year']) 
            ? (int)$validated['procurement_year'] 
            : (int)date('Y');

        $book = Book::create([
            'isbn' => $validated['isbn'],
            'title' => $validated['title'],
            'author' => $validated['author'],
            'publisher' => $validated['publisher'],
            'publish_year' => $validated['publish_year'],
            'procurement_year' => $procurementYear,
            'category_id' => $validated['category_id'],
            'rack_id' => $validated['rack_id'],
            'cover_image' => $coverPath,
            'call_number' => $callNumber,
            'total_copies' => $validated['initial_copies'],
        ]);

        // Auto-generate eksemplar fisik
        $category = Category::find($validated['category_id']);
        $catCode = $category ? $category->code : 'GEN';
        $shortTitle = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $validated['title']), 0, 4));
        $yy = substr((string)$procurementYear, -2);

        $baseInventoryNumber = BarcodeService::getNextInventoryNumber(0);

        for ($i = 1; $i <= $validated['initial_copies']; $i++) {
            $suffix = chr(64 + $i);
            $copyCode = "IND-{$catCode}-{$shortTitle}-{$book->id}-{$suffix}";
            $invNumber = $baseInventoryNumber + $i;
            $barcode = BarcodeService::generateCopyBarcode($yy, $invNumber);

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
            'procurement_year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'category_id' => ['required', 'exists:categories,id'],
            'rack_id' => ['required', 'exists:racks,id'],
            'call_number' => ['nullable', 'string', 'max:100'],
            'cover_image' => ['nullable'],
            'cover_url' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('covers', 'public');
            $validated['cover_image'] = '/storage/' . $coverPath;
        } elseif ($request->filled('cover_url')) {
            $validated['cover_image'] = $request->cover_url;
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
        $procurementYear = !empty($book->procurement_year) 
            ? (int)$book->procurement_year 
            : (!empty($book->publish_year) ? (int)$book->publish_year : (int)date('Y'));
        $yy = substr((string)$procurementYear, -2);

        $baseInventoryNumber = BarcodeService::getNextInventoryNumber(0);

        for ($i = 1; $i <= $request->count; $i++) {
            $num = $currentCount + $i;
            $suffix = $num <= 26 ? chr(64 + $num) : "X{$num}";
            $copyCode = "IND-{$catCode}-{$shortTitle}-{$book->id}-{$suffix}";
            $invNumber = $baseInventoryNumber + $i;
            $barcode = BarcodeService::generateCopyBarcode($yy, $invNumber);

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
        $runningInventory = BarcodeService::getNextInventoryNumber(0);

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

            // Cek apakah kolom 5 adalah TahunPengadaan (format 4 digit angka) atau KodeKategoriDDC
            $hasProcurementCol = isset($cols[5]) && is_numeric(trim($cols[5])) && strlen(trim($cols[5])) === 4 && count($cols) >= 9;

            if ($hasProcurementCol) {
                $procurementYear = (int)trim($cols[5]);
                $categoryCode = isset($cols[6]) ? trim($cols[6]) : null;
                $rackCode = isset($cols[7]) ? trim($cols[7]) : null;
                $copiesCount = isset($cols[8]) && is_numeric(trim($cols[8])) ? (int)trim($cols[8]) : 1;
            } else {
                $procurementYear = (int)date('Y');
                $categoryCode = isset($cols[5]) ? trim($cols[5]) : null;
                $rackCode = isset($cols[6]) ? trim($cols[6]) : null;
                $copiesCount = isset($cols[7]) && is_numeric(trim($cols[7])) ? (int)trim($cols[7]) : 1;
            }

            $category = null;
            if ($categoryCode) {
                $category = Category::where('code', $categoryCode)->orWhere('id', $categoryCode)->first();
            }
            $categoryId = $category ? $category->id : ($defaultCat ? $defaultCat->id : 1);

            $rack = null;
            if ($rackCode) {
                $rack = Rack::where('code_rack', $rackCode)->orWhere('id', $rackCode)->first();
            }
            $rackId = $rack ? $rack->id : ($defaultRack ? $defaultRack->id : 1);

            if (empty($title) || empty($author)) continue;

            $book = Book::create([
                'isbn' => $isbn,
                'title' => $title,
                'author' => $author,
                'publisher' => $publisher,
                'publish_year' => $publishYear,
                'procurement_year' => $procurementYear,
                'category_id' => $categoryId,
                'rack_id' => $rackId,
                'total_copies' => $copiesCount,
            ]);

            $shortTitle = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $title), 0, 4));
            $yy = substr((string)$procurementYear, -2);

            for ($i = 1; $i <= $copiesCount; $i++) {
                $runningInventory++;
                $suffix = chr(64 + $i);
                $copyCode = "IMP-{$shortTitle}-{$book->id}-{$suffix}";
                $barcode = BarcodeService::generateCopyBarcode($yy, $runningInventory);

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
            fputcsv($file, ['Judul', 'Pengarang', 'ISBN', 'Penerbit', 'TahunTerbit', 'TahunPengadaan', 'KodeKategoriDDC', 'KodeRak', 'JumlahEksemplar']);
            fputcsv($file, ['Pemrograman Web dengan Laravel 11', 'Budi Santoso M.Kom', '978-602-8765-43-2', 'Informatika Press', '2022', '2026', '000', 'RAK-01', '3']);
            fputcsv($file, ['Panduan Rekam Medis Modern', 'Dr. Hendra Wijaya', '978-602-1234-56-7', 'Airlangga Press', '2020', '2024', '600', 'RAK-02', '2']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

