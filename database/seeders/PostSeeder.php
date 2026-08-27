<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $petugas = User::where('role', 'petugas')->first();
        $authorId = $petugas ? $petugas->id : null;
        $authorName = $petugas ? $petugas->name : 'Tim Perpustakaan Politeknik Indonusa';

        $posts = [
            [
                'title' => 'Peluncuran Fitur Self-Service Scan Barcode Peminjaman Mandiri SIMPUS',
                'slug' => 'peluncuran-fitur-self-service-scan-barcode-peminjaman-mandiri-simpus',
                'category' => 'Inovasi & Teknologi',
                'excerpt' => 'Kini seluruh sivitas akademika Politeknik Indonusa Surakarta dapat melakukan peminjaman buku mandiri cukup dengan memindai barcode buku melalui kamera smartphone.',
                'content' => '<p>Perpustakaan Politeknik Indonusa Surakarta resmi meluncurkan pembaruan sistem sirkulasi mandiri berbasis web (*Self-Service Circulation*). Inovasi ini memungkinkan mahasiswa dan dosen untuk memindai kode barcode buku langsung di rak menggunakan kamera HP masing-masing tanpa harus antre panjang di meja sirkulasi.</p><h2>Cara Menggunakan Fitur Self-Service</h2><p>Langkah-langkah peminjaman mandiri sangat mudah dan cepat:</p><ul><li>Login ke akun anggota SIMPUS melalui smartphone Anda.</li><li>Buka menu <strong>Pindai Barcode (Scan Mandiri)</strong> di navigasi portal.</li><li>Arahkan kamera ke stiker barcode eksemplar buku yang ingin dipinjam.</li><li>Dapatkan tiket reservasi digital 5 menit dengan kunci stok otomatis.</li><li>Tunjukkan tiket kepada pustakawan di meja sirkulasi untuk konfirmasi serah terima fisik.</li></ul><p>Melalui inovasi ini, diharapkan efisiensi layanan perpustakaan meningkat pesat dan mempermudah mahasiswa dalam mengakses literatur akademik.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
                'thumbnail_alt' => 'Mahasiswa menggunakan sistem sirkulasi digital di perpustakaan Politeknik Indonusa',
                'status' => 'published',
                'is_featured' => true,
                'view_count' => 342,
                'reading_time' => 3,
                'meta_title' => 'Self-Service Scan Barcode Mandiri SIMPUS Politeknik Indonusa',
                'meta_description' => 'Pinjam buku perpustakaan kini lebih cepat dengan fitur Self-Service scan barcode kamera HP di Politeknik Indonusa Surakarta.',
                'meta_keywords' => 'perpustakaan digital, self-service barcode, poltekindonusa, pinjam buku online, simpus',
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'Workshop Literasi Informasi: Pemanfaatan E-Journal dan Referensi Ilmiah',
                'slug' => 'workshop-literasi-informasi-pemanfaatan-e-journal-dan-referensi-ilmiah',
                'category' => 'Kegiatan & Acara',
                'excerpt' => 'Tingkatkan kualitas tugas akhir dan publikasi ilmiah dengan mengikuti workshop literasi informasi perpustakaan bersama pakar kepustakawanan.',
                'content' => '<p>Dalam rangka mendukung peningkatan kualitas penelitian dan tugas akhir mahasiswa, UPT Perpustakaan Politeknik Indonusa Surakarta menyelenggarakan workshop bertajuk <em>"Pemanfaatan E-Journal Internasional dan Reference Management Tools"</em>.</p><h2>Materi yang Akan Dibahas</h2><ul><li>Strategi penelusuran jurnal bereputasi tinggi (Scopus, DOAJ, IEEE).</li><li>Penggunaan aplikasi manajemen sitasi (Mendeley dan Zotero).</li><li>Etika sitasi dan pencegahan plagiarisme karya tulis ilmiah.</li></ul><p>Kegiatan ini gratis untuk seluruh mahasiswa aktif dan dosen Politeknik Indonusa. Segera daftarkan diri Anda sebelum kuota penuh!</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
                'thumbnail_alt' => 'Suasana workshop literasi informasi mahasiswa di perpustakaan',
                'status' => 'published',
                'is_featured' => true,
                'view_count' => 218,
                'reading_time' => 2,
                'meta_title' => 'Workshop Literasi Informasi & E-Journal Politeknik Indonusa',
                'meta_description' => 'Ikuti workshop literasi informasi perpustakaan Poltekindonusa untuk memaksimalkan referensi e-journal dan manajemen sitasi skripsi.',
                'meta_keywords' => 'workshop literasi, referensi ilmiah, e-journal, mendeley, tugas akhir poltek',
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Penambahan 250+ Judul Buku Baru Koleksi Teknologi Informasi dan Kesehatan',
                'slug' => 'penambahan-250-judul-buku-baru-koleksi-teknologi-informasi-dan-kesehatan',
                'category' => 'Koleksi Baru',
                'excerpt' => 'Perpustakaan menambah ratusan koleksi buku cetak edisi terbaru untuk program studi Informatika, Rekam Medis, Farmasi, dan Manajemen.',
                'content' => '<p>Guna memenuhi kebutuhan referensi terkini, perpustakaan telah melakukan pengadaan 250+ eksemplar buku terbaru tahun terbit 2024-2025. Buku-buku ini mencakup topik kecerdasan buatan (AI), rekam medis elektronik, manajemen bisnis digital, dan sistem informasi kesehatan.</p><p>Seluruh koleksi baru telah diinput ke dalam katalog SIMPUS dan sudah tersedia di rak untuk dipinjam.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
                'thumbnail_alt' => 'Koleksi buku baru di rak perpustakaan politeknik',
                'status' => 'published',
                'is_featured' => false,
                'view_count' => 175,
                'reading_time' => 2,
                'meta_title' => '250+ Koleksi Buku Baru Perpustakaan Politeknik Indonusa',
                'meta_description' => 'Daftar pengadaan buku baru perpustakaan Politeknik Indonusa Surakarta bidang IT, Rekam Medis, dan Kesehatan.',
                'meta_keywords' => 'buku baru perpustakaan, koleksi ddc, buku IT rekam medis, poltekindonusa',
                'published_at' => now()->subDays(8),
            ],
            [
                'title' => 'Jadwal Layanan Perpustakaan Selama Periode Ujian Akhir Semester',
                'slug' => 'jadwal-layanan-perpustakaan-selama-periode-ujian-akhir-semester',
                'category' => 'Pengumuman',
                'excerpt' => 'Informasi jam operasional perpanjangan layanan ruang baca dan sirkulasi selama masa UAS semester ini.',
                'content' => '<p>Diberitahukan kepada seluruh mahasiswa Politeknik Indonusa Surakarta bahwa selama periode Ujian Akhir Semester (UAS), ruang baca perpustakaan akan memperpanjang jam layanan operasional hingga pukul 19.00 WIB setiap hari Senin hingga Jumat.</p><p>Fasilitas ruang diskusi, koneksi internet Wi-Fi cepat, serta stopkontak laptop dapat dimanfaatkan dengan tetap menjaga ketenangan dan kebersihan lingkungan perpustakaan.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
                'thumbnail_alt' => 'Ruang baca perpustakaan mahasiswa menjelang ujian',
                'status' => 'published',
                'is_featured' => false,
                'view_count' => 140,
                'reading_time' => 1,
                'meta_title' => 'Jadwal Operasional Perpustakaan Periode UAS Politeknik Indonusa',
                'meta_description' => 'Pengumuman perpanjangan jam operasional ruang baca perpustakaan selama masa UAS Politeknik Indonusa.',
                'meta_keywords' => 'jadwal perpustakaan, jam buka simpus, ruang baca uas poltek',
                'published_at' => now()->subDays(12),
            ],
        ];

        foreach ($posts as $postData) {
            Post::updateOrCreate(
                ['slug' => $postData['slug']],
                array_merge($postData, [
                    'user_id' => $authorId,
                    'author_name' => $authorName,
                ])
            );
        }
    }
}
