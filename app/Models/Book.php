<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'isbn',
        'title',
        'author',
        'publisher',
        'publish_year',
        'category_id',
        'rack_id',
        'cover_image',
        'call_number',
        'total_copies',
    ];

    /**
     * Relasi ke Kategori DDC
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relasi ke Rak Lokasi
     */
    public function rack(): BelongsTo
    {
        return $this->belongsTo(Rack::class);
    }

    /**
     * Relasi ke eksemplar fisik buku
     */
    public function copies(): HasMany
    {
        return $this->hasMany(BookCopy::class);
    }

    /**
     * Relasi ke eksemplar fisik yang tersedia
     */
    public function availableCopies(): HasMany
    {
        return $this->hasMany(BookCopy::class)->where('status', 'available');
    }
}
