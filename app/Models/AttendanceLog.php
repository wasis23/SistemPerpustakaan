<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'visit_purpose',
        'notes',
        'checked_in_at',
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
    ];

    protected $appends = [
        'purpose_label',
    ];

    /**
     * Label Tujuan Kunjungan
     */
    public function getPurposeLabelAttribute(): string
    {
        return match ($this->visit_purpose) {
            'reading' => 'Membaca Mandiri',
            'borrowing' => 'Peminjaman / Pengembalian Koleksi',
            'research' => 'Pemberkasan',
            'computer' => 'Akses Komputer',
            default => $this->visit_purpose ?? '-',
        };
    }

    /**
     * Relasi ke Pengunjung / Anggota
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
