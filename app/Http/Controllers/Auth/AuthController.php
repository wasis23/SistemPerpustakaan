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
use App\Services\SiakadService;
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
    public function login(Request $request, SiakadService $siakadService)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $inputUsername = trim($credentials['username']);
        $inputPassword = $credentials['password'];
        $remember = $request->boolean('remember');

        // 1. Coba Autentikasi API / DB SIAKAD terlebih dahulu (untuk Mahasiswa/Anggota)
        $siakadUser = $siakadService->authenticate($inputUsername, $inputPassword);
        if ($siakadUser) {
            if ($siakadUser->status !== 'active') {
                return back()->withErrors([
                    'username' => 'Akun Anda sedang dinonaktifkan. Silakan hubungi petugas perpustakaan.',
                ]);
            }

            Auth::login($siakadUser, $remember);
            $request->session()->regenerate();

            return redirect()->route('anggota.dashboard')->with('success', 'Selamat datang di SIMPUS!');
        }

        // 2. Fallback Autentikasi Lokal (untuk Petugas Pustakawan / Fallback jika akun lokal)
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


