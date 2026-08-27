<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
    ];

    /**
     * Ambil nilai pengaturan berdasarkan key dengan sistem caching
     */
    public static function get(string $key, $default = null)
    {
        return Cache::rememberForever("app_setting_{$key}", function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            if (!$setting) {
                return $default;
            }
            return self::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Simpan atau perbarui nilai pengaturan dan bersihkan cache
     */
    public static function set(string $key, $value, ?string $type = null, ?string $label = null, ?string $description = null, string $group = 'circulation')
    {
        $setting = self::firstOrNew(['key' => $key]);
        $setting->value = is_array($value) ? json_encode($value) : (string)$value;
        if ($type) $setting->type = $type;
        if ($label) $setting->label = $label;
        if ($description) $setting->description = $description;
        $setting->group = $group;
        $setting->save();

        Cache::forget("app_setting_{$key}");

        return $setting;
    }

    /**
     * Konversi tipe data nilai setting
     */
    private static function castValue($value, string $type)
    {
        if ($value === null) return null;
        return match ($type) {
            'integer', 'int' => (int) $value,
            'float', 'double', 'decimal' => (float) $value,
            'boolean', 'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json', 'array' => json_decode($value, true),
            default => $value,
        };
    }
}
