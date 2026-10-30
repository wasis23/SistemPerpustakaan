<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Borrowing;
use App\Models\BorrowTicket;
use App\Models\DigitalCollection;
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
                'today_external_visits' => AttendanceLog::whereDate('checked_in_at', today())->where('is_external', true)->count(),
                'active_loans' => Borrowing::where('status', 'active')->count(),
                'active_borrowings' => Borrowing::where('status', 'active')->count(),
                'pending_tickets' => BorrowTicket::where('status', 'pending')->where('expires_at', '>', now())->count(),
                'overdue_books' => Borrowing::where('status', 'active')->where('due_date', '<', now())->count(),
                'overdue_borrowings' => Borrowing::where('status', 'active')->where('due_date', '<', now())->count(),
                'total_magazines' => DigitalCollection::where('collection_type', DigitalCollection::TYPE_MAGAZINE)->count(),
                'total_newspapers' => DigitalCollection::where('collection_type', DigitalCollection::TYPE_NEWSPAPER)->count(),
                'total_ebooks' => DigitalCollection::where('collection_type', DigitalCollection::TYPE_EBOOK)->count(),
                'pending_book_proposals' => DigitalCollection::where('collection_type', DigitalCollection::TYPE_BOOK_PROPOSAL)->where('review_status', 'pending')->count(),
            ],
        ]);
    }
}
