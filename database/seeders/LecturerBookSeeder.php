<?php

namespace Database\Seeders;

use App\Models\LecturerBook;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LecturerBookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dosenUser = User::where('role', 'anggota')->where('username', 'dsn99887')->first();

        $books = [
            [
                'title' => 'Pengembangan Sistem Informasi Manajemen Rekam Medis Elektronik Berbasis Standar HL7 FHIR',
                'slug' => 'pengembangan-sistem-informasi-manajemen-rekam-medis-elektronik-berbasis-standar-hl7-fhir',
                'authors' => 'Dr. Indah Permata, M.Kom; Sinta Novratilova, S.ST., M.Kes',
                'nidn' => '0624068701',
                'user_id' => $dosenUser?->id,
                'prodi' => 'D4-Manajemen Informasi Kesehatan',
                'publication_type' => 'Buku Referensi',
                'isbn' => '978-623-01-2345-6',
                'publisher' => 'Poltek Indonusa Surakarta Press',
                'publish_year' => 2024,
                'city' => 'Surakarta',
                'edition' => 'Cetakan Ke-1',
                'pages' => 248,
                'synopsis' => 'Buku referensi ini membahas secara mendalam implementasi dan arsitektur Rekam Medis Elektronik (RME) di fasilitas pelayanan kesehatan, mengacu pada integrasi data SATUSEHAT Kemenkes RI dan interoperabilitas standar HL7 FHIR.',
                'cover_image' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
                'document_url' => null,
                'doi_url' => 'https://doi.org/10.5281/zenodo.1089234',
                'hki_number' => 'EC00202419823',
                'is_featured' => true,
            ],
            [
                'title' => 'Rekayasa Perangkat Lunak Modern: Konsep Microservices, CI/CD, dan Docker Container',
                'slug' => 'rekayasa-perangkat-lunak-modern-konsep-microservices-cicd-dan-docker-container',
                'authors' => 'Wasis Waluyo, S.Kom; Ahmad Rizky Pratama, M.Kom',
                'nidn' => '202202001',
                'user_id' => null,
                'prodi' => 'D4-Teknologi Rekayasa Perangkat Lunak',
                'publication_type' => 'Buku Ajar',
                'isbn' => '978-602-401-889-1',
                'publisher' => 'Deepublish Publisher',
                'publish_year' => 2024,
                'city' => 'Yogyakarta',
                'edition' => 'Edisi Revisi',
                'pages' => 312,
                'synopsis' => 'Buku ajar kurikulum vokasi teknologi perangkat lunak yang membimbing mahasiswa merancang arsitektur aplikasi scalable, deployment otomatis pipeline GitHub Actions, dan kontainerisasi Docker.',
                'cover_image' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
                'document_url' => null,
                'doi_url' => 'https://doi.org/10.1016/j.procs.2024.03.11',
                'hki_number' => 'EC00202409812',
                'is_featured' => true,
            ],
            [
                'title' => 'Formulasi dan Evaluasi Mutu Sediaan Herbal Berbasis Bahan Alam Lokal Soloraya',
                'slug' => 'formulasi-dan-evaluasi-mutu-sediaan-herbal-berbasis-bahan-alam-lokal-soloraya',
                'authors' => 'Rahmadhani Tyas Angganawati, M.Farm., Apt.',
                'nidn' => '0618089301',
                'user_id' => null,
                'prodi' => 'D3-Farmasi',
                'publication_type' => 'Monograf',
                'isbn' => '978-623-789-112-0',
                'publisher' => 'Pustaka Rekan Grafika',
                'publish_year' => 2023,
                'city' => 'Surakarta',
                'edition' => 'Cetakan Ke-1',
                'pages' => 180,
                'synopsis' => 'Monograf hasil riset terapan laboratorium farmasi tentang ekstraksi senyawa bioaktif tanaman obat endemik Soloraya serta standardisasi sediaan farmasi cair dan semipadat.',
                'cover_image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
                'document_url' => null,
                'doi_url' => 'https://sinta.kemdikbud.go.id/authors/profile/6180893',
                'hki_number' => 'EC00202391204',
                'is_featured' => false,
            ],
            [
                'title' => 'Diagnostik Sistem Elektronik Kendaraan Listrik dan Hybrid: Panduan Praktik Bengkel Vokasi',
                'slug' => 'diagnostik-sistem-elektronik-kendaraan-listrik-dan-hybrid-panduan-praktik-bengkel-vokasi',
                'authors' => 'Didik Sugiyanto, M.T.; Agus Susanto, S.T., M.Eng',
                'nidn' => '0625098201',
                'user_id' => null,
                'prodi' => 'D4-Teknologi Rekayasa Otomotif',
                'publication_type' => 'Modul Praktikum',
                'isbn' => '978-602-280-456-7',
                'publisher' => 'Andi Offset',
                'publish_year' => 2024,
                'city' => 'Yogyakarta',
                'edition' => 'Edisi Ke-2',
                'pages' => 195,
                'synopsis' => 'Panduan komprehensif praktikum bengkel otomotif modern meliputi pengujian Battery Management System (BMS), inverter, motor induksi 3 fasa, dan troubleshooting sensor OBD-II.',
                'cover_image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
                'document_url' => null,
                'doi_url' => 'https://doi.org/10.1109/trans.2024.120',
                'hki_number' => 'EC00202456789',
                'is_featured' => false,
            ],
            [
                'title' => 'Strategi Manajemen Bisnis Ritel Modern dan Omnichannel Marketing di Era Digital',
                'slug' => 'strategi-manajemen-bisnis-ritel-modern-dan-omnichannel-marketing-di-era-digital',
                'authors' => 'Sigit Suroto, S.E., M.M.; Miswanto, M.M.',
                'nidn' => '9906977719',
                'user_id' => null,
                'prodi' => 'D4-Bisnis dan Manajemen Ritel',
                'publication_type' => 'Buku Ajar',
                'isbn' => '978-623-221-789-3',
                'publisher' => 'Erlangga Akademik',
                'publish_year' => 2023,
                'city' => 'Jakarta',
                'edition' => 'Cetakan Ke-1',
                'pages' => 260,
                'synopsis' => 'Buku ajar untuk mata kuliah operasional ritel dan pemasaran digital yang mengupas integrasi gerai fisik, marketplace, CRM, dan supply chain logistics modern.',
                'cover_image' => 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80',
                'document_url' => null,
                'doi_url' => null,
                'hki_number' => 'EC00202344123',
                'is_featured' => false,
            ],
        ];

        foreach ($books as $data) {
            LecturerBook::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
