<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'username' => $request->user()->username,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'prodi' => $request->user()->prodi,
                    'phone' => $request->user()->phone,
                    'status' => $request->user()->status,
                ] : null,
            ],
            'active_ticket_id' => fn () => $request->user() && $request->user()->role === 'anggota'
                ? \App\Models\BorrowTicket::where('user_id', $request->user()->id)
                    ->where('status', 'pending')
                    ->where('expires_at', '>', now())
                    ->value('id')
                : null,
            'active_tickets_count' => fn () => $request->user() && $request->user()->role === 'anggota'
                ? \App\Models\BorrowTicket::where('user_id', $request->user()->id)
                    ->where('status', 'pending')
                    ->where('expires_at', '>', now())
                    ->count()
                : 0,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
                'success_borrowing' => fn () => $request->session()->get('success_borrowing'),
                'success_return' => fn () => $request->session()->get('success_return'),
                'success_visitor' => fn () => $request->session()->get('success_visitor'),
            ],
            'library_settings' => [
                'max_borrow_limit' => fn () => (int) \App\Models\Setting::get('max_borrow_limit', 3),
                'fine_per_day' => fn () => (float) \App\Models\Setting::get('fine_per_day', 1000),
                'borrow_duration_days' => fn () => (int) \App\Models\Setting::get('borrow_duration_days', 7),
                'ticket_expire_minutes' => fn () => (int) \App\Models\Setting::get('ticket_expire_minutes', 5),
            ],
        ]);
    }
}
