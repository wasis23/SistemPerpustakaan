<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
