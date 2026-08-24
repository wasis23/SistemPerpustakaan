<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Laboratory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaboratoryController extends Controller
{
    /**
     * Tampilkan Daftar Laboratorium & Form Manajemen 360°
     */
    public function index(Request $request): Response
    {
        $query = Laboratory::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($request->filled('location')) {
            $query->where('location', $request->location);
        }

        $laboratories = $query->latest('id')->paginate(10)->withQueryString();

        return Inertia::render('Petugas/Laboratorium/Index', [
            'laboratories' => $laboratories,
            'filters' => $request->only(['search', 'location']),
        ]);
    }

    /**
     * Simpan Data Laboratorium Baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'in:Kampus 1,Kampus 2'],
            'link_360' => ['required', 'string', 'url', 'max:1000'],
            'description' => ['nullable', 'string', 'max:1000'],
        ], [
            'name.required' => 'Nama perpustakaan / ruang baca wajib diisi.',
            'location.required' => 'Lokasi perpustakaan wajib dipilih (Kampus 1 atau Kampus 2).',
            'location.in' => 'Lokasi perpustakaan harus berupa Kampus 1 atau Kampus 2.',
            'link_360.required' => 'Link 360 virtual tour wajib diisi.',
            'link_360.url' => 'Link 360 harus berupa alamat URL valid (misal: https://...).',
        ]);

        Laboratory::create($validated);

        return back()->with('success', 'Data perpustakaan 360° berhasil ditambahkan!');
    }

    /**
     * Update Data Laboratorium / Perpustakaan
     */
    public function update(Request $request, Laboratory $laboratory)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'in:Kampus 1,Kampus 2'],
            'link_360' => ['required', 'string', 'url', 'max:1000'],
            'description' => ['nullable', 'string', 'max:1000'],
        ], [
            'name.required' => 'Nama perpustakaan / ruang baca wajib diisi.',
            'location.required' => 'Lokasi perpustakaan wajib dipilih.',
            'link_360.required' => 'Link 360 virtual tour wajib diisi.',
            'link_360.url' => 'Link 360 harus berupa alamat URL valid.',
        ]);

        $laboratory->update($validated);

        return back()->with('success', 'Data perpustakaan berhasil diperbarui!');
    }

    /**
     * Hapus Data Laboratorium / Perpustakaan
     */
    public function destroy(Laboratory $laboratory)
    {
        $laboratory->delete();

        return back()->with('success', 'Perpustakaan berhasil dihapus.');
    }
}
