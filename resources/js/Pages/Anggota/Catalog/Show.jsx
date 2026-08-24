import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, MapPin, Tag, CheckCircle2, QrCode, Sparkles, LogIn } from 'lucide-react';

export default function Show({ book, copies }) {
    const { auth } = usePage().props;

    const statusBadge = {
        available: { label: 'Tersedia di Rak', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        ticketed: { label: 'Tertahan Tiket HP', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        borrowed: { label: 'Sedang Dipinjam', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        damaged: { label: 'Rusak', color: 'bg-rose-50 text-rose-700 border-rose-200' },
        lost: { label: 'Hilang', color: 'bg-slate-100 text-slate-600 border-slate-300' },
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
            <Head title={`Detail Buku - ${book.title}`} />

            {/* Header Bar */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link href="/katalog" className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-extrabold text-slate-950 text-lg tracking-tight line-clamp-1">{book.title}</h1>
                            <p className="text-xs text-slate-500 font-medium">Petunjuk Lokasi Rak & Kode Eksemplar Fisik</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {auth && auth.user ? (
                            <Link 
                                href={auth.user.role === 'petugas' ? '/petugas/dashboard' : '/anggota/dashboard'} 
                                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-full shadow transition-all"
                            >
                                Dashboard Saya
                            </Link>
                        ) : (
                            <Link href="/login" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow transition-all flex items-center space-x-1.5">
                                <LogIn className="w-4 h-4 stroke-[2.5]" />
                                <span>Masuk / Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Book Info Panel */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-3 flex justify-center">
                        {book.cover_image ? (
                            <img
                                src={book.cover_image}
                                alt={book.title}
                                className="w-44 h-60 object-cover rounded-2xl border border-amber-200/60 shadow-md"
                            />
                        ) : (
                            <div className="w-44 h-60 bg-amber-50 rounded-2xl border border-amber-200/60 flex flex-col items-center justify-center p-4 text-center">
                                <BookOpen className="w-12 h-12 text-amber-600 mb-2" />
                                <p className="text-xs font-extrabold text-slate-900 line-clamp-2">{book.title}</p>
                                <span className="text-[10px] text-amber-800 font-mono mt-1 font-semibold">ISBN: {book.isbn || '-'}</span>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-9 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-amber-100/80 text-amber-800 border border-amber-300/60 px-3 py-1 rounded-full text-xs font-bold">
                                [{book.category?.code}] {book.category?.name}
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-mono font-bold">
                                📍 Rak: {book.rack?.code_rack} ({book.rack?.location})
                            </span>
                        </div>

                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">{book.title}</h2>
                        <p className="text-sm text-slate-600 font-medium">Penulis: <strong className="text-slate-950 font-bold">{book.author}</strong></p>
                        <p className="text-xs text-slate-500 font-medium">Penerbit: {book.publisher || '-'} ({book.publish_year || '-'})</p>

                        {auth && auth.user ? (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl text-xs text-slate-700 flex items-start space-x-3">
                                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-extrabold text-slate-950 text-sm">Cara Meminjam Mandiri via HP:</p>
                                    <ol className="list-decimal list-inside space-y-1 mt-1 text-slate-700 font-medium">
                                        <li>Cari rak fisik <strong className="text-amber-800 font-extrabold">{book.rack?.code_rack}</strong> ({book.rack?.location}).</li>
                                        <li>Pilih salah satu eksemplar buku di bawah yang berstatus <strong>Tersedia</strong>.</li>
                                        <li>Buka Kamera HP Anda di menu <Link href="/anggota/scan" className="underline font-bold text-amber-800">Scan Barcode HP</Link>, lalu pindai Barcode Fisik yang terempel pada buku tersebut.</li>
                                    </ol>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl text-xs text-slate-700 flex items-center justify-between gap-4">
                                <div className="flex items-center space-x-3">
                                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                                    <div>
                                        <p className="font-extrabold text-slate-950 text-sm">Ingin Meminjam Buku Ini?</p>
                                        <p className="text-slate-600 mt-0.5">Silakan masuk ke Portal Anggota untuk melakukan scan barcode & mendapatkan tiket digital 5 menit.</p>
                                    </div>
                                </div>
                                <Link href="/login" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shrink-0 shadow">
                                    Masuk Ke Portal
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Copies List */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-amber-600" />
                        <span>Eksemplar Fisik di Rak</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {copies.map((copy) => {
                            const badge = statusBadge[copy.status] || { label: copy.status, color: 'bg-slate-100 text-slate-600 border-slate-200' };
                            return (
                                <div key={copy.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-mono font-extrabold text-amber-800 text-sm">{copy.copy_code}</p>
                                            <span className={`inline-block border px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Render Barcode SVG Preview */}
                                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col items-center justify-center">
                                        <div
                                            className="w-full flex justify-center overflow-hidden"
                                            dangerouslySetInnerHTML={{ __html: copy.barcode_svg }}
                                        />
                                        <p className="font-mono text-[10px] text-slate-900 font-bold mt-1 tracking-wider">
                                            {copy.barcode_hash}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
