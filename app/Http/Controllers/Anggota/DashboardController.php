<?php

namespace App\Http\Controllers\Anggota;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\BorrowTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan Dashboard Anggota (Mahasiswa & Dosen)
     */
    public function index(Request $request): Response
    {
        // Bersihkan tiket kadaluwarsa terlebih dahulu
        BorrowTicket::releaseExpiredTickets();

        $user = $request->user();

        // 1. Data Peminjaman Aktif Anggota
        $activeBorrowings = Borrowing::where('user_id', $user->id)
            ->where('status', 'active')
            ->with(['bookCopy.book.rack', 'bookCopy.book.category'])
            ->latest('borrowed_at')
            ->get();

        // 2. Data Tiket Mandiri 5 Menit yang Masih Aktif
        $activeTickets = BorrowTicket::where('user_id', $user->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->with(['bookCopy.book.rack', 'bookCopy.book.category'])
            ->latest()
            ->get();

        // 3. Statistik Ringkasan Pengguna
        $totalHistory = Borrowing::where('user_id', $user->id)->count();
        $unpaidFines = (float) Borrowing::where('user_id', $user->id)
            ->where('fine_status', 'unpaid')
            ->sum('fine_amount');

        return Inertia::render('Anggota/Dashboard', [
            'stats' => [
                'active_borrowings' => $activeBorrowings->count(),
                'active_tickets' => $activeTickets->count(),
                'total_history' => $totalHistory,
                'history_count' => $totalHistory,
                'unpaid_fines' => $unpaidFines,
            ],
            'activeTickets' => $activeTickets,
            'activeBorrowings' => $activeBorrowings,
        ]);
    }
}
