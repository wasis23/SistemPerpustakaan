<?php

namespace App\Services;

use Picqer\Barcode\BarcodeGeneratorSVG;
use Picqer\Barcode\BarcodeGeneratorHTML;

class BarcodeService
{
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
