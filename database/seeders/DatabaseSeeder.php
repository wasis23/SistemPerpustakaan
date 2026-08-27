<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seeder Akun Petugas (Pustakawan)
        User::updateOrCreate(
            ['username' => 'pustakawan'],
            [
                'name' => 'Budi Pustakawan, S.IP',
                'email' => 'pustakawan@indonusa.ac.id',
                'password' => Hash::make('password'),
                'role' => 'petugas',
                'prodi' => 'Perpustakaan & Arsip',
                'phone' => '081234567890',
                'status' => 'active',
            ]
        );

        // 2. Seeder Akun Anggota (Mahasiswa)
        User::updateOrCreate(
            ['username' => 'mhs12345'],
            [
                'name' => 'Ahmad Rizky Pratama',
                'email' => 'ahmad.rizky@student.indonusa.ac.id',
                'password' => Hash::make('password'),
                'role' => 'anggota',
                'prodi' => 'D4 Teknologi Rekayasa Perangkat Lunak',
                'phone' => '089876543210',
                'status' => 'active',
            ]
        );

        // 3. Seeder Akun Anggota (Dosen)
        User::updateOrCreate(
            ['username' => 'dsn99887'],
            [
                'name' => 'Dr. Indah Permata, M.Kom',
                'email' => 'indah.permata@indonusa.ac.id',
                'password' => Hash::make('password'),
                'role' => 'anggota',
                'prodi' => 'D4 Manajemen Informasi Kesehatan',
                'phone' => '081122334455',
                'status' => 'active',
            ]
        );

        // 4. Seeder Master Data (Laboratorium/Perpustakaan 360, Kategori, Rak, Buku, Eksemplar, Pengaturan, Hari Libur)
        $this->call([
            SettingSeeder::class,
            HolidaySeeder::class,
            LaboratorySeeder::class,
            CategorySeeder::class,
            RackSeeder::class,
            BookSeeder::class,
        ]);
    }
}
