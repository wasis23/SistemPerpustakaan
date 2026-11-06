import React, { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { 
    CheckCircle2, 
    BookmarkCheck, 
    Calendar, 
    Clock, 
    BookOpen, 
    User, 
    DollarSign, 
    Sparkles, 
    X,
    ArrowRight
} from 'lucide-react';

export default function TransactionPopupModal({ customData, onCloseCustom }) {
    const { flash } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    // Deteksi flash message baru atau custom data
    useEffect(() => {
        if (customData) {
            setReceiptData(customData);
            setIsOpen(true);
            return;
        }

        const borrowReceipt = flash?.success_borrowing;
        const returnReceipt = flash?.success_return || flash?.return_receipt;

        if (borrowReceipt) {
            setReceiptData({
                ...borrowReceipt,
                type: 'borrowing_success',
                title: borrowReceipt.title || 'Peminjaman Buku Berhasil Disahkan! 🎉',
            });
            setIsOpen(true);
        } else if (returnReceipt) {
            setReceiptData({
                ...returnReceipt,
                type: 'return_success',
                title: returnReceipt.title || 'Buku Berhasil Dikembalikan! ✅',
            });
            setIsOpen(true);
        }
    }, [flash?.success_borrowing, flash?.success_return, flash?.return_receipt, customData]);

    const handleClose = () => {
        setIsOpen(false);
        setReceiptData(null);
        if (onCloseCustom) onCloseCustom();
    };

    if (!isOpen || !receiptData) return null;

    const isReturn = receiptData.type === 'return_success';
    const isBorrow = receiptData.type === 'borrowing_success';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop Blur */}
            <div 
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal Dialog Card */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 animate-in zoom-in-95 duration-200 space-y-5 p-6 sm:p-8">
                {/* Close Button Top Right */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-5 right-5 p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    aria-label="Tutup Popup"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Top Banner Icon & Header */}
                <div className="flex items-center space-x-3.5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-lg ${
                        isReturn
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-slate-950'
                    }`}>
                        {isReturn ? (
                            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                        ) : (
                            <BookmarkCheck className="w-8 h-8 stroke-[2.5]" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center space-x-1.5">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                isReturn 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-900'
                            }`}>
                                {isReturn ? 'Pengembalian Sah' : 'Peminjaman Sah'}
                            </span>
                        </div>
                        <h2 className="text-lg font-black text-slate-950 tracking-tight mt-0.5">
                            {receiptData.title}
                        </h2>
                        <p className="text-xs text-slate-500 font-mono font-bold mt-0.5">
                            Kode: {receiptData.borrowing_code || '-'}
                        </p>
                    </div>
                </div>

                {/* Detail Box Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs">
                    {/* Book Information */}
                    <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                            <BookOpen className="w-3 h-3 text-slate-500" />
                            <span>Judul Buku Fisik</span>
                        </span>
                        <p className="font-extrabold text-slate-950 text-sm leading-snug">
                            {receiptData.book_title || '-'}
                        </p>
                        {receiptData.copy_code && (
                            <p className="text-[11px] font-mono font-bold text-amber-800">
                                Eksemplar: <span className="bg-amber-100 px-1.5 py-0.5 rounded">{receiptData.copy_code}</span>
                            </p>
                        )}
                    </div>

                    {/* Borrower / User Information (if available) */}
                    {(receiptData.user_name || receiptData.user_username) && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
                                <User className="w-3 h-3 text-slate-500" />
                                <span>Peminjam</span>
                            </span>
                            <span className="font-bold text-slate-900 text-right">
                                {receiptData.user_name} {receiptData.user_nim ? `(${receiptData.user_nim})` : ''}
                            </span>
                        </div>
                    )}

                    {/* Date / Time Information */}
                    {isBorrow && receiptData.due_date && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                            <span className="font-bold text-amber-900 flex items-center space-x-1.5">
                                <Calendar className="w-4 h-4 text-amber-700" />
                                <span>Wajib Kembali:</span>
                            </span>
                            <span className="font-mono font-black text-amber-950 text-sm">
                                {receiptData.due_date}
                            </span>
                        </div>
                    )}

                    {isReturn && (
                        <div className="space-y-2">
                            {receiptData.returned_at && (
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-slate-500 flex items-center space-x-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Waktu Pengembalian:</span>
                                    </span>
                                    <span className="font-bold font-mono text-slate-800">
                                        {receiptData.returned_at}
                                    </span>
                                </div>
                            )}

                            {/* Fine Status Box */}
                            <div className={`p-3 rounded-xl border flex items-center justify-between ${
                                (receiptData.fine_amount || 0) > 0
                                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            }`}>
                                <span className="font-bold flex items-center space-x-1.5">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Status Denda:</span>
                                </span>
                                <span className="font-black text-sm">
                                    {(receiptData.fine_amount || 0) > 0 
                                        ? `Rp ${Number(receiptData.fine_amount).toLocaleString('id-ID')} (Terlambat ${receiptData.late_days || receiptData.overdue_days || 0} hari)` 
                                        : 'Rp 0 (Tepat Waktu / Bebas Denda)'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-all cursor-pointer text-center"
                    >
                        Tutup
                    </button>

                    <Link
                        href="/anggota/borrowings"
                        onClick={handleClose}
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-center"
                    >
                        <span>Lihat Buku Saya</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
