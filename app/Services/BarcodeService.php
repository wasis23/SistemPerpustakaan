<?php

namespace App\Services;

use App\Models\BookCopy;
use Picqer\Barcode\BarcodeGeneratorSVG;
use Picqer\Barcode\BarcodeGeneratorHTML;

class BarcodeService
{
    /**
     * Generate format Barcode Eksemplar Perpustakaan:
     * Format: INDO + YY (2 digit tahun pengadaan) + Nomor Inventaris (4+ digit berurutan)
     * Contoh: INDO243421, INDO265001, INDO265002
     */
    public static function generateCopyBarcode(int|string|null $year = null, ?int $inventoryNumber = null): string
    {
        $yy = !empty($year) && strlen((string)$year) >= 2 
            ? substr((string)$year, -2) 
            : date('y');

        if ($inventoryNumber === null) {
            $inventoryNumber = self::getNextInventoryNumber();
        }

        $padded = str_pad((string)$inventoryNumber, 4, '0', STR_PAD_LEFT);
        return "INDO{$yy}{$padded}";
    }

    /**
     * Konversi angka bulan (1-12) ke angka Romawi (I - XII)
     */
    public static function monthToRoman(int|string|null $month): string
    {
        $m = (int)$month;
        $romanMap = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];
        return $romanMap[$m] ?? 'I';
    }

    /**
     * Generate format Nomor Inventaris Eksemplar Perpustakaan:
     * Format: [NO INVENTARIS]/PERPUS-INDO/[BULAN PENGADAAN]/[TAHUN PENGADAAN]
     * Contoh: 0001/PERPUS-INDO/V/2026
     */
    public static function generateCopyCode(int|string|null $year = null, int|string|null $month = null, ?int $inventoryNumber = null): string
    {
        if ($inventoryNumber === null) {
            $inventoryNumber = self::getNextInventoryNumber();
        }

        $padded = str_pad((string)$inventoryNumber, 4, '0', STR_PAD_LEFT);
        $procurementMonth = !empty($month) ? (int)$month : (int)date('n');
        $romanMonth = self::monthToRoman($procurementMonth);
        $procurementYear = !empty($year) ? (string)$year : date('Y');

        return "{$padded}/PERPUS-INDO/{$romanMonth}/{$procurementYear}";
    }

    /**
     * Dapatkan nomor urut inventaris berikutnya
     */
    public static function getNextInventoryNumber(int $offset = 1): int
    {
        $highestNumber = 0;
        
        $lastBarcode = BookCopy::where('barcode_hash', 'LIKE', 'INDO%')
            ->orderBy('id', 'desc')
            ->value('barcode_hash');

        if ($lastBarcode && preg_match('/^INDO\d{2}(\d+)$/', $lastBarcode, $matches)) {
            $highestNumber = (int)$matches[1];
        }

        // Cek juga nomor urut tertinggi dari copy_code (misal: 0001/PERPUS-INDO/...)
        $lastCopyCode = BookCopy::whereRaw("copy_code REGEXP '^[0-9]+/'")
            ->orderBy('id', 'desc')
            ->value('copy_code');
        if ($lastCopyCode && preg_match('/^(\d+)/', $lastCopyCode, $m)) {
            $highestNumber = max($highestNumber, (int)$m[1]);
        }

        $totalCopies = (int)(BookCopy::max('id') ?? 0);
        $baseNumber = max($highestNumber, $totalCopies, BookCopy::count());

        return $baseNumber + $offset;
    }

    /**
     * Generate Barcode SVG string for a given barcode hash
     */
    public static function generateSvg(string $code): string
    {
        $generator = new BarcodeGeneratorSVG();
        return $generator->getBarcode($code, $generator::TYPE_CODE_128, 2, 50);
    }

    /**
     * Generate Barcode HTML string for a given barcode hash
     */
    public static function generateHtml(string $code): string
    {
        $generator = new BarcodeGeneratorHTML();
        return $generator->getBarcode($code, $generator::TYPE_CODE_128, 2, 50);
    }
}

