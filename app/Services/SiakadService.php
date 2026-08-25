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

        // 1. Coba via HTTP API SIAKAD External (POST verify-login)
        $apiUrl = config('services.siakad.url', 'https://siakadv2.poltekindonusa.ac.id/api/verify-login');
        $apiKey = config('services.siakad.api_key', 'e844f45c5100479b91c0eb97793a84b8b85cc2fe21f50caf38807ff72408e143');

        // Daftar target URL yang dicoba (baik tanpa .php maupun dengan .php)
        $endpoints = [$apiUrl];
        if (!str_ends_with($apiUrl, '.php')) {
            $endpoints[] = $apiUrl . '.php';
        }

        foreach ($endpoints as $url) {
            try {
                $response = Http::timeout(3)
                    ->withHeaders([
                        'X-Api-Key' => $apiKey,
                        'Accept' => 'application/json',
                    ])
                    ->asJson()
                    ->post($url, [
                        'username' => $cleanNim,
                        'password' => $password,
                    ]);

                if ($response->successful()) {
                    $payload = $response->json();

                    // Format 1: Status success langsung dengan payload data
                    if (
                        !empty($payload) &&
                        (
                            (isset($payload['status']) && in_array(strtolower((string)$payload['status']), ['success', 'true', 'ok', '1'])) ||
                            (!empty($payload['success']) && $payload['success'] === true)
                        )
                    ) {
                        $mhs = $payload['data'] ?? $payload['user'] ?? $payload['mahasiswa'] ?? $payload;
                        $mahasiswaData = [
                            'nim' => $mhs['nim'] ?? $mhs['nipd'] ?? $mhs['username'] ?? $cleanNim,
                            'nama' => $mhs['nama'] ?? $mhs['name'] ?? $mhs['nm_pd'] ?? $cleanNim,
                            'email' => $mhs['email'] ?? $mhs['email_institusi'] ?? $mhs['email_poltek'] ?? ($cleanNim . '@poltekindonusa.ac.id'),
                            'prodi' => $mhs['prodi'] ?? $mhs['nm_lemb'] ?? $mhs['program_studi'] ?? null,
                            'phone' => $mhs['no_hp'] ?? $mhs['phone'] ?? $mhs['telepon_seluler'] ?? null,
                        ];
                        break;
                    }

                    // Format 2: Response mengembalikan password_hash untuk diverifikasi lokal
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
                            break;
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Gagal menghubungi HTTP API SIAKAD di ' . $url . ': ' . $e->getMessage());
            }
        }

        // 2. Fallback: Direct Database Connection ke Database SIAKAD (siakaddb)
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
