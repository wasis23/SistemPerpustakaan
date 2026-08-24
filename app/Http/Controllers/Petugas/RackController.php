<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Laboratory;
use App\Models\Rack;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RackController extends Controller
{
    /**
     * Tampilkan Daftar Lokasi Rak Fisik & Form Manajemen
     */
    public function index(Request $request): Response
    {
        $query = Rack::with(['laboratory'])->withCount('books');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code_rack', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('laboratory', function ($labQuery) use ($search) {
                      $labQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('laboratory_id')) {
            $query->where('laboratory_id', $request->laboratory_id);
        }

        $racks = $query->orderBy('code_rack', 'asc')->paginate(10)->withQueryString();
        $laboratories = Laboratory::select('id', 'name', 'location')->orderBy('name', 'asc')->get();

        return Inertia::render('Petugas/Racks/Index', [
            'racks' => $racks,
            'laboratories' => $laboratories,
            'filters' => $request->only(['search', 'laboratory_id']),
        ]);
    }

    /**
     * Simpan Data Rak Fisik Baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'laboratory_id' => ['nullable', 'exists:laboratories,id'],
            'code_rack' => ['required', 'string', 'max:50', 'unique:racks,code_rack'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ], [
            'code_rack.required' => 'Kode rak fisik wajib diisi.',
            'code_rack.unique' => 'Kode rak tersebut sudah terdaftar.',
            'location.required' => 'Lokasi rak (kampus/lantai/ruang) wajib diisi.',
        ]);

        Rack::create($validated);

        return back()->with('success', 'Lokasi Rak Fisik baru berhasil ditambahkan!');
    }

    /**
     * Update Data Rak Fisik
     */
    public function update(Request $request, Rack $rack)
    {
        $validated = $request->validate([
            'laboratory_id' => ['nullable', 'exists:laboratories,id'],
            'code_rack' => ['required', 'string', 'max:50', 'unique:racks,code_rack,' . $rack->id],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ], [
            'code_rack.required' => 'Kode rak fisik wajib diisi.',
            'code_rack.unique' => 'Kode rak tersebut sudah digunakan.',
            'location.required' => 'Lokasi rak wajib diisi.',
        ]);

        $rack->update($validated);

        return back()->with('success', 'Data Lokasi Rak Fisik berhasil diperbarui!');
    }

    /**
     * Hapus Data Rak Fisik
     */
    public function destroy(Rack $rack)
    {
        if ($rack->books()->count() > 0) {
            return back()->with('error', 'Rak fisik tidak dapat dihapus karena masih digunakan oleh koleksi buku.');
        }

        $rack->delete();

        return back()->with('success', 'Lokasi Rak Fisik berhasil dihapus.');
    }
}
