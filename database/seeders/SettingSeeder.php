<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::set(
            'max_borrow_limit',
            3,
            'integer',
            'Batas Maksimal Eksemplar Peminjaman',
            'Jumlah maksimal eksemplar buku fisik yang dapat dipinjam secara bersamaan oleh seorang anggota perpustakaan (bukan berdasarkan jumlah judul).',
            'circulation'
        );

        Setting::set(
            'fine_per_day',
            1000,
            'integer',
            'Tarif Denda Keterlambatan Per Hari (Rp)',
            'Tarif denda per eksemplar buku untuk setiap 1 hari keterlambatan melewati batas tanggal jatuh tempo pengembalian.',
            'circulation'
        );

        Setting::set(
            'borrow_duration_days',
            7,
            'integer',
            'Durasi Masa Peminjaman (Hari)',
            'Masa aktif durasi peminjaman buku sebelum jatuh tempo.',
            'circulation'
        );

        Setting::set(
            'ticket_expire_minutes',
            5,
            'integer',
            'Batas Kadaluarsa Tiket Peminjaman (Menit)',
            'Batas toleransi waktu pengambilan buku fisik di rak dan validasi ke petugas sirkulasi.',
            'circulation'
        );
    }
}
