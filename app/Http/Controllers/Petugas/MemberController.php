<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    /**
     * Daftar Resmi Program Studi Politeknik Indonusa Surakarta
     */
    public const PRODI_LIST = [
        'D4 Teknologi Rekayasa Otomotif',
        'D4 Teknologi Rekayasa Perangkat Lunak',
        'D4 Produksi Media',
        'D3 Perhotelan',
        'D3 Farmasi',
        'D4 Manajemen Informasi Kesehatan',
        'D4 Teknologi Laboratorium Medis',
        'D4 Bisnis Manajemen Ritel',
        'D4 Akuntansi Perpajakan',
        'Dosen / Tendik',
        'Anggota Eksternal',
    ];

    /**
     * Tampilkan Daftar Seluruh Anggota Perpustakaan (Mahasiswa & Dosen)
     */
    public function index(Request $request): Response
    {
        $query = User::where('role', 'anggota')->withCount([
            'borrowings as active_borrowings_count' => function ($q) {
                $q->where('status', 'active');
            },
            'borrowings as total_borrowings_count',
        ]);

        // Filter Pencarian (NIM/Username, Nama, Email, No. HP, Prodi)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('prodi', 'like', "%{$search}%");
            });
        }

        // Filter Program Studi
        if ($request->filled('prodi')) {
            $query->where('prodi', $request->prodi);
        }

        // Filter Tipe Anggota (Mahasiswa / Dosen / Eksternal)
        if ($request->filled('member_type')) {
            $query->where('member_type', $request->member_type);
        }

        // Filter Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $members = $query->latest('id')->paginate(12)->withQueryString();

        // Gabungkan list prodi resmi dengan prodi unik yang ada di DB
        $dbProdis = User::where('role', 'anggota')
            ->whereNotNull('prodi')
            ->where('prodi', '!=', '')
            ->distinct()
            ->pluck('prodi')
            ->toArray();

        $prodiList = array_values(array_unique(array_merge(self::PRODI_LIST, $dbProdis)));

        // Statistik
        $stats = [
            'total_members' => User::where('role', 'anggota')->count(),
            'active_members' => User::where('role', 'anggota')->where('status', 'active')->count(),
            'suspended_members' => User::where('role', 'anggota')->where('status', 'suspended')->count(),
            'borrowing_now' => User::where('role', 'anggota')->whereHas('borrowings', fn($q) => $q->where('status', 'active'))->count(),
            'mahasiswa_count' => User::where('role', 'anggota')->where(function($q) {
                $q->where('member_type', 'mahasiswa')
                  ->orWhere(function($sq) {
                      $sq->whereNull('member_type')
                         ->where('prodi', '!=', 'Anggota Eksternal')
                         ->where('username', 'not like', 'dsn%')
                         ->where('username', 'not like', 'nip%')
                         ->where('username', 'not like', 'nidn%');
                  });
            })->count(),
            'dosen_count' => User::where('role', 'anggota')->where(function($q) {
                $q->where('member_type', 'dosen_tendik')
                  ->orWhere('username', 'like', 'dsn%')
                  ->orWhere('username', 'like', 'nip%')
                  ->orWhere('username', 'like', 'nidn%')
                  ->orWhere('prodi', 'like', '%dosen%')
                  ->orWhere('prodi', 'like', '%tendik%');
            })->count(),
            'eksternal_count' => User::where('role', 'anggota')->where(function($q) {
                $q->where('member_type', 'eksternal')
                  ->orWhere('prodi', 'Anggota Eksternal')
                  ->orWhere('username', 'like', 'eks%');
            })->count(),
        ];

        return Inertia::render('Petugas/Members/Index', [
            'members' => $members,
            'prodiList' => $prodiList,
            'filters' => $request->only(['search', 'prodi', 'status', 'member_type']),
            'stats' => $stats,
        ]);
    }

    /**
     * Tambah Akun Anggota Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'name' => ['required', 'string', 'max:255'],
            'member_type' => ['required', Rule::in(['mahasiswa', 'dosen_tendik', 'eksternal'])],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'prodi' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'status' => ['required', Rule::in(['active', 'suspended'])],
        ], [
            'username.required' => 'NIM / NIDN / Username wajib diisi.',
            'username.unique' => 'NIM / Username ini sudah terdaftar.',
            'name.required' => 'Nama lengkap anggota wajib diisi.',
            'member_type.required' => 'Jenis / tipe keanggotaan wajib dipilih.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
        ]);

        $defaultProdi = 'D4 Teknologi Rekayasa Perangkat Lunak';
        if ($validated['member_type'] === 'eksternal') {
            $defaultProdi = 'Anggota Eksternal';
        } elseif ($validated['member_type'] === 'dosen_tendik') {
            $defaultProdi = 'Dosen / Tendik';
        }

        User::create([
            'username' => trim($validated['username']),
            'name' => trim($validated['name']),
            'member_type' => $validated['member_type'],
            'email' => !empty($validated['email']) ? trim($validated['email']) : null,
            'password' => Hash::make($validated['password']),
            'role' => 'anggota',
            'prodi' => !empty($validated['prodi']) ? trim($validated['prodi']) : $defaultProdi,
            'phone' => !empty($validated['phone']) ? trim($validated['phone']) : null,
            'status' => $validated['status'],
        ]);

        return back()->with('success', "Akun anggota {$validated['name']} ({$validated['username']}) berhasil ditambahkan.");
    }

    /**
     * Update Data Diri Anggota Perpustakaan
     */
    public function update(Request $request, User $member): RedirectResponse
    {
        if ($member->role !== 'anggota') {
            return back()->with('error', 'Hanya akun anggota yang dapat diedit melalui menu ini.');
        }

        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', Rule::unique('users')->ignore($member->id)],
            'name' => ['required', 'string', 'max:255'],
            'member_type' => ['required', Rule::in(['mahasiswa', 'dosen_tendik', 'eksternal'])],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users')->ignore($member->id)],
            'prodi' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'status' => ['required', Rule::in(['active', 'suspended'])],
        ], [
            'username.required' => 'NIM / Username wajib diisi.',
            'username.unique' => 'NIM / Username sudah digunakan oleh akun lain.',
            'name.required' => 'Nama lengkap wajib diisi.',
            'member_type.required' => 'Jenis / tipe keanggotaan wajib dipilih.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan oleh akun lain.',
        ]);

        $member->update([
            'username' => trim($validated['username']),
            'name' => trim($validated['name']),
            'member_type' => $validated['member_type'],
            'email' => $validated['email'] ? trim($validated['email']) : null,
            'prodi' => $validated['prodi'] ? trim($validated['prodi']) : null,
            'phone' => $validated['phone'] ? trim($validated['phone']) : null,
            'status' => $validated['status'],
        ]);

        return back()->with('success', "Data anggota {$member->name} berhasil diperbarui.");
    }

    /**
     * Ganti / Reset Password Anggota oleh Pustakawan
     */
    public function updatePassword(Request $request, User $member): RedirectResponse
    {
        if ($member->role !== 'anggota') {
            return back()->with('error', 'Hanya password akun anggota yang dapat diganti.');
        }

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password baru minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak sesuai.',
        ]);

        $member->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', "Password untuk anggota {$member->name} ({$member->username}) berhasil diubah.");
    }

    /**
     * Hapus Akun Anggota
     */
    public function destroy(User $member): RedirectResponse
    {
        if ($member->role !== 'anggota') {
            return back()->with('error', 'Hanya akun anggota yang dapat dihapus.');
        }

        // Cek jika anggota masih memiliki pinjaman aktif
        $hasActive = $member->borrowings()->where('status', 'active')->exists();
        if ($hasActive) {
            return back()->with('error', "Tidak dapat menghapus anggota {$member->name} karena masih memiliki buku yang sedang dipinjam.");
        }

        $name = $member->name;
        $member->delete();

        return back()->with('success', "Akun anggota {$name} berhasil dihapus.");
    }
}
