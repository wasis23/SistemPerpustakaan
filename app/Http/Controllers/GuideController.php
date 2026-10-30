<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class GuideController extends Controller
{
    /**
     * Halaman Publik & Anggota: Panduan Layanan Perpustakaan
     */
    public function index(): Response
    {
        $guides = [
            [
                'id' => 'peminjaman-mandiri',
                'title' => 'Panduan Peminjaman Buku Mandiri (Scan HP)',
                'category' => 'Layanan Sirkulasi',
                'summary' => 'Tata cara meminjam buku fisik di rak perpustakaan menggunakan kamera smartphone tanpa perlu antre.',
                'steps' => [
                    'Pastikan Anda telah login ke akun portal Website Perpustakaan menggunakan NIM/NIDN SIAKAD.',
                    'Datang ke ruang perpustakaan dan cari buku yang Anda inginkan di rak koleksi.',
                    'Buka menu "Scan Barcode Rak" di ponsel Anda dan izinkan akses kamera.',
                    'Arahkan kamera ke stiker barcode eksemplar buku fisik yang tertempel di cover/punggung buku.',
                    'Sistem akan otomatis mengunci (hold) stok buku selama 5 menit dan memunculkan tiket digital.',
                    'Bawa buku ke meja petugas sirkulasi dan tunjukkan tiket digital pada layar HP untuk disahkan.',
                ],
                'notes' => 'Batas maksimal peminjaman: Mahasiswa 3 buku (7 hari), Dosen/Tendik 4 buku (14 hari).',
            ],
            [
                'id' => 'perpanjangan-buku',
                'title' => 'Panduan Perpanjangan Pinjaman Buku',
                'category' => 'Layanan Sirkulasi',
                'summary' => 'Prosedur perpanjangan masa pinjam buku sebelum jatuh tempo pengembalian.',
                'steps' => [
                    'Masuk ke menu "Buku Dipinjam Saya" di portal anggota.',
                    'Periksa daftar pinjaman aktif Anda. Buku yang belum terlambat akan menampilkan tombol "Perpanjang Masa Pinjam".',
                    'Klik tombol perpanjangan untuk menambah masa pinjam sesuai ketentuan (Mahasiswa +7 hari, Dosen +14 hari).',
                    'Perpanjangan hanya dapat dilakukan maksimal 1 kali per peminjaman.',
                    'Buku yang sudah melewati tanggal jatuh tempo tidak dapat diperpanjang mandiri dan harus diselesaikan di meja petugas.',
                ],
                'notes' => 'Pastikan mengajukan perpanjangan sebelum tanggal jatuh tempo berakhir.',
            ],
            [
                'id' => 'pengumpulan-ta',
                'title' => 'Panduan Pengumpulan Tugas Akhir (TA / Skripsi / PI / PKL)',
                'category' => 'Bebas Pustaka & Karya Ilmiah',
                'summary' => 'Alur dan persyaratan penyerahan dokumen Tugas Akhir, Skripsi, dan Laporan Praktik Kerja Lapangan untuk syarat yudisium.',
                'steps' => [
                    'Format dokumen naskah TA/Skripsi/Laporan PKL disusun sesuai pedoman baku Politeknik Indonusa Surakarta.',
                    'Siapkan file naskah lengkap (Cover s/d Lampiran) dalam format PDF yang sudah ditandatangani pembimbing dan penguji.',
                    'Sertakan halaman persetujuan publikasi dan lembar pernyataan keaslian karya bermaterai.',
                    'Unggah naskah mandiri melalui repository atau serahkan berkas softcopy (CD/Flashdisk) ke petugas perpustakaan.',
                    'Menyerahkan 1 eksemplar hardcopy naskah Tugas Akhir yang sudah dijilid rapi (hard cover).',
                    'Petugas akan memverifikasi kelengkapan berkas dan menerbitkan Surat Bebas Pustaka resmi.',
                ],
                'notes' => 'Bebas pustaka wajib mensyaratkan tidak adanya tanggungan pinjaman buku atau denda berjalan.',
            ],
            [
                'id' => 'presensi-kios',
                'title' => 'Panduan Presensi Pengunjung Perpustakaan',
                'category' => 'Presensi & Kunjungan',
                'summary' => 'Cara mencatat kehadiran di terminal Kiosk pintu masuk perpustakaan.',
                'steps' => [
                    'Bagi Mahasiswa/Dosen: Pilih tab "Sivitas Akademika", masukkan NIM/Username dan kata sandi, lalu pilih keperluan kunjungan.',
                    'Bagi Anggota Eksternal / Tamu: Pilih tab "Anggota Eksternal", masukkan Nama Lengkap, Asal Instansi/Kampus, No. HP/WhatsApp, dan keperluan kunjungan.',
                    'Klik tombol "Konfirmasi Masuk Presensi".',
                    'Layar akan menampilkan notifikasi selamat datang dan nama Anda akan tercatat di log kunjungan real-time.',
                ],
                'notes' => 'Presensi diwajibkan bagi seluruh pengunjung perpustakaan sebelum memasuki area rak baca.',
            ],
            [
                'id' => 'akses-gale',
                'title' => 'Panduan Akses Database Jurnal & E-Book GALE Cengage',
                'category' => 'E-Resources',
                'summary' => 'Panduan penelusuran jurnal internasional bereputasi dan referensi ilmiah melalui platform GALE.',
                'steps' => [
                    'Buka halaman utama Website Perpustakaan pada bagian "Publikasi Ilmiah & Database Riset".',
                    'Temukan bagian "GALE Cengage Learning" dan pilih subjek yang Anda butuhkan (contoh: Gale Academic OneFile, Health & Medicine, Business, atau IT).',
                    'Klik tombol "Akses Database / Login GALE".',
                    'Masukkan ID Institusi atau kredensial akun perpustakaan kampus Anda yang telah dibagikan.',
                    'Telusuri artikel ilmiah berteks lengkap (Full-Text PDF) untuk referensi tugas atau penelitian.',
                ],
                'notes' => 'Akses database GALE dilanggan khusus untuk sivitas akademika Politeknik Indonusa Surakarta.',
            ],
        ];

        return Inertia::render('Panduan/Index', [
            'guides' => $guides,
        ]);
    }
}
