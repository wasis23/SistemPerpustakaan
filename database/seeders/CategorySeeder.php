<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['code' => '000', 'name' => 'Karya Umum & Komputer', 'description' => 'Karya umum, ilmu perpustakaan, dan teknologi informasi'],
            ['code' => '004', 'name' => 'Pemrograman & Rekayasa Perangkat Lunak', 'description' => 'Bahasa pemrograman, arsitektur software, dan basis data'],
            ['code' => '600', 'name' => 'Teknologi & Ilmu Terapan', 'description' => 'Ilmu teknik, industri, dan rekayasa terapan'],
            ['code' => '610', 'name' => 'Kesehatan & Rekam Medis', 'description' => 'Ilmu kedokteran, farmasi, manajemen rekam medis dan informasi kesehatan'],
            ['code' => '650', 'name' => 'Manajemen & Akuntansi', 'description' => 'Manajemen bisnis, akuntansi sektor publik, dan kewirausahaan'],
            ['code' => '300', 'name' => 'Ilmu Sosial & Hukum', 'description' => 'Ilmu sosial, politik, dan hukum tata negara'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['code' => $cat['code']], $cat);
        }
    }
}
