<?php

namespace Database\Seeders;

use App\Models\Rack;
use Illuminate\Database\Seeder;

class RackSeeder extends Seeder
{
    public function run(): void
    {
        $racks = [
            ['code_rack' => 'RAK-A1', 'location' => 'Lantai 1 - Sektor Barat (Komputer & IT)', 'description' => 'Rak koleksi pemrograman dan ilmu komputer'],
            ['code_rack' => 'RAK-A2', 'location' => 'Lantai 1 - Sektor Barat (Sistem Informasi)', 'description' => 'Rak basis data, jaringan, dan analisis sistem'],
            ['code_rack' => 'RAK-B1', 'location' => 'Lantai 1 - Sektor Timur (Rekam Medis & Kesehatan)', 'description' => 'Rak rekam medis, kodifikasi penyakit ICD-10, dan kesehatan'],
            ['code_rack' => 'RAK-B2', 'location' => 'Lantai 1 - Sektor Timur (Farmasi & Biomedis)', 'description' => 'Rak kefarmasian dan biomedis terapan'],
            ['code_rack' => 'RAK-C1', 'location' => 'Lantai 2 - Sektor Utara (Teknik & Rekayasa)', 'description' => 'Rak teknik mesin, elektro, dan manufaktur'],
            ['code_rack' => 'RAK-C2', 'location' => 'Lantai 2 - Sektor Selatan (Manajemen & Bisnis)', 'description' => 'Rak akuntansi, manajemen, dan umum'],
        ];

        foreach ($racks as $rack) {
            Rack::updateOrCreate(['code_rack' => $rack['code_rack']], $rack);
        }
    }
}
