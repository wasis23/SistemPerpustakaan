<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Tampilkan halaman Login
     */
    public function showLogin()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'petugas') {
                return redirect()->route('petugas.dashboard');
            }
            return redirect()->route('anggota.dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Proses Autentikasi Pengguna
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $inputUsername = trim($credentials['username']);
        $inputPassword = $credentials['password'];
        $remember = $request->boolean('remember');

        // 1. Coba Autentikasi API / DB SIAKAD terlebih dahulu (untuk Mahasiswa/Anggota)
        $siakadRedirect = $this->attemptSiakadLogin($inputUsername, $inputPassword, $remember, $request);
        if ($siakadRedirect !== null) {
            return $siakadRedirect;
        }

        // 2. Fallback Autentikasi Lokal (untuk Petugas Pustakawan / Fallback jika koneksi SIAKAD offline)
        $loginType = filter_var($inputUsername, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (Auth::attempt([$loginType => $inputUsername, 'password' => $inputPassword], $remember)) {
            $request->session()->regenerate();

            $user = Auth::user();

            if ($user->status !== 'active') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors([
                    'username' => 'Akun Anda sedang dinonaktifkan. Silakan hubungi petugas perpustakaan.',
                ]);
            }

            // Redirect langsung ke dashboard berdasarkan peran (petugas vs anggota)
            if ($user->role === 'petugas') {
                return redirect()->route('petugas.dashboard')->with('success', 'Selamat datang kembali, Petugas!');
            }

            return redirect()->route('anggota.dashboard')->with('success', 'Selamat datang di SIMPUS!');
        }

        return back()->withErrors([
            'username' => 'Nama pengguna/NIM atau kata sandi yang Anda masukkan tidak cocok.',
        ]);
    }

    /**
     * Verifikasi Login via Endpoint API SIAKAD External / Database SIAKAD Direct Fallback
     */
    private function attemptSiakadLogin(string $username, string $password, bool $remember, Request $request)
    {
        $cleanNim = strtoupper(trim($username));
        $mahasiswaData = null;

        // 1. Coba via HTTP API SIAKAD External
        $apiUrl = config('services.siakad.url', 'https://siakad.poltekindonusa.ac.id/api/mahasiswa_external.php');
        $apiKey = config('services.siakad.api_key', 'INDONUSA_SECRET_API_KEY_2026_X7Z');

        try {
            $response = Http::timeout(4)
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
            Log::warning('Gagal menghubungi HTTP API SIAKAD saat login: ' . $e->getMessage());
        }

        // 2. Fallback: Coba koneksi langsung ke Database SIAKAD jika HTTP API tidak merespons/error (cth: Error 525 SSL)
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

        // 3. Jika Mahasiswa berhasil diverifikasi (via HTTP API atau DB SIAKAD)
        if ($mahasiswaData) {
            $user = User::updateOrCreate(
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

            if ($user->status !== 'active') {
                return back()->withErrors([
                    'username' => 'Akun Anda sedang dinonaktifkan. Silakan hubungi petugas perpustakaan.',
                ]);
            }

            Auth::login($user, $remember);
            $request->session()->regenerate();

            return redirect()->route('anggota.dashboard')->with('success', 'Selamat datang di SIMPUS!');
        }

        return null;
    }

    /**
     * Log out Pengguna
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('info', 'Anda telah berhasil keluar dari sistem.');
    }
}


