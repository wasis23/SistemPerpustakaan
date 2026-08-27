<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Holiday extends Model
{
    use HasFactory;

    protected $fillable = [
        'holiday_date',
        'name',
        'description',
        'created_by',
    ];

    protected $casts = [
        'holiday_date' => 'date',
    ];

    /**
     * Relasi ke Petugas yang Menambahkan
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Cek apakah sebuah tanggal adalah tanggal merah/hari libur
     */
    public static function isHoliday(string|Carbon $date): bool
    {
        $dateStr = $date instanceof Carbon ? $date->format('Y-m-d') : Carbon::parse($date)->format('Y-m-d');
        return static::where('holiday_date', $dateStr)->exists();
    }

    /**
     * Ambil daftar tanggal merah dalam rentang tertentu
     */
    public static function getHolidaysInRange(string|Carbon $startDate, string|Carbon $endDate): array
    {
        $start = $startDate instanceof Carbon ? $startDate->format('Y-m-d') : Carbon::parse($startDate)->format('Y-m-d');
        $end = $endDate instanceof Carbon ? $endDate->format('Y-m-d') : Carbon::parse($endDate)->format('Y-m-d');

        return static::whereBetween('holiday_date', [$start, $end])
            ->pluck('name', 'holiday_date')
            ->toArray();
    }
}
