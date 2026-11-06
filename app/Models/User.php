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

#[Fillable(['username', 'name', 'email', 'password', 'role', 'member_type', 'prodi', 'phone', 'status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $appends = [
        'member_type_label',
    ];

    /**
     * Check if user is officer (Petugas / Pustakawan)
     */
    public function isPetugas(): bool
    {
        return $this->role === 'petugas';
    }

    /**
     * Check if user is member (Anggota: Mahasiswa / Dosen / Tendik / Eksternal)
     */
    public function isAnggota(): bool
    {
        return $this->role === 'anggota';
    }

    /**
     * Check if user is Anggota Eksternal (Pengunjung luar kampus)
     */
    public function isEksternal(): bool
    {
        if (($this->member_type ?? '') === 'eksternal') {
            return true;
        }
        $prodi = strtolower($this->prodi ?? '');
        $username = strtolower($this->username ?? '');
        return str_contains($prodi, 'eksternal') || str_starts_with($username, 'eks');
    }

    /**
     * Check if user is Dosen or Tenaga Kependidikan (Tendik)
     */
    public function isDosenOrTendik(): bool
    {
        if ($this->isEksternal()) {
            return false;
        }

        if (($this->member_type ?? '') === 'dosen_tendik') {
            return true;
        }

        if (($this->member_type ?? '') === 'mahasiswa') {
            return false;
        }

        $prodi = strtolower($this->prodi ?? '');
        $username = strtolower($this->username ?? '');
        
        // Cek indikator prodi atau username dosen/tendik/pegawai
        if (str_contains($prodi, 'dosen') || str_contains($prodi, 'tendik') || str_contains($prodi, 'pegawai') || str_contains($prodi, 'staf') || str_contains($prodi, 'staff')) {
            return true;
        }

        // Format username dosen biasanya diawali dsn, nidn, nip
        if (str_starts_with($username, 'dsn') || str_starts_with($username, 'nip') || str_starts_with($username, 'nidn')) {
            return true;
        }

        return false;
    }

    /**
     * Check if user is Mahasiswa aktif
     */
    public function isMahasiswa(): bool
    {
        return $this->isAnggota() && !$this->isDosenOrTendik() && !$this->isEksternal();
    }

    /**
     * Cek apakah akun diizinkan meminjam buku fisik ke luar perpustakaan
     * Aturan:
     * - Mahasiswa: Boleh (2 buku / minggu)
     * - Dosen & Tendik: Boleh (4 buku / 2 minggu)
     * - Eksternal: TIDAK BOLEH MEMINJAM (hanya baca di tempat)
     */
    public function canBorrow(): bool
    {
        if ($this->isEksternal()) {
            return false;
        }

        return $this->isAnggota() && $this->status === 'active';
    }

    /**
     * Dapatkan batas maksimal peminjaman buku berdasarkan tipe anggota:
     * - Mahasiswa: 2 buku
     * - Dosen / Tendik: 4 buku
     * - Eksternal: 0 buku (tidak boleh pinjam)
     */
    public function getMaxBorrowLimit(): int
    {
        if ($this->isEksternal()) {
            return 0;
        }

        if ($this->isDosenOrTendik()) {
            return (int) Setting::get('max_borrow_limit_lecturer', 4);
        }

        return (int) Setting::get('max_borrow_limit', 2);
    }

    /**
     * Dapatkan durasi masa pinjam (hari) berdasarkan tipe anggota:
     * - Mahasiswa: 7 hari (1 minggu)
     * - Dosen / Tendik: 14 hari (2 minggu)
     * - Eksternal: 0 hari
     */
    public function getBorrowDurationDays(): int
    {
        if ($this->isEksternal()) {
            return 0;
        }

        if ($this->isDosenOrTendik()) {
            return (int) Setting::get('borrow_duration_days_lecturer', 14);
        }

        return (int) Setting::get('borrow_duration_days', 7);
    }

    /**
     * Kategori tipe anggota (string key)
     */
    public function getMemberType(): string
    {
        if ($this->isPetugas()) return 'petugas';
        if ($this->isEksternal()) return 'eksternal';
        if ($this->isDosenOrTendik()) return 'dosen_tendik';
        return 'mahasiswa';
    }

    /**
     * Label representasi jenis anggota
     */
    public function getMemberTypeLabelAttribute(): string
    {
        if ($this->isPetugas()) return 'Petugas Perpustakaan';
        if ($this->isEksternal()) return 'Anggota Eksternal';
        if ($this->isDosenOrTendik()) return 'Dosen / Tendik';
        return 'Mahasiswa';
    }

    /**
     * Ringkasan aturan peminjaman sesuai tipe akun
     */
    public function getBorrowRuleDescription(): string
    {
        if ($this->isEksternal()) {
            return 'Hanya baca di tempat (tidak boleh meminjam)';
        }

        if ($this->isDosenOrTendik()) {
            return 'Maksimal 4 buku / 14 hari (2 minggu)';
        }

        return 'Maksimal 2 buku / 7 hari (1 minggu)';
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
     * Relasi Notifikasi Pengguna
     */
    public function userNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class);
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
