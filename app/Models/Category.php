<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    /**
     * 10 Kelas Utama Dewey Decimal Classification (DDC)
     */
    public const MAIN_CLASSES = [
        '000' => 'Karya Umum, Ilmu Komputer, dan Informasi (Generalities)',
        '100' => 'Filsafat dan Psikologi (Philosophy & Psychology)',
        '200' => 'Agama dan Teologi (Religion)',
        '300' => 'Ilmu Sosial (Social Sciences)',
        '400' => 'Bahasa dan Linguistik (Language)',
        '500' => 'Sains Murni / Ilmu Alam dan Matematika (Natural Sciences & Mathematics)',
        '600' => 'Teknologi dan Ilmu Terapan (Technology & Applied Science)',
        '700' => 'Kesenian, Hiburan, dan Olahraga (The Arts)',
        '800' => 'Kesusastraan dan Sastra (Literature)',
        '900' => 'Sejarah, Geografi, dan Biografi (Geography & History)',
    ];

    protected $fillable = [
        'code',
        'name',
        'description',
    ];

    /**
     * Relasi ke data buku
     */
    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }

    /**
     * Normalisasi kode atau teks DDC (misal: "001", "001.42", "001.42 Sug m", "621.8 Sum a")
     * ke 3-digit kode kelas utama DDC ("000", "100", ..., "900").
     *
     * Contoh:
     * - "001" atau "001.42" -> "000"
     * - "150" atau "153.4"   -> "100"
     * - "621.8"              -> "600"
     */
    public static function normalizeDdcToMainClass(string|int|null $raw): string
    {
        if (empty($raw)) {
            return '000';
        }

        $str = trim((string) $raw);

        // Jika sudah persis 3 digit berakhiran 00 (000, 100, ..., 900)
        if (preg_match('/^[0-9]00$/', $str)) {
            return $str;
        }

        // Cari pola angka DDC (misal "001.42", "001", "621.8", "50", dsb)
        if (preg_match('/\b(\d{1,3}(?:\.\d+)?)\b/', $str, $matches)) {
            $parts = explode('.', $matches[1]);
            $intVal = (int) $parts[0];
            $hundreds = (int) (floor($intVal / 100) * 100);

            if ($hundreds >= 0 && $hundreds <= 900) {
                return str_pad((string) $hundreds, 3, '0', STR_PAD_LEFT);
            }
        }

        return '000';
    }

    /**
     * Cari entitas Category kelas utama berdasarkan input (id numeric, code, sub-kelas DDC, atau call number).
     */
    public static function findMainCategory(string|int|null $input): ?self
    {
        if (empty($input)) {
            return self::where('code', '000')->first() ?: self::first();
        }

        // Jika input adalah ID category yang tersimpan
        if (is_numeric($input) && self::where('id', $input)->exists()) {
            $cat = self::find($input);
            $mainCode = self::normalizeDdcToMainClass($cat->code);
            if ($cat->code === $mainCode) {
                return $cat;
            }
            return self::where('code', $mainCode)->first() ?: $cat;
        }

        // Jika input berupa kode DDC atau nomor panggil (misal: "001", "001.42", "001.42 Sug m")
        $mainCode = self::normalizeDdcToMainClass($input);
        return self::where('code', $mainCode)->first()
            ?: (self::where('code', '000')->first() ?: self::first());
    }

    /**
     * Cek apakah kategori ini merupakan salah satu dari 10 kelas utama DDC
     */
    public function isMainClass(): bool
    {
        return array_key_exists($this->code, self::MAIN_CLASSES);
    }
}
