<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NationalJournal extends Model
{
    use HasFactory;

    protected $table = 'national_journals';

    protected $fillable = [
        'title',
        'journal_type', // 'Nasional' | 'Internasional' | 'Prosiding'
        'prodi',
        'publisher',
        'country',
        'access_url',
        'sinta',
        'issn',
        'e_issn',
        'frequency',
        'publish_year',
        'description',
        'cover_image',
        'doi_prefix',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'publish_year' => 'integer',
    ];

    /**
     * Scope pencarian multi-kolom
     */
    public function scopeSearch($query, ?string $term)
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('prodi', 'like', "%{$term}%")
              ->orWhere('publisher', 'like', "%{$term}%")
              ->orWhere('sinta', 'like', "%{$term}%")
              ->orWhere('issn', 'like', "%{$term}%")
              ->orWhere('e_issn', 'like', "%{$term}%")
              ->orWhere('publish_year', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%");
        });
    }

    /**
     * Scope filter Jenis Publikasi (Nasional / Internasional / Prosiding)
     */
    public function scopeOfType($query, ?string $type)
    {
        if (!empty($type) && in_array(strtolower($type), ['nasional', 'internasional', 'prosiding'])) {
            return $query->where('journal_type', ucfirst(strtolower($type)));
        }
        return $query;
    }

    /**
     * Scope filter SINTA / Indeksasi
     */
    public function scopeOfSinta($query, ?string $sinta)
    {
        if (!empty($sinta)) {
            return $query->where('sinta', $sinta);
        }
        return $query;
    }

    /**
     * Scope filter Program Studi
     */
    public function scopeOfProdi($query, ?string $prodi)
    {
        if (!empty($prodi)) {
            return $query->where('prodi', $prodi);
        }
        return $query;
    }
}
