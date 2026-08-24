import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { QrCode, AlertCircle, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import AnggotaLayout from '@/Layouts/AnggotaLayout';

export default function Scan({ error }) {
    const { data, setData, post, processing, errors } = useForm({
        copy_code: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.copy_code.trim()) return;

        post('/anggota/scan', {
            onSuccess: () => setData('copy_code', ''),
        });
    };

    return (
        <AnggotaLayout activeMenu="scan">
            <Head title="Scan Barcode Rak Fisik - Anggota" />

            <div className="max-w-3xl mx-auto space-y-6 w-full">
                {/* Header Title Card */}
                <div className="flex items-center space-x-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <Link href="/anggota/dashboard" className="p-2.5 text-slate-600 hover:text-amber-700 bg-slate-50 border border-slate-200 rounded-2xl transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Scan Barcode Buku di Rak</h1>
                        <p className="text-xs text-slate-500 font-medium">Buat tiket penahanan stok mandiri 5 menit dari HP Anda</p>
                    </div>
                </div>

                {/* Main Interactive Scanner Container */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                    {/* Instructions Banner */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-900 leading-relaxed font-medium">
                            <p className="font-bold">Panduan Pemindaian Stiker Rak:</p>
                            <p className="mt-0.5">Arahkan kamera HP Anda ke stiker barcode fisik yang terdapat pada sampul belakang/halaman pertama buku, atau ketikkan Kode Eksemplar secara manual.</p>
                        </div>
                    </div>

                    {/* Alert Errors */}
                    {(error || errors.copy_code) && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center space-x-3 text-rose-800 text-xs font-bold shadow-sm">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>{error || errors.copy_code}</span>
                        </div>
                    )}

                    {/* Camera Simulation Viewfinder Frame */}
                    <div className="relative w-full aspect-video sm:aspect-[21/9] bg-slate-950 rounded-3xl overflow-hidden flex flex-col items-center justify-center text-white border-4 border-amber-500/30 shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />
                        
                        {/* Scanning Box Outline */}
                        <div className="relative z-10 w-48 h-32 border-2 border-amber-400 border-dashed rounded-2xl flex items-center justify-center animate-pulse">
                            <QrCode className="w-12 h-12 text-amber-400/80" />
                        </div>

                        <p className="relative z-10 text-[11px] font-mono text-amber-300 mt-4 font-bold bg-slate-900/80 px-3 py-1 rounded-full border border-amber-500/30">
                            Arahkan Barcode ke Dalam Kotak
                        </p>
                    </div>

                    {/* Input Fallback Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div>
                            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                                Atau Input Manual Kode Eksemplar / Barcode:
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={data.copy_code}
                                    onChange={(e) => setData('copy_code', e.target.value)}
                                    placeholder="Contoh: BK-001-01 atau BK-600-05"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                            <QrCode className="w-4 h-4 stroke-[2.5]" />
                            <span>{processing ? 'Memproses Poin Barcode...' : 'Proses Tiket Pinjam Mandiri'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </AnggotaLayout>
    );
}
