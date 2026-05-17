import { prisma } from "@/lib/prisma"; // Sesuaikan path prisma lu
import AssetForm from "./AssetForm"; // Kita buat file ini di bawah
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react"; // 👈 Tambahan icon ShieldAlert
import { cookies } from "next/headers"; // 👈 Tambahan import cookies
import { decrypt } from "@/lib/auth"; // 👈 Tambahan import auth
import { redirect } from "next/navigation"; // 👈 Tambahan import redirect

export default async function AddAssetPage() {
  // ====================================================================
  // 🔥 1. ABSOLUTE SERVER-SIDE FIREWALL (ANTI TEMBAK URL & IDOR)
  // ====================================================================
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;

  // Kalau gak ada session, tendang ke login
  if (!payload) redirect("/login");

  const userRole = (payload.role as string).toLowerCase();
  const userBranch = payload.branch as string;
  const isSuperAdmin = userRole === "superadmin";

  // 🛑 JIKA ROLENYA 'USER', TAMPILKAN HALAMAN AKSES DITOLAK!
  if (userRole === "user") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
          Akun Anda memiliki level akses <strong>Read-Only</strong>. Anda tidak diizinkan untuk menambah, mengubah, atau menghapus data di sistem ini.
        </p>
        <Link href="/assets" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
          Kembali ke Daftar Aset
        </Link>
      </div>
    );
  }

  // 🔥 2. FIREWALL IDOR UNTUK PILIHAN KATEGORI
  // Mencegah Admin Jakarta melihat kategori milik Admin Bali
  const whereClause: any = {};
  if (!isSuperAdmin) {
    whereClause.branch = userBranch || "UNKNOWN_BRANCH";
  }
  // ====================================================================

  // Mengambil data kategori aktif dari database (Sudah diamankan dengan IDOR)
  const categories = await prisma.category.findMany({
    where: whereClause,
    orderBy: { category_name: 'asc' }
  });

  // UI ASLI LU TETAP UTUH DI BAWAH INI BRAY 👇
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2">
        <Link href="/assets" className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-all w-fit group">
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Daftar Aset
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Registrasi Aset Baru</h1>
          <p className="text-slate-500 font-medium mt-1">Lengkapi form di bawah untuk memasukkan aset ke dalam inventaris perusahaan.</p>
        </div>
      </div>

      {/* Panggil komponen Client Form dan oper data kategorinya */}
      <AssetForm initialCategories={categories} />
    </div>
  );
}