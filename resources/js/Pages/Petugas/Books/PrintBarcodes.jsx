import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, BookOpen, Barcode } from 'lucide-react';

export default function PrintBarcodes({ book, labels }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 p-4 sm:p-8 font-sans">
            <Head title={`Cetak Barcode Label - ${book.title}`} />

            {/* Print Trigger & Header Bar (Hidden in Print Mode) */}
            <div className="no-print max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center space-x-3">
                    <Link
                        href={`/petugas/books/${book.id}`}
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                        title="Kembali ke Detail Buku"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-base tracking-tight">Cetak Barcode Label Eksemplar Fisik</h1>
                        <p className="text-xs text-slate-500 font-medium">Siapkan stiker / kertas cetak label perpustakaan</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow transition-all shrink-0"
                >
                    <Printer className="w-4 h-4 stroke-[2.5]" />
                    <span>Cetak Sekarang (Print / PDF)</span>
                </button>
            </div>

            {/* Printable Labels Container */}
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm print-area">
                <div className="text-center mb-8 pb-4 border-b border-slate-200">
                    <div className="inline-flex items-center space-x-2 bg-amber-100/80 text-amber-800 px-3 py-1 rounded-full text-[11px] font-bold mb-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>UPT PERPUSTAKAAN POLITEKNIK INDONUSA SURAKARTA</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">{book.title}</h2>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        Penulis: {book.author} | Kategori: DDC {book.category?.code || '-'} | Rak: {book.rack?.code_rack || '-'}
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {labels.map((item, idx) => (
                        <div 
                            key={idx} 
                            className="border-2 border-dashed border-slate-300 p-4 rounded-2xl text-center flex flex-col items-center justify-between bg-slate-50/70 hover:border-amber-400 transition-colors"
                        >
                            <p className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider line-clamp-1 w-full">
                                POLINDONUSA LIBRARY
                            </p>
                            <p className="text-[10px] font-mono font-extrabold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md my-1.5 border border-amber-300/60">
                                {item.copy_code}
                            </p>

                            {/* Render Barcode SVG */}
                            <div className="w-full flex justify-center py-1">
                                <div
                                    className="w-full flex justify-center"
                                    dangerouslySetInnerHTML={{ __html: item.barcode_svg }}
                                />
                            </div>

                            <p className="text-[9px] font-mono font-extrabold text-slate-950 tracking-wider">
                                {item.barcode_hash}
                            </p>

                            <div className="mt-2 pt-1.5 border-t border-slate-200 w-full flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-tight">
                                <span>Rak: {item.rack_code}</span>
                                <span>Punggung Buku</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    .print-area { border: none !important; shadow: none !important; padding: 0 !important; width: 100% !important; }
                }
            `}</style>
        </div>
    );
}
