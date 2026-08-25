import React, { useRef, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, QrCode, CheckCircle2, AlertCircle, Sparkles, User, BookOpen, Calendar } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function ScanTicket() {
    const { errors, flash } = usePage().props;
    const inputRef = useRef(null);

    const { data, setData, post, processing, reset } = useForm({
        ticket_code: '',
    });

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/petugas/circulations/validate-ticket', {
            onSuccess: () => {
                reset('ticket_code');
                if (inputRef.current) inputRef.current.focus();
            },
        });
    };

    const successReceipt = flash.success_borrowing;

    return (
        <PetugasLayout activeMenu="circulations">
            <Head title="Meja Sirkulasi - Scan Tiket HP" />

            <div className="space-y-6 w-full">
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <Link href="/petugas/circulations" className="p-2.5 text-slate-600 hover:text-amber-700 bg-slate-50 border border-slate-200 rounded-2xl transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Meja Sirkulasi Pustakawan</h1>
                            <p className="text-xs text-slate-500 font-medium">Pemindaian QR Tiket HP Anggota untuk Pengesahan Pinjam</p>
                        </div>
                    </div>

                    <Link
                        href="/petugas/circulations/scan-return"
                        className="px-4 py-2.5 bg-white border border-slate-300 hover:border-amber-500 rounded-2xl text-xs font-bold text-slate-700 hover:text-amber-700 transition-all shadow-sm"
                    >
                        Pindah ke Scan Pengembalian ➔
                    </Link>
                </div>

                {/* Input Box for Hardware Barcode Scanner */}
                <div className="bg-white p-8 rounded-3xl border border-amber-900/10 text-center space-y-4 shadow-xl">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <QrCode className="w-10 h-10 stroke-[2.5]" />
                    </div>

                    <div>
                        <h2 className="text-lg font-extrabold text-slate-950">Scan QR Tiket di HP Anggota</h2>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                            Tempelkan scanner barcode fisik ke layar HP mahasiswa/dosen. Input akan otomatis memproses saat terdeteksi.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={data.ticket_code}
                                onChange={(e) => setData('ticket_code', e.target.value.toUpperCase())}
                                placeholder="TCK-YYYYMMDD-XXXX"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-amber-400 rounded-2xl text-center font-mono text-lg font-black tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600"
                                autoFocus
                            />
                        </div>

                        {errors.ticket_code && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center justify-center space-x-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errors.ticket_code}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow-lg transition-all"
                        >
                            VALIDASI & PROSES PEMINJAMAN
                        </button>
                    </form>
                </div>

                {/* Struk / Proof of Borrowing Receipt */}
                {successReceipt && (
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center space-x-3 text-emerald-800 pb-3 border-b border-emerald-200">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                            <div>
                                <h3 className="font-extrabold text-sm">Peminjaman Berhasil Disahkan!</h3>
                                <p className="text-[10px] text-emerald-700 font-mono">Kode Transaksi: {successReceipt.borrowing_code}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
                                    <User className="w-3 h-3 text-slate-500" />
                                    <span>Peminjam</span>
                                </span>
                                <p className="font-bold text-slate-900">{successReceipt.user_name}</p>
                                <p className="text-[10px] text-slate-500">{successReceipt.user_nim}</p>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
                                    <BookOpen className="w-3 h-3 text-slate-500" />
                                    <span>Buku & Eksemplar</span>
                                </span>
                                <p className="font-bold text-slate-900 line-clamp-1">{successReceipt.book_title}</p>
                                <p className="text-[10px] font-mono text-amber-800 font-bold">{successReceipt.copy_code}</p>
                            </div>
                        </div>

                        <div className="bg-emerald-100/70 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-900 flex items-center space-x-1.5">
                                <Calendar className="w-4 h-4 text-emerald-700" />
                                <span>Tanggal Wajib Kembali:</span>
                            </span>
                            <span className="font-mono font-black text-emerald-950 text-sm">{successReceipt.due_date}</span>
                        </div>
                    </div>
                )}
            </div>
        </PetugasLayout>
    );
}
