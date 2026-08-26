import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { 
    Users, 
    UserCheck, 
    UserPlus, 
    Search, 
    Filter, 
    KeyRound, 
    Edit, 
    Trash2, 
    CheckCircle2, 
    AlertCircle, 
    X, 
    Shield, 
    BookOpen, 
    Phone, 
    Mail, 
    GraduationCap,
    Lock,
    Save,
    RefreshCw
} from 'lucide-react';
import PetugasLayout from '@/Layouts/PetugasLayout';

export default function Index({ members, prodiList, filters, stats }) {
    const { flash } = usePage().props;

    // Search & Filter State
    const [search, setSearch] = useState(filters.search || '');
    const [prodi, setProdi] = useState(filters.prodi || '');
    const [status, setStatus] = useState(filters.status || '');

    // Modals State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editMember, setEditMember] = useState(null);
    const [passwordMember, setPasswordMember] = useState(null);

    // Form Tambah Anggota
    const createForm = useForm({
        username: '',
        name: '',
        email: '',
        password: '',
        prodi: 'Anggota External',
        phone: '',
        status: 'active',
    });

    // Form Edit Anggota
    const editForm = useForm({
        username: '',
        name: '',
        email: '',
        prodi: '',
        phone: '',
        status: 'active',
    });

    // Form Ganti Password Anggota
    const passwordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/petugas/members', { search, prodi, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setProdi('');
        setStatus('');
        router.get('/petugas/members', {}, { preserveState: true });
    };

    // Open Edit Modal
    const openEditModal = (member) => {
        setEditMember(member);
        editForm.setData({
            username: member.username || '',
            name: member.name || '',
            email: member.email || '',
            prodi: member.prodi || '',
            phone: member.phone || '',
            status: member.status || 'active',
        });
    };

    // Open Password Reset Modal
    const openPasswordModal = (member) => {
        setPasswordMember(member);
        passwordForm.reset();
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/petugas/members', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editMember) return;
        editForm.put(`/petugas/members/${editMember.id}`, {
            onSuccess: () => {
                setEditMember(null);
            },
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!passwordMember) return;
        passwordForm.put(`/petugas/members/${passwordMember.id}/password`, {
            onSuccess: () => {
                setPasswordMember(null);
                passwordForm.reset();
            },
        });
    };

    const handleDelete = (member) => {
        if (member.active_borrowings_count > 0) {
            alert(`Tidak dapat menghapus ${member.name} karena masih memiliki buku yang sedang dipinjam.`);
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menghapus akun anggota ${member.name} (${member.username})?`)) {
            router.delete(`/petugas/members/${member.id}`);
        }
    };

    return (
        <PetugasLayout activeMenu="members">
            <Head title="Manajemen Anggota Perpustakaan - Petugas" />

            <div className="space-y-6 w-full">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                                <UserCheck className="w-5 h-5 stroke-[2.5]" />
                            </span>
                            <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">
                                Data Anggota Perpustakaan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Manajemen akun mahasiswa & dosen, registrasi anggota baru, dan kelola kata sandi
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center space-x-2 self-start sm:self-center cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4 stroke-[2.5]" />
                        <span>+ Tambah Anggota Baru</span>
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

                {/* 4 Stat Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Anggota</span>
                            <p className="text-3xl font-black text-slate-950 mt-1">{stats.total_members}</p>
                            <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">Mahasiswa & Dosen</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            <Users className="w-6 h-6 stroke-[2.5]" />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Anggota Aktif</span>
                            <p className="text-3xl font-black text-emerald-700 mt-1">{stats.active_members}</p>
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
                                Terverifikasi
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <UserCheck className="w-6 h-6 stroke-[2.5]" />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Sedang Meminjam</span>
                            <p className="text-3xl font-black text-amber-800 mt-1">{stats.borrowing_now}</p>
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
                                Membawa Buku
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            <BookOpen className="w-6 h-6 stroke-[2.5]" />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Akun Ditangguhkan</span>
                            <p className="text-3xl font-black text-rose-600 mt-1">{stats.suspended_members}</p>
                            <span className="text-[10px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
                                Suspended
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                            <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari NIM/NIDN, Nama Anggota, Email, atau No HP..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={prodi}
                                onChange={(e) => setProdi(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                            >
                                <option value="">Semua Program Studi</option>
                                {prodiList && prodiList.map((p, idx) => (
                                    <option key={idx} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="suspended">Ditangguhkan</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2 flex space-x-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow flex items-center justify-center space-x-1 transition-all cursor-pointer"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter</span>
                            </button>
                            {(search || prodi || status) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-xs transition-all cursor-pointer"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Table Data Anggota */}
                <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
                                <tr>
                                    <th className="px-6 py-4">NIM / NIDN</th>
                                    <th className="px-6 py-4">Nama Lengkap & Kontak</th>
                                    <th className="px-6 py-4">Program Studi</th>
                                    <th className="px-6 py-4 text-center">Pinjaman Aktif</th>
                                    <th className="px-6 py-4 text-center">Status Akun</th>
                                    <th className="px-6 py-4 text-right">Aksi Kelola</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {members.data && members.data.length > 0 ? (
                                    members.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                                            <td className="px-6 py-4 font-mono font-bold text-amber-800 whitespace-nowrap align-top">
                                                <span className="px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200">
                                                    {item.username}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-slate-950 text-xs">{item.name}</p>
                                                        <p className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                                                            <Mail className="w-3 h-3 text-slate-400" />
                                                            <span>{item.email || '-'}</span>
                                                            {item.phone && (
                                                                <>
                                                                    <span className="text-slate-300">•</span>
                                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                                    <span>{item.phone}</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top whitespace-nowrap">
                                                <span className="font-semibold text-slate-800">
                                                    {item.prodi || 'Umum'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 align-top text-center whitespace-nowrap">
                                                {item.active_borrowings_count > 0 ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center space-x-1">
                                                        <BookOpen className="w-3 h-3" />
                                                        <span>{item.active_borrowings_count} Buku</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-[10px]">0 Buku</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 align-top text-center whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    item.status === 'active'
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                                                }`}>
                                                    {item.status === 'active' ? 'Aktif' : 'Suspended'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openPasswordModal(item)}
                                                        className="p-2 text-slate-600 hover:text-amber-800 hover:bg-amber-100/60 rounded-xl transition-all border border-slate-200 bg-white"
                                                        title="Ganti / Reset Password Anggota"
                                                    >
                                                        <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 bg-white"
                                                        title="Edit Data Diri Anggota"
                                                    >
                                                        <Edit className="w-3.5 h-3.5 text-indigo-600" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        disabled={item.active_borrowings_count > 0}
                                                        className={`p-2 rounded-xl transition-all border ${
                                                            item.active_borrowings_count > 0
                                                                ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50'
                                                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200 bg-white'
                                                        }`}
                                                        title={item.active_borrowings_count > 0 ? 'Sedang meminjam buku' : 'Hapus Anggota'}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            Tidak ditemukan data anggota perpustakaan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {members.links && members.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Menampilkan {members.from || 0} - {members.to || 0} dari {members.total} anggota
                            </span>
                            <div className="flex items-center space-x-1">
                                {members.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            link.active
                                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                                : link.url
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                : 'text-slate-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL 1: Tambah Anggota Baru */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-in">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                                        <UserPlus className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-950">Tambah Anggota Baru</h3>
                                        <p className="text-[11px] text-slate-500">Registrasi akun anggota perpustakaan</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        NIM / NIDN (Username Login) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.username}
                                        onChange={(e) => createForm.setData('username', e.target.value)}
                                        placeholder="Contoh: 202401001"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                                        required
                                    />
                                    {createForm.errors.username && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">{createForm.errors.username}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Nama Lengkap Anggota <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Nama mahasiswa / dosen"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">{createForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WA</label>
                                        <input
                                            type="text"
                                            value={createForm.data.phone}
                                            onChange={(e) => createForm.setData('phone', e.target.value)}
                                            placeholder="081234567890"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        />
                                        {createForm.errors.phone && (
                                            <p className="text-rose-600 text-[10px] font-bold mt-1">{createForm.errors.phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Email (Opsional)</label>
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="anggota@email.com"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        />
                                        {createForm.errors.email && (
                                            <p className="text-rose-600 text-[10px] font-bold mt-1">{createForm.errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
                                        <select
                                            value={createForm.data.status}
                                            onChange={(e) => createForm.setData('status', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        >
                                            <option value="active">Aktif</option>
                                            <option value="suspended">Ditangguhkan</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Password Akun <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={createForm.data.password}
                                            onChange={(e) => createForm.setData('password', e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                            required
                                        />
                                        {createForm.errors.password && (
                                            <p className="text-rose-600 text-[10px] font-bold mt-1">{createForm.errors.password}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-3 flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{createForm.processing ? 'Menyimpan...' : 'Simpan Anggota'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: Edit Data Diri Anggota */}
                {editMember && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-in">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                                        <Edit className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-950">Edit Data Anggota</h3>
                                        <p className="text-[11px] text-slate-500">Perbarui data profil {editMember.name}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditMember(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        NIM / NIDN (Username) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.username}
                                        onChange={(e) => editForm.setData('username', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                                        required
                                    />
                                    {editForm.errors.username && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">{editForm.errors.username}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Nama Lengkap <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">{editForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Program Studi <span className="text-rose-500">*</span></label>
                                        <select
                                            value={editForm.data.prodi}
                                            onChange={(e) => editForm.setData('prodi', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                            required
                                        >
                                            <option value="">-- Pilih Program Studi --</option>
                                            {prodiList && prodiList.map((p, idx) => (
                                                <option key={idx} value={p}>{p}</option>
                                            ))}
                                        </select>
                                        {editForm.errors.prodi && (
                                            <p className="text-rose-600 text-[10px] font-bold mt-1">{editForm.errors.prodi}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WA</label>
                                        <input
                                            type="text"
                                            value={editForm.data.phone}
                                            onChange={(e) => editForm.setData('phone', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        />
                                        {editForm.errors.email && (
                                            <p className="text-rose-600 text-[10px] font-bold mt-1">{editForm.errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
                                        <select
                                            value={editForm.data.status}
                                            onChange={(e) => editForm.setData('status', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        >
                                            <option value="active">Aktif</option>
                                            <option value="suspended">Ditangguhkan</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-3 flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditMember(null)}
                                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 3: Ganti Password Anggota oleh Pustakawan */}
                {passwordMember && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-in">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                                        <KeyRound className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-950">Ganti Password Anggota</h3>
                                        <p className="text-[11px] text-slate-500">Reset kata sandi akun peminjam</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPasswordMember(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                                <p className="font-bold">Informasi Akun Anggota:</p>
                                <p className="font-mono text-[11px]">NIM / NIDN: <strong className="text-amber-950">{passwordMember.username}</strong></p>
                                <p>Nama: <strong>{passwordMember.name}</strong></p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Password Baru Anggota <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        required
                                        autoFocus
                                    />
                                    {passwordForm.errors.password && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">{passwordForm.errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Ulangi Konfirmasi Password Baru <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Ketik ulang password baru"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {passwordForm.errors.password_confirmation && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">{passwordForm.errors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="pt-3 flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setPasswordMember(null)}
                                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                                    >
                                        <Lock className="w-4 h-4 text-amber-400" />
                                        <span>{passwordForm.processing ? 'Menyimpan...' : 'Perbarui Password'}</span>
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
