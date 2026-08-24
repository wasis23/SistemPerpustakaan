import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { 
    Plus, 
    Search, 
    Filter, 
    ExternalLink, 
    Edit, 
    Trash2, 
    CheckCircle2, 
    AlertCircle, 
    Sparkles, 
    Library, 
    MapPin, 
    Compass 
} from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Index({ laboratories, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [locationFilter, setLocationFilter] = useState(filters.location || '');
    const [showModal, setShowModal] = useState(false);
    const [editingLab, setEditingLab] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        location: 'Kampus 1',
        link_360: '',
        description: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/petugas/laboratories', { search, location: locationFilter }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        setLocationFilter('');
        router.get('/petugas/laboratories', {}, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingLab(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (lab) => {
        setEditingLab(lab);
        setData({
            name: lab.name,
            location: lab.location,
            link_360: lab.link_360,
            description: lab.description || '',
        });
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingLab) {
            put(`/petugas/laboratories/${editingLab.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post('/petugas/laboratories', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus perpustakaan "${name}"?`)) {
            router.delete(`/petugas/laboratories/${id}`);
        }
    };

    return (
        <PetugasLayout activeMenu="laboratories">
            <Head title="Manajemen Perpustakaan 360° - Petugas" />

            <div className="space-y-6 w-full">
                {/* Header Title & Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Manajemen Perpustakaan Virtual 360°</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Pengelolaan fasilitas ruang perpustakaan Kampus 1 & Kampus 2 beserta link tur 360 derajat</p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5 shrink-0"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Tambah Perpustakaan</span>
                    </button>
                </div>

                {/* Flash Message */}
                {flash.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Filter Control Bar */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Nama Perpustakaan / Ruang Baca..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <div className="sm:col-span-4">
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            >
                                <option value="">Semua Lokasi Kampus</option>
                                <option value="Kampus 1">Kampus 1</option>
                                <option value="Kampus 2">Kampus 2</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2 flex space-x-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1 shadow"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="py-2.5 px-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-xs font-bold"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Library Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {laboratories.data && laboratories.data.length > 0 ? (
                        laboratories.data.map((lab) => (
                            <div key={lab.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                                            <Library className="w-6 h-6" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                            lab.location === 'Kampus 1' 
                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                            📍 {lab.location}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-extrabold text-slate-950 text-base">{lab.name}</h3>
                                        {lab.description && (
                                            <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">{lab.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <a
                                        href={lab.link_360}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 rounded-2xl text-xs font-bold text-center flex items-center justify-center space-x-1.5 shadow transition-all"
                                    >
                                        <Compass className="w-4 h-4 text-amber-400" />
                                        <span>Buka Virtual Tour 360°</span>
                                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                                    </a>

                                    <div className="flex items-center justify-end space-x-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(lab)}
                                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(lab.id, lab.name)}
                                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Hapus</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200/80 font-medium space-y-2">
                            <Library className="w-10 h-10 text-slate-300 mx-auto" />
                            <p>Belum ada data perpustakaan 360° terdaftar.</p>
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="text-xs font-bold text-amber-700 hover:underline"
                            >
                                + Tambah Perpustakaan Pertama
                            </button>
                        </div>
                    )}
                </div>

                {/* Create / Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-900/10 shadow-2xl space-y-6">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-950">
                                    {editingLab ? 'Edit Data Perpustakaan' : 'Tambah Perpustakaan 360° Baru'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Isi seluruh inputan wajib berikut (*)</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Input 1: Nama Perpustakaan (Wajib) */}
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Nama Perpustakaan / Ruang Baca <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Perpustakaan Utama Kampus 1"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-rose-600 font-bold mt-1">{errors.name}</p>}
                                </div>

                                {/* Input 2: Lokasi Perpustakaan (Wajib: Kampus 1 / Kampus 2) */}
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Lokasi Kampus <span className="text-rose-600">*</span>
                                    </label>
                                    <select
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                        required
                                    >
                                        <option value="Kampus 1">Kampus 1</option>
                                        <option value="Kampus 2">Kampus 2</option>
                                    </select>
                                    {errors.location && <p className="text-xs text-rose-600 font-bold mt-1">{errors.location}</p>}
                                </div>

                                {/* Input 3: Link 360 Virtual Tour (Wajib) */}
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Link 360 Virtual Tour / Peta <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={data.link_360}
                                        onChange={(e) => setData('link_360', e.target.value)}
                                        placeholder="https://my.matterport.com/show/?m=example atau https://..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs font-mono focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {errors.link_360 && <p className="text-xs text-rose-600 font-bold mt-1">{errors.link_360}</p>}
                                </div>

                                {/* Input 4: Deskripsi (Opsional) */}
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Deskripsi / Fasilitas (Opsional)
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        placeholder="Catatan tambahan seperti jam operasional, area diskusi, fasilitas AC, dsb."
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
                                        {processing ? 'Memproses...' : (editingLab ? 'Simpan Perubahan' : 'Tambah Perpustakaan')}
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
