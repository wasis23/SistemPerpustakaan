import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Plus, Search, Filter, Edit, Trash2, CheckCircle2, AlertCircle, Tag, BookOpen } from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Index({ categories, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        description: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/petugas/categories', { search }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        router.get('/petugas/categories', {}, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setData({
            code: category.code,
            name: category.name,
            description: category.description || '',
        });
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/petugas/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post('/petugas/categories', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kategori DDC "${name}"?`)) {
            router.delete(`/petugas/categories/${id}`);
        }
    };

    return (
        <PetugasLayout activeMenu="categories">
            <Head title="Manajemen Kategori DDC - Petugas" />

            <div className="space-y-6 w-full">
                {/* Header Title & Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Manajemen Kategori DDC</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Pengelolaan sistem klasifikasi Dewey Decimal Classification (DDC) koleksi perpustakaan</p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow transition-all flex items-center space-x-1.5 shrink-0"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Tambah Kategori DDC</span>
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
                    <form onSubmit={handleFilter} className="flex gap-3">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Kode DDC, Nama Klasifikasi, atau Deskripsi..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                        </div>

                        <button
                            type="submit"
                            className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1 shadow shrink-0"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Cari</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="py-2.5 px-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-xs font-bold shrink-0"
                        >
                            Reset
                        </button>
                    </form>
                </div>

                {/* Category Table / Cards */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Kode DDC</th>
                                    <th className="px-6 py-4">Nama Klasifikasi DDC</th>
                                    <th className="px-6 py-4">Jumlah Koleksi Buku</th>
                                    <th className="px-6 py-4">Deskripsi</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                {categories.data && categories.data.length > 0 ? (
                                    categories.data.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-xl text-xs">
                                                    {cat.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-950">
                                                {cat.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center space-x-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                                                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>{cat.books_count || 0} Judul</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                                                {cat.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(cat)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center space-x-1"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(cat.id, cat.name)}
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
                                            Belum ada data kategori DDC terdaftar.
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
                                    {editingCategory ? 'Edit Kategori DDC' : 'Tambah Kategori DDC Baru'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Klasifikasi Dewey Decimal Classification (DDC)</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Kode DDC <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="Contoh: 000, 004, 600, 610, dsb."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {errors.code && <p className="text-xs text-rose-600 font-bold mt-1">{errors.code}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Nama Klasifikasi Kategori <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Ilmu Komputer & Sains, Kebidanan, Farmasi, dsb."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-rose-600 font-bold mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                                        Deskripsi Kategori (Opsional)
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        placeholder="Keterangan cakupan disiplin ilmu atau bidang studi..."
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
                                        {processing ? 'Memproses...' : (editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori')}
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
