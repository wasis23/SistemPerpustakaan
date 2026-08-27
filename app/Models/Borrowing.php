<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Borrowing extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrowing_code',
        'user_id',
        'book_copy_id',
        'ticket_id',
        'officer_id',
        'borrowed_at',
        'due_date',
        'returned_at',
        'fine_amount',
        'fine_status',
        'status',
        'notes',
    ];

    protected $casts = [
        'borrowed_at' => 'datetime',
        'due_date' => 'datetime',
        'returned_at' => 'datetime',
        'fine_amount' => 'decimal:2',
    ];

    /**
     * Relasi ke Peminjam (Anggota)
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
     * Relasi ke Tiket Asal
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(BorrowTicket::class, 'ticket_id');
    }

    /**
     * Relasi ke Petugas Validator
     */
    public function officer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'officer_id');
    }

    /**
     * Cek apakah transaksi peminjaman sudah terlambat
     */
    public function isOverdue(): bool
    {
        if ($this->status === 'returned') {
            return false;
        }

        return now()->greaterThan($this->due_date);
    }

    /**
     * Hitung rincian denda keterlambatan transaksi ini
     */
    public function getFineCalculation(?\Carbon\Carbon $at = null): array
    {
        return \App\Services\FineCalculator::calculate($this->due_date, $at ?? $this->returned_at ?? now());
    }
}
