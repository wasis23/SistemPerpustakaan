import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BookOpen, User, Lock, CheckCircle2, Clock, Sparkles, BookMarked, Library, Monitor, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Kiosk({ recentVisitors, todayCount }) {
    const { flash } = usePage().props;
    const [time, setTime] = useState(new Date());
    const [successVisitor, setSuccessVisitor] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const usernameInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        visit_purpose: 'reading',
    });

    // Update Jam Live Kios
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Cek Flash Data Pengunjung Sukses & Trigger 3 Detik Auto-Reset
    useEffect(() => {
        if (flash.success_visitor) {
            setSuccessVisitor(flash.success_visitor);
            setCountdown(3);

            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setSuccessVisitor(null);
                        reset('username', 'password');
                        if (usernameInputRef.current) {
                            usernameInputRef.current.focus();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [flash.success_visitor]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/presensi', {
            preserveScroll: true,
            onError: () => {
                if (usernameInputRef.current) {
                    usernameInputRef.current.focus();
                }
            },
        });
    };

    const purposes = [
        {
            id: 'reading',
            title: 'Membaca Mandiri',
            desc: 'Membaca koleksi cetak / jurnal di ruangan',
            icon: BookMarked,
        },
        {
            id: 'borrowing',
            title: 'Peminjaman Koleksi',
            desc: 'Scan QR fisik & transaksi peminjaman',
            icon: Library,
        },
        {
            id: 'research',
            title: 'Penyusunan Riset',
            desc: 'Penelitian tugas akhir / skripsi',
            icon: GraduationCap,
        },
        {
            id: 'computer',
            title: 'Akses Komputer',
            desc: 'Penggunaan komputer & perpustakaan digital',
            icon: Monitor,
        },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden select-none font-sans">
            <Head title="Kios Presensi Kunjungan Perpustakaan" />

            {/* Ambient Background Glows */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

            {/* 3-Second Auto-Reset Success Overlay Modal */}
            {successVisitor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center border border-emerald-500/40 shadow-2xl relative">
                        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-950 tracking-tight">Presensi Berhasil Dicatat!</h3>
                        <p className="text-lg font-bold text-emerald-700 mt-2">{successVisitor.name}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{successVisitor.username} • {successVisitor.prodi}</p>

                        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Tujuan Kunjungan:</span>
                                <span className="font-bold text-slate-900">{successVisitor.purpose}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Waktu Masuk:</span>
                                <span className="font-mono font-bold text-emerald-700">{successVisitor.time} WIB</span>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-slate-600 font-medium">
                            <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
                            <span>Formulir akan otomatis reset dalam <strong className="text-slate-950 text-sm font-bold">{countdown}</strong> detik...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Kiosk Header Bar */}
            <header className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:px-8 rounded-3xl border border-amber-900/10 shadow-sm z-10">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md font-black">
                        <BookOpen className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">PRESENSI PINTU MASUK</h1>
                        <p className="text-xs text-slate-500 font-medium">Perpustakaan Digital Politeknik Indonusa Surakarta</p>
                    </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                    <div className="hidden md:block">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Pengunjung Hari Ini</p>
                        <p className="text-lg font-extrabold text-emerald-700">{todayCount} Mahasiswa / Dosen</p>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                        <p className="text-xs text-amber-900 font-bold">
                            {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xl font-black text-amber-700 font-mono tracking-wider">
                            {time.toLocaleTimeString('id-ID')} <span className="text-xs text-amber-800 font-normal">WIB</span>
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Form Content */}
            <main className="max-w-7xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
                {/* Left Column: Purpose Selection & Form */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Step 1: Select Purpose */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border border-amber-900/10 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-2">
                                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                                <span>Pilih Tujuan Kunjungan Anda</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {purposes.map((p) => {
                                const Icon = p.icon;
                                const isSelected = data.visit_purpose === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setData('visit_purpose', p.id)}
                                        className={`p-4 rounded-2xl text-left transition-all flex items-start space-x-3.5 border ${
                                            isSelected
                                                ? 'bg-amber-500/15 border-amber-500 text-slate-950 shadow'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-400'
                                        }`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-sm text-slate-950">{p.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 font-medium">{p.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Input Credentials Form */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-sm">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-2 mb-6">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                            <span>Masukkan Kredensial Pengguna</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Username Input */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                                        NIM / NIDN / Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <input
                                            ref={usernameInputRef}
                                            type="text"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            placeholder="Contoh: mhs12345"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium transition-all"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    {errors.username && (
                                        <p className="text-xs text-rose-600 font-semibold mt-1.5">{errors.username}</p>
                                    )}
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                                        Kata Sandi
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium transition-all"
                                            required
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-rose-600 font-semibold mt-1.5">{errors.password}</p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                <span>{processing ? 'Memverifikasi Presensi...' : 'SIMPAN PRESENSI KEHADIRAN'}</span>
                                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Live Ticker of Recent Check-ins */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                <span>Pengunjung Terakhir</span>
                            </h3>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Real-time</span>
                        </div>

                        <div className="space-y-3">
                            {recentVisitors && recentVisitors.length > 0 ? (
                                recentVisitors.map((v) => (
                                    <div key={v.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{v.user?.name}</p>
                                            <p className="text-[10px] text-slate-500">{v.user?.username} • {v.user?.prodi || 'Mahasiswa'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-mono font-bold">
                                                {new Date(v.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-xs font-medium">
                                    Belum ada presensi pengunjung hari ini.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <div className="inline-flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Terminal Kios Mandiri - Tanpa Sesi Login Permanen</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Kiosk Footer Bar */}
            <footer className="max-w-7xl w-full mx-auto text-center py-2 text-xs text-slate-500 font-medium">
                &copy; {new Date().getFullYear()} SIMPUS Politeknik Indonusa Surakarta. Hak Cipta Dilindungi.
            </footer>
        </div>
    );
}
