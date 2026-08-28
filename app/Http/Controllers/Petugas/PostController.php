<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * Tampilkan Daftar Berita & Artikel Petugas
     */
    public function index(Request $request): Response
    {
        $query = Post::with('author')
            ->search($request->search);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->boolean('featured_only')) {
            $query->where('is_featured', true);
        }

        $posts = $query->latest('id')->paginate(10)->withQueryString();

        // Kategori yang tersedia
        $categories = Post::distinct()->pluck('category')->filter()->values();

        // Statistik ringkas
        $counts = [
            'all' => Post::count(),
            'published' => Post::where('status', 'published')->count(),
            'draft' => Post::where('status', 'draft')->count(),
            'featured' => Post::where('is_featured', true)->count(),
        ];

        return Inertia::render('Petugas/Posts/Index', [
            'posts' => $posts,
            'filters' => $request->only(['search', 'status', 'category', 'featured_only']),
            'categories' => $categories,
            'counts' => $counts,
        ]);
    }

    /**
     * Form Buat Berita Baru
     */
    public function create(): Response
    {
        $categories = [
            'Pengumuman',
            'Kegiatan & Acara',
            'Inovasi & Teknologi',
            'Koleksi Baru',
            'Literasi Informasi',
            'Akademik & Riset',
            'Panduan Layanan',
        ];

        $authors = User::where('role', 'petugas')->get(['id', 'name', 'username']);

        return Inertia::render('Petugas/Posts/Create', [
            'categories' => $categories,
            'authors' => $authors,
            'defaultAuthor' => Auth::user(),
        ]);
    }

    /**
     * Generate Konten Berita Otomatis dengan Bantuan LLM (AI)
     */
    public function generateWithAi(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => ['required', 'string', 'max:500'],
            'category' => ['nullable', 'string'],
            'tone' => ['nullable', 'string'],
        ]);

        $userPrompt = trim($request->prompt);
        $preferredCategory = $request->category ?: 'Pengumuman';
        $tone = $request->tone ?: 'informatif, menarik, dan profesional';

        $openAiKey = config('services.openai.api_key') ?: env('OPENAI_API_KEY');
        $generatedData = null;

        if (!empty($openAiKey)) {
            try {
                $systemPrompt = "Anda adalah Asisten Jurnalis & Content Writer Ahli Perpustakaan Digital di Politeknik Indonusa Surakarta (SIMPUS Poltek Indonusa).\n"
                    . "Tugas Anda adalah membuat artikel berita / pengumuman perpustakaan yang lengkap, terstruktur, profesional, dan kaya informasi berdasarkan ide atau judul yang diberikan oleh pustakawan.\n"
                    . "Kategori perpustakaan yang tersedia: 'Pengumuman', 'Kegiatan & Acara', 'Inovasi & Teknologi', 'Koleksi Baru', 'Literasi Informasi', 'Akademik & Riset', 'Panduan Layanan'.\n\n"
                    . "Format output HARUS berupa JSON murni dengan format persis seperti ini (tanpa markdown tambahan di luar JSON):\n"
                    . "{\n"
                    . "  \"title\": \"Judul Berita yang Menarik, Ringkas, dan Jurnalistik\",\n"
                    . "  \"slug\": \"slug-url-berita-seo\",\n"
                    . "  \"category\": \"Kategori yang paling cocok\",\n"
                    . "  \"excerpt\": \"Ringkasan 1-2 kalimat padat untuk kartu preview dan search engine (maksimal 180 karakter).\",\n"
                    . "  \"content\": \"<p>Paragraf pembuka berita...</p><h2>Sub Judul 1</h2><p>Penjelasan detail...</p><ul><li>Poin penting 1</li><li>Poin penting 2</li></ul><blockquote>Kutipan penting atau highlight pengumuman perpustakaan</blockquote><h2>Sub Judul 2</h2><p>Paragraf penutup atau ajakan sivitas akademika...</p>\",\n"
                    . "  \"meta_title\": \"Judul SEO Google 50-60 Karakter | SIMPUS Politeknik Indonusa\",\n"
                    . "  \"meta_description\": \"Deskripsi meta pencarian Google 130-155 karakter yang mengundang klik.\",\n"
                    . "  \"meta_keywords\": \"kata kunci 1, kata kunci 2, perpustakaan, poltekindonusa, literasi\",\n"
                    . "  \"thumbnail_alt\": \"Deskripsi alt gambar pendukung berita\"\n"
                    . "}\n\n"
                    . "Gunakan gaya bahasa: {$tone}. Konten artikel pada key 'content' harus menggunakan tag HTML standar (<p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>) yang rapi, berbobot, dan siap dipublikasikan.";

                $response = Http::timeout(30)->withHeaders([
                    'Authorization' => 'Bearer ' . $openAiKey,
                    'Content-Type' => 'application/json',
                ])->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => "Buatkan artikel berita/pengumuman lengkap untuk topik perpustakaan berikut ini:\n\"{$userPrompt}\"" . ($preferredCategory ? "\nKategori yang diinginkan: {$preferredCategory}" : "")],
                    ],
                    'temperature' => 0.7,
                    'response_format' => ['type' => 'json_object'],
                ]);

                if ($response->successful()) {
                    $json = $response->json();
                    $contentStr = $json['choices'][0]['message']['content'] ?? '';
                    $cleanJson = trim($contentStr);
                    $parsed = json_decode($cleanJson, true);
                    if ($parsed && !empty($parsed['title']) && !empty($parsed['content'])) {
                        $generatedData = $parsed;
                    }
                }
            } catch (\Throwable $e) {
                // Fallback handled below
            }
        }

        // Fallback smart generator jika OpenAI API belum diisi / offline
        if (!$generatedData) {
            $title = Str::title($userPrompt);
            $slug = Str::slug($title);
            $cat = in_array($preferredCategory, [
                'Pengumuman', 'Kegiatan & Acara', 'Inovasi & Teknologi', 'Koleksi Baru',
                'Literasi Informasi', 'Akademik & Riset', 'Panduan Layanan'
            ]) ? $preferredCategory : 'Pengumuman';

            $generatedData = [
                'title' => $title,
                'slug' => $slug,
                'category' => $cat,
                'excerpt' => "Perpustakaan Politeknik Indonusa Surakarta merilis informasi terkini mengenai {$title} guna menunjang produktivitas dan literasi akademik seluruh sivitas kampus.",
                'content' => "<p>Dalam rangka meningkatkan mutu layanan serta memperluas akses sumber daya informasi, UPT Perpustakaan Politeknik Indonusa Surakarta secara resmi menghadirkan program dan pengumuman mengenai <strong>{$title}</strong>.</p>"
                    . "<h2>Tujuan & Manfaat Program</h2>"
                    . "<p>Inisiatif ini diluncurkan untuk mempermudah mahasiswa, dosen, serta tenaga kependidikan dalam mengakses referensi keilmuan, riset, dan pemanfaatan fasilitas perpustakaan modern.</p>"
                    . "<ul>"
                    . "<li>Memperluas jangkauan layanan literasi informasi bagi seluruh civitas akademika.</li>"
                    . "<li>Menyediakan sarana referensi yang kredibel, mutakhir, dan relevan dengan kurikulum vokasi.</li>"
                    . "<li>Mendorong iklim riset, publikasi ilmiah, dan minat baca yang berkelanjutan di lingkungan kampus.</li>"
                    . "</ul>"
                    . "<blockquote>\"Perpustakaan bertransformasi menjadi pusat kolaborasi, riset, dan pengembangan inovasi terdepan sivitas akademika Politeknik Indonusa.\"</blockquote>"
                    . "<h2>Panduan & Akses Layanan</h2>"
                    . "<p>Seluruh civitas akademika dapat langsung memanfaatkan layanan ini melalui meja sirkulasi perpustakaan atau mengakses portal SIMPUS digital Politeknik Indonusa Surakarta pada hari dan jam operasional layanan.</p>"
                    . "<p>Untuk konsultasi dan bantuan lebih lanjut, silakan menghubungi tim pustakawan di layanan informasi terpadu perpustakaan.</p>",
                'meta_title' => Str::limit($title, 55, '') . ' | Perpustakaan Poltek Indonusa',
                'meta_description' => "Informasi lengkap {$title} dari Perpustakaan Politeknik Indonusa Surakarta. Simak panduan dan jadwal resminya di sini.",
                'meta_keywords' => 'perpustakaan, simpus, poltekindonusa, ' . Str::slug($title, ', ') . ', surakarta, literasi',
                'thumbnail_alt' => 'Ilustrasi ' . $title . ' Perpustakaan Politeknik Indonusa Surakarta',
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $generatedData,
        ]);
    }

    /**
     * Simpan Berita Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:posts,slug'],
            'category' => ['required', 'string', 'max:100'],
            'author_name' => ['nullable', 'string', 'max:100'],
            'user_id' => ['nullable', 'exists:users,id'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'content' => ['required', 'string'],
            'thumbnail_file' => ['nullable', 'image', 'max:4096'],
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'thumbnail_alt' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:draft,published,archived'],
            'is_featured' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            
            // Field SEO Khusus
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:255'],
            'canonical_url' => ['nullable', 'url', 'max:255'],
        ]);

        // Generate Slug
        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        // Upload Thumbnail
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail_file')) {
            $thumbnailPath = '/storage/' . $request->file('thumbnail_file')->store('posts', 'public');
        } elseif ($request->filled('thumbnail_url')) {
            $thumbnailPath = $request->thumbnail_url;
        }

        // Author Name fallback
        $userId = $validated['user_id'] ?? Auth::id();
        $user = User::find($userId);
        $authorName = $validated['author_name'] ?: ($user ? $user->name : 'Pustakawan SIMPUS');

        // Reading Time
        $readingTime = Post::estimateReadingTime($validated['content']);

        // Published At
        $publishedAt = $validated['published_at'] ?? ($validated['status'] === 'published' ? now() : null);

        Post::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'user_id' => $userId,
            'author_name' => $authorName,
            'category' => $validated['category'],
            'excerpt' => $validated['excerpt'] ?: Str::limit(strip_tags($validated['content']), 180),
            'content' => $validated['content'],
            'thumbnail' => $thumbnailPath,
            'thumbnail_alt' => $validated['thumbnail_alt'] ?: $validated['title'],
            'status' => $validated['status'],
            'is_featured' => $request->boolean('is_featured'),
            'reading_time' => $readingTime,
            'meta_title' => $validated['meta_title'] ?: $validated['title'],
            'meta_description' => $validated['meta_description'] ?: ($validated['excerpt'] ?: Str::limit(strip_tags($validated['content']), 160)),
            'meta_keywords' => $validated['meta_keywords'],
            'canonical_url' => $validated['canonical_url'],
            'published_at' => $publishedAt,
        ]);

        return redirect()->route('petugas.posts.index')->with('success', 'Berita berhasil dipublikasikan!');
    }

    /**
     * Form Edit Berita
     */
    public function edit(Post $post): Response
    {
        $categories = [
            'Pengumuman',
            'Kegiatan & Acara',
            'Inovasi & Teknologi',
            'Koleksi Baru',
            'Literasi Informasi',
            'Akademik & Riset',
            'Panduan Layanan',
        ];

        $authors = User::where('role', 'petugas')->get(['id', 'name', 'username']);

        return Inertia::render('Petugas/Posts/Edit', [
            'post' => $post,
            'categories' => $categories,
            'authors' => $authors,
        ]);
    }

    /**
     * Update Berita
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:posts,slug,' . $post->id],
            'category' => ['required', 'string', 'max:100'],
            'author_name' => ['nullable', 'string', 'max:100'],
            'user_id' => ['nullable', 'exists:users,id'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'content' => ['required', 'string'],
            'thumbnail_file' => ['nullable', 'image', 'max:4096'],
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'thumbnail_alt' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:draft,published,archived'],
            'is_featured' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            
            // Field SEO Khusus
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:255'],
            'canonical_url' => ['nullable', 'url', 'max:255'],
        ]);

        $thumbnailPath = $post->thumbnail;
        if ($request->hasFile('thumbnail_file')) {
            // Hapus file lama jika disimpan di storage lokal
            if ($thumbnailPath && Str::startsWith($thumbnailPath, '/storage/posts/')) {
                $oldFile = str_replace('/storage/', '', $thumbnailPath);
                Storage::disk('public')->delete($oldFile);
            }
            $thumbnailPath = '/storage/' . $request->file('thumbnail_file')->store('posts', 'public');
        } elseif ($request->filled('thumbnail_url')) {
            $thumbnailPath = $request->thumbnail_url;
        }

        $userId = $validated['user_id'] ?? $post->user_id;
        $user = User::find($userId);
        $authorName = $validated['author_name'] ?: ($user ? $user->name : $post->author_name);

        $readingTime = Post::estimateReadingTime($validated['content']);
        $publishedAt = $validated['published_at'] ?? ($validated['status'] === 'published' ? ($post->published_at ?: now()) : null);

        $post->update([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['slug']),
            'user_id' => $userId,
            'author_name' => $authorName,
            'category' => $validated['category'],
            'excerpt' => $validated['excerpt'] ?: Str::limit(strip_tags($validated['content']), 180),
            'content' => $validated['content'],
            'thumbnail' => $thumbnailPath,
            'thumbnail_alt' => $validated['thumbnail_alt'] ?: $validated['title'],
            'status' => $validated['status'],
            'is_featured' => $request->boolean('is_featured'),
            'reading_time' => $readingTime,
            'meta_title' => $validated['meta_title'] ?: $validated['title'],
            'meta_description' => $validated['meta_description'] ?: ($validated['excerpt'] ?: Str::limit(strip_tags($validated['content']), 160)),
            'meta_keywords' => $validated['meta_keywords'],
            'canonical_url' => $validated['canonical_url'],
            'published_at' => $publishedAt,
        ]);

        return redirect()->route('petugas.posts.index')->with('success', 'Berita berhasil diperbarui!');
    }

    /**
     * Hapus Berita
     */
    public function destroy(Post $post): RedirectResponse
    {
        if ($post->thumbnail && Str::startsWith($post->thumbnail, '/storage/posts/')) {
            $oldFile = str_replace('/storage/', '', $post->thumbnail);
            Storage::disk('public')->delete($oldFile);
        }

        $post->delete();

        return redirect()->route('petugas.posts.index')->with('success', 'Berita berhasil dihapus.');
    }

    /**
     * Toggle status Featured (Berita Sorotan)
     */
    public function toggleFeatured(Post $post): RedirectResponse
    {
        $post->update([
            'is_featured' => !$post->is_featured,
        ]);

        return back()->with('success', 'Status Berita Sorotan berhasil diperbarui.');
    }
}
