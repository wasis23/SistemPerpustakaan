<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceKioskTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::create([
            'username' => 'mhs12345',
            'name' => 'Budi Santoso',
            'email' => 'budi@polindonusa.ac.id',
            'password' => bcrypt('password'),
            'role' => 'anggota',
            'status' => 'active',
            'prodi' => 'S1 Informatika',
        ]);
    }

    /**
     * Test Kiosk Presensi Halaman Depan bisa diakses publik
     */
    public function test_kiosk_page_is_accessible(): void
    {
        $response = $this->get('/presensi');
        $response->assertStatus(200);
    }

    /**
     * Test Presensi Kios sukses hanya dengan NIM / Username valid
     */
    public function test_kiosk_attendance_logging_with_valid_username(): void
    {
        $response = $this->from('/presensi')->post('/presensi', [
            'username' => 'mhs12345',
            'visit_purpose' => 'reading',
        ]);

        $response->assertRedirect('/presensi');
        $response->assertSessionHas('success_visitor');

        $this->assertDatabaseHas('attendance_logs', [
            'user_id' => $this->student->id,
            'visit_purpose' => 'reading',
        ]);
    }

    /**
     * Test Kios Presensi menolak NIM tidak terdaftar
     */
    public function test_kiosk_attendance_rejects_nonexistent_user(): void
    {
        $response = $this->from('/presensi')->post('/presensi', [
            'username' => 'nim_tidak_ada_99999',
            'visit_purpose' => 'reading',
        ]);

        $response->assertSessionHasErrors(['username']);
        $this->assertDatabaseMissing('attendance_logs', [
            'user_id' => $this->student->id,
        ]);
    }
}
