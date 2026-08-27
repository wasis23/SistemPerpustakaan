<?php

namespace Database\Seeders;

use App\Models\NationalJournal;
use Illuminate\Database\Seeder;

class NationalJournalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $journals = [
            [
                'title' => 'INFOKES: Jurnal Ilmiah Rekam Medis dan Informatika Kesehatan',
                'prodi' => 'D4-Manajemen Informasi Kesehatan',
                'publisher' => 'LPPM Politeknik Indonusa Surakarta',
                'access_url' => 'https://ojs.poltekindonusa.ac.id/index.php/infokes',
                'sinta' => 'SINTA 3',
                'issn' => '2086-2628',
                'e_issn' => '2541-5476',
                'frequency' => '2 Kali Setahun (Maret & September)',
                'description' => 'Jurnal ilmiah yang mempublikasikan hasil penelitian di bidang manajemen informasi kesehatan, rekam medis elektronik, sistem informasi rumah sakit, dan klasifikasi kode penyakit.',
                'cover_image' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80',
                'doi_prefix' => '10.47701/infokes',
                'is_active' => true,
            ],
            [
                'title' => 'JITET: Jurnal Informatika Terapan dan Rekayasa Komputer',
                'prodi' => 'D4-Teknologi Rekayasa Perangkat Lunak',
                'publisher' => 'Politeknik Indonusa Surakarta Press',
                'access_url' => 'https://ojs.poltekindonusa.ac.id/index.php/jitet',
                'sinta' => 'SINTA 4',
                'issn' => '2301-8925',
                'e_issn' => '2685-998X',
                'frequency' => '3 Kali Setahun (Januari, Mei, September)',
                'description' => 'Memuat artikel hasil riset terapan bidang Software Engineering, Cloud Computing, Artificial Intelligence, Internet of Things (IoT), dan Cybersecurity.',
                'cover_image' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
                'doi_prefix' => '10.47701/jitet',
                'is_active' => true,
            ],
            [
                'title' => 'Jurnal Farmasi Indonesia & Sains Terapan (J-FIST)',
                'prodi' => 'D3-Farmasi',
                'publisher' => 'Prodi Farmasi Politeknik Indonusa Surakarta',
                'access_url' => 'https://ojs.poltekindonusa.ac.id/index.php/jfist',
                'sinta' => 'SINTA 4',
                'issn' => '2722-113X',
                'e_issn' => '2722-1148',
                'frequency' => '2 Kali Setahun (Juni & Desember)',
                'description' => 'Publikasi ilmiah dalam bidang formulasi sediaan farmasi, teknologi bahan alam, farmasi klinis & komunitas, serta analisis kimia farmasi.',
                'cover_image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
                'doi_prefix' => '10.47701/jfist',
                'is_active' => true,
            ],
            [
                'title' => 'JUTO: Jurnal Rekayasa Teknologi Otomotif & Manufaktur',
                'prodi' => 'D4-Teknologi Rekayasa Otomotif',
                'publisher' => 'LPPM Politeknik Indonusa Surakarta',
                'access_url' => 'https://ojs.poltekindonusa.ac.id/index.php/juto',
                'sinta' => 'SINTA 5',
                'issn' => '2407-3342',
                'e_issn' => '2686-1208',
                'frequency' => '2 Kali Setahun (April & Oktober)',
                'description' => 'Wadah publikasi karya ilmiah bidang kendaraan listrik, sistem kontrol otomotif, konversi energi terbarukan, dan perancangan mekanik manufaktur.',
                'cover_image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
                'doi_prefix' => '10.47701/juto',
                'is_active' => true,
            ],
            [
                'title' => 'JOMAN: Jurnal Manajemen Bisnis Ritel & Digital Marketing',
                'prodi' => 'D4-Bisnis dan Manajemen Ritel',
                'publisher' => 'Politeknik Indonusa Surakarta',
                'access_url' => 'https://ojs.poltekindonusa.ac.id/index.php/joman',
                'sinta' => 'SINTA 5',
                'issn' => '2808-9901',
                'e_issn' => '2808-991X',
                'frequency' => '2 Kali Setahun (Februari & Agustus)',
                'description' => 'Fokus kajian mengenai perilaku konsumen digital, operasional ritel modern, supply chain management terintegrasi, dan kewirausahaan.',
                'cover_image' => 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=400&q=80',
                'doi_prefix' => '10.47701/joman',
                'is_active' => true,
            ],
            [
                'title' => 'Jurnal Media Komunikasi & Produksi Penyiaran',
                'prodi' => 'D4-Produksi Media',
                'publisher' => 'Politeknik Indonusa Surakarta',
                'access_url' => 'https://ojs.poltekindonusa.ac.id/index.php/jmkp',
                'sinta' => 'Non-SINTA',
                'issn' => '2964-1020',
                'e_issn' => '2964-1039',
                'frequency' => '2 Kali Setahun (Mei & November)',
                'description' => 'Publikasi riset terapan bidang broadcasting, produksi konten multimedia interaktif, sinematografi, jurnalisme penyiaran, dan periklanan digital.',
                'cover_image' => 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=400&q=80',
                'doi_prefix' => null,
                'is_active' => true,
            ],
        ];

        foreach ($journals as $data) {
            NationalJournal::updateOrCreate(
                ['title' => $data['title']],
                $data
            );
        }
    }
}
