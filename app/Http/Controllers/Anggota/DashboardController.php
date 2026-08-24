<?php

namespace App\Http\Controllers\Anggota;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Anggota/Dashboard', [
            'stats' => [
                'active_borrowings' => 0,
                'history_count' => 0,
                'active_tickets' => 0,
                'unpaid_fines' => 0,
            ],
        ]);
    }
}
