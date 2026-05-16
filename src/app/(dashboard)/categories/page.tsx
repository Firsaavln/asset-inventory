export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { cookies } from "next/headers"; // 👈 Import cookies untuk session
import { decrypt } from "@/lib/auth";   // 👈 Import decryptor session
import { 
  Plus, 
  FolderTree, 
  BriefcaseBusiness, 
  Pencil, 
  Server,
  LayoutGrid,
  ShieldCheck, 
  Wallet,
  Building2
} from "lucide-react";
import DeleteCategoryButton from "@/components/DeleteCategoryButton"; 
import ExportCategoryButton from "@/components/ExportCategoryButton"; 
import Pagination from "@/components/Pagination"; 
import { MANAGING_DIVISIONS } from "@/lib/constants"; 

// --- SERVER ACTION (Dilengkapi Inline Firewall & Read-Only Protection) ---
async function deleteCategory(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  
  if (id) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("session")?.value;
      const payload = token ? await decrypt(token) : null;
      
      const roleLower = payload?.role?.toLowerCase();
      const isSuperAdmin = roleLower === "superadmin";
      const isReadOnlyUser = roleLower === "user";

      // 🔥 ABSOLUTE FIREWALL: Read-Only User dilarang keras memodifikasi data!
      if (isReadOnlyUser) {
         console.error("Akses Ditolak: Read-Only Role mencoba melakukan bypass penghapusan.");
         return; 
      }

      const existing = await prisma.category.findUnique({ where: { id: Number(id) } });
      
      // 🔥 IDOR FIREWALL SECURITY CHECK: Cegah admin hapus kategori cabang lain
      if (existing && !isSuperAdmin && existing.branch !== payload?.branch) {
         console.error("Akses Ditolak: Mencoba menghapus data dari luar cabang authorization.");
         return; 
      }

      await prisma.category.delete({ 
        where: { id: Number(id) } 
      });
      revalidatePath("/categories"); 
    } catch (error) {
      console.error("Gagal menghapus kategori:", error);
    }
  }
}

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // 🔥 1. DETEKSI IDENTITAS USER & CABANG LOGIN
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;
  const userRole = payload?.role as string;
  const userBranch = payload?.branch as string;
  
  const isSuperAdmin = userRole?.toLowerCase() === "superadmin";
  const isReadOnlyUser = userRole?.toLowerCase() === "user"; // 👈 Flag untuk UI Read-Only

  // Paginasi Config
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const ITEMS_PER_PAGE = 10;

  // 🔥 2. BANGUN CONDITIONAL FILTER CABANG (READ FIREWALL)
  const whereClause: any = {};
  if (!isSuperAdmin) {
    whereClause.branch = userBranch || "UNKNOWN_BRANCH";
  }

  // Hitung total dan ambil data (Dengan Injeksi Filter Pintu Depan)
  const totalItems = await prisma.category.count({ where: whereClause });
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const categories = await prisma.category.findMany({
    where: whereClause, // 👈 Terapkan di query list
    orderBy: { created_at: "desc" },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  const getDeptStyles = (deptId: string) => {
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
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      
      {/* --- HEADER SECTION (RESPONSIVE OPTIMIZED) --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-2xl -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 hidden sm:block">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Kategori Aset</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
               <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1.5 w-fit">
                 <Building2 className="w-3.5 h-3.5" /> {isSuperAdmin ? "Semua Cabang (HO)" : userBranch}
               </span>
               <p className="text-sm font-medium text-slate-500">Kelola klasifikasi dan wewenang departemen.</p>
            </div>
          </div>
        </div>

        {/* WADAH TOMBOL AKSES - FLEKSIBEL DI MOBILE & DESKTOP */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0 relative z-10">
          <ExportCategoryButton />
          
          {/* 🔥 PROTEKSI UI: Sembunyikan Tombol Add jika Read-Only User */}
          {!isReadOnlyUser && (
            <Link 
              href="/categories/add" 
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:shadow-indigo-200 transition-all duration-300 active:scale-95 whitespace-nowrap text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Kategori Baru
            </Link>
          )}
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 sm:px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Nama Kategori</th>
                <th className="px-6 sm:px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Divisi Pengelola</th>
                <th className="px-6 sm:px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Tgl. Dibuat</th>
                <th className="px-6 sm:px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => {
                const style = getDeptStyles(cat.owner_dept);
                return (
                <tr key={cat.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 sm:px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shrink-0">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-800 whitespace-nowrap sm:whitespace-normal">{cat.category_name}</span>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border whitespace-nowrap ${style.color}`}>
                      {style.icon} {style.label}
                    </span>
                  </td>
                  <td className="px-6 sm:px-8 py-5 text-sm font-medium text-slate-500 whitespace-nowrap">
                    {cat.created_at.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  
                  {/* 🔥 AKSI KONTROL DATA (Dilindungi UI Read-Only) */}
                  <td className="px-6 sm:px-8 py-5 text-right">
                    {!isReadOnlyUser ? (
                      <div className="flex items-center justify-end gap-2 sm:gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                        <Link href={`/categories/${cat.id}/edit`} className="p-2 sm:p-2.5 text-indigo-500 bg-indigo-50 hover:text-white hover:bg-indigo-600 rounded-lg sm:rounded-xl transition-all duration-300 shadow-sm hover:shadow-indigo-200 active:scale-95" title="Edit Kategori">
                          <Pencil className="w-4 h-4 sm:w-4 sm:h-4" />
                        </Link>
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={cat.id} />
                          <DeleteCategoryButton id={cat.id} categoryName={cat.category_name} />
                        </form>
                      </div>
                    ) : (
                      <span className="text-xs font-black text-slate-300 tracking-widest px-3">—</span>
                    )}
                  </td>
                </tr>
              )})}

              {/* EMPTY STATE */}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 sm:px-8 py-16 sm:py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <FolderTree className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-300" />
                      </div>
                      <p className="text-slate-900 font-bold text-lg sm:text-xl mb-1">Kategori Masih Kosong</p>
                      <p className="text-slate-500 font-medium text-xs sm:text-sm mb-6">Belum ada kategori terdaftar untuk {isSuperAdmin ? "seluruh cabang" : userBranch}.</p>
                      
                      {/* 🔥 Sembunyikan prompt tambah data jika dia Read-Only */}
                      {!isReadOnlyUser && (
                        <Link href="/categories/add" className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base">
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Buat Kategori Pertama
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}