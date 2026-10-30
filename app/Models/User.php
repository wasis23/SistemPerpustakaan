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
     * Check if user is member (Anggota: Mahasiswa / Dosen / Tendik)
     */
    public function isAnggota(): bool
    {
        return $this->role === 'anggota';
    }

    /**
     * Check if user is Dosen or Tenaga Kependidikan (Tendik)
     */
    public function isDosenOrTendik(): bool
    {
        $prodi = strtolower($this->prodi ?? '');
        $username = strtolower($this->username ?? '');
        
        // Cek indikator prodi atau username dosen/tendik/pegawai
        if (str_contains($prodi, 'dosen') || str_contains($prodi, 'tendik') || str_contains($prodi, 'pegawai') || str_contains($prodi, 'staf') || str_contains($prodi, 'staff')) {
            return true;
        }

        // Format username dosen biasanya diawali dsn, nidn, nip, atau berawalan huruf bukan nim mhs
        if (str_starts_with($username, 'dsn') || str_starts_with($username, 'nip') || str_starts_with($username, 'nidn')) {
            return true;
        }

        return false;
    }

    /**
     * Dapatkan batas maksimal peminjaman buku berdasarkan tipe anggota
     */
    public function getMaxBorrowLimit(): int
    {
        if ($this->isDosenOrTendik()) {
            return (int) Setting::get('max_borrow_limit_lecturer', 4);
        }
        return (int) Setting::get('max_borrow_limit', 3);
    }

    /**
     * Dapatkan durasi masa pinjam (hari) berdasarkan tipe anggota
     */
    public function getBorrowDurationDays(): int
    {
        if ($this->isDosenOrTendik()) {
            return (int) Setting::get('borrow_duration_days_lecturer', 14);
        }
        return (int) Setting::get('borrow_duration_days', 7);
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
