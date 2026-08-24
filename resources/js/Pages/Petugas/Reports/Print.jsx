import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';

export default function Print({ type, startDate, endDate, data, officer }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-900 p-8 font-sans">
            <Head title={`Laporan Cetak PDF - ${type === 'attendance' ? 'Presensi' : 'Sirkulasi'}`} />

            {/* Print Trigger Floating Bar (Hidden when printing) */}
            <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700 text-white">
                <div>
                    <h1 className="font-bold text-sm">Pratinjau Cetak Laporan Resmi SIMPUS</h1>
                    <p className="text-xs text-slate-400">Politeknik Indonusa Surakarta • Periode: {startDate} s/d {endDate}</p>
                </div>
                <button
                    type="button"
                    onClick={handlePrint}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg"
                >
                    <Printer className="w-4 h-4" />
                    <span>Cetak PDF Laporan Resmi</span>
                </button>
            </div>

            {/* Printable Institutional Report Document */}
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-xl print-area text-slate-900">
                {/* Institutional Letterhead / Kop Surat */}
                <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center">
                    <h2 className="text-lg font-extrabold uppercase tracking-wide text-slate-950">
                        POLITEKNIK INDONUSA SURAKARTA
                    </h2>
                    <h3 className="text-sm font-bold tracking-wider text-slate-800 mt-0.5">
                        UNIT PELAKSANA TEKNIS PERPUSTAKAAN DIGITAL
                    </h3>
                    <p className="text-[10px] text-slate-600 mt-1">
                        Jl. KH. Samanhudi No.84, Sondakan, Laweyan, Kota Surakarta, Jawa Tengah 57147
                    </p>
                </div>

                {/* Report Title */}
                <div className="text-center mb-6">
                    <h4 className="text-sm font-bold uppercase tracking-wider underline text-slate-900">
                        {type === 'attendance' ? 'LAPORAN REKAPITULASI PRESENSI KUNJUNGAN PERPUSTAKAAN' : 'LAPORAN REKAPITULASI SIRKULASI PEMINJAMAN BUKU'}
                    </h4>
                    <p className="text-xs font-semibold text-slate-700 mt-1">
                        PERIODE: {startDate} S/D {endDate}
                    </p>
                </div>

                {/* Report Data Table */}
                <div className="overflow-x-auto mb-8">
                    {type === 'attendance' ? (
                        <table className="w-full text-left text-xs border-collapse border border-slate-400">
                            <thead>
                                <tr className="bg-slate-200 text-slate-900 uppercase font-bold text-[10px]">
                                    <th className="border border-slate-400 p-2 text-center">No</th>
                                    <th className="border border-slate-400 p-2">Waktu Kunjungan</th>
                                    <th className="border border-slate-400 p-2">NIM / NIDN</th>
                                    <th className="border border-slate-400 p-2">Nama Pengunjung</th>
                                    <th className="border border-slate-400 p-2">Program Studi</th>
                                    <th className="border border-slate-400 p-2">Tujuan Kunjungan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data && data.length > 0 ? (
                                    data.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-slate-300">
                                            <td className="border border-slate-400 p-2 text-center">{idx + 1}</td>
                                            <td className="border border-slate-400 p-2 font-mono">{new Date(item.checked_in_at).toLocaleString('id-ID')}</td>
                                            <td className="border border-slate-400 p-2 font-mono font-semibold">{item.user?.username || '-'}</td>
                                            <td className="border border-slate-400 p-2 font-semibold">{item.user?.name || '-'}</td>
                                            <td className="border border-slate-400 p-2">{item.user?.prodi || 'Pustakawan'}</td>
                                            <td className="border border-slate-400 p-2 font-semibold">{item.purpose_label}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center text-slate-500">Tidak ada data.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left text-xs border-collapse border border-slate-400">
                            <thead>
                                <tr className="bg-slate-200 text-slate-900 uppercase font-bold text-[10px]">
                                    <th className="border border-slate-400 p-2 text-center">No</th>
                                    <th className="border border-slate-400 p-2">Kode Sirkulasi</th>
                                    <th className="border border-slate-400 p-2">Peminjam</th>
                                    <th className="border border-slate-400 p-2">Judul Buku & Eksemplar</th>
                                    <th className="border border-slate-400 p-2">Pinjam / Tempo</th>
                                    <th className="border border-slate-400 p-2 text-center">Status</th>
                                    <th className="border border-slate-400 p-2 text-right">Denda</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data && data.length > 0 ? (
                                    data.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-slate-300">
                                            <td className="border border-slate-400 p-2 text-center">{idx + 1}</td>
                                            <td className="border border-slate-400 p-2 font-mono font-bold">{item.borrowing_code}</td>
                                            <td className="border border-slate-400 p-2">
                                                <p className="font-semibold">{item.user?.name}</p>
                                                <p className="text-[10px] text-slate-600">{item.user?.username} ({item.user?.prodi || '-'})</p>
                                            </td>
                                            <td className="border border-slate-400 p-2">
                                                <p className="font-semibold line-clamp-1">{item.book_copy?.book?.title}</p>
                                                <p className="text-[10px] font-mono text-slate-600">{item.book_copy?.copy_code}</p>
                                            </td>
                                            <td className="border border-slate-400 p-2 font-mono text-[10px]">
                                                <p>{item.borrowed_at ? new Date(item.borrowed_at).toLocaleDateString('id-ID') : '-'}</p>
                                                <p className="font-bold">s/d {item.due_date ? new Date(item.due_date).toLocaleDateString('id-ID') : '-'}</p>
                                            </td>
                                            <td className="border border-slate-400 p-2 text-center font-bold uppercase text-[10px]">{item.status}</td>
                                            <td className="border border-slate-400 p-2 text-right font-mono font-bold">
                                                Rp {item.fine_amount.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-4 text-center text-slate-500">Tidak ada data.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Institutional Signature Section */}
                <div className="flex justify-between items-end pt-8 text-xs text-slate-900">
                    <div>
                        <p className="text-[10px] text-slate-500">Dicetak otomatis dari Sistem Informasi Perpustakaan (SIMPUS)</p>
                        <p className="text-[10px] text-slate-500 font-mono">Waktu Cetak: {new Date().toLocaleString('id-ID')}</p>
                    </div>

                    <div className="text-center w-64">
                        <p>Surakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="font-bold mt-1">Kepala UPT Perpustakaan</p>
                        <div className="h-16" />
                        <p className="font-bold underline">{officer.name}</p>
                        <p className="text-[10px] text-slate-600">NIP/NIDN: {officer.username}</p>
                    </div>
                </div>
            </div>

            {/* Print CSS Rules */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    .print-area { shadow: none !important; padding: 0 !important; width: 100% !important; }
                }
            `}</style>
        </div>
    );
}
