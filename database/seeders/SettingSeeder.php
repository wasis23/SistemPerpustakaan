<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Aturan Peminjaman Mahasiswa
        Setting::set(
            'max_borrow_limit',
            2,
            'integer',
            'Batas Maksimal Eksemplar Peminjaman Mahasiswa',
            'Jumlah maksimal eksemplar buku fisik yang dapat dipinjam oleh mahasiswa (2 buku per minggu).',
            'circulation'
        );

        Setting::set(
            'borrow_duration_days',
            7,
            'integer',
            'Durasi Masa Peminjaman Mahasiswa (Hari)',
            'Masa aktif durasi peminjaman buku mahasiswa sebelum jatuh tempo (7 hari / 1 minggu).',
            'circulation'
        );

        // 2. Aturan Peminjaman Dosen & Tendik
        Setting::set(
            'max_borrow_limit_lecturer',
            4,
            'integer',
            'Batas Maksimal Eksemplar Peminjaman Dosen & Tendik',
            'Jumlah maksimal eksemplar buku fisik yang dapat dipinjam oleh dosen dan tenaga kependidikan (4 buku per 2 minggu).',
            'circulation'
        );

        Setting::set(
            'borrow_duration_days_lecturer',
            14,
            'integer',
            'Durasi Masa Peminjaman Dosen & Tendik (Hari)',
            'Masa aktif durasi peminjaman buku dosen & tendik sebelum jatuh tempo (14 hari / 2 minggu).',
            'circulation'
        );

        // 3. Tarif Denda & Kadaluarsa Tiket
        Setting::set(
            'fine_per_day',
            1000,
            'integer',
            'Tarif Denda Keterlambatan Per Hari (Rp)',
            'Tarif denda per eksemplar buku untuk setiap 1 hari keterlambatan melewati batas tanggal jatuh tempo pengembalian.',
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
