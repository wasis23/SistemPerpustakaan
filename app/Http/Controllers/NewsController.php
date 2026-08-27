<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    /**
     * Tampilkan Halaman Arsip & Katalog Berita Publik
     */
    public function index(Request $request): Response
    {
        $query = Post::published()
            ->search($request->search);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $posts = $query->latest('published_at')->paginate(9)->withQueryString();

        // 3 Berita Unggulan (Featured)
        $featuredPosts = Post::published()
            ->featured()
            ->latest('published_at')
            ->take(3)
            ->get();

        // Kategori yang ada dengan jumlah artikel
        $categories = Post::published()
            ->selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->get();

        return Inertia::render('Berita/Index', [
            'posts' => $posts,
            'featuredPosts' => $featuredPosts,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Halaman Detail Baca Berita Publik dengan Full SEO & JSON-LD
     */
    public function show(string $slug): Response
    {
        $post = Post::published()
            ->where('slug', $slug)
            ->firstOrFail();

        // Tingkatkan counter view pembaca
        $post->increment('view_count');

        // Berita Terkait / Rekomendasi
        $relatedPosts = Post::published()
            ->where('id', '!=', $post->id)
            ->where(function ($q) use ($post) {
                $q->where('category', $post->category)
                  ->orWhere('is_featured', true);
            })
            ->latest('published_at')
            ->take(3)
            ->get();

        // Berita Populer
        $popularPosts = Post::published()
            ->where('id', '!=', $post->id)
            ->orderBy('view_count', 'desc')
            ->take(4)
            ->get();

        return Inertia::render('Berita/Show', [
            'post' => $post,
            'relatedPosts' => $relatedPosts,
            'popularPosts' => $popularPosts,
            'appUrl' => config('app.url'),
        ]);
    }
}
