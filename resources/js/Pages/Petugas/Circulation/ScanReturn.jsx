import React, { useRef, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRightLeft, CheckCircle2, AlertCircle, DollarSign, Calendar, Clock, BookOpen } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function ScanReturn() {
    const { errors, flash } = usePage().props;
    const inputRef = useRef(null);

    const { data, setData, post, processing, reset } = useForm({
        barcode_hash: '',
    });

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/petugas/circulations/process-return', {
            onSuccess: () => {
                reset('barcode_hash');
                if (inputRef.current) inputRef.current.focus();
            },
        });
    };

    const returnReceipt = flash.success_return;

    return (
        <PetugasLayout activeMenu="circulations">
            <Head title="Meja Sirkulasi - Scan Pengembalian Buku" />

            <div className="space-y-6 w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <Link href="/petugas/circulations" className="p-2.5 text-slate-600 hover:text-amber-700 bg-slate-50 border border-slate-200 rounded-2xl transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Meja Sirkulasi Pustakawan</h1>
                            <p className="text-xs text-slate-500 font-medium">Pemindaian Barcode Fisik Pengembalian Buku & Kalkulasi Denda</p>
                        </div>
                    </div>

                    <Link
                        href="/petugas/circulations/scan-ticket"
                        className="px-4 py-2.5 bg-white border border-slate-300 hover:border-amber-500 rounded-2xl text-xs font-bold text-slate-700 hover:text-amber-700 transition-all shadow-sm"
                    >
                        Pindah ke Scan Tiket HP ➔
                    </Link>
                </div>

                {/* Input Box for Hardware Barcode Scanner */}
                <div className="bg-white p-8 rounded-3xl border border-amber-900/10 text-center space-y-4 shadow-xl">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <ArrowRightLeft className="w-10 h-10 stroke-[2.5]" />
                    </div>

                    <div>
                        <h2 className="text-lg font-extrabold text-slate-950">Scan Barcode Physical Book Copy</h2>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                            Arahkan scanner ke stiker barcode di sampul/punggung buku yang diserahkan oleh peminjam.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={data.barcode_hash}
                                onChange={(e) => setData('barcode_hash', e.target.value.toUpperCase())}
                                placeholder="BC-XXXXXXXX atau IND-XXX-XXXX"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-amber-400 rounded-2xl text-center font-mono text-lg font-black tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600"
                                autoFocus
                            />
                        </div>

                        {errors.barcode_hash && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center justify-center space-x-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errors.barcode_hash}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow-lg transition-all"
                        >
                            PROSES PENGEMBALIAN BUKU
                        </button>
                    </form>
                </div>

                {/* Struk Bukti Pengembalian / Calculator Receipt */}
                {returnReceipt && (
                    <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center space-x-2 text-emerald-700">
                                <CheckCircle2 className="w-6 h-6 shrink-0" />
                                <span className="font-extrabold text-sm">Buku Sukses Dikembalikan ke Stok Rak!</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                                {returnReceipt.borrowing_code}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Peminjam</span>
                                <p className="font-bold text-slate-900">{returnReceipt.user_name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{returnReceipt.user_nim}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Detail Buku</span>
                                <p className="font-bold text-slate-900 line-clamp-1">{returnReceipt.book_title}</p>
                                <p className="text-[10px] font-mono text-amber-800 font-bold">{returnReceipt.copy_code}</p>
                            </div>
                        </div>

                        {/* Denda Summary Box */}
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                            returnReceipt.late_days > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
                        }`}>
                            <div className="space-y-0.5">
                                <p className="font-extrabold text-slate-900">
                                    {returnReceipt.late_days > 0 ? `Terlambat ${returnReceipt.late_days} Hari Kalender` : 'Tepat Waktu'}
                                </p>
                                <p className="text-[10px] text-slate-500">Tgl Jatuh Tempo: {returnReceipt.due_date}</p>
                                {returnReceipt.total_exempt_days > 0 && (
                                    <p className="text-[10px] text-emerald-700 font-bold">
                                        ✓ Bebas Denda: {returnReceipt.total_exempt_days} Hari (
                                        {returnReceipt.sunday_exempt_days > 0 ? `${returnReceipt.sunday_exempt_days} Minggu` : ''}
                                        {returnReceipt.sunday_exempt_days > 0 && returnReceipt.holiday_exempt_days > 0 ? ' + ' : ''}
                                        {returnReceipt.holiday_exempt_days > 0 ? `${returnReceipt.holiday_exempt_days} Tanggal Merah` : ''}
                                        )
                                    </p>
                                )}
                            </div>

                            <div className="text-right sm:text-right">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                                    Total Denda ({returnReceipt.fineable_days ?? returnReceipt.late_days} hari kena denda):
                                </span>
                                <span className={`font-mono font-black text-base ${
                                    returnReceipt.fine_amount > 0 ? 'text-rose-600' : 'text-emerald-700'
                                }`}>
                                    Rp {returnReceipt.fine_amount.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PetugasLayout>
    );
}
