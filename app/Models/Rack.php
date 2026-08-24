<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rack extends Model
{
    use HasFactory;

    protected $fillable = [
        'laboratory_id',
        'code_rack',
        'location',
        'description',
    ];

    /**
     * Relasi ke data Perpustakaan / Ruang Baca Virtual 360
     */
    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }

    /**
     * Relasi ke data buku di rak ini
     */
    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }
}
