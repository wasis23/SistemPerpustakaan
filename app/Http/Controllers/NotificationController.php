<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Tandai satu notifikasi sebagai telah dibaca
     */
    public function markAsRead(Request $request, UserNotification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $notification->markAsRead();

        return back()->with('info', 'Notifikasi telah ditandai dibaca.');
    }

    /**
     * Tandai seluruh notifikasi pengguna sebagai telah dibaca
     */
    public function markAllAsRead(Request $request)
    {
        UserNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back()->with('info', 'Semua notifikasi telah ditandai dibaca.');
    }

    /**
     * Hapus notifikasi
     */
    public function destroy(Request $request, UserNotification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $notification->delete();

        return back()->with('info', 'Notifikasi berhasil dihapus.');
    }
}
