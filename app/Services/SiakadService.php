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
     * Autentikasi dan sinkronisasi data Mahasiswa atau Dosen dari SIAKAD
     *
     * @param string $username (NIM Mahasiswa / NIDN Dosen / NIP / Username)
     * @param string $password
     * @return User|null
     */
    public function authenticate(string $username, string $password): ?User
    {
        $cleanUsername = trim($username);
        $upperUsername = strtoupper($cleanUsername);
        $userData = null;

        // =========================================================================
        // 1. Coba Autentikasi via HTTP API SIAKAD External (POST verify-login)
        // =========================================================================
        $apiUrl = config('services.siakad.url', 'https://siakadv2.poltekindonusa.ac.id/api/verify-login');
        $apiKey = config('services.siakad.api_key', 'e844f45c5100479b91c0eb97793a84b8b85cc2fe21f50caf38807ff72408e143');

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
                        'username' => $cleanUsername,
                        'password' => $password,
                    ]);

                if ($response->successful()) {
                    $payload = $response->json();

                    if (
                        !empty($payload) &&
                        (
                            (isset($payload['status']) && in_array(strtolower((string)$payload['status']), ['success', 'true', 'ok', '1'])) ||
                            (!empty($payload['success']) && $payload['success'] === true)
                        )
                    ) {
                        $pData = $payload['data'] ?? $payload['user'] ?? $payload['mahasiswa'] ?? $payload['dosen'] ?? $payload;
                        $isDosen = !empty($pData['nidn']) || !empty($pData['nip']) || (isset($pData['role']) && in_array(strtolower($pData['role']), ['dosen', 'pengajar', 'lecturer']));

                        $userData = [
                            'username' => $pData['nidn'] ?? $pData['nim'] ?? $pData['nipd'] ?? $pData['nip'] ?? $pData['username'] ?? $cleanUsername,
                            'name' => $pData['nama'] ?? $pData['name'] ?? $pData['nm_pd'] ?? $pData['nm_ptk'] ?? $cleanUsername,
                            'email' => $pData['email'] ?? $pData['email_institusi'] ?? $pData['email_poltek'] ?? ($cleanUsername . '@poltekindonusa.ac.id'),
                            'prodi' => $pData['prodi'] ?? $pData['nm_lemb'] ?? $pData['program_studi'] ?? ($isDosen ? 'Dosen Politeknik Indonusa' : null),
                            'phone' => $pData['no_hp'] ?? $pData['phone'] ?? $pData['telepon_seluler'] ?? null,
                        ];
                        break;
                    }

                    // Format 2: Password hash verification from API response
                    if (!empty($payload['status']) && isset($payload['data']['password_hash'])) {
                        $pData = $payload['data'];
                        if (password_verify($password, $pData['password_hash'])) {
                            $isDosen = !empty($pData['nidn']) || !empty($pData['nip']);
                            $userData = [
                                'username' => $pData['nidn'] ?? $pData['nim'] ?? $pData['nipd'] ?? $cleanUsername,
                                'name' => $pData['nama'] ?? $pData['name'] ?? $cleanUsername,
                                'email' => $pData['email'] ?? $pData['email_institusi'] ?? ($cleanUsername . '@poltekindonusa.ac.id'),
                                'prodi' => $pData['prodi'] ?? ($isDosen ? 'Dosen Politeknik Indonusa' : null),
                                'phone' => $pData['no_hp'] ?? null,
                            ];
                            break;
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Gagal menghubungi HTTP API SIAKAD di ' . $url . ': ' . $e->getMessage());
            }
        }

        // =========================================================================
        // 2. Fallback: Direct Database Connection ke Database SIAKAD (siakaddb)
        // =========================================================================
        if (!$userData) {
            try {
                // -------------------------------------------------------------
                // A. CEK DATA MAHASISWA (viewMahasiswaPt / viewMahasiswaKeluar)
                // -------------------------------------------------------------
                $student = DB::connection('siakad')
                    ->table('viewMahasiswaPt')
                    ->where('nipd', $upperUsername)
                    ->first();

                if (!$student) {
                    $student = DB::connection('siakad')
                        ->table('viewMahasiswaKeluar')
                        ->where('nipd', $upperUsername)
                        ->first();
                }

                if ($student) {
                    $hash = trim((string)($student->pass ?? $student->password ?? ''));
                    if ($this->verifyPasswordHash($password, $hash)) {
                        $bio = null;
                        if (!empty($student->id_pd) || !empty($student->xid_pd)) {
                            $bio = DB::connection('siakad')->table('wsia_mahasiswa')
                                ->where(function ($q) use ($student) {
                                    if (!empty($student->id_pd)) $q->where('id_pd', $student->id_pd);
                                    if (!empty($student->xid_pd)) $q->orWhere('xid_pd', $student->xid_pd);
                                })
                                ->first();
                        }

                        $userData = [
                            'username' => $student->nipd ?? $upperUsername,
                            'name' => $bio->nm_pd ?? $student->nm_pd ?? $upperUsername,
                            'email' => $bio->email_poltek ?: ($bio->email ?: strtolower($upperUsername) . '@students.poltekindonusa.ac.id'),
                            'prodi' => $student->nm_lemb ?? $student->nm_prodi ?? null,
                            'phone' => $bio->telepon_seluler ?? $bio->telepon_rumah ?? $student->telepon_seluler ?? null,
                        ];
                    }
                }

                // -------------------------------------------------------------
                // B. CEK DATA DOSEN (wsia_dosen / viewDosenPt)
                // -------------------------------------------------------------
                if (!$userData) {
                    $dosen = DB::connection('siakad')
                        ->table('wsia_dosen')
                        ->where(function ($q) use ($cleanUsername, $upperUsername) {
                            $q->where('nidn', $cleanUsername)
                              ->orWhere('nip', $cleanUsername)
                              ->orWhere('xid_ptk', $cleanUsername)
                              ->orWhere('id_ptk', $cleanUsername)
                              ->orWhere('niy_nigk', $cleanUsername)
                              ->orWhere('nuptk', $cleanUsername)
                              ->orWhere('email', $cleanUsername)
                              ->orWhere('email_poltek', $cleanUsername)
                              ->orWhere('nm_dsn', $cleanUsername);
                        })
                        ->first();

                    if ($dosen) {
                        $hash = trim((string)($dosen->pass ?? ''));
                        if ($this->verifyPasswordHash($password, $hash)) {
                            // Ambil info Homebase Prodi Dosen dari viewDosenPt
                            $dosenPt = DB::connection('siakad')
                                ->table('viewDosenPt')
                                ->where(function ($q) use ($dosen) {
                                    if (!empty($dosen->id_ptk)) $q->where('id_ptk', $dosen->id_ptk);
                                    if (!empty($dosen->xid_ptk)) $q->orWhere('xid_ptk', $dosen->xid_ptk);
                                    if (!empty($dosen->nidn)) $q->orWhere('nidn', $dosen->nidn);
                                })
                                ->first();

                            // Susun Nama Lengkap Beserta Gelar
                            $fullName = trim($dosen->nm_ptk);
                            $gelarDepan = trim((string)($dosen->gelar_depan ?? ''));
                            $gelarBelakang = trim((string)($dosen->gelar_belakang ?? ''));

                            if ($gelarDepan) {
                                $fullName = $gelarDepan . ' ' . $fullName;
                            }
                            if ($gelarBelakang) {
                                $fullName = $fullName . ', ' . $gelarBelakang;
                            }

                            $nidnOrUsername = $dosen->nidn ?: ($dosen->nip ?: ($dosen->niy_nigk ?: $cleanUsername));
                            $email = $dosen->email_poltek ?: ($dosen->email ?: strtolower($nidnOrUsername) . '@poltekindonusa.ac.id');
                            $prodi = $dosenPt->nm_prodi ?? 'Dosen Politeknik Indonusa';

                            $userData = [
                                'username' => $nidnOrUsername,
                                'name' => $fullName,
                                'email' => $email,
                                'prodi' => $prodi,
                                'phone' => $dosen->no_hp ?? null,
                            ];
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Gagal koneksi langsung ke DB SIAKAD: ' . $e->getMessage());
            }
        }

        // =========================================================================
        // 3. Jika Mahasiswa / Dosen Terverifikasi, Simpan / Update Akun Lokal SIMPUS
        // =========================================================================
        if ($userData) {
            return User::updateOrCreate(
                ['username' => $userData['username']],
                [
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => Hash::make($password),
                    'role' => 'anggota',
                    'prodi' => $userData['prodi'],
                    'phone' => $userData['phone'],
                    'status' => 'active',
                ]
            );
        }

        return null;
    }

    /**
     * Helper Verifikasi Password Hash SIAKAD (Bcrypt / MD5 / SHA1 / Plaintext)
     */
    private function verifyPasswordHash(string $password, string $hash): bool
    {
        if (empty($hash)) {
            return false;
        }

        // 1. Standar Bcrypt / Argon2 / PHP password_hash
        if (password_verify($password, $hash)) {
            return true;
        }

        // 2. MD5 Hash (Legacy SIAKAD)
        if (md5($password) === strtolower($hash) || strtoupper(md5($password)) === strtoupper($hash)) {
            return true;
        }

        // 3. SHA1 Hash
        if (sha1($password) === strtolower($hash) || strtoupper(sha1($password)) === strtoupper($hash)) {
            return true;
        }

        // 4. Plaintext
        if ($password === $hash) {
            return true;
        }

        return false;
    }
}
