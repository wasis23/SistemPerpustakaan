<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class JournalVisitor extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_type',
        'user_id',
        'ip_address',
        'user_agent',
        'session_id',
        'visited_at',
    ];

    protected $casts = [
        'visited_at' => 'datetime',
    ];

    protected $appends = [
        'journal_type_label',
    ];

    /**
     * Label Jenis Halaman Jurnal / Publikasi
     */
    public function getJournalTypeLabelAttribute(): string
    {
        return match (strtolower($this->journal_type)) {
            'nasional' => 'Jurnal Nasional (SINTA)',
            'internasional' => 'Jurnal Internasional',
            'prosiding' => 'Prosiding Seminar',
            default => ucfirst($this->journal_type),
        };
    }

    /**
     * Relasi ke Pengguna / Civitas Akademika (Mahasiswa, Dosen, Petugas)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope filter tipe jurnal
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('journal_type', strtolower($type));
    }

    /**
     * Catat kunjungan pengunjung / civitas dengan proteksi de-duplikasi jeda 15 menit.
     */
    public static function recordVisit(Request $request, string $journalType): ?self
    {
        $normalizedType = strtolower($journalType);
        $user = $request->user();
        $userId = $user?->id;
        $ip = $request->ip();
        $sessionId = $request->hasSession() ? $request->session()->getId() : null;

        // Cek apakah pengunjung / civitas yang sama baru saja tercatat dalam 15 menit terakhir
        $recentVisitExists = self::where('journal_type', $normalizedType)
            ->where('visited_at', '>=', now()->subMinutes(15))
            ->where(function ($q) use ($userId, $sessionId, $ip) {
                if ($userId) {
                    $q->where('user_id', $userId);
                } elseif ($sessionId) {
                    $q->where('session_id', $sessionId);
                } elseif ($ip) {
                    $q->where('ip_address', $ip);
                }
            })
            ->exists();

        if ($recentVisitExists) {
            return null;
        }

        return self::create([
            'journal_type' => $normalizedType,
            'user_id' => $userId,
            'ip_address' => $ip,
            'user_agent' => $request->userAgent(),
            'session_id' => $sessionId,
            'visited_at' => now(),
        ]);
    }

    /**
     * Ringkasan statistik pengunjung untuk halaman publikasi
     */
    public static function getStats(?string $journalType = null): array
    {
        $query = self::query();
        if ($journalType) {
            $query->where('journal_type', strtolower($journalType));
        }

        $totalVisits = (clone $query)->count();
        $todayVisits = (clone $query)->whereDate('visited_at', today())->count();
        $civitasVisits = (clone $query)->whereNotNull('user_id')->count();
        $uniqueCivitas = (clone $query)->whereNotNull('user_id')->distinct('user_id')->count('user_id');

        return [
            'total_visits' => $totalVisits,
            'today_visits' => $todayVisits,
            'civitas_visits' => $civitasVisits,
            'unique_civitas' => $uniqueCivitas,
        ];
    }
}
