<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Tampilkan Daftar Kategori DDC & Form Manajemen
     */
    public function index(Request $request): Response
    {
        $query = Category::withCount('books');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        $categories = $query->orderBy('code', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('Petugas/Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Simpan Kategori DDC Baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20', 'unique:categories,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ], [
            'code.required' => 'Kode DDC wajib diisi.',
            'code.unique' => 'Kode DDC tersebut sudah terdaftar.',
            'name.required' => 'Nama klasifikasi DDC wajib diisi.',
        ]);

        Category::create($validated);

        return back()->with('success', 'Kategori DDC baru berhasil ditambahkan!');
    }

    /**
     * Update Kategori DDC
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20', 'unique:categories,code,' . $category->id],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ], [
            'code.required' => 'Kode DDC wajib diisi.',
            'code.unique' => 'Kode DDC tersebut sudah digunakan.',
            'name.required' => 'Nama klasifikasi DDC wajib diisi.',
        ]);

        $category->update($validated);

        return back()->with('success', 'Data Kategori DDC berhasil diperbarui!');
    }

    /**
     * Hapus Kategori DDC
     */
    public function destroy(Category $category)
    {
        if ($category->books()->count() > 0) {
            return back()->with('error', 'Kategori DDC tidak dapat dihapus karena masih digunakan oleh koleksi buku.');
        }

        $category->delete();

        return back()->with('success', 'Kategori DDC berhasil dihapus.');
    }
}
