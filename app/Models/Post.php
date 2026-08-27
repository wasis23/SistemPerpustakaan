<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'user_id',
        'author_name',
        'category',
        'excerpt',
        'content',
        'thumbnail',
        'thumbnail_alt',
        'status',
        'is_featured',
        'view_count',
        'reading_time',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'canonical_url',
        'published_at',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'view_count' => 'integer',
        'reading_time' => 'integer',
        'published_at' => 'datetime',
    ];

    /**
     * Relasi ke pustakawan pembuat
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scope hanya artikel yang berstatus published
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')
                  ->orWhere('published_at', '<=', now());
            });
    }

    /**
     * Scope artikel featured (unggulan)
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope pencarian judul, konten, excerpt, atau kata kunci
     */
    public function scopeSearch($query, ?string $term)
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('excerpt', 'like', "%{$term}%")
              ->orWhere('content', 'like', "%{$term}%")
              ->orWhere('category', 'like', "%{$term}%")
              ->orWhere('meta_keywords', 'like', "%{$term}%");
        });
    }

    /**
     * Fallback SEO Title jika meta_title kosong
     */
    public function getSeoTitleAttribute(): string
    {
        return $this->meta_title ?: $this->title;
    }

    /**
     * Fallback SEO Description jika meta_description kosong
     */
    public function getSeoDescriptionAttribute(): string
    {
        if ($this->meta_description) {
            return $this->meta_description;
        }

        if ($this->excerpt) {
            return Str::limit(strip_tags($this->excerpt), 160);
        }

        return Str::limit(strip_tags($this->content), 160);
    }

    /**
     * Hitung estimasi waktu baca dari isi konten (kata per menit ~ 200)
     */
    public static function estimateReadingTime(string $content): int
    {
        $wordCount = str_word_count(strip_tags($content));
        return max(1, (int) ceil($wordCount / 200));
    }
}
