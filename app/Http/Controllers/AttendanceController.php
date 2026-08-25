<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\User;
use App\Services\SiakadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Tampilkan antarmuka Kios Presensi Pintu Masuk
     */
    public function kiosk(): Response
    {
        // Ambil 5 pengunjung terakhir hari ini untuk tampilan live ticker
        $recentVisitors = AttendanceLog::with('user:id,name,username,prodi')
            ->whereDate('checked_in_at', today())
            ->latest('checked_in_at')
            ->limit(5)
            ->get();

        return Inertia::render('Presensi/Kiosk', [
            'recentVisitors' => $recentVisitors,
            'todayCount' => AttendanceLog::whereDate('checked_in_at', today())->count(),
        ]);
    }

    /**
     * Simpan Log Presensi Kehadiran Pengunjung Kios
     */
    public function store(Request $request, SiakadService $siakadService)
    {
        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'visit_purpose' => ['required', 'in:reading,borrowing,research,computer'],
        ], [
            'username.required' => 'NIM / Username wajib diisi.',
            'password.required' => 'Kata sandi wajib diisi.',
            'visit_purpose.required' => 'Pilih tujuan kunjungan Anda.',
        ]);

        $inputUsername = trim($request->username);
        $inputPassword = $request->password;

        // 1. Coba verifikasi akun lokal terlebih dahulu
        $loginType = filter_var($inputUsername, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $user = User::where($loginType, $inputUsername)->first();

        if (! $user || ! Hash::check($inputPassword, $user->password)) {
            // 2. Fallback: Verifikasi ke SIAKAD & auto-sync
            $user = $siakadService->authenticate($inputUsername, $inputPassword);
        }

        if (! $user) {
            return back()->withErrors([
                'username' => 'NIM/Username atau kata sandi tidak valid.',
            ]);
        }

        if ($user->status !== 'active') {
            return back()->withErrors([
                'username' => 'Status keanggotaan Anda tidak aktif. Silakan ke Meja Pustakawan.',
            ]);
        }

        // Catat Presensi Kunjungan
        $log = AttendanceLog::create([
            'user_id' => $user->id,
            'visit_purpose' => $request->visit_purpose,
            'checked_in_at' => now(),
        ]);

        $purposeLabels = [
            'reading' => 'Membaca Mandiri',
            'borrowing' => 'Peminjaman / Pengembalian Koleksi',
            'research' => 'Penyusunan Riset / Tugas Akhir',
            'computer' => 'Akses Komputer & Digital Library',
        ];

        return back()->with('success_visitor', [
            'name' => $user->name,
            'username' => $user->username,
            'prodi' => $user->prodi ?? 'Anggota Perpustakaan',
            'purpose' => $purposeLabels[$request->visit_purpose] ?? $request->visit_purpose,
            'time' => now()->format('H:i:s'),
        ]);
    }

    /**
     * Halaman Rekap Presensi Kunjungan untuk Petugas
     */
    public function index(Request $request): Response
    {
        $query = AttendanceLog::with('user:id,name,username,prodi,role');

        // Filter Pencarian NIM / Nama
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        // Filter Tujuan Kunjungan
        if ($request->filled('purpose')) {
            $query->where('visit_purpose', $request->purpose);
        }

        // Filter Tanggal
        if ($request->filled('date')) {
            $query->whereDate('checked_in_at', $request->date);
        } else {
            $query->whereDate('checked_in_at', today());
        }

        $logs = $query->latest('checked_in_at')->paginate(15)->withQueryString();

        return Inertia::render('Petugas/Presensi/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'purpose', 'date']),
            'stats' => [
                'today_total' => AttendanceLog::whereDate('checked_in_at', today())->count(),
                'reading_total' => AttendanceLog::whereDate('checked_in_at', today())->where('visit_purpose', 'reading')->count(),
                'borrowing_total' => AttendanceLog::whereDate('checked_in_at', today())->where('visit_purpose', 'borrowing')->count(),
                'research_total' => AttendanceLog::whereDate('checked_in_at', today())->where('visit_purpose', 'research')->count(),
                'computer_total' => AttendanceLog::whereDate('checked_in_at', today())->where('visit_purpose', 'computer')->count(),
            ],
        ]);
    }
}
