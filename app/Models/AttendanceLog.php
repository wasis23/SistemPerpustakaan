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
        'is_external',
        'visitor_name',
        'visitor_institution',
        'visitor_phone',
        'visit_purpose',
        'notes',
        'checked_in_at',
    ];

    protected $casts = [
        'is_external' => 'boolean',
        'checked_in_at' => 'datetime',
    ];

    protected $appends = [
        'purpose_label',
        'visitor_display_name',
        'visitor_identity',
    ];

    /**
     * Nama pengunjung, baik anggota terdaftar maupun anggota eksternal.
     */
    public function getVisitorDisplayNameAttribute(): string
    {
        return $this->user?->name ?? $this->visitor_name ?? 'Pengunjung Eksternal';
    }

    /**
     * Identitas pengunjung untuk ditampilkan pada tabel rekap.
     */
    public function getVisitorIdentityAttribute(): string
    {
        if ($this->is_external) {
            return $this->visitor_institution ?: 'Anggota Eksternal';
        }

        return $this->user?->prodi ?: 'Anggota Perpustakaan';
    }

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
