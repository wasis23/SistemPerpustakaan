<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class BorrowTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_code',
        'user_id',
        'book_copy_id',
        'expires_at',
        'status',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Relasi ke Pemilik Tiket (Anggota)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Eksemplar Buku Fisik
     */
    public function bookCopy(): BelongsTo
    {
        return $this->belongsTo(BookCopy::class);
    }

    /**
     * Cek apakah tiket sudah kadaluarsa
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast() || $this->status === 'expired';
    }

    /**
     * Rilis otomatis seluruh tiket kadaluwarsa (>5 menit) & kembalikan status eksemplar ke available
     */
    public static function releaseExpiredTickets(): int
    {
        return DB::transaction(function () {
            $expiredTickets = self::where('status', 'pending')
                ->where('expires_at', '<=', now())
                ->get();

            $releasedCount = 0;
            foreach ($expiredTickets as $ticket) {
                $ticket->update(['status' => 'expired']);

                if ($ticket->bookCopy && $ticket->bookCopy->status === 'ticketed') {
                    $ticket->bookCopy->update(['status' => 'available']);
                }

                $releasedCount++;
            }

            return $releasedCount;
        });
    }
}
