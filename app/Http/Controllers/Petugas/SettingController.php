<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\Holiday;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Tampilkan Halaman Pengaturan Aturan Sirkulasi, Denda & Tanggal Merah
     */
    public function index(): Response
    {
        $settings = [
            'max_borrow_limit' => (int) Setting::get('max_borrow_limit', 3),
            'fine_per_day' => (float) Setting::get('fine_per_day', 1000),
            'borrow_duration_days' => (int) Setting::get('borrow_duration_days', 7),
            'ticket_expire_minutes' => (int) Setting::get('ticket_expire_minutes', 5),
        ];

        $now = now();
        $stats = [
            'active_borrowings_count' => Borrowing::where('status', 'active')->count(),
            'overdue_borrowings_count' => Borrowing::where('status', 'active')->where('due_date', '<', $now)->count(),
            'unpaid_fines_total' => (float) Borrowing::where('fine_status', 'unpaid')->sum('fine_amount'),
            'paid_fines_total' => (float) Borrowing::where('fine_status', 'paid')->sum('fine_amount'),
            'holidays_count' => Holiday::count(),
        ];

        $holidays = Holiday::with('creator:id,name')
            ->orderBy('holiday_date', 'asc')
            ->get()
            ->map(function ($h) {
                $date = Carbon::parse($h->holiday_date);
                return [
                    'id' => $h->id,
                    'holiday_date' => $date->format('Y-m-d'),
                    'holiday_date_formatted' => $date->locale('id')->isoFormat('D MMMM Y'),
                    'day_name' => $date->locale('id')->isoFormat('dddd'),
                    'name' => $h->name,
                    'description' => $h->description,
                    'creator_name' => $h->creator?->name ?? 'Pustakawan',
                    'is_past' => $date->copy()->endOfDay()->isPast(),
                    'is_today' => $date->isToday(),
                    'is_upcoming' => $date->copy()->startOfDay()->isFuture(),
                ];
            });

        return Inertia::render('Petugas/Settings/Index', [
            'settings' => $settings,
            'stats' => $stats,
            'holidays' => $holidays,
        ]);
    }

    /**
     * Simpan Pembaruan Pengaturan Sirkulasi & Denda
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'max_borrow_limit' => ['required', 'integer', 'min:1', 'max:50'],
            'fine_per_day' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'borrow_duration_days' => ['required', 'integer', 'min:1', 'max:180'],
            'ticket_expire_minutes' => ['required', 'integer', 'min:1', 'max:1440'],
        ], [
            'max_borrow_limit.required' => 'Batas maksimal eksemplar peminjaman wajib diisi.',
            'max_borrow_limit.integer' => 'Batas maksimal eksemplar peminjaman harus berupa angka bulat.',
            'max_borrow_limit.min' => 'Batas minimal peminjaman adalah 1 eksemplar.',
            'fine_per_day.required' => 'Nominal denda per hari wajib diisi.',
            'fine_per_day.numeric' => 'Nominal denda harus berupa angka.',
            'fine_per_day.min' => 'Nominal denda tidak boleh negatif.',
            'borrow_duration_days.required' => 'Durasi masa peminjaman wajib diisi.',
            'borrow_duration_days.min' => 'Durasi peminjaman minimal 1 hari.',
            'ticket_expire_minutes.required' => 'Batas kadaluarsa tiket wajib diisi.',
            'ticket_expire_minutes.min' => 'Batas kadaluarsa tiket minimal 1 menit.',
        ]);

        Setting::set(
            'max_borrow_limit',
            (int)$validated['max_borrow_limit'],
            'integer',
            'Batas Maksimal Eksemplar Peminjaman',
            'Jumlah maksimal eksemplar buku fisik yang dapat dipinjam secara bersamaan oleh seorang anggota perpustakaan (bukan berdasarkan jumlah judul).',
            'circulation'
        );

        Setting::set(
            'fine_per_day',
            (float)$validated['fine_per_day'],
            'integer',
            'Tarif Denda Keterlambatan Per Hari (Rp)',
            'Tarif denda per eksemplar buku untuk setiap 1 hari keterlambatan melewati batas tanggal jatuh tempo pengembalian.',
            'circulation'
        );

        Setting::set(
            'borrow_duration_days',
            (int)$validated['borrow_duration_days'],
            'integer',
            'Durasi Masa Peminjaman (Hari)',
            'Masa aktif durasi peminjaman buku sebelum jatuh tempo.',
            'circulation'
        );

        Setting::set(
            'ticket_expire_minutes',
            (int)$validated['ticket_expire_minutes'],
            'integer',
            'Batas Kadaluarsa Tiket Peminjaman (Menit)',
            'Batas toleransi waktu pengambilan buku fisik di rak dan validasi ke petugas sirkulasi.',
            'circulation'
        );

        return back()->with('success', 'Pengaturan batas maksimal eksemplar peminjaman dan tarif denda sirkulasi berhasil diperbarui!');
    }

    /**
     * Tambah Tanggal Merah / Hari Libur (Bebas Denda)
     */
    public function storeHoliday(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'description' => ['nullable', 'string', 'max:500'],
        ], [
            'name.required' => 'Nama tanggal merah / keterangan hari libur wajib diisi.',
            'start_date.required' => 'Tanggal mulai libur wajib diisi.',
            'start_date.date' => 'Format tanggal mulai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai libur harus sama atau setelah tanggal mulai.',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = !empty($validated['end_date']) ? Carbon::parse($validated['end_date']) : $startDate->copy();
        $user = $request->user();

        $count = 0;
        $curr = $startDate->copy();
        while ($curr->lte($endDate)) {
            Holiday::updateOrCreate(
                ['holiday_date' => $curr->format('Y-m-d')],
                [
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                    'created_by' => $user->id,
                ]
            );
            $count++;
            $curr->addDay();
        }

        $dateRangeText = $count > 1 
            ? "{$startDate->locale('id')->isoFormat('D MMMM Y')} s/d {$endDate->locale('id')->isoFormat('D MMMM Y')} ({$count} hari)"
            : $startDate->locale('id')->isoFormat('D MMMM Y');

        return back()->with('success', "Tanggal merah \"{$validated['name']}\" ({$dateRangeText}) berhasil disimpan dan otomatis bebas denda sirkulasi!");
    }

    /**
     * Hapus Tanggal Merah / Hari Libur
     */
    public function destroyHoliday(Holiday $holiday)
    {
        $dateText = Carbon::parse($holiday->holiday_date)->locale('id')->isoFormat('D MMMM Y');
        $name = $holiday->name;
        $holiday->delete();

        return back()->with('success', "Tanggal merah \"{$name}\" ({$dateText}) berhasil dihapus.");
    }
}

