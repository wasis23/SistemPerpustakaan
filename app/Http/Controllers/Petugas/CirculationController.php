<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\BookCopy;
use App\Models\Borrowing;
use App\Models\BorrowTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CirculationController extends Controller
{
    /**
     * Tampilkan Daftar Transaksi Sirkulasi Peminjaman & Pengembalian
     */
    public function index(Request $request): Response
    {
        // Rilis tiket kadaluwarsa
        BorrowTicket::releaseExpiredTickets();

        $query = Borrowing::with(['user:id,name,username,prodi', 'bookCopy.book:id,title,author', 'officer:id,name']);

        // Filter Pencarian (Kode Transaksi, NIM, Nama Anggota, Judul Buku)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('borrowing_code', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('username', 'like', "%{$search}%");
                  })
                  ->orWhereHas('bookCopy.book', function ($bq) use ($search) {
                      $bq->where('title', 'like', "%{$search}%");
                  });
            });
        }

        // Filter Status Peminjaman
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $borrowings = $query->latest('id')->paginate(12)->withQueryString();

        return Inertia::render('Petugas/Circulation/Index', [
            'borrowings' => $borrowings,
            'filters' => $request->only(['search', 'status']),
            'stats' => [
                'active_count' => Borrowing::where('status', 'active')->count(),
                'returned_count' => Borrowing::where('status', 'returned')->count(),
                'overdue_count' => Borrowing::where('status', 'active')->where('due_date', '<', now())->count(),
                'unpaid_fines_total' => (float) Borrowing::where('fine_status', 'unpaid')->sum('fine_amount'),
            ],
        ]);
    }

    /**
     * Form Pemindaian Tiket Digital Layar HP Anggota
     */
    public function scanTicketForm(): Response
    {
        BorrowTicket::releaseExpiredTickets();

        return Inertia::render('Petugas/Circulation/ScanTicket');
    }

    /**
     * Validasi Tiket Digital & Eksekusi Peminjaman Resmi
     */
    public function validateTicket(Request $request)
    {
        $request->validate([
            'ticket_code' => ['required', 'string'],
        ], [
            'ticket_code.required' => 'Scan atau masukkan kode tiket digital.',
        ]);

        BorrowTicket::releaseExpiredTickets();

        $ticketCode = trim($request->ticket_code);
        $officer = $request->user();

        try {
            $borrowing = DB::transaction(function () use ($ticketCode, $officer) {
                $ticket = BorrowTicket::where('ticket_code', $ticketCode)
                    ->lockForUpdate()
                    ->first();

                if (! $ticket) {
                    throw new \Exception("Kode tiket {$ticketCode} tidak ditemukan.");
                }

                if ($ticket->status !== 'pending' || $ticket->expires_at->isPast()) {
                    throw new \Exception("Tiket {$ticketCode} sudah kadaluwarsa atau pernah digunakan.");
                }

                $bookCopy = BookCopy::where('id', $ticket->book_copy_id)
                    ->lockForUpdate()
                    ->first();

                if (! $bookCopy || $bookCopy->status !== 'ticketed') {
                    throw new \Exception("Eksemplar buku tidak dalam status penahanan tiket valid.");
                }

                // Update Tiket & Eksemplar
                $ticket->update(['status' => 'validated']);
                $bookCopy->update(['status' => 'borrowed']);

                // Buat Transaksi Sirkulasi (Durasi Pinjam 7 Hari)
                $borrowingCode = 'TRX-' . date('Ymd') . '-' . sprintf('%04d', Borrowing::count() + 1);

                return Borrowing::create([
                    'borrowing_code' => $borrowingCode,
                    'user_id' => $ticket->user_id,
                    'book_copy_id' => $bookCopy->id,
                    'ticket_id' => $ticket->id,
                    'officer_id' => $officer->id,
                    'borrowed_at' => now(),
                    'due_date' => now()->addDays(7),
                    'status' => 'active',
                ]);
            });

            $borrowing->load(['user', 'bookCopy.book']);

            return back()->with('success_borrowing', [
                'borrowing_code' => $borrowing->borrowing_code,
                'user_name' => $borrowing->user->name,
                'user_username' => $borrowing->user->username,
                'book_title' => $borrowing->bookCopy->book->title,
                'copy_code' => $borrowing->bookCopy->copy_code,
                'due_date' => $borrowing->due_date->format('d M Y (H:i)'),
            ]);

        } catch (\Exception $e) {
            return back()->withErrors([
                'ticket_code' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Form Pemindaian Barcode Pengembalian Buku Fisik
     */
    public function scanReturnForm(): Response
    {
        return Inertia::render('Petugas/Circulation/ScanReturn');
    }

    /**
     * Proses Pengembalian Buku & Kalkulasi Denda Otomatis
     */
    public function processReturn(Request $request)
    {
        $request->validate([
            'barcode_hash' => ['required', 'string'],
        ], [
            'barcode_hash.required' => 'Scan atau masukkan barcode hash buku yang dikembalikan.',
        ]);

        $barcodeHash = trim($request->barcode_hash);

        try {
            $result = DB::transaction(function () use ($barcodeHash) {
                // Cari eksemplar buku
                $bookCopy = BookCopy::where('barcode_hash', $barcodeHash)
                    ->orWhere('copy_code', $barcodeHash)
                    ->lockForUpdate()
                    ->first();

                if (! $bookCopy) {
                    throw new \Exception("Eksemplar buku dengan barcode/kode {$barcodeHash} tidak ditemukan.");
                }

                // Cari transaksi peminjaman aktif
                $borrowing = Borrowing::where('book_copy_id', $bookCopy->id)
                    ->where('status', 'active')
                    ->lockForUpdate()
                    ->first();

                if (! $borrowing) {
                    throw new \Exception("Tidak ditemukan transaksi peminjaman aktif untuk eksemplar {$bookCopy->copy_code}.");
                }

                // Kalkulasi Denda (Rp 1.000 per hari keterlambatan)
                $returnedAt = now();
                $fineAmount = 0;
                $overdueDays = 0;

                if ($returnedAt->greaterThan($borrowing->due_date)) {
                    $overdueDays = ceil($returnedAt->diffInDays($borrowing->due_date));
                    $fineAmount = $overdueDays * 1000;
                }

                $fineStatus = $fineAmount > 0 ? 'unpaid' : 'none';

                // Update Peminjaman & Eksemplar
                $borrowing->update([
                    'returned_at' => $returnedAt,
                    'fine_amount' => $fineAmount,
                    'fine_status' => $fineStatus,
                    'status' => 'returned',
                ]);

                $bookCopy->update(['status' => 'available']);

                $borrowing->load(['user', 'bookCopy.book']);

                return [
                    'borrowing_code' => $borrowing->borrowing_code,
                    'user_name' => $borrowing->user->name,
                    'book_title' => $borrowing->bookCopy->book->title,
                    'copy_code' => $borrowing->bookCopy->copy_code,
                    'overdue_days' => $overdueDays,
                    'fine_amount' => $fineAmount,
                    'fine_status' => $fineStatus,
                    'returned_at' => $returnedAt->format('d M Y (H:i)'),
                ];
            });

            return back()->with('success_return', $result);

        } catch (\Exception $e) {
            return back()->withErrors([
                'barcode_hash' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Lunasi Denda Peminjaman Keterlambatan
     */
    public function payFine(Borrowing $borrowing)
    {
        if ($borrowing->fine_status === 'unpaid') {
            $borrowing->update(['fine_status' => 'paid']);
            return back()->with('success', "Denda sebesar Rp " . number_format($borrowing->fine_amount, 0, ',', '.') . " telah dilunasi.");
        }

        return back();
    }
}
