<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class LecturerBook extends Model
{
    use HasFactory;

    protected $table = 'lecturer_books';

    protected $fillable = [
        'title',
        'slug',
        'authors',
        'nidn',
        'user_id',
        'prodi',
        'publication_type',
        'isbn',
        'publisher',
        'publish_year',
        'city',
        'edition',
        'pages',
        'synopsis',
        'cover_image',
        'document_url',
        'doi_url',
        'hki_number',
        'is_featured',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'publish_year' => 'integer',
        'pages' => 'integer',
    ];

    /**
     * Relasi ke User akun dosen (jika terdaftar di SIMPUS)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scope pencarian multi-field (judul, penulis, nidn, isbn, prodi, penerbit)
     */
    public function scopeSearch($query, ?string $term)
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('authors', 'like', "%{$term}%")
              ->orWhere('nidn', 'like', "%{$term}%")
              ->orWhere('isbn', 'like', "%{$term}%")
              ->orWhere('prodi', 'like', "%{$term}%")
              ->orWhere('publisher', 'like', "%{$term}%")
              ->orWhere('hki_number', 'like', "%{$term}%")
              ->orWhere('synopsis', 'like', "%{$term}%");
        });
    }

    /**
     * Scope tipe publikasi
     */
    public function scopeOfType($query, ?string $type)
    {
        if (!empty($type)) {
            return $query->where('publication_type', $type);
        }
        return $query;
    }

    /**
     * Scope program studi
     */
    public function scopeOfProdi($query, ?string $prodi)
    {
        if (!empty($prodi)) {
            return $query->where('prodi', $prodi);
        }
        return $query;
    }
}
