<?php

namespace App\Http\Controllers\Anggota;

use App\Http\Controllers\Controller;
use App\Models\BookCopy;
use App\Models\Borrowing;
use App\Models\BorrowTicket;
use App\Services\BarcodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    /**
     * Tampilkan Halaman Scanner Barcode Buku di HP Anggota
     */
    public function showScanner(Request $request): Response
    {
        // Bersihkan tiket kadaluwarsa lebih dahulu
        BorrowTicket::releaseExpiredTickets();

        $user = $request->user();

        // Jika anggota sudah memiliki tiket pending aktif yang belum kadaluwarsa
        $activeTicket = BorrowTicket::where('user_id', $user->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if ($activeTicket) {
            return Inertia::render('Anggota/Scan', [
                'activeTicket' => $activeTicket->load('bookCopy.book'),
            ]);
        }

        return Inertia::render('Anggota/Scan', [
            'activeTicket' => null,
        ]);
    }

    /**
     * Buat Tiket Pinjam Mandiri dengan DB Lock & LockForUpdate
     */
    public function createTicket(Request $request)
    {
        $input = trim($request->input('barcode_hash') ?? $request->input('copy_code') ?? '');

        if (empty($input)) {
            return back()->withErrors([
                'copy_code' => 'Scan atau masukkan barcode / kode eksemplar buku.',
                'barcode_hash' => 'Scan atau masukkan barcode / kode eksemplar buku.',
            ]);
        }

        // 1. Sapu tiket kadaluarsa
        BorrowTicket::releaseExpiredTickets();

        $user = $request->user();

        // 2. Cek apakah anggota sudah punya tiket pending aktif
        $existingTicket = BorrowTicket::where('user_id', $user->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if ($existingTicket) {
            return back()->withErrors([
                'copy_code' => 'Anda masih memiliki tiket aktif yang belum divalidasi. Selesaikan atau batalkan tiket tersebut terlebih dahulu.',
                'barcode_hash' => 'Anda masih memiliki tiket aktif yang belum divalidasi. Selesaikan atau batalkan tiket tersebut terlebih dahulu.',
            ]);
        }

        // 3. Cek batas maksimal peminjaman aktif anggota (misal maksimal 3 buku)
        $activeBorrowingsCount = Borrowing::where('user_id', $user->id)
            ->where('status', 'active')
            ->count();

        if ($activeBorrowingsCount >= 3) {
            return back()->withErrors([
                'copy_code' => 'Anda telah mencapai batas maksimal 3 peminjaman buku aktif. Kembalikan buku fisik sebelumnya terlebih dahulu.',
                'barcode_hash' => 'Anda telah mencapai batas maksimal 3 peminjaman buku aktif. Kembalikan buku fisik sebelumnya terlebih dahulu.',
            ]);
        }

        try {
            $ticket = DB::transaction(function () use ($user, $input) {
                // Lock row eksemplar buku berdasarkan barcode_hash atau copy_code
                $copy = BookCopy::where(function ($q) use ($input) {
                    $q->where('barcode_hash', $input)
                      ->orWhere('copy_code', $input);
                })
                ->lockForUpdate()
                ->first();

                if (! $copy) {
                    throw new \Exception("Barcode atau Kode Eksemplar '{$input}' tidak ditemukan dalam sistem.");
                }

                if ($copy->status !== 'available') {
                    if ($copy->status === 'ticketed') {
                        throw new \Exception('Buku ini sedang ditahan oleh anggota lain yang sedang memproses tiket. Silakan pilih eksemplar lain.');
                    } elseif ($copy->status === 'borrowed') {
                        throw new \Exception('Buku fisik ini sedang dipinjam oleh anggota lain.');
                    } else {
                        throw new \Exception('Eksemplar buku ini tidak dalam kondisi tersedia.');
                    }
                }

                // Ubah status eksemplar dari available menjadi ticketed
                $copy->update(['status' => 'ticketed']);

                // Buat Tiket Pinjam 5 Menit
                $ticketCode = 'TCK-' . date('Ymd') . '-' . strtoupper(Str::random(4));

                return BorrowTicket::create([
                    'ticket_code' => $ticketCode,
                    'user_id' => $user->id,
                    'book_copy_id' => $copy->id,
                    'expires_at' => now()->addMinutes(5),
                    'status' => 'pending',
                ]);
            });

            return redirect()->route('anggota.ticket.show', $ticket->id)
                ->with('success', 'Tiket peminjaman mandiri berhasil dibuat! Tunjukkan QR Code tiket ini ke Meja Sirkulasi Pustakawan.');

        } catch (\Exception $e) {
            return back()->withErrors([
                'copy_code' => $e->getMessage(),
                'barcode_hash' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Tampilkan Layar Tiket Digital di HP Anggota
     */
    public function showTicket(Request $request, BorrowTicket $ticket): Response
    {
        BorrowTicket::releaseExpiredTickets();

        if ($ticket->user_id !== $request->user()->id) {
            abort(403, 'Akses tiket ditolak.');
        }

        $ticket->load(['bookCopy.book.rack', 'bookCopy.book.category']);

        $qrSvg = BarcodeService::generateSvg($ticket->ticket_code);

        return Inertia::render('Anggota/Ticket/Show', [
            'ticket' => $ticket,
            'qrSvg' => $qrSvg,
        ]);
    }

    /**
     * Batal Pinjam (Rilis Penguncian Eksemplar Fisik)
     */
    public function cancelTicket(Request $request, BorrowTicket $ticket)
    {
        if ($ticket->user_id !== $request->user()->id) {
            abort(403, 'Akses tiket ditolak.');
        }

        DB::transaction(function () use ($ticket) {
            if ($ticket->status === 'pending') {
                $ticket->update(['status' => 'cancelled']);

                if ($ticket->bookCopy && $ticket->bookCopy->status === 'ticketed') {
                    $ticket->bookCopy->update(['status' => 'available']);
                }
            }
        });

        return redirect()->route('anggota.dashboard')
            ->with('info', 'Tiket peminjaman berhasil dibatalkan dan eksemplar buku telah dirilis kembali.');
    }
}
