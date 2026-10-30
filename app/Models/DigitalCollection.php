<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DigitalCollection extends Model
{
    use HasFactory;

    public const TYPE_MAGAZINE = 'magazine';
    public const TYPE_NEWSPAPER = 'newspaper';
    public const TYPE_EBOOK = 'ebook';
    public const TYPE_BOOK_PROPOSAL = 'book_proposal';

    protected $fillable = [
        'collection_type',
        'title',
        'author',
        'publisher',
        'prodi',
        'issn',
        'e_issn',
        'frequency',
        'edition',
        'publish_year',
        'description',
        'access_url',
        'cover_image',
        'proposer_name',
        'proposer_prodi',
        'proposer_contact',
        'estimated_price',
        'review_status',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'publish_year' => 'integer',
        'estimated_price' => 'decimal:2',
    ];

    /**
     * Scope pencarian multi-kolom.
     */
    public function scopeSearch($query, ?string $term)
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('author', 'like', "%{$term}%")
              ->orWhere('publisher', 'like', "%{$term}%")
              ->orWhere('prodi', 'like', "%{$term}%")
              ->orWhere('issn', 'like', "%{$term}%")
              ->orWhere('e_issn', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%")
              ->orWhere('proposer_name', 'like', "%{$term}%");
        });
    }

    /**
     * Scope filter berdasarkan jenis koleksi.
     */
    public function scopeOfType($query, ?string $type)
    {
        if (!empty($type)) {
            return $query->where('collection_type', $type);
        }

        return $query;
    }

    /**
     * Label jenis koleksi.
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->collection_type) {
            self::TYPE_MAGAZINE => 'Majalah',
            self::TYPE_NEWSPAPER => 'Surat Kabar / Koran',
            self::TYPE_EBOOK => 'E-Book',
            self::TYPE_BOOK_PROPOSAL => 'Usulan Buku',
            default => 'Koleksi Digital',
        };
    }

    /**
     * Label status usulan buku.
     */
    public function getReviewStatusLabelAttribute(): string
    {
        return match ($this->review_status) {
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            default => 'Menunggu Verifikasi',
        };
    }
}
