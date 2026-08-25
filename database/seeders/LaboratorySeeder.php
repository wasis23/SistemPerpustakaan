<?php

namespace Database\Seeders;

use App\Models\Laboratory;
use App\Models\Rack;
use Illuminate\Database\Seeder;

class LaboratorySeeder extends Seeder
{
    public function run(): void
    {
        $laboratories = [
            [
                'name' => 'Perpustakaan Utama Kampus 1',
                'location' => 'Kampus 1',
                'link_360' => 'https://kuula.co/share/collection/7l7Q1?logo=1&card=1&info=0&logosize=40&fs=1&vr=1&sd=1&initload=0&thumbs=1',
                'description' => 'Ruang baca ber-AC, area diskusi multimedia, dan koleksi lengkap teknologi informasi & rekayasa.',
            ],
            [
                'name' => 'Ruang Baca Perpustakaan Kampus 2',
                'location' => 'Kampus 2',
                'link_360' => 'https://kuula.co/share/collection/7v2P3?logo=1&card=1&info=0&logosize=40&fs=1&vr=1&sd=1&initload=0&thumbs=1',
                'description' => 'Spot membaca hening, koleksi kesehatan rekam medis, kefarmasian, dan e-library terminal.',
            ],
        ];

        foreach ($laboratories as $labData) {
            $lab = Laboratory::updateOrCreate(['name' => $labData['name']], $labData);

            // Hubungkan rak yang lokasinya sesuai ke laboratorium ini
            if ($lab->location === 'Kampus 1') {
                Rack::whereIn('code_rack', ['RAK-A1', 'RAK-A2', 'RAK-C1', 'RAK-C2'])
                    ->update(['laboratory_id' => $lab->id]);
            } elseif ($lab->location === 'Kampus 2') {
                Rack::whereIn('code_rack', ['RAK-B1', 'RAK-B2'])
                    ->update(['laboratory_id' => $lab->id]);
            }
        }
    }
}
