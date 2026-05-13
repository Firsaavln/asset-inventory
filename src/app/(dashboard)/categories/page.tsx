export const dynamic = "force-dynamic";

import { prisma } from "../../../lib/prisma"; // Sesuaikan path ini dengan letak prisma lu
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { 
  Plus, 
  FolderTree, 
  BriefcaseBusiness, 
  Pencil, 
  Server,
  LayoutGrid,
  ShieldCheck, // Tambahan Icon untuk divisi HR
  Wallet       // Tambahan Icon untuk divisi Finance
} from "lucide-react";
import DeleteCategoryButton from "@/components/DeleteCategoryButton"; // Sesuaikan path import
import ExportCategoryButton from "@/components/ExportCategoryButton"; // Tambahan tombol Export Excel
import { MANAGING_DIVISIONS } from "@/lib/constants"; // Mengambil label divisi secara dinamis

// --- SERVER ACTION: FUNGSI HAPUS KE DATABASE ---
// (Tetap dipertahankan sesuai request lu)
async function deleteCategory(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  
  if (id) {
    try {
      await prisma.category.delete({ 
        where: { id: Number(id) } 
      });
      revalidatePath("/categories"); // Refresh data tabel otomatis
    } catch (error) {
      console.error("Gagal menghapus kategori (mungkin masih ada aset yang terikat):", error);
    }
  }
}

export default async function CategoriesPage() {
  // Menarik data langsung dari MySQL
  const categories = await prisma.category.findMany({
    orderBy: { created_at: "desc" },
  });

  // HELPER BARU: Mengatur icon dan warna dinamis untuk setiap divisi tanpa default ke GA
  const getDeptStyles = (deptId: string) => {
    // Cari nama label yang sesungguhnya di constants.ts
    const realLabel = MANAGING_DIVISIONS.find(d => d.id === deptId)?.label || deptId;
    
    switch (deptId) {
      case 'IT': return { color: 'bg-blue-50 text-blue-700 border-blue-200/60', icon: <Server className="w-3.5 h-3.5" />, label: realLabel };
      case 'GA': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', icon: <BriefcaseBusiness className="w-3.5 h-3.5" />, label: realLabel };
      case 'HR': return { color: 'bg-purple-50 text-purple-700 border-purple-200/60', icon: <ShieldCheck className="w-3.5 h-3.5" />, label: realLabel };
      case 'FINANCE': return { color: 'bg-amber-50 text-amber-700 border-amber-200/60', icon: <Wallet className="w-3.5 h-3.5" />, label: realLabel };
      default: return { color: 'bg-slate-50 text-slate-700 border-slate-200/60', icon: <FolderTree className="w-3.5 h-3.5" />, label: realLabel };
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Ornamen Background */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-2xl -z-10"></div>
        
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 hidden sm:block">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Kategori Aset</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-indigo-400" />
              Kelola klasifikasi dan wewenang departemen.
            </p>
          </div>
        </div>

        {/* TOMBOL AKSI: EXPORT & KATEGORI BARU */}
        <div className="flex items-center gap-3">
          <ExportCategoryButton />
          
          <Link 
            href="/categories/add" 
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:shadow-indigo-200 transition-all duration-300 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Kategori Baru
          </Link>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Nama Kategori</th>
                <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Divisi Pengelola</th>
                <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Tgl. Dibuat</th>
                <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => {
                const style = getDeptStyles(cat.owner_dept);

                return (
                <tr key={cat.id} className="hover:bg-indigo-50/30 transition-colors group">
                  
                  {/* KOLOM 1: NAMA KATEGORI */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{cat.category_name}</span>
                    </div>
                  </td>

                  {/* KOLOM 2: DEPARTEMEN PENGELOLA (BUG FIX: Dinamis) */}
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${style.color}`}>
                      {style.icon} {style.label}
                    </span>
                  </td>

                  {/* KOLOM 3: TANGGAL */}
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">
                    {cat.created_at.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                 {/* KOLOM 4: AKSI (EDIT & DELETE) */}
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      
                      {/* TOMBOL EDIT */}
                      <Link 
                        href={`/categories/${cat.id}/edit`}
                        className="p-2.5 text-indigo-500 bg-indigo-50 hover:text-white hover:bg-indigo-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-indigo-200 active:scale-95"
                        title="Edit Kategori"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>

                      {/* TOMBOL HAPUS (Kini pakai komponen yang langsung nembak action.ts) */}
                      <DeleteCategoryButton 
                        id={cat.id} 
                        categoryName={cat.category_name} 
                      />

                    </div>
                  </td>
                </tr>
              )})}

              {/* JIKA DATA KOSONG (EMPTY STATE) */}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <FolderTree className="w-10 h-10 text-indigo-300" />
                      </div>
                      <p className="text-slate-900 font-bold text-xl mb-1">Kategori Masih Kosong</p>
                      <p className="text-slate-500 font-medium text-sm mb-6">Belum ada kategori yang ditambahkan. Silakan buat kategori pertama Anda untuk mulai mengelola aset.</p>
                      <Link 
                        href="/categories/add" 
                        className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-6 py-3 rounded-xl font-bold transition-all"
                      >
                        <Plus className="w-4 h-4" /> Buat Kategori Pertama
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}