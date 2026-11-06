<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotification extends Model
{
    use HasFactory;

    protected $table = 'user_notifications';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi ke Pengguna Penerima Notifikasi
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope notifikasi yang belum dibaca
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Tandai notifikasi sebagai dibaca
     */
    public function markAsRead(): bool
    {
        if (is_null($this->read_at)) {
            return $this->update(['read_at' => now()]);
        }
        return true;
    }

    /**
     * Helper membuat notifikasi Peminjaman Berhasil
     */
    public static function notifyBorrowing(User $user, Borrowing $borrowing): self
    {
        $book = $borrowing->bookCopy?->book;
        $bookTitle = $book?->title ?? 'Buku Perpustakaan';
        $copyCode = $borrowing->bookCopy?->copy_code ?? '-';
        $dueDateFormatted = $borrowing->due_date ? $borrowing->due_date->format('d M Y (H:i)') : '-';

        return self::create([
            'user_id' => $user->id,
            'type' => 'borrowing_success',
            'title' => 'Peminjaman Buku Berhasil! 🎉',
            'message' => "Buku '{$bookTitle}' ({$copyCode}) berhasil dipinjam. Harap kembalikan sebelum tanggal {$dueDateFormatted}.",
            'data' => [
                'borrowing_id' => $borrowing->id,
                'borrowing_code' => $borrowing->borrowing_code,
                'book_title' => $bookTitle,
                'copy_code' => $copyCode,
                'due_date' => $dueDateFormatted,
                'borrowed_at' => $borrowing->borrowed_at ? $borrowing->borrowed_at->format('d M Y (H:i)') : now()->format('d M Y (H:i)'),
                'action_url' => '/anggota/borrowings',
            ],
        ]);
    }

    /**
     * Helper membuat notifikasi Pengembalian Berhasil
     */
    public static function notifyReturn(User $user, Borrowing $borrowing, float $fineAmount = 0): self
    {
        $book = $borrowing->bookCopy?->book;
        $bookTitle = $book?->title ?? 'Buku Perpustakaan';
        $copyCode = $borrowing->bookCopy?->copy_code ?? '-';
        $returnedAt = $borrowing->returned_at ? $borrowing->returned_at->format('d M Y (H:i)') : now()->format('d M Y (H:i)');

        $message = "Buku '{$bookTitle}' ({$copyCode}) telah berhasil dikembalikan ke perpustakaan pada {$returnedAt}.";
        if ($fineAmount > 0) {
            $formattedFine = number_format($fineAmount, 0, ',', '.');
            $message .= " Denda keterlambatan tercatat: Rp {$formattedFine}.";
        } else {
            $message .= " Pengembalian tepat waktu (bebas denda).";
        }

        return self::create([
            'user_id' => $user->id,
            'type' => 'return_success',
            'title' => 'Buku Berhasil Dikembalikan! ✅',
            'message' => $message,
            'data' => [
                'borrowing_id' => $borrowing->id,
                'borrowing_code' => $borrowing->borrowing_code,
                'book_title' => $bookTitle,
                'copy_code' => $copyCode,
                'returned_at' => $returnedAt,
                'fine_amount' => $fineAmount,
                'is_overdue' => $fineAmount > 0,
                'action_url' => '/anggota/borrowings',
            ],
        ]);
    }
}
