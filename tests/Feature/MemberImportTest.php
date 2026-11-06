<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class MemberImportTest extends TestCase
{
    use RefreshDatabase;

    protected User $petugas;

    protected function setUp(): void
    {
        parent::setUp();

        $this->petugas = User::create([
            'username' => 'admin_petugas',
            'name' => 'Petugas Perpustakaan',
            'email' => 'admin@poltekindonusa.ac.id',
            'password' => bcrypt('password123'),
            'role' => 'petugas',
            'status' => 'active',
        ]);
    }

    /**
     * Test download template CSV data anggota
     */
    public function test_can_download_member_csv_template(): void
    {
        $response = $this->actingAs($this->petugas)
            ->get('/petugas/members/download-template');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    /**
     * Test import data anggota via CSV
     */
    public function test_can_import_members_from_csv(): void
    {
        $csvContent = "\xEF\xBB\xBF" .
            "NO,NIM_NIDN,NAMA_LENGKAP,PROGRAM_STUDI,NO_HP,EMAIL,PASSWORD,STATUS\n" .
            "1,202401999,Rizky Pratama,D4 Teknologi Rekayasa Perangkat Lunak,081299998888,rizky@poltekindonusa.ac.id,secret123,active\n" .
            "2,202402888,Dewi Lestari,D3 Farmasi,085677776666,dewi@poltekindonusa.ac.id,,active\n";

        $file = UploadedFile::fake()->createWithContent('anggota_test.csv', $csvContent);

        $response = $this->actingAs($this->petugas)
            ->post('/petugas/members/import-csv', [
                'file' => $file,
            ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'username' => '202401999',
            'name' => 'Rizky Pratama',
            'role' => 'anggota',
            'prodi' => 'D4 Teknologi Rekayasa Perangkat Lunak',
            'phone' => '081299998888',
            'email' => 'rizky@poltekindonusa.ac.id',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('users', [
            'username' => '202402888',
            'name' => 'Dewi Lestari',
            'role' => 'anggota',
            'prodi' => 'D3 Farmasi',
            'status' => 'active',
        ]);
    }

    /**
     * Test import CSV updates existing member
     */
    public function test_import_updates_existing_member(): void
    {
        $existing = User::create([
            'username' => '202401001',
            'name' => 'Nama Lama',
            'email' => 'lama@poltekindonusa.ac.id',
            'password' => bcrypt('123456'),
            'role' => 'anggota',
            'prodi' => 'D3 Perhotelan',
            'status' => 'active',
        ]);

        $csvContent = "NO,NIM_NIDN,NAMA_LENGKAP,PROGRAM_STUDI,NO_HP,EMAIL,PASSWORD,STATUS\n" .
            "1,202401001,Nama Baru Terupdate,D4 Bisnis Manajemen Ritel,081234567890,lama@poltekindonusa.ac.id,,active\n";

        $file = UploadedFile::fake()->createWithContent('update_anggota.csv', $csvContent);

        $response = $this->actingAs($this->petugas)
            ->post('/petugas/members/import-csv', [
                'file' => $file,
            ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'id' => $existing->id,
            'username' => '202401001',
            'name' => 'Nama Baru Terupdate',
            'prodi' => 'D4 Bisnis Manajemen Ritel',
        ]);
    }
}
