import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    UserCog, 
    Lock, 
    Mail, 
    Phone, 
    User, 
    CheckCircle2, 
    AlertCircle, 
    KeyRound, 
    Calendar,
    Save,
    GraduationCap,
    Shield
} from 'lucide-react';
import AnggotaLayout from '@/Layouts/AnggotaLayout';

export default function Edit({ user, prodiList }) {
    const { flash } = usePage().props;

    // Form Update Data Diri Anggota
    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        prodi: user.prodi || '',
        phone: user.phone || '',
    });

    // Form Ganti Password Anggota
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.patch('/anggota/profile', {
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put('/anggota/profile/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    return (
        <AnggotaLayout activeMenu="profile">
            <Head title="Pengaturan Profil & Password Saya" />

            <div className="space-y-6 w-full">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                            <UserCog className="w-7 h-7 stroke-[2.5]" />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-slate-950 text-xl sm:text-2xl tracking-tight">
                                Profil & Pengaturan Akun Saya
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Perbarui data diri, nomor kontak, program studi, dan ganti kata sandi login Anda
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl">
                        <GraduationCap className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-slate-700 font-mono">
                            NIM/NIDN: <span className="text-amber-800 font-black">{user.username}</span>
                        </span>
                    </div>
                </div>

                {/* Flash Message */}
                {flash.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2.5 shadow-sm animate-fade-in">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form Ubah Data Diri */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
                                <User className="w-5 h-5 text-amber-600" />
                                <h2 className="font-extrabold text-base text-slate-950">
                                    Informasi Data Diri
                                </h2>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        NIM / NIDN (Username Login)
                                    </label>
                                    <input
                                        type="text"
                                        value={user.username}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                        Nomor identitas akademik Anda bersifat tetap.
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Nama Lengkap <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        placeholder="Nama lengkap sesuai data akademik"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {profileForm.errors.name && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">
                                            {profileForm.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Program Studi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={profileForm.data.prodi}
                                        onChange={(e) => profileForm.setData('prodi', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        required
                                    >
                                        <option value="">-- Pilih Program Studi --</option>
                                        {prodiList && prodiList.map((p, idx) => (
                                            <option key={idx} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    {profileForm.errors.prodi && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">
                                            {profileForm.errors.prodi}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        No. WhatsApp / Telepon Aktif
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.data.phone}
                                        onChange={(e) => profileForm.setData('phone', e.target.value)}
                                        placeholder="Contoh: 081234567890"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                    />
                                    {profileForm.errors.phone && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">
                                            {profileForm.errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Alamat Email (Opsional)
                                    </label>
                                    <input
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={(e) => profileForm.setData('email', e.target.value)}
                                        placeholder="nama@student.indonusa.ac.id"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                    />
                                    {profileForm.errors.email && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">
                                            {profileForm.errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={profileForm.processing}
                                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan Data Diri'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Form Ganti Password */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
                                <KeyRound className="w-5 h-5 text-amber-600" />
                                <h2 className="font-extrabold text-base text-slate-950">
                                    Ganti Kata Sandi (Password)
                                </h2>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Password Saat Ini <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        placeholder="Masukkan password lama Anda saat ini"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {passwordForm.errors.current_password && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">
                                            {passwordForm.errors.current_password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Password Baru <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {passwordForm.errors.password && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">
                                            {passwordForm.errors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Ulangi Konfirmasi Password Baru <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Ketik ulang password baru Anda"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    {passwordForm.errors.password_confirmation && (
                                        <p className="text-rose-600 text-[10px] font-bold mt-1">
                                            {passwordForm.errors.password_confirmation}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                                    >
                                        <Lock className="w-4 h-4 text-amber-400" />
                                        <span>{passwordForm.processing ? 'Memperbarui...' : 'Perbarui Kata Sandi Saya'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AnggotaLayout>
    );
}
