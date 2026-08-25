import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    BookOpen, 
    QrCode, 
    BookmarkCheck, 
    LogOut, 
    Search,
    Compass,
    Sparkles,
    UserCog
} from 'lucide-react';

export default function AnggotaLayout({ children, activeMenu, activeTicketsCount }) {
    const { auth, active_ticket_id, active_tickets_count } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');

    const effectiveTicketsCount = activeTicketsCount ?? active_tickets_count ?? 0;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/anggota/katalog', { search: searchQuery });
        }
    };

    const handleTicketClick = (e) => {
        e.preventDefault();
        if (active_ticket_id) {
            router.visit(`/anggota/ticket/${active_ticket_id}`);
            return;
        }

        if (window.location.pathname === '/anggota/dashboard') {
            const el = document.getElementById('tiket-section');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-amber-400', 'transition-all', 'duration-300');
                setTimeout(() => {
                    el.classList.remove('ring-4', 'ring-amber-400');
                }, 2000);
            }
        } else {
            router.visit('/anggota/scan');
        }
    };

    const navItems = [
        { key: 'dashboard', label: 'Dashboard Utama', href: '/anggota/dashboard', icon: Compass },
        { key: 'borrowings', label: 'Buku Dipinjam Saya', href: '/anggota/borrowings', icon: BookmarkCheck },
        { key: 'catalog', label: 'Katalog Buku', href: '/anggota/katalog', icon: BookOpen },
        { key: 'scan', label: 'Scan Barcode Rak', href: '/anggota/scan', icon: QrCode },
        { key: 'profile', label: 'Profil & Password', href: '/anggota/profile', icon: UserCog },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex font-sans selection:bg-amber-500 selection:text-slate-950">
            {/* Left Vertical Sidebar */}
            <aside className="w-64 bg-white border-r border-amber-900/10 hidden md:flex flex-col justify-between p-6 shrink-0 min-h-screen sticky top-0 h-screen z-30">
                <div className="space-y-8">
                    {/* Brand Header */}
                    <Link href="/" className="flex items-center space-x-3 px-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                            <BookOpen className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <span className="font-extrabold text-xl text-slate-950 tracking-tight">SIMPUS.</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full ml-2 font-bold uppercase">Anggota</span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeMenu === item.key;
                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-4 py-3 font-bold rounded-2xl text-xs transition-all ${
                                        isActive
                                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                                            : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 stroke-[2.5]" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        <button
                            type="button"
                            onClick={handleTicketClick}
                            className="w-full flex items-center justify-between px-4 py-3 text-slate-600 hover:text-amber-800 hover:bg-amber-50 font-semibold rounded-2xl text-xs transition-all cursor-pointer text-left"
                        >
                            <div className="flex items-center space-x-3">
                                <BookmarkCheck className="w-4 h-4" />
                                <span>Tiket Pinjam Saya</span>
                            </div>
                            {effectiveTicketsCount > 0 && (
                                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                                    {effectiveTicketsCount} Aktif
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Bottom Sidebar Illustration Widget */}
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-100/50 to-amber-500/20 p-4 rounded-3xl border border-amber-500/20 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                        <Sparkles className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                        <p className="text-xs font-extrabold text-slate-950">Sirkulasi Mandiri</p>
                        <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                            Pindai stiker rak & tahan stok buku 5 menit via HP.
                        </p>
                    </div>
                    <div className="bg-white/80 p-2 rounded-2xl border border-amber-200 text-center">
                        <span className="text-[10px] font-bold text-amber-900 font-mono">STATUS: TERAUTENTIKASI</span>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header Bar */}
                <header className="sticky top-0 z-20 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
                    {/* Mobile Brand Link */}
                    <Link href="/" className="md:hidden flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-base text-slate-950">SIMPUS</span>
                    </Link>

                    {/* Search Bar Center */}
                    <form onSubmit={handleSearch} className="max-w-md w-full relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari judul buku, penulis, DDC..."
                            className="w-full pl-11 pr-24 py-2.5 bg-white border border-slate-300 rounded-full text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold rounded-full transition-all"
                        >
                            Cari
                        </button>
                    </form>

                    {/* Right User Utility */}
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/anggota/profile"
                            className="flex items-center space-x-2.5 p-1.5 hover:bg-amber-100/50 rounded-2xl border border-slate-200/80 bg-white transition-all text-left group shadow-sm"
                            title="Klik untuk ubah data diri & password"
                        >
                            <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold text-xs shadow group-hover:scale-105 transition-all">
                                {auth.user.name.charAt(0)}
                            </div>

                            <div className="hidden lg:block pr-2">
                                <p className="text-xs font-extrabold text-slate-950 leading-tight group-hover:text-amber-800 transition-colors">
                                    {auth.user.name}
                                </p>
                                <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                                    <span>{auth.user.prodi || 'Mahasiswa'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-amber-800 font-bold">Edit Profil</span>
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-slate-200 bg-white transition-all shadow-sm"
                            title="Keluar"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </header>

                {/* Full Width Main Canvas Container */}
                <main className="flex-1 p-4 sm:p-8 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
