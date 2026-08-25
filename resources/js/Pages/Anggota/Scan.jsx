import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    QrCode, 
    AlertCircle, 
    ArrowLeft, 
    CheckCircle2, 
    Sparkles, 
    Camera, 
    CameraOff, 
    RefreshCw, 
    Clock, 
    ExternalLink,
    BookOpen
} from 'lucide-react';
import AnggotaLayout from '@/Layouts/AnggotaLayout';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function Scan({ activeTicket, error }) {
    const [scannerActive, setScannerActive] = useState(false);
    const [cameraLoading, setCameraLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState(null);
    const [lastScannedCode, setLastScannedCode] = useState(null);
    
    const scannerRef = useRef(null);
    const scannerRunningRef = useRef(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        copy_code: '',
        barcode_hash: '',
    });

    const currentError = error || errors.copy_code || errors.barcode_hash || cameraError;

    // Inisialisasi daftar kamera perangkat
    useEffect(() => {
        let isMounted = true;

        const getCameras = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (isMounted && devices && devices.length > 0) {
                    setCameras(devices);
                    // Pilih kamera belakang (environment) jika tersedia
                    const backCam = devices.find(d => 
                        d.label.toLowerCase().includes('back') || 
                        d.label.toLowerCase().includes('belakang') ||
                        d.label.toLowerCase().includes('rear') ||
                        d.label.toLowerCase().includes('environment')
                    );
                    setSelectedCameraId(backCam ? backCam.id : devices[0].id);
                }
            } catch (err) {
                console.warn('Gagal membaca daftar kamera:', err);
            }
        };

        getCameras();

        return () => {
            isMounted = false;
            stopScanner();
        };
    }, []);

    // Stop scanner helper
    const stopScanner = async () => {
        if (scannerRef.current && scannerRunningRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRunningRef.current = false;
                scannerRef.current.clear();
            } catch (err) {
                console.warn('Error saat menghentikan scanner:', err);
            }
        }
        setScannerActive(false);
        setCameraLoading(false);
    };

    // Start scanner helper
    const startScanner = async (cameraId = null) => {
        setCameraError(null);
        setCameraLoading(true);

        try {
            await stopScanner();

            const formatsToSupport = [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
            ];

            const html5QrCode = new Html5Qrcode("interactive-scanner-box", { 
                formatsToSupport,
                verbose: false 
            });
            scannerRef.current = html5QrCode;

            const config = {
                fps: 15,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxSize = Math.floor(minEdge * 0.75);
                    return {
                        width: Math.max(qrboxSize, 220),
                        height: Math.max(Math.floor(qrboxSize * 0.65), 180),
                    };
                },
                aspectRatio: 1.777778, // 16:9 widescreen
            };

            const cameraConfig = cameraId ? { deviceId: { exact: cameraId } } : { facingMode: "environment" };

            await html5QrCode.start(
                cameraConfig,
                config,
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                () => {
                    // Frame scan skip (abaikan frame tanpa barcode)
                }
            );

            scannerRunningRef.current = true;
            setScannerActive(true);
            setCameraLoading(false);

            // Re-fetch cameras jika label sebelumnya kosong
            try {
                const refreshedDevices = await Html5Qrcode.getCameras();
                if (refreshedDevices && refreshedDevices.length > 0) {
                    setCameras(refreshedDevices);
                }
            } catch (e) {}

        } catch (err) {
            console.error('Kamera gagal dimulai:', err);
            setScannerActive(false);
            setCameraLoading(false);
            scannerRunningRef.current = false;
            setCameraError(
                err.name === 'NotAllowedError'
                    ? 'Izin kamera ditolak. Silakan izinkan akses kamera pada browser Anda untuk memindai barcode.'
                    : 'Gagal menghubungkan ke kamera perangkat. Pastikan kamera tidak sedang dipakai aplikasi lain atau gunakan input manual di bawah.'
            );
        }
    };

    // Handler ketika barcode/QR berhasil dibaca kamera
    const handleScanSuccess = async (decodedText) => {
        const cleaned = decodedText.trim();
        if (!cleaned || processing || lastScannedCode === cleaned) return;

        setLastScannedCode(cleaned);
        setData({
            copy_code: cleaned,
            barcode_hash: cleaned,
        });

        // Hentikan pemindaian agar tidak ter-trigger berulang kali
        await stopScanner();

        // Otomatis kirim formulir ke endpoint POST /anggota/ticket
        router.post('/anggota/ticket', {
            barcode_hash: cleaned,
            copy_code: cleaned,
        }, {
            onError: () => {
                setLastScannedCode(null);
            },
        });
    };

    // Handler form input manual
    const handleSubmit = (e) => {
        e.preventDefault();
        const code = data.copy_code.trim();
        if (!code) return;

        post('/anggota/ticket', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setLastScannedCode(null);
            },
        });
    };

    return (
        <AnggotaLayout activeMenu="scan">
            <Head title="Scan Barcode Rak Fisik - Anggota" />

            <div className="max-w-3xl mx-auto space-y-6 w-full">
                {/* Header Title Card */}
                <div className="flex items-center space-x-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <Link 
                        href="/anggota/dashboard" 
                        className="p-2.5 text-slate-600 hover:text-amber-700 bg-slate-50 border border-slate-200 rounded-2xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-extrabold text-slate-950 text-xl tracking-tight">Scan Barcode Buku di Rak</h1>
                        <p className="text-xs text-slate-500 font-medium">Buat tiket penahanan stok mandiri 5 menit dari HP Anda</p>
                    </div>
                </div>

                {/* Banner Jika Anggota Sudah Memiliki Tiket Aktif Berjalan */}
                {activeTicket && (
                    <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-6 shadow-md space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                                    <Clock className="w-5 h-5 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-950">Anda Memiliki Tiket Aktif Berjalan!</h3>
                                    <p className="text-xs text-amber-900 font-mono font-bold">{activeTicket.ticket_code}</p>
                                </div>
                            </div>

                            <Link
                                href={`/anggota/ticket/${activeTicket.id}`}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
                            >
                                <span>Buka Tiket</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="text-xs text-slate-700 bg-white/80 p-3 rounded-2xl border border-amber-200/60 flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                            <span className="truncate font-semibold">{activeTicket.book_copy?.book?.title}</span>
                        </div>
                    </div>
                )}

                {/* Main Interactive Scanner Container */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                    {/* Instructions Banner */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-900 leading-relaxed font-medium">
                            <p className="font-bold">Panduan Pemindaian Stiker Rak:</p>
                            <p className="mt-0.5">
                                Klik tombol <strong>Nyalakan Kamera</strong> lalu arahkan kamera ke stiker barcode fisik / QR Code di buku, atau ketikkan Kode Eksemplar secara manual.
                            </p>
                        </div>
                    </div>

                    {/* Alert Errors */}
                    {currentError && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center space-x-3 text-rose-800 text-xs font-bold shadow-sm">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>{currentError}</span>
                        </div>
                    )}

                    {/* Camera Scanner Container */}
                    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border-4 border-amber-500/30 shadow-inner flex flex-col items-center justify-center min-h-[300px] text-white">
                        {/* Target DOM Element for Html5Qrcode */}
                        <div 
                            id="interactive-scanner-box" 
                            className={`w-full ${scannerActive ? 'block' : 'hidden'}`}
                            style={{ minHeight: '300px' }}
                        />

                        {/* Standby / Placeholder Screen when Camera is Stopped */}
                        {!scannerActive && (
                            <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center">
                                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
                                    <QrCode className="w-10 h-10 text-amber-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-extrabold text-sm text-slate-100">Kamera Scanner Siap Digunakan</p>
                                    <p className="text-xs text-slate-400 max-w-xs">
                                        Izinkan akses kamera untuk mendeteksi stiker barcode buku secara otomatis
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => startScanner(selectedCameraId)}
                                    disabled={cameraLoading || processing}
                                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>{cameraLoading ? 'Menghubungkan Kamera...' : 'Nyalakan Kamera Scanner'}</span>
                                </button>
                            </div>
                        )}

                        {/* Scanner Overlay Controls when Active */}
                        {scannerActive && (
                            <div className="w-full bg-slate-900/90 border-t border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2 z-20">
                                <div className="flex items-center space-x-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                                    <span className="text-[11px] font-bold text-emerald-400 font-mono">SCANNER LIVE</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {cameras.length > 1 && (
                                        <select
                                            value={selectedCameraId || ''}
                                            onChange={(e) => {
                                                setSelectedCameraId(e.target.value);
                                                startScanner(e.target.value);
                                            }}
                                            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                                        >
                                            {cameras.map((cam, idx) => (
                                                <option key={cam.id} value={cam.id}>
                                                    {cam.label || `Kamera ${idx + 1}`}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    <button
                                        type="button"
                                        onClick={stopScanner}
                                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                                    >
                                        <CameraOff className="w-3.5 h-3.5" />
                                        <span>Matikan</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Fallback Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div>
                            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                                Atau Input Manual Kode Eksemplar / Barcode:
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={data.copy_code}
                                    onChange={(e) => {
                                        setData({
                                            copy_code: e.target.value,
                                            barcode_hash: e.target.value,
                                        });
                                    }}
                                    placeholder="Contoh: BK-IT-001-A atau BC-GMNR8YM5"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                        >
                            <QrCode className="w-4 h-4 stroke-[2.5]" />
                            <span>{processing ? 'Memproses Poin Barcode...' : 'Proses Tiket Pinjam Mandiri'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </AnggotaLayout>
    );
}
