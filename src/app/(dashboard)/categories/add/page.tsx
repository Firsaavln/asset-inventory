import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react"; // 👈 Tambahan ShieldAlert
import AddCategoryForm from "./AddCategoryForm"; 
import { cookies } from "next/headers"; // 👈 Tambahan Session Reader
import { decrypt } from "@/lib/auth";   // 👈 Tambahan Decrypt Engine
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AddCategoryPage() {
  // ====================================================================
  // 🔥 1. ABSOLUTE SERVER-SIDE FIREWALL (ANTI TEMBAK URL)
  // ====================================================================
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;

  if (!payload) redirect("/login");

  const userRole = (payload.role as string).toLowerCase();

  // 🛑 JIKA ROLENYA 'USER', TAMPILKAN HALAMAN AKSES DITOLAK!
  if (userRole === "user") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
          Akun Anda memiliki level akses <strong>Read-Only</strong>. Anda tidak diizinkan untuk menambah, mengubah, atau menghapus data di sistem ini.
        </p>
        <Link href="/categories" className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          Kembali ke Daftar Kategori
        </Link>
      </div>
    );
  }
  // ====================================================================

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2 mb-8">
        <Link 
          href="/categories" 
          className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-all w-fit group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Daftar Kategori
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Kategori Baru</h1>
          <p className="text-slate-500 font-medium mt-1">Tambahkan klasifikasi aset baru untuk mempermudah inventarisasi.</p>
        </div>
      </div>

      {/* PANGGIL CLIENT FORM YANG KONSISTEN */}
      <AddCategoryForm />
      
    </div>
  );
}