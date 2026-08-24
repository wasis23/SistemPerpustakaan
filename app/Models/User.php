<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['username', 'name', 'email', 'password', 'role', 'prodi', 'phone', 'status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Check if user is officer (Petugas / Pustakawan)
     */
    public function isPetugas(): bool
    {
        return $this->role === 'petugas';
    }

    /**
     * Check if user is member (Anggota: Mahasiswa / Dosen)
     */
    public function isAnggota(): bool
    {
        return $this->role === 'anggota';
    }

    /**
     * Relasi ke Log Presensi Kios
     */
    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    /**
     * Relasi ke Tiket Pinjam
     */
    public function borrowTickets(): HasMany
    {
        return $this->hasMany(BorrowTicket::class);
    }

    /**
     * Tiket Aktif Berjalan yang sedang pending (maksimal 1 per anggota)
     */
    public function activeTicket(): HasOne
    {
        return $this->hasOne(BorrowTicket::class)
            ->where('status', 'pending')
            ->where('expires_at', '>', now());
    }

    /**
     * Relasi ke Transaksi Peminjaman (sebagai anggota)
     */
    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class, 'user_id');
    }

    /**
     * Relasi Peminjaman Aktif (buku yang sedang dibawa)
     */
    public function activeBorrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class, 'user_id')->where('status', 'active');
    }

    /**
     * Relasi Transaksi Peminjaman yang disetujui (sebagai petugas)
     */
    public function approvedBorrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class, 'officer_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
