<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Borrowing;
use App\Models\BorrowTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Petugas/Dashboard', [
            'stats' => [
                'today_visits' => AttendanceLog::whereDate('checked_in_at', today())->count(),
                'active_loans' => Borrowing::where('status', 'active')->count(),
                'active_borrowings' => Borrowing::where('status', 'active')->count(),
                'pending_tickets' => BorrowTicket::where('status', 'pending')->where('expires_at', '>', now())->count(),
                'overdue_books' => Borrowing::where('status', 'active')->where('due_date', '<', now())->count(),
                'overdue_borrowings' => Borrowing::where('status', 'active')->where('due_date', '<', now())->count(),
            ],
        ]);
    }
}
