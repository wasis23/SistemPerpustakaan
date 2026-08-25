<?php

namespace App\Http\Controllers\Anggota;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\BorrowTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BorrowingController extends Controller
{
    /**
     * Tampilkan Daftar Buku yang Sedang Dipinjam oleh Akun Mahasiswa / Dosen
     */
    public function index(Request $request): Response
    {
        // Rilis tiket kadaluwarsa
        BorrowTicket::releaseExpiredTickets();

        $user = $request->user();

        // 1. Buku yang sedang aktif dipinjam oleh akun ini
        $activeBorrowings = Borrowing::where('user_id', $user->id)
            ->where('status', 'active')
            ->with([
                'bookCopy.book.rack',
                'bookCopy.book.category',
                'officer:id,name',
            ])
            ->latest('borrowed_at')
            ->get()
            ->map(function ($borrowing) {
                $now = now();
                $dueDate = $borrowing->due_date;
                $isOverdue = $now->greaterThan($dueDate);
                $remainingDays = $isOverdue ? 0 : (int) ceil($now->diffInDays($dueDate, false));
                $overdueDays = $isOverdue ? (int) ceil($now->diffInDays($dueDate)) : 0;
                $estimatedFine = $overdueDays * 1000;

                return [
                    'id' => $borrowing->id,
                    'borrowing_code' => $borrowing->borrowing_code,
                    'book_title' => $borrowing->bookCopy?->book?->title ?? 'Judul Buku',
                    'author' => $borrowing->bookCopy?->book?->author ?? '-',
                    'publisher' => $borrowing->bookCopy?->book?->publisher ?? '-',
                    'category_name' => $borrowing->bookCopy?->book?->category?->name ?? 'Umum',
                    'category_code' => $borrowing->bookCopy?->book?->category?->code ?? '-',
                    'rack_code' => $borrowing->bookCopy?->book?->rack?->code_rack ?? '-',
                    'rack_location' => $borrowing->bookCopy?->book?->rack?->location ?? '-',
                    'copy_code' => $borrowing->bookCopy?->copy_code ?? '-',
                    'barcode_hash' => $borrowing->bookCopy?->barcode_hash ?? '-',
                    'officer_name' => $borrowing->officer?->name ?? 'Pustakawan',
                    'borrowed_at' => $borrowing->borrowed_at ? $borrowing->borrowed_at->format('d M Y (H:i)') : '-',
                    'due_date' => $borrowing->due_date ? $borrowing->due_date->format('d M Y (H:i)') : '-',
                    'due_date_raw' => $borrowing->due_date?->toISOString(),
                    'is_overdue' => $isOverdue,
                    'remaining_days' => $remainingDays,
                    'overdue_days' => $overdueDays,
                    'estimated_fine' => $estimatedFine,
                ];
            });

        // 2. Riwayat Peminjaman Buku Selesai (Dikembalikan)
        $historyBorrowings = Borrowing::where('user_id', $user->id)
            ->where('status', 'returned')
            ->with(['bookCopy.book'])
            ->latest('returned_at')
            ->paginate(6)
            ->withQueryString();

        // 3. Statistik Akun
        $unpaidFinesTotal = (float) Borrowing::where('user_id', $user->id)
            ->where('fine_status', 'unpaid')
            ->sum('fine_amount');

        return Inertia::render('Anggota/Borrowings/Index', [
            'activeBorrowings' => $activeBorrowings,
            'historyBorrowings' => $historyBorrowings,
            'stats' => [
                'active_count' => $activeBorrowings->count(),
                'max_limit' => 3,
                'overdue_count' => $activeBorrowings->where('is_overdue', true)->count(),
                'history_count' => Borrowing::where('user_id', $user->id)->count(),
                'unpaid_fines' => $unpaidFinesTotal,
            ],
        ]);
    }
}
