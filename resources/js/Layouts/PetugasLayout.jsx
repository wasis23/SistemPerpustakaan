import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    BookOpen, 
    Shield, 
    ArrowRightLeft, 
    Users, 
    FileSpreadsheet, 
    LogOut, 
    Compass, 
    Monitor, 
    Library, 
    Tag, 
    MapPin, 
    UserCheck, 
    UserCog,
    Menu,
    X
} from 'lucide-react';

export default function PetugasLayout({ children, activeMenu, todayVisitsCount }) {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { key: 'dashboard', label: 'Dashboard Utama', href: '/petugas/dashboard', icon: Compass },
        { key: 'members', label: 'Data Anggota', href: '/petugas/members', icon: UserCheck },
        { key: 'books', label: 'Katalog Buku', href: '/petugas/books', icon: BookOpen },
        { key: 'categories', label: 'Kategori DDC', href: '/petugas/categories', icon: Tag },
        { key: 'racks', label: 'Lokasi Rak Fisik', href: '/petugas/racks', icon: MapPin },
        { key: 'circulations', label: 'Sirkulasi Transaksi', href: '/petugas/circulations', icon: ArrowRightLeft },
        { key: 'presensi', label: 'Rekap Presensi', href: '/petugas/presensi', icon: Users },
        { key: 'reports', label: 'Laporan Analytics', href: '/petugas/reports', icon: FileSpreadsheet },
        { key: 'laboratories', label: 'Perpustakaan 360°', href: '/petugas/laboratories', icon: Library },
        { key: 'profile', label: 'Profil Pustakawan', href: '/petugas/profile', icon: UserCog },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex font-sans selection:bg-amber-500 selection:text-slate-950">
            {/* Desktop Left Vertical Sidebar */}
            <aside className="w-64 bg-white border-r border-amber-900/10 hidden md:flex flex-col justify-between p-6 shrink-0 min-h-screen sticky top-0 h-screen z-30">
                <div className="space-y-8">
                    {/* Brand Header */}
                    <Link href="/" className="flex items-center space-x-3 px-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                            <Shield className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <span className="font-extrabold text-xl text-slate-950 tracking-tight">SIMPUS.</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full ml-2 font-bold uppercase">Petugas</span>
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

                        <Link
                            href="/presensi"
                            target="_blank"
                            className="flex items-center space-x-3 px-4 py-3 text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold rounded-2xl text-xs transition-all border border-amber-200"
                        >
                            <Monitor className="w-4 h-4" />
                            <span>Presensi</span>
                        </Link>
                    </nav>
                </div>


            </aside>

            {/* Mobile Drawer / Slide-Over Sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    {/* Backdrop Overlay */}
                    <div 
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="relative w-72 max-w-[85vw] bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
                        <div className="space-y-6">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <Link 
                                    href="/" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center space-x-2.5"
                                >
                                    <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                                        <Shield className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <span className="font-extrabold text-lg text-slate-950 tracking-tight">SIMPUS.</span>
                                        <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full ml-1.5 font-bold uppercase">Petugas</span>
                                    </div>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                    aria-label="Tutup Menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Nav Links */}
                            <nav className="space-y-1.5">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeMenu === item.key;
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
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

                                <Link
                                    href="/presensi"
                                    target="_blank"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-3 text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold rounded-2xl text-xs transition-all border border-amber-200"
                                >
                                    <Monitor className="w-4 h-4" />
                                    <span>Presensi</span>
                                </Link>
                            </nav>
                        </div>

                        {/* Drawer Bottom Widget */}
                        <div className="pt-6 border-t border-slate-100 space-y-3">
                            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60">
                                <p className="text-xs font-extrabold text-slate-950">{auth.user.name}</p>
                                <p className="text-[10px] text-amber-800 font-medium">Pustakawan / Administrator</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Hari ini: {todayVisitsCount ?? 0} Kunjungan</p>
                            </div>

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-2xl text-xs transition-all flex items-center justify-center space-x-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Keluar dari Akun</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header Bar */}
                <header className="sticky top-0 z-20 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3">
                    {/* Left: Mobile Hamburger Button & Brand */}
                    <div className="flex items-center space-x-2.5">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 text-slate-700 hover:text-amber-800 bg-white border border-slate-200/80 rounded-2xl shadow-sm transition-all focus:outline-none"
                            aria-label="Buka Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <Link href="/" className="md:hidden flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
                                <Shield className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-base text-slate-950 tracking-tight">SIMPUS</span>
                        </Link>
                    </div>



                    {/* Right User Utility */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <Link
                            href="/petugas/profile"
                            className="flex items-center space-x-2 p-1 sm:p-1.5 hover:bg-amber-100/50 rounded-2xl border border-slate-200/80 bg-white transition-all text-left group shadow-sm"
                            title="Klik untuk ubah profil & password"
                        >
                            <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold text-xs shadow group-hover:scale-105 transition-all">
                                {auth.user.name.charAt(0)}
                            </div>

                            <div className="hidden lg:block pr-2">
                                <p className="text-xs font-extrabold text-slate-950 leading-tight group-hover:text-amber-800 transition-colors">
                                    {auth.user.name}
                                </p>
                                <p className="text-[10px] text-amber-800 font-semibold flex items-center space-x-1">
                                    <UserCog className="w-3 h-3 text-amber-600" />
                                    <span>Ubah Profil</span>
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="p-2 sm:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-slate-200 bg-white transition-all shadow-sm"
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
