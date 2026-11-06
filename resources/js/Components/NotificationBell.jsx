import React, { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { 
    Bell, 
    CheckCircle2, 
    BookmarkCheck, 
    Clock, 
    X, 
    CheckCheck, 
    Sparkles,
    BookOpen,
    ArrowRight
} from 'lucide-react';

export default function NotificationBell({ onOpenReceipt }) {
    const { user_notifications } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = user_notifications?.unread_count || 0;
    const notifications = user_notifications?.recent || [];

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAllRead = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleItemClick = (notification) => {
        if (!notification.is_read) {
            router.post(`/notifications/${notification.id}/read`, {}, {
                preserveScroll: true,
                preserveState: true,
            });
        }

        // Jika notifikasi memiliki data receipt, buka popup
        if (onOpenReceipt && notification.data) {
            onOpenReceipt({
                ...notification.data,
                type: notification.type,
                title: notification.title,
            });
            setIsOpen(false);
            return;
        }

        // Navigasi jika ada action_url
        if (notification.data?.action_url) {
            setIsOpen(false);
            router.visit(notification.data.action_url);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center justify-center ${
                    isOpen || unreadCount > 0
                        ? 'bg-amber-500/10 border-amber-400 text-amber-900 hover:bg-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-amber-800 hover:bg-slate-50'
                }`}
                title={unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Notifikasi Perpustakaan'}
                aria-label="Notifikasi"
            >
                <Bell className={`w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2] ${unreadCount > 0 ? 'text-amber-800 animate-bounce' : ''}`} />

                {/* Unread Counter Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 bg-rose-600 text-white text-[10px] font-black rounded-full shadow-md animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Dropdown Header */}
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-amber-500/10 border-b border-amber-200/60 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="p-1.5 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-sm">
                                <Bell className="w-3.5 h-3.5" />
                            </span>
                            <div>
                                <h3 className="font-extrabold text-xs text-slate-950 tracking-tight">Notifikasi Perpustakaan</h3>
                                <p className="text-[10px] text-slate-500 font-medium">Peminjaman & pengembalian buku</p>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="text-[10px] font-bold text-amber-800 hover:text-amber-950 flex items-center space-x-1 px-2.5 py-1 bg-white/80 hover:bg-white rounded-xl border border-amber-300 transition-all cursor-pointer shadow-xs"
                                title="Tandai semua notifikasi sudah dibaca"
                            >
                                <CheckCheck className="w-3 h-3 text-emerald-600" />
                                <span>Tandai Semua Dibaca</span>
                            </button>
                        )}
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 divide-dashed">
                        {notifications.length > 0 ? (
                            notifications.map((item) => {
                                const isReturn = item.type === 'return_success';
                                const isBorrow = item.type === 'borrowing_success';

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className={`p-4 transition-all cursor-pointer flex items-start space-x-3 text-left ${
                                            !item.is_read
                                                ? 'bg-amber-500/5 hover:bg-amber-500/10'
                                                : 'hover:bg-slate-50 opacity-80 hover:opacity-100'
                                        }`}
                                    >
                                        {/* Icon Status */}
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-bold ${
                                            isReturn
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                : isBorrow
                                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                        }`}>
                                            {isReturn ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                                            ) : isBorrow ? (
                                                <BookmarkCheck className="w-4 h-4 text-amber-800 stroke-[2.5]" />
                                            ) : (
                                                <Sparkles className="w-4 h-4 text-indigo-700" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <h4 className="font-extrabold text-xs text-slate-950 truncate">
                                                    {item.title}
                                                </h4>
                                                {!item.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                                )}
                                            </div>

                                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                                                {item.message}
                                            </p>

                                            <div className="flex items-center justify-between pt-0.5 text-[9px] text-slate-400">
                                                <span className="flex items-center space-x-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span>{item.time_ago || item.created_at}</span>
                                                </span>

                                                {item.data?.copy_code && (
                                                    <span className="font-mono font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                                                        {item.data.copy_code}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center space-y-2">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                    <Bell className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <p className="font-extrabold text-xs text-slate-950">Belum Ada Notifikasi</p>
                                <p className="text-[11px] text-slate-500">
                                    Aktivitas peminjaman dan pengembalian buku akan tampil di sini.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
