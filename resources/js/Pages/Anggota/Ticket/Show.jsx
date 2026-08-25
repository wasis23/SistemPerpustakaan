import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { QrCode, Clock, ShieldAlert, ArrowLeft, XCircle, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import AnggotaLayout from '@/Layouts/AnggotaLayout';

export default function Show({ ticket, qrSvg }) {
    const [timeLeft, setTimeLeft] = useState(0);
    const { post: postCancel, processing: cancelling } = useForm({});

    useEffect(() => {
        const calculateTimeLeft = () => {
            const expireTime = new Date(ticket.expires_at).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((expireTime - now) / 1000));
            return diff;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timer);
                router.reload();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [ticket.expires_at]);

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleCancel = () => {
        if (confirm('Apakah Anda yakin ingin membatalkan tiket ini? Eksemplar buku akan langsung dirilis kembali ke rak.')) {
            postCancel(`/anggota/ticket/${ticket.id}/cancel`);
        }
    };

    return (
        <AnggotaLayout activeMenu="dashboard">
            <Head title={`Tiket Digital - ${ticket.ticket_code}`} />

            <div className="space-y-6 w-full">
                {/* Header Card */}
                <div className="flex items-center space-x-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <Link href="/anggota/dashboard" className="p-2.5 text-slate-600 hover:text-amber-700 bg-slate-50 border border-slate-200 rounded-2xl transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight uppercase">TIKET PEMINJAMAN DIGITAL</h1>
                        <p className="text-xs text-slate-500 font-medium">Scan di Meja Sirkulasi Pustakawan</p>
                    </div>
                </div>

                {/* Main Digital Ticket Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-6">
                    {/* Status Indicator */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">Tiket Aktif Berjalan</span>
                        </div>
                        <span className="font-mono text-xs font-extrabold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                            {ticket.ticket_code}
                        </span>
                    </div>

                    {/* 5-Minute Short-TTL Countdown Timer */}
                    <div className="p-4 rounded-2xl border border-amber-200 text-center space-y-1 bg-amber-50/50">
                        <p className="text-[10px] text-amber-900 uppercase font-bold tracking-wider flex items-center justify-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Batas Waktu Validasi Meja Sirkulasi</span>
                        </p>
                        <p className={`text-4xl font-black font-mono tracking-widest ${timeLeft < 60 ? 'text-rose-600 animate-pulse' : 'text-amber-700'}`}>
                            {formatCountdown(timeLeft)}
                        </p>
                        <p className="text-[10px] text-slate-600 font-medium">
                            Bawa buku ke Meja Pustakawan sebelum timer habis.
                        </p>
                    </div>

                    {/* Rendered Barcode / QR Code SVG for Librarian to Scan */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center space-y-2">
                        <div
                            className="w-full flex justify-center overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: qrSvg }}
                        />
                        <p className="font-mono text-xs font-black text-slate-950 tracking-widest mt-2">
                            {ticket.ticket_code}
                        </p>
                    </div>

                    {/* Book & Copy Details */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <h3 className="font-extrabold text-slate-950 text-sm line-clamp-1">{ticket.book_copy?.book?.title}</h3>
                        <div className="space-y-1 text-slate-600 text-[11px]">
                            <p>Penulis: <span className="font-semibold text-slate-900">{ticket.book_copy?.book?.author}</span></p>
                            <p>Kode Eksemplar: <span className="font-mono font-bold text-amber-800">{ticket.book_copy?.copy_code}</span></p>
                            <p className="flex items-center space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Lokasi Rak: {ticket.book_copy?.book?.rack?.code_rack} ({ticket.book_copy?.book?.rack?.location})</span>
                            </p>
                        </div>
                    </div>

                    {/* Cancel Button */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="w-full py-3 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                        >
                            <XCircle className="w-4 h-4" />
                            <span>{cancelling ? 'Memproses Batal...' : 'Batalkan Penahanan Stok Tiket'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </AnggotaLayout>
    );
}
