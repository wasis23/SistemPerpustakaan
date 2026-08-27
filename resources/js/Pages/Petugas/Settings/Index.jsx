import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { 
    SlidersHorizontal, 
    Save, 
    BookOpen, 
    DollarSign, 
    Clock, 
    QrCode, 
    CheckCircle2, 
    AlertCircle, 
    RotateCcw,
    Calendar,
    CalendarDays,
    CalendarOff,
    Plus,
    Trash2,
    Sun,
    Search,
    Info
} from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Index({ settings, stats, holidays = [] }) {
    const { flash } = usePage().props;
    const [holidaySearch, setHolidaySearch] = useState('');
    const [isAddingHoliday, setIsAddingHoliday] = useState(false);

    // Form Pengaturan Sirkulasi
    const { data, setData, put, processing, errors, isDirty } = useForm({
        max_borrow_limit: settings.max_borrow_limit || 3,
        fine_per_day: settings.fine_per_day || 1000,
        borrow_duration_days: settings.borrow_duration_days || 7,
        ticket_expire_minutes: settings.ticket_expire_minutes || 5,
    });

    // Form Tambah Tanggal Merah
    const {
        data: holidayData,
        setData: setHolidayData,
        post: postHoliday,
        processing: holidayProcessing,
        errors: holidayErrors,
        reset: resetHoliday,
    } = useForm({
        name: '',
        start_date: '',
        end_date: '',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/petugas/settings');
    };

    const handleResetDefaults = () => {
        setData({
            max_borrow_limit: 3,
            fine_per_day: 1000,
            borrow_duration_days: 7,
            ticket_expire_minutes: 5,
        });
    };

    const handleHolidaySubmit = (e) => {
        e.preventDefault();
        postHoliday('/petugas/settings/holidays', {
            preserveScroll: true,
            onSuccess: () => {
                resetHoliday();
                setIsAddingHoliday(false);
            },
        });
    };

    const handleDeleteHoliday = (id, name, dateText) => {
        if (confirm(`Hapus tanggal merah "${name}" (${dateText}) dari daftar libur bebas denda?`)) {
            router.delete(`/petugas/settings/holidays/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const filteredHolidays = holidays.filter((h) => {
        const query = holidaySearch.toLowerCase();
        return (
            h.name.toLowerCase().includes(query) ||
            h.holiday_date.includes(query) ||
            h.holiday_date_formatted.toLowerCase().includes(query) ||
            (h.description && h.description.toLowerCase().includes(query))
        );
    });

    return (
        <PetugasLayout activeMenu="settings">
            <Head title="Pengaturan Sirkulasi & Tanggal Merah - Petugas" />

            <div className="space-y-8 w-full">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                            <SlidersHorizontal className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Pengaturan Sirkulasi, Denda & Tanggal Merah</h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Konfigurasi batas maksimal eksemplar, tarif denda per hari, dan jadwal hari libur bebas denda
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={handleResetDefaults}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                            title="Kembalikan nilai bawaan standar perpustakaan"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Default Parameter</span>
                        </button>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-sm animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2 shadow-sm animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Quick Status Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Pinjaman Aktif</span>
                            <BookOpen className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-950">{stats?.active_borrowings_count || 0}</p>
                        <p className="text-[10px] text-slate-500">Eksemplar fisik di tangan peminjam</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Eksemplar Terlambat</span>
                            <Clock className="w-4 h-4 text-rose-600" />
                        </div>
                        <p className="text-2xl font-black text-rose-600">{stats?.overdue_borrowings_count || 0}</p>
                        <p className="text-[10px] text-slate-500">Melewati tanggal jatuh tempo</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Denda Belum Lunas</span>
                            <DollarSign className="w-4 h-4 text-rose-600" />
                        </div>
                        <p className="text-2xl font-black text-rose-700">
                            Rp {(stats?.unpaid_fines_total || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[10px] text-slate-500">Piutang denda sirkulasi</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Tanggal Merah Terdaftar</span>
                            <CalendarOff className="w-4 h-4 text-rose-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-950">
                            {stats?.holidays_count || holidays.length}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-bold">+ Hari Minggu Bebas Denda</p>
                    </div>
                </div>

                {/* Section 1: Parameter Sirkulasi & Denda Standar */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                        <h2 className="text-base font-extrabold text-slate-950 flex items-center space-x-2">
                            <span>Parameter Sirkulasi & Tarif Keterlambatan</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Nilai berikut langsung mempengaruhi kuota peminjaman eksemplar, validasi tiket, dan besaran tarif denda harian.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 1. Maksimal Eksemplar yang Boleh Dipinjam */}
                            <div className="space-y-2">
                                <label className="block text-xs font-extrabold text-slate-900">
                                    1. Batas Maksimal Eksemplar per Anggota <span className="text-rose-600">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <BookOpen className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={data.max_borrow_limit}
                                        onChange={(e) => setData('max_borrow_limit', e.target.value)}
                                        className="w-full pl-10 pr-36 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-950 font-bold text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                                        placeholder="Contoh: 3"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-1 rounded-xl">
                                            Eksemplar / Orang
                                        </span>
                                    </div>
                                </div>
                                {errors.max_borrow_limit ? (
                                    <p className="text-xs font-bold text-rose-600">{errors.max_borrow_limit}</p>
                                ) : (
                                    <p className="text-[11px] text-slate-500">
                                        Batas maksimal total eksemplar fisik buku aktif yang dapat dipinjam secara bersamaan oleh seorang anggota (dihitung per eksemplar fisik, bukan berdasarkan jumlah judul buku).
                                    </p>
                                )}
                            </div>

                            {/* 2. Tarif Denda Keterlambatan per Eksemplar per Hari */}
                            <div className="space-y-2">
                                <label className="block text-xs font-extrabold text-slate-900">
                                    2. Tarif Denda Keterlambatan per Eksemplar per Hari <span className="text-rose-600">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <span className="text-xs font-black text-amber-700">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={data.fine_per_day}
                                        onChange={(e) => setData('fine_per_day', e.target.value)}
                                        className="w-full pl-12 pr-36 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-950 font-black text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                                        placeholder="Contoh: 1000"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-1 rounded-xl">
                                            / Hari / Eksemplar
                                        </span>
                                    </div>
                                </div>
                                {errors.fine_per_day ? (
                                    <p className="text-xs font-bold text-rose-600">{errors.fine_per_day}</p>
                                ) : (
                                    <p className="text-[11px] text-slate-500">
                                        Tarif denda harian per eksemplar (dikecualikan pada Hari Minggu & Tanggal Merah terdaftar).
                                    </p>
                                )}
                            </div>

                            {/* 3. Durasi Masa Peminjaman */}
                            <div className="space-y-2">
                                <label className="block text-xs font-extrabold text-slate-900">
                                    3. Durasi Masa Peminjaman Standar <span className="text-rose-600">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="180"
                                        value={data.borrow_duration_days}
                                        onChange={(e) => setData('borrow_duration_days', e.target.value)}
                                        className="w-full pl-10 pr-28 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-950 font-bold text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                                        placeholder="Contoh: 7"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-1 rounded-xl">
                                            Hari Kalender
                                        </span>
                                    </div>
                                </div>
                                {errors.borrow_duration_days ? (
                                    <p className="text-xs font-bold text-rose-600">{errors.borrow_duration_days}</p>
                                ) : (
                                    <p className="text-[11px] text-slate-500">
                                        Jumlah hari masa pinjam normal sejak tiket divalidasi oleh petugas meja sirkulasi.
                                    </p>
                                )}
                            </div>

                            {/* 4. Batas Kadaluarsa Tiket Peminjaman */}
                            <div className="space-y-2">
                                <label className="block text-xs font-extrabold text-slate-900">
                                    4. Batas Kadaluarsa Tiket QR Mandiri <span className="text-rose-600">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <QrCode className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="1440"
                                        value={data.ticket_expire_minutes}
                                        onChange={(e) => setData('ticket_expire_minutes', e.target.value)}
                                        className="w-full pl-10 pr-28 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-950 font-bold text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                                        placeholder="Contoh: 5"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-1 rounded-xl">
                                            Menit
                                        </span>
                                    </div>
                                </div>
                                {errors.ticket_expire_minutes ? (
                                    <p className="text-xs font-bold text-rose-600">{errors.ticket_expire_minutes}</p>
                                ) : (
                                    <p className="text-[11px] text-slate-500">
                                        Waktu penahanan eksemplar buku di rak fisik setelah anggota membuat tiket peminjaman via HP.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                {isDirty ? (
                                    <span className="text-amber-600 font-bold">● Ada perubahan parameter belum disimpan</span>
                                ) : (
                                    <span>Pengaturan parameter tersimpan aman</span>
                                )}
                            </span>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                            >
                                <Save className="w-4 h-4 stroke-[2.5]" />
                                <span>{processing ? 'Menyimpan...' : 'Simpan Parameter Sirkulasi'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Aturan Hari Bebas Denda & Manajemen Tanggal Merah */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                    {/* Header Info & Sunday Exemption Rule Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-950 flex items-center space-x-2">
                                <CalendarOff className="w-5 h-5 text-rose-600" />
                                <span>Aturan Hari Bebas Denda & Tanggal Merah</span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Hari-hari di mana sistem secara otomatis <strong>TIDAK menghitung denda keterlambatan</strong> bagi seluruh peminjam buku.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsAddingHoliday(!isAddingHoliday)}
                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-all flex items-center space-x-2 shadow-sm shrink-0 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{isAddingHoliday ? 'Tutup Form' : 'Tambah Tanggal Merah'}</span>
                        </button>
                    </div>

                    {/* Notice Banner: Automatic Sunday Exemption */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 flex items-start space-x-3">
                        <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold shrink-0 mt-0.5">
                            <Sun className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-extrabold text-amber-900 text-xs">
                                Aturan Permanen: Hari Minggu Otomatis Bebas Denda
                            </p>
                            <p className="text-[11px] text-slate-700 leading-relaxed">
                                Seluruh hari Minggu dalam masa keterlambatan otomatis <strong>bebas denda (Rp 0)</strong> tanpa perlu diinput manual satu per satu. 
                                Di bawah ini Anda dapat menambahkan <strong>Tanggal Merah Nasional</strong>, <strong>Cuti Bersama</strong>, atau <strong>Hari Libur Khusus Kampus</strong> agar denda juga otomatis tidak ditagihkan pada tanggal tersebut.
                            </p>
                        </div>
                    </div>

                    {/* Form Tambah Tanggal Merah (Collapsible / Toggleable) */}
                    {isAddingHoliday && (
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
                            <div className="flex items-center space-x-2">
                                <CalendarDays className="w-4 h-4 text-amber-600" />
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    Form Tambah Tanggal Merah / Libur Baru
                                </h3>
                            </div>

                            <form onSubmit={handleHolidaySubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-800">
                                            Nama Hari Libur / Tanggal Merah <span className="text-rose-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={holidayData.name}
                                            onChange={(e) => setHolidayData('name', e.target.value)}
                                            placeholder="Contoh: HUT Kemerdekaan RI ke-81"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                                            required
                                        />
                                        {holidayErrors.name && (
                                            <p className="text-[10px] text-rose-600 font-bold">{holidayErrors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-800">
                                            Tanggal Mulai <span className="text-rose-600">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={holidayData.start_date}
                                            onChange={(e) => setHolidayData('start_date', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
                                            required
                                        />
                                        {holidayErrors.start_date && (
                                            <p className="text-[10px] text-rose-600 font-bold">{holidayErrors.start_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-800">
                                            Tanggal Selesai <span className="text-slate-400 font-normal">(Opsional bila &gt; 1 hari)</span>
                                        </label>
                                        <input
                                            type="date"
                                            min={holidayData.start_date || undefined}
                                            value={holidayData.end_date}
                                            onChange={(e) => setHolidayData('end_date', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
                                            placeholder="Opsional jika hanya 1 hari"
                                        />
                                        {holidayErrors.end_date && (
                                            <p className="text-[10px] text-rose-600 font-bold">{holidayErrors.end_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">
                                        Catatan / Keterangan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={holidayData.description}
                                        onChange={(e) => setHolidayData('description', e.target.value)}
                                        placeholder="Contoh: Perpustakaan tutup layanan tatap muka sesuai SK Rektorat"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
                                    />
                                    {holidayErrors.description && (
                                        <p className="text-[10px] text-rose-600 font-bold">{holidayErrors.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetHoliday();
                                            setIsAddingHoliday(false);
                                        }}
                                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={holidayProcessing}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>{holidayProcessing ? 'Menyimpan...' : 'Simpan Tanggal Merah'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Table / List of Registered Holidays */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-extrabold text-slate-900">Daftar Tanggal Merah Terdaftar</span>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-mono font-bold rounded-full">
                                    {filteredHolidays.length} hari
                                </span>
                            </div>

                            {/* Search Filter */}
                            <div className="relative w-full sm:w-64">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={holidaySearch}
                                    onChange={(e) => setHolidaySearch(e.target.value)}
                                    placeholder="Cari tanggal / nama libur..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                                />
                            </div>
                        </div>

                        {filteredHolidays.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                                <p className="text-xs font-bold text-slate-700">
                                    {holidaySearch ? 'Tidak ditemukan tanggal merah yang cocok dengan pencarian.' : 'Belum ada tanggal merah khusus yang ditambahkan.'}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    Hari Minggu otomatis tetap bebas denda. Klik tombol <strong>+ Tambah Tanggal Merah</strong> di atas untuk memasukkan hari libur nasional atau cuti bersama.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4">Tanggal Libur</th>
                                            <th className="py-3 px-4">Nama Hari Libur / Tanggal Merah</th>
                                            <th className="py-3 px-4">Keterangan</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredHolidays.map((holiday) => (
                                            <tr key={holiday.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                                        <div>
                                                            <span className="font-bold text-slate-900 font-mono">
                                                                {holiday.holiday_date_formatted}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 block">
                                                                Hari {holiday.day_name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 font-extrabold text-slate-900">
                                                    {holiday.name}
                                                </td>

                                                <td className="py-3 px-4 text-slate-600 text-[11px]">
                                                    {holiday.description || '-'}
                                                </td>

                                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                                    {holiday.is_today ? (
                                                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                                            Hari Ini
                                                        </span>
                                                    ) : holiday.is_upcoming ? (
                                                        <span className="px-2.5 py-1 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-full">
                                                            Akan Datang
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                                                            Telah Lewat
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteHoliday(holiday.id, holiday.name, holiday.holiday_date_formatted)}
                                                        className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl transition-all inline-flex items-center space-x-1 cursor-pointer"
                                                        title="Hapus tanggal merah ini"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span className="text-[11px] font-bold">Hapus</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PetugasLayout>
    );
}

