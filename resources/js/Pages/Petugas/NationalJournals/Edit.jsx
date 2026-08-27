import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import {
    ArrowLeft,
    BookMarked,
    Save,
    Building2,
    Globe,
    Award,
    FileText,
    CheckCircle2,
    ExternalLink,
    Calendar
} from 'lucide-react';

export default function NationalJournalsEdit({
    journal,
    prodiList = [],
    nationalIndexings = [],
    internationalIndexings = []
}) {
    const { data, setData, processing, errors } = useForm({
        title: journal.title || '',
        journal_type: journal.journal_type || 'Nasional',
        prodi: journal.prodi || prodiList[0] || 'D4-Manajemen Informasi Kesehatan',
        publisher: journal.publisher || '',
        access_url: journal.access_url || '',
        sinta: journal.sinta || 'Non-SINTA',
        issn: journal.issn || '',
        e_issn: journal.e_issn || '',
        frequency: journal.frequency || '',
        publish_year: journal.publish_year || '',
        description: journal.description || '',
        doi_prefix: journal.doi_prefix || '',
        is_active: Boolean(journal.is_active),
    });

    const handleTypeChange = (type) => {
        let defaultSinta = 'Non-SINTA';
        let defaultFreq = '2 Kali Setahun';

        if (type === 'Nasional') {
            defaultSinta = nationalIndexings[3] || 'SINTA 4';
            defaultFreq = '2 Kali Setahun (Juni & Desember)';
        } else if (type === 'Internasional') {
            defaultSinta = internationalIndexings[0] || 'Scopus (Q3)';
            defaultFreq = '4 Kali Setahun (Triwulan)';
        } else if (type === 'Prosiding') {
            defaultSinta = 'Prosiding Seminar';
            defaultFreq = 'Tahunan (Annual Conference)';
        }

        setData((prev) => ({
            ...prev,
            journal_type: type,
            sinta: defaultSinta,
            frequency: defaultFreq,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put(`/petugas/national-journals/${journal.id}`, data);
    };

    const activeIndexings = data.journal_type === 'Internasional' ? internationalIndexings : nationalIndexings;

    return (
        <PetugasLayout activeMenu="national-journals">
            <Head title={`Edit: ${journal.title} - SIMPUS Petugas`} />

            <form onSubmit={handleSubmit} className="space-y-8 w-full">
                {/* Header Navigation Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/petugas/national-journals"
                            className="p-2.5 bg-white hover:bg-slate-100 rounded-2xl border border-slate-200 text-slate-700 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700">
                                <BookMarked className="w-3.5 h-3.5" />
                                <span>Edit Direktori Publikasi Ilmiah</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                                Edit {data.journal_type === 'Prosiding' ? 'Prosiding Seminar' : `Jurnal ${data.journal_type}`}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <a
                            href={journal.access_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center space-x-1.5"
                        >
                            <Globe className="w-4 h-4 text-amber-600" />
                            <span>Buka Portal</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Menyimpan...' : 'Perbarui Data'}</span>
                        </button>
                    </div>
                </div>

                {/* Form Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Identitas Utama (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="font-black text-base text-slate-950 flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-amber-600" />
                                    <span>Informasi Publikasi</span>
                                </h2>

                                {/* 3-Way Type Selector */}
                                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('Nasional')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            data.journal_type === 'Nasional'
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Jurnal Nasional
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('Internasional')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            data.journal_type === 'Internasional'
                                                ? 'bg-purple-600 text-white shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Jurnal Internasional
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('Prosiding')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            data.journal_type === 'Prosiding'
                                                ? 'bg-amber-600 text-white shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Prosiding Seminar
                                    </button>
                                </div>
                            </div>

                            {/* Judul */}
                            <div>
                                <label className="block text-xs font-extrabold text-slate-900 mb-2">
                                    {data.journal_type === 'Prosiding'
                                        ? 'Judul Prosiding / Tema Konferensi'
                                        : 'Judul Jurnal Ilmiah'}{' '}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    required
                                />
                                {errors.title && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.title}</p>}
                            </div>

                            {/* Program Studi, Penerbit & Tahun */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-extrabold text-slate-900">
                                        Program Studi Pengelola <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.prodi}
                                        onChange={(e) => setData('prodi', e.target.value)}
                                        className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    >
                                        {prodiList.map((p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.prodi && <p className="text-rose-500 text-xs mt-1">{errors.prodi}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-extrabold text-slate-900">
                                        Penerbit / Lembaga Penyelenggara <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.publisher}
                                        onChange={(e) => setData('publisher', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    />
                                    {errors.publisher && <p className="text-rose-500 text-xs mt-1">{errors.publisher}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-extrabold text-slate-900">
                                        Tahun Pelaksanaan / Terbit
                                    </label>
                                    <input
                                        type="number"
                                        min="1990"
                                        max={new Date().getFullYear() + 1}
                                        value={data.publish_year || ''}
                                        onChange={(e) => setData('publish_year', e.target.value)}
                                        placeholder="2024"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Link Akses Jurnal (URL) */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-extrabold text-slate-900">
                                    Link Akses Publikasi (URL Portal / OJS / Repositori) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="url"
                                        value={data.access_url}
                                        onChange={(e) => setData('access_url', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                {errors.access_url && <p className="text-rose-500 text-xs mt-1">{errors.access_url}</p>}
                            </div>

                            {/* Deskripsi & Fokus Ruang Lingkup */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                <label className="block text-xs font-extrabold text-slate-900">
                                    Fokus & Ruang Lingkup (Scope)
                                </label>
                                <textarea
                                    rows="4"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan cakupan topik makalah seminar atau artikel jurnal ilmiah..."
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Akreditasi & Legalitas (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm space-y-5">
                            <h2 className="font-black text-sm text-slate-950 pb-3 border-b border-slate-100 flex items-center justify-between">
                                <span>
                                    {data.journal_type === 'Prosiding'
                                        ? 'Detail Prosiding'
                                        : data.journal_type === 'Internasional'
                                        ? 'Indeksasi Internasional'
                                        : 'Akreditasi SINTA'}
                                </span>
                                <Award className="w-4 h-4 text-emerald-600" />
                            </h2>

                            {/* Tingkat Akreditasi / Indeksasi (Khusus Jurnal) */}
                            {data.journal_type !== 'Prosiding' && (
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-extrabold text-slate-900">
                                        {data.journal_type === 'Internasional'
                                            ? 'Lembaga Pengindeks Global'
                                            : 'Peringkat SINTA'}{' '}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.sinta}
                                        onChange={(e) => setData('sinta', e.target.value)}
                                        className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    >
                                        {activeIndexings.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* ISSN Cetak */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    ISSN / ISBN Cetak
                                </label>
                                <input
                                    type="text"
                                    value={data.issn}
                                    onChange={(e) => setData('issn', e.target.value)}
                                    placeholder="2086-2628"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>

                            {/* e-ISSN Elektronik */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    e-ISSN Elektronik (Online)
                                </label>
                                <input
                                    type="text"
                                    value={data.e_issn}
                                    onChange={(e) => setData('e_issn', e.target.value)}
                                    placeholder="2541-5476"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>

                            {/* Frekuensi Terbit */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Frekuensi Terbitan / Seri
                                </label>
                                <input
                                    type="text"
                                    value={data.frequency}
                                    onChange={(e) => setData('frequency', e.target.value)}
                                    placeholder="Contoh: Tahunan (Annual) / 2 Kali Setahun"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>

                            {/* DOI Prefix */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    DOI Prefix (Crossref)
                                </label>
                                <input
                                    type="text"
                                    value={data.doi_prefix}
                                    onChange={(e) => setData('doi_prefix', e.target.value)}
                                    placeholder="10.47701/..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>

                            {/* Status Aktif Switch */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between pt-3">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-extrabold text-slate-900 block flex items-center space-x-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Status Terbit Aktif</span>
                                    </span>
                                    <span className="text-[10px] text-slate-500">Tampilkan di direktori aktif.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </PetugasLayout>
    );
}
