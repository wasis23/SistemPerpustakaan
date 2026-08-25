<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Book;
use App\Models\Borrowing;
use App\Models\BorrowTicket;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Halaman Rekapitulasi Laporan Analytics & Export Data
     */
    public function index(Request $request): Response
    {
        BorrowTicket::releaseExpiredTickets();

        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));
        $reportType = $request->input('type', 'circulation'); // 'circulation', 'attendance', 'books'

        // Data Sirkulasi Filtered
        $circulationsQuery = Borrowing::with(['user:id,name,username,prodi', 'bookCopy.book:id,title,category_id', 'bookCopy.book.category:id,name'])
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);

        if ($request->filled('prodi')) {
            $circulationsQuery->whereHas('user', function ($q) use ($request) {
                $q->where('prodi', $request->prodi);
            });
        }

        if ($request->filled('category_id')) {
            $circulationsQuery->whereHas('bookCopy.book', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        $circulations = (clone $circulationsQuery)->latest('id')->paginate(15)->withQueryString();

        // Data Presensi Filtered
        $attendanceQuery = AttendanceLog::with('user:id,name,username,prodi')
            ->whereBetween('checked_in_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);

        if ($request->filled('purpose')) {
            $attendanceQuery->where('visit_purpose', $request->purpose);
        }

        $attendances = (clone $attendanceQuery)->latest('id')->paginate(15)->withQueryString();

        // Top 5 Buku Sering Dipinjam
        $topBooks = Book::withCount('copies')
            ->with(['category', 'rack'])
            ->latest('id')
            ->take(5)
            ->get();

        // Ringkasan Counter Statistik
        $summary = [
            'total_circulations' => (clone $circulationsQuery)->count(),
            'total_returned' => (clone $circulationsQuery)->where('status', 'returned')->count(),
            'total_overdue' => (clone $circulationsQuery)->where('status', 'active')->where('due_date', '<', now())->count(),
            'total_fines' => (float) (clone $circulationsQuery)->sum('fine_amount'),
            'total_visits' => (clone $attendanceQuery)->count(),
        ];

        return Inertia::render('Petugas/Reports/Index', [
            'circulations' => $circulations,
            'attendances' => $attendances,
            'topBooks' => $topBooks,
            'categories' => Category::select('id', 'code', 'name')->get(),
            'prodiList' => \App\Http\Controllers\Petugas\MemberController::PRODI_LIST,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'type' => $reportType,
                'prodi' => $request->prodi ?? '',
                'purpose' => $request->purpose ?? '',
                'category_id' => $request->category_id ?? '',
            ],
        ]);
    }

    /**
     * Ekspor Data Laporan ke Format CSV / Excel
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));
        $type = $request->input('type', 'circulation');

        $filename = "laporan-simpus-{$type}-{$startDate}-to-{$endDate}.csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($startDate, $endDate, $type) {
            $handle = fopen('php://output', 'w');

            if ($type === 'attendance') {
                // Header CSV Presensi
                fputcsv($handle, ['No', 'Tanggal & Waktu', 'NIM / Username', 'Nama Pengunjung', 'Prodi / Peran', 'Tujuan Kunjungan']);

                $rows = AttendanceLog::with('user')
                    ->whereBetween('checked_in_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->latest('id')
                    ->get();

                $no = 1;
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $no++,
                        $row->checked_in_at ? $row->checked_in_at->format('Y-m-d H:i:s') : '-',
                        $row->user->username ?? '-',
                        $row->user->name ?? '-',
                        $row->user->prodi ?? 'Pustakawan',
                        $row->purpose_label,
                    ]);
                }
            } else {
                // Header CSV Sirkulasi
                fputcsv($handle, ['No', 'Kode Sirkulasi', 'Tanggal Pinjam', 'Jatuh Tempo', 'NIM / Username', 'Nama Peminjam', 'Judul Buku', 'Kode Eksemplar', 'Status', 'Denda (Rp)']);

                $rows = Borrowing::with(['user', 'bookCopy.book'])
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->latest('id')
                    ->get();

                $no = 1;
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $no++,
                        $row->borrowing_code,
                        $row->borrowed_at ? $row->borrowed_at->format('Y-m-d H:i:s') : '-',
                        $row->due_date ? $row->due_date->format('Y-m-d') : '-',
                        $row->user->username ?? '-',
                        $row->user->name ?? '-',
                        $row->bookCopy->book->title ?? '-',
                        $row->bookCopy->copy_code ?? '-',
                        $row->status,
                        $row->fine_amount,
                    ]);
                }
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Tampilan Cetak Laporan PDF Resmi Institusi
     */
    public function printPdf(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));
        $type = $request->input('type', 'circulation');

        if ($type === 'attendance') {
            $data = AttendanceLog::with('user')
                ->whereBetween('checked_in_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->latest('id')
                ->get();
        } else {
            $data = Borrowing::with(['user', 'bookCopy.book.category', 'officer'])
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->latest('id')
                ->get();
        }

        return Inertia::render('Petugas/Reports/Print', [
            'type' => $type,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'data' => $data,
            'officer' => $request->user(),
        ]);
    }
}
