<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Laboratory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'link_360',
        'description',
    ];

    /**
     * Relasi ke daftar rak fisik di perpustakaan ini
     */
    public function racks(): HasMany
    {
        return $this->hasMany(Rack::class);
    }
}
