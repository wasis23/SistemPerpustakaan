import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Plus, Search, Filter, Edit, Trash2, CheckCircle2, AlertCircle, MapPin, BookOpen, Library } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Index({ racks, laboratories, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [laboratoryId, setLaboratoryId] = useState(filters.laboratory_id || '');
    const [showModal, setShowModal] = useState(false);
    const [editingRack, setEditingRack] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        laboratory_id: '',
        code_rack: '',
        location: '',
        description: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/petugas/racks', { search, laboratory_id: laboratoryId }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        setLaboratoryId('');
        router.get('/petugas/racks', {}, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingRack(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (rack) => {
        setEditingRack(rack);
        setData({
            laboratory_id: rack.laboratory_id || '',
            code_rack: rack.code_rack,
            location: rack.location,
            description: rack.description || '',
        });
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingRack) {
            put(`/petugas/racks/${editingRack.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post('/petugas/racks', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id, code) => {
        if (confirm(`Apakah Anda yakin ingin menghapus rak "${code}"?`)) {
            router.delete(`/petugas/racks/${id}`);
        }
    };

    return (
        <PetugasLayout activeMenu="racks">
            <Head title="Manajemen Lokasi Rak Fisik - Petugas" />

            <div className="space-y-6 w-full">
                {/* Header Title & Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Manajemen Lokasi Rak Fisik</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Pengelolaan kode rak fisik buku, lokasi perpustakaan, kampus, dan lantai/ruangan</p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5 shrink-0"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Tambah Rak Fisik</span>
                    </button>
                </div>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash.error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2 shadow-sm">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Kode Rak, Lokasi Kampus, atau Nama Perpustakaan..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-4">
                            <select
                                value={laboratoryId}
                                onChange={(e) => setLaboratoryId(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Perpustakaan / Ruang Baca</option>
                                {laboratories.map((lab) => (
                                    <option key={lab.id} value={lab.id}>{lab.name} ({lab.location})</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-3 flex space-x-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1 shadow"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="py-2.5 px-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-xs font-bold"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Rack Table */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Kode Rak Fisik</th>
                                    <th className="px-6 py-4">Perpustakaan / Ruang Baca</th>
                                    <th className="px-6 py-4">Detail Lokasi Rak</th>
                                    <th className="px-6 py-4">Koleksi Buku</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                {racks.data && racks.data.length > 0 ? (
                                    racks.data.map((r) => (
                                        <tr key={r.id} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-xl text-xs">
                                                    {r.code_rack}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {r.laboratory ? (
                                                    <span className="inline-flex items-center space-x-1.5 font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full text-xs">
                                                        <Library className="w-3.5 h-3.5 text-amber-700" />
                                                        <span>{r.laboratory.name}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-medium italic">
                                                        Perpustakaan Utama
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-950">
                                                <span className="flex items-center space-x-1">
                                                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                    <span>{r.location}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center space-x-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                                                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>{r.books_count || 0} Judul</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(r)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center space-x-1"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(r.id, r.code_rack)}
                                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold inline-flex items-center space-x-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Hapus</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                                            Belum ada lokasi rak fisik terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create / Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-900/10 shadow-2xl space-y-6">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-950">
                                    {editingRack ? 'Edit Lokasi Rak Fisik' : 'Tambah Lokasi Rak Fisik Baru'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Penempatan posisi fisik rak dan tracking perpustakaan lokasi</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Perpustakaan / Ruang Baca (Tracking Lokasi)
                                    </label>
                                    <select
                                        value={data.laboratory_id}
                                        onChange={(e) => setData('laboratory_id', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="">-- Pilih Unit Perpustakaan / Ruang Baca --</option>
                                        {laboratories.map((lab) => (
                                            <option key={lab.id} value={lab.id}>
                                                {lab.name} ({lab.location})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.laboratory_id && <p className="text-xs text-rose-600 font-bold mt-1">{errors.laboratory_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Kode Rak Fisik <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code_rack}
                                        onChange={(e) => setData('code_rack', e.target.value)}
                                        placeholder="Contoh: RAK-01, RAK-MEDIS-A, RAK-KOMP-02, dsb."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {errors.code_rack && <p className="text-xs text-rose-600 font-bold mt-1">{errors.code_rack}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Detail Lokasi (Lantai / Ruangan) <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="Contoh: Lantai 2 - Ruang Baca Utama Sudut Barat"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {errors.location && <p className="text-xs text-rose-600 font-bold mt-1">{errors.location}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Keterangan / Catatan Tambahan (Opsional)
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        placeholder="Catatan penempatan rak, kapasitas buku, dsb."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow"
                                    >
                                        {processing ? 'Memproses...' : (editingRack ? 'Simpan Perubahan' : 'Tambah Rak Fisik')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </PetugasLayout>
    );
}
