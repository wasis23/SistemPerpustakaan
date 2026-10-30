<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\User;
use App\Services\SiakadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use Carbon\Carbon;
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
            'todayMemberCount' => AttendanceLog::whereDate('checked_in_at', today())->where('is_external', false)->count(),
            'todayExternalCount' => AttendanceLog::whereDate('checked_in_at', today())->where('is_external', true)->count(),
        ]);
    }

    /**
     * Simpan Log Presensi Kehadiran Pengunjung Kios
     */
    public function store(Request $request, SiakadService $siakadService)
    {
        $request->validate([
            'visitor_type' => ['nullable', 'in:member,external'],
            'username' => ['required_unless:visitor_type,external', 'nullable', 'string'],
            'visitor_name' => ['required_if:visitor_type,external', 'nullable', 'string', 'max:255'],
            'visitor_institution' => ['nullable', 'string', 'max:255'],
            'visitor_phone' => ['nullable', 'string', 'max:30'],
            'visit_purpose' => ['required', 'in:reading,borrowing,research,computer'],
        ], [
            'username.required_unless' => 'NIM / NIDN / Username wajib diisi.',
            'visitor_name.required_if' => 'Nama lengkap pengunjung eksternal wajib diisi.',
            'visit_purpose.required' => 'Pilih tujuan kunjungan Anda.',
        ]);

        $purposeLabels = [
            'reading' => 'Membaca Mandiri',
            'borrowing' => 'Peminjaman / Pengembalian Koleksi',
            'research' => 'Pemberkasan',
            'computer' => 'Akses Komputer & Digital Library',
        ];

        // Presensi Anggota Eksternal (tanpa akun / tanpa sesi login)
        if ($request->visitor_type === 'external') {
            AttendanceLog::create([
                'user_id' => null,
                'is_external' => true,
                'visitor_name' => trim($request->visitor_name),
                'visitor_institution' => $request->filled('visitor_institution') ? trim($request->visitor_institution) : null,
                'visitor_phone' => $request->filled('visitor_phone') ? trim($request->visitor_phone) : null,
                'visit_purpose' => $request->visit_purpose,
                'checked_in_at' => now(),
            ]);

            return back()->with('success_visitor', [
                'name' => trim($request->visitor_name),
                'username' => $request->filled('visitor_phone') ? trim($request->visitor_phone) : 'Anggota Eksternal',
                'prodi' => $request->filled('visitor_institution') ? trim($request->visitor_institution) : 'Anggota Eksternal',
                'purpose' => $purposeLabels[$request->visit_purpose] ?? $request->visit_purpose,
                'time' => now()->format('H:i:s'),
                'is_external' => true,
            ]);
        }

        $inputUsername = trim($request->username);

        // Cari data pengguna di DB SIMPUS atau sinkronisasi langsung dari SIAKAD
        $user = $siakadService->findUser($inputUsername);

        if (! $user) {
            return back()->withErrors([
                'username' => 'NIM / NIDN tidak ditemukan di sistem perpustakaan atau SIAKAD.',
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
            'is_external' => false,
            'visit_purpose' => $request->visit_purpose,
            'checked_in_at' => now(),
        ]);

        return back()->with('success_visitor', [
            'name' => $user->name,
            'username' => $user->username,
            'prodi' => $user->prodi ?? 'Anggota Perpustakaan',
            'purpose' => $purposeLabels[$request->visit_purpose] ?? $request->visit_purpose,
            'time' => now()->format('H:i:s'),
            'is_external' => false,
        ]);
    }

    /**
     * Halaman Rekap Presensi Kunjungan untuk Petugas
     */
    public function index(Request $request): Response
    {
        $query = AttendanceLog::with('user:id,name,username,prodi,role');

        // Filter Pencarian NIM / Nama (termasuk nama pengunjung eksternal)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('visitor_name', 'like', "%{$search}%")
                  ->orWhere('visitor_institution', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                          ->orWhere('username', 'like', "%{$search}%");
                  });
            });
        }

        // Filter Tujuan Kunjungan
        if ($request->filled('purpose')) {
            $query->where('visit_purpose', $request->purpose);
        }

        // Filter Jenis Pengunjung (Anggota Terdaftar / Anggota Eksternal)
        if ($request->filled('visitor_type')) {
            $query->where('is_external', $request->visitor_type === 'external');
        }

        // Filter Rentang Tanggal (start_date & end_date) atau Tanggal Tunggal (date)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('checked_in_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('checked_in_at', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('checked_in_at', '<=', $request->end_date);
        } elseif ($request->filled('date')) {
            $query->whereDate('checked_in_at', $request->date);
        }

        $logs = $query->latest('checked_in_at')->paginate(15)->withQueryString();

        return Inertia::render('Petugas/Presensi/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'purpose', 'date', 'start_date', 'end_date', 'visitor_type']),
            'stats' => [
                'today_total' => AttendanceLog::whereDate('checked_in_at', today())->count(),
                'reading_total' => AttendanceLog::whereDate('checked_in_at', today())->where('visit_purpose', 'reading')->count(),
                'borrowing_total' => AttendanceLog::whereDate('checked_in_at', today())->where('visit_purpose', 'borrowing')->count(),
                'research_total' => AttendanceLog::whereDate('checked_in_at', today())->where('visit_purpose', 'research')->count(),
                'computer_total' => AttendanceLog::whereDate('checked_in_at', today())->where('visit_purpose', 'computer')->count(),
                'member_total' => AttendanceLog::whereDate('checked_in_at', today())->where('is_external', false)->count(),
                'external_total' => AttendanceLog::whereDate('checked_in_at', today())->where('is_external', true)->count(),
            ],
        ]);
    }
}
