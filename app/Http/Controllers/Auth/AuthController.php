<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

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

        // Coba login berdasarkan username (NIM/NIDN/NIP) atau email
        $loginType = filter_var($credentials['username'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (Auth::attempt([$loginType => $credentials['username'], 'password' => $credentials['password']], $request->boolean('remember'))) {
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
