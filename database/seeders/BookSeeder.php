<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\Rack;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $catIT = Category::where('code', '004')->first();
        $catHealth = Category::where('code', '610')->first();
        $catMgmt = Category::where('code', '650')->first();

        $rackA1 = Rack::where('code_rack', 'RAK-A1')->first();
        $rackB1 = Rack::where('code_rack', 'RAK-B1')->first();
        $rackC2 = Rack::where('code_rack', 'RAK-C2')->first();

        $sampleBooks = [
            [
                'isbn' => '978-602-04-9812-1',
                'title' => 'Pemrograman Modern dengan Laravel 11 & React',
                'author' => 'Dr. Rahmat Hidayat, M.T.',
                'publisher' => 'Informatika Press',
                'publish_year' => 2024,
                'category_id' => $catIT->id,
                'rack_id' => $rackA1->id,
                'total_copies' => 3,
                'copy_prefix' => 'BK-IT-001',
            ],
            [
                'isbn' => '978-602-89-1100-5',
                'title' => 'Manajemen Sistem Rekam Medis & Manajemen Informasi Kesehatan',
                'author' => 'Siti Aminah, S.ST., M.Kes.',
                'publisher' => 'EGC Medika',
                'publish_year' => 2023,
                'category_id' => $catHealth->id,
                'rack_id' => $rackB1->id,
                'total_copies' => 2,
                'copy_prefix' => 'BK-RM-002',
            ],
            [
                'isbn' => '978-602-12-3456-7',
                'title' => 'Akuntansi Sektor Publik & Tata Kelola Keuangan',
                'author' => 'Bambang Sudibyo, M.Com.',
                'publisher' => 'Salemba Empat',
                'publish_year' => 2022,
                'category_id' => $catMgmt->id,
                'rack_id' => $rackC2->id,
                'total_copies' => 2,
                'copy_prefix' => 'BK-AK-003',
            ],
        ];

        foreach ($sampleBooks as $data) {
            $prefix = $data['copy_prefix'];
            unset($data['copy_prefix']);

            $book = Book::updateOrCreate(['isbn' => $data['isbn']], $data);

            // Generate eksemplar fisik buku
            for ($i = 1; $i <= $book->total_copies; $i++) {
                $suffix = chr(64 + $i); // A, B, C
                $copyCode = "{$prefix}-{$suffix}";
                $barcode = "BC-" . strtoupper(Str::random(8));

                BookCopy::updateOrCreate(
                    ['copy_code' => $copyCode],
                    [
                        'book_id' => $book->id,
                        'barcode_hash' => $barcode,
                        'condition' => 'good',
                        'status' => 'available',
                    ]
                );
            }
        }
    }
}
