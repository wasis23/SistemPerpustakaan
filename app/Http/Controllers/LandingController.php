<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Borrowing;
use App\Models\Category;
use App\Models\Laboratory;
use App\Models\LecturerBook;
use App\Models\NationalJournal;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Tampilkan Halaman Utama Publik SIMPUS (Sebelum User Login)
     */
    public function index(Request $request): Response
    {
        // 6 Koleksi Terpopuler / Terbaru
        $featuredBooks = Book::with(['category', 'rack'])
            ->withCount([
                'copies as available_copies_count' => function ($query) {
                    $query->where('status', 'available');
                },
            ])
            ->latest('id')
            ->take(6)
            ->get();

        // Kategori Utama dengan jumlah buku
        $categories = Category::withCount('books')
            ->orderBy('code', 'asc')
            ->take(6)
            ->get();

        // Data Perpustakaan 360 Virtual Tour
        $libraries = Laboratory::latest('id')->take(3)->get();

        // Karya Buku Dosen (Featured & Terbaru)
        $lecturerBooks = LecturerBook::with('user')
            ->orderByDesc('is_featured')
            ->latest('id')
            ->take(8)
            ->get();

        // Statistik Perpustakaan Real-Time
        $stats = [
            'total_books' => Book::count(),
            'available_copies' => BookCopy::where('status', 'available')->count(),
            'total_circulations' => Borrowing::count(),
            'active_members' => User::where('role', 'anggota')->count(),
            'total_lecturer_books' => LecturerBook::count(),
            'total_national_journals' => NationalJournal::where('is_active', true)->where('journal_type', 'Nasional')->count(),
            'total_international_journals' => NationalJournal::where('is_active', true)->where('journal_type', 'Internasional')->count(),
            'total_proceedings' => NationalJournal::where('is_active', true)->where('journal_type', 'Prosiding')->count(),
        ];

        // Berita & Informasi Terbaru
        $latestPosts = Post::published()
            ->latest('published_at')
            ->take(3)
            ->get();

        return Inertia::render('Landing', [
            'featuredBooks' => $featuredBooks,
            'categories' => $categories,
            'libraries' => $libraries,
            'lecturerBooks' => $lecturerBooks,
            'stats' => $stats,
            'latestPosts' => $latestPosts,
        ]);
    }
}
