<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['code' => '000', 'name' => 'Karya Umum, Ilmu Komputer, dan Informasi (Generalities)', 'description' => 'Karya umum, ilmu komputer, informasi, bibliografi, dan perpustakaan'],
            ['code' => '100', 'name' => 'Filsafat dan Psikologi (Philosophy & Psychology)', 'description' => 'Filsafat, psikologi, logika, dan etika'],
            ['code' => '200', 'name' => 'Agama dan Teologi (Religion)', 'description' => 'Agama, teologi, mitologi keagamaan, dan perbandingan agama'],
            ['code' => '300', 'name' => 'Ilmu Sosial (Social Sciences)', 'description' => 'Sosiologi, antropologi, politik, hukum, ekonomi, dan pendidikan'],
            ['code' => '400', 'name' => 'Bahasa dan Linguistik (Language)', 'description' => 'Linguistik, tata bahasa, kamus, dan bahasa-bahasa dunia'],
            ['code' => '500', 'name' => 'Sains Murni / Ilmu Alam dan Matematika (Natural Sciences & Mathematics)', 'description' => 'Matematika, astronomi, fisika, kimia, biologi, dan ilmu alam'],
            ['code' => '600', 'name' => 'Teknologi dan Ilmu Terapan (Technology & Applied Science)', 'description' => 'Kedokteran, farmasi, rekayasa, teknologi, agrikultur, dan manajemen terapan'],
            ['code' => '700', 'name' => 'Kesenian, Hiburan, dan Olahraga (The Arts)', 'description' => 'Seni rupa, arsitektur, musik, fotografi, rekreasi, dan olahraga'],
            ['code' => '800', 'name' => 'Kesusastraan dan Sastra (Literature)', 'description' => 'Puisi, drama, fiksi, esai, kritik sastra, dan sastra dunia'],
            ['code' => '900', 'name' => 'Sejarah, Geografi, dan Biografi (Geography & History)', 'description' => 'Geografi, perjalanan wisata, biografi, dan sejarah dunia'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['code' => $cat['code']], $cat);
        }
    }
}
