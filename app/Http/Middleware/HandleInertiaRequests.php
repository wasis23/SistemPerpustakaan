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
                    'member_type' => $request->user()->member_type ?? ($request->user()->isEksternal() ? 'eksternal' : ($request->user()->isDosenOrTendik() ? 'dosen_tendik' : 'mahasiswa')),
                    'member_type_label' => $request->user()->member_type_label,
                    'can_borrow' => $request->user()->canBorrow(),
                    'max_borrow_limit' => $request->user()->getMaxBorrowLimit(),
                    'borrow_duration_days' => $request->user()->getBorrowDurationDays(),
                    'borrow_rule_description' => $request->user()->getBorrowRuleDescription(),
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
                'return_receipt' => fn () => $request->session()->get('return_receipt'),
                'success_visitor' => fn () => $request->session()->get('success_visitor'),
            ],
            'user_notifications' => fn () => $request->user() ? [
                'unread_count' => \App\Models\UserNotification::where('user_id', $request->user()->id)->unread()->count(),
                'recent' => \App\Models\UserNotification::where('user_id', $request->user()->id)
                    ->latest('id')
                    ->take(10)
                    ->get()
                    ->map(fn ($n) => [
                        'id' => $n->id,
                        'type' => $n->type,
                        'title' => $n->title,
                        'message' => $n->message,
                        'data' => $n->data,
                        'is_read' => ! is_null($n->read_at),
                        'created_at' => $n->created_at ? $n->created_at->format('d M Y H:i') : '',
                        'time_ago' => $n->created_at ? $n->created_at->diffForHumans() : '',
                    ]),
            ] : null,
            'library_settings' => [
                'max_borrow_limit' => fn () => (int) \App\Models\Setting::get('max_borrow_limit', 2),
                'max_borrow_limit_lecturer' => fn () => (int) \App\Models\Setting::get('max_borrow_limit_lecturer', 4),
                'fine_per_day' => fn () => (float) \App\Models\Setting::get('fine_per_day', 1000),
                'borrow_duration_days' => fn () => (int) \App\Models\Setting::get('borrow_duration_days', 7),
                'borrow_duration_days_lecturer' => fn () => (int) \App\Models\Setting::get('borrow_duration_days_lecturer', 14),
                'ticket_expire_minutes' => fn () => (int) \App\Models\Setting::get('ticket_expire_minutes', 5),
            ],
        ]);
    }
}
