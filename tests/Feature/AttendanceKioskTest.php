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
     * Test Presensi Kios sukses dengan kredensial valid
     */
    public function test_kiosk_attendance_logging_with_valid_credentials(): void
    {
        $response = $this->from('/presensi')->post('/presensi', [
            'username' => 'mhs12345',
            'password' => 'password',
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
     * Test Kios Presensi menolak kredensial salah
     */
    public function test_kiosk_attendance_rejects_invalid_password(): void
    {
        $response = $this->from('/presensi')->post('/presensi', [
            'username' => 'mhs12345',
            'password' => 'passwordsalah',
            'visit_purpose' => 'reading',
        ]);

        $response->assertSessionHasErrors(['username']);
        $this->assertDatabaseMissing('attendance_logs', [
            'user_id' => $this->student->id,
        ]);
    }
}
