<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookCopy extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'copy_code',
        'barcode_hash',
        'condition',
        'status',
    ];

    /**
     * Relasi ke Induk Buku
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Relasi ke tiket pemesanan eksemplar ini
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(BorrowTicket::class);
    }

    /**
     * Relasi ke riwayat peminjaman eksemplar ini
     */
    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class);
    }

    /**
     * Helper apakah eksemplar siap dipinjam
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
