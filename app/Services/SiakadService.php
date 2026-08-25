<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SiakadService
{
    /**
     * Autentikasi dan sinkronisasi data Mahasiswa dari SIAKAD
     *
     * @param string $username (NIM Mahasiswa)
     * @param string $password
     * @return User|null
     */
    public function authenticate(string $username, string $password): ?User
    {
        $cleanNim = strtoupper(trim($username));
        $mahasiswaData = null;

        // 1. Coba via HTTP API SIAKAD External
        $apiUrl = config('services.siakad.url', 'https://siakad.poltekindonusa.ac.id/api/mahasiswa_external.php');
        $apiKey = config('services.siakad.api_key', 'INDONUSA_SECRET_API_KEY_2026_X7Z');

        try {
            $response = Http::timeout(3)
                ->withHeaders([
                    'X-Api-Key' => $apiKey,
                    'Accept' => 'application/json',
                ])
                ->get($apiUrl, [
                    'nim' => $cleanNim,
                ]);

            if ($response->successful()) {
                $payload = $response->json();
                if (!empty($payload['status']) && isset($payload['data']['password_hash'])) {
                    $mhs = $payload['data'];
                    if (password_verify($password, $mhs['password_hash'])) {
                        $mahasiswaData = [
                            'nim' => $mhs['nim'] ?? $cleanNim,
                            'nama' => $mhs['nama'] ?? $cleanNim,
                            'email' => $mhs['email_institusi'] ?? ($cleanNim . '@poltekindonusa.ac.id'),
                            'prodi' => $mhs['prodi'] ?? null,
                            'phone' => $mhs['no_hp'] ?? null,
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Gagal menghubungi HTTP API SIAKAD: ' . $e->getMessage());
        }

        // 2. Fallback: Direct Database Connection ke SIAKAD DB
        if (!$mahasiswaData) {
            try {
                $student = DB::connection('siakad')
                    ->table('viewMahasiswaPt')
                    ->where('nipd', $cleanNim)
                    ->first();

                if (!$student) {
                    $student = DB::connection('siakad')
                        ->table('viewMahasiswaKeluar')
                        ->where('nipd', $cleanNim)
                        ->first();
                }

                if ($student) {
                    $hash = trim((string)($student->pass ?? $student->password ?? ''));
                    $passwordValid = false;

                    if ($hash && password_verify($password, $hash)) {
                        $passwordValid = true;
                    } elseif ($hash && md5($password) === strtolower($hash)) {
                        $passwordValid = true;
                    } elseif ($hash && sha1($password) === strtolower($hash)) {
                        $passwordValid = true;
                    } elseif ($hash && $password === $hash) {
                        $passwordValid = true;
                    }

                    if ($passwordValid) {
                        $bio = null;
                        if (!empty($student->id_pd) || !empty($student->xid_pd)) {
                            $bio = DB::connection('siakad')->table('wsia_mahasiswa')
                                ->where(function ($q) use ($student) {
                                    if (!empty($student->id_pd)) $q->where('id_pd', $student->id_pd);
                                    if (!empty($student->xid_pd)) $q->orWhere('xid_pd', $student->xid_pd);
                                })
                                ->first();
                        }

                        $mahasiswaData = [
                            'nim' => $student->nipd ?? $cleanNim,
                            'nama' => $bio->nm_pd ?? $student->nm_pd ?? $cleanNim,
                            'email' => $bio->email_poltek ?: ($bio->email ?: strtolower($cleanNim) . '@students.poltekindonusa.ac.id'),
                            'prodi' => $student->nm_lemb ?? $student->nm_prodi ?? null,
                            'phone' => $bio->telepon_seluler ?? $bio->telepon_rumah ?? $student->telepon_seluler ?? null,
                        ];
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Gagal koneksi langsung ke DB SIAKAD: ' . $e->getMessage());
            }
        }

        // 3. Jika Mahasiswa terverifikasi, sinkronisasi ke tabel lokal users
        if ($mahasiswaData) {
            return User::updateOrCreate(
                ['username' => $mahasiswaData['nim']],
                [
                    'name' => $mahasiswaData['nama'],
                    'email' => $mahasiswaData['email'],
                    'password' => Hash::make($password),
                    'role' => 'anggota',
                    'prodi' => $mahasiswaData['prodi'],
                    'phone' => $mahasiswaData['phone'],
                    'status' => 'active',
                ]
            );
        }

        return null;
    }
}
