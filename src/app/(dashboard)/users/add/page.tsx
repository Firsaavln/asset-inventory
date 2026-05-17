import { addUser } from "../actions";
import Link from "next/link";
import { ArrowLeft, UserPlus, Shield, Building2, ShieldAlert } from "lucide-react"; // 👈 Tambah ShieldAlert
import { BRANCHES } from "@/lib/constants"; 
import { cookies } from "next/headers"; // 👈 Tambahan Session Reader
import { decrypt } from "@/lib/auth";   // 👈 Tambahan Decrypt Engine
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AddUserPage() {
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
          Akun Anda memiliki level akses <strong>Read-Only</strong>. Anda tidak diizinkan untuk membuat kredensial akun baru di sistem ini.
        </p>
        <Link href="/users" className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          Kembali ke Manajemen Akun
        </Link>
      </div>
    );
  }
  // ====================================================================

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* HEADER */}
      <header className="flex items-center gap-4">
        <Link href="/users" className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            Tambah Akun Baru
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Buat kredensial akses untuk staf atau administrator.</p>
        </div>
      </header>

      {/* FORM CARD */}
      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Detail Kredensial</h2>
            <p className="text-xs font-medium text-slate-500">Pastikan username unik dan password kuat.</p>
          </div>
        </div>

        <form action={addUser} className="p-6 sm:p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NAMA LENGKAP */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Lengkap</label>
              <input 
                type="text" name="name" required placeholder="Cth: Firsawanto Saputra"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
              />
            </div>

            {/* USERNAME */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Username</label>
              <input 
                type="text" name="username" required placeholder="Cth: firsawanto_s"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password Default</label>
              <input 
                type="password" name="password" required placeholder="Minimal 6 karakter" minLength={6}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
              />
            </div>

            {/* LEVEL AKSES (ROLE) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Level Akses
              </label>
              <select name="role" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none cursor-pointer">
                <option value="user">User (Viewer & Data Aset)</option>
                <option value="admin">Admin (CRUD Aset Cabang)</option>
                <option value="superadmin">Superadmin (Akses Penuh)</option>
              </select>
            </div>

            {/* 🔥 PENEMPATAN CABANG (DROPDOWN DINAMIS) 🔥 */}
            <div className="space-y-2 md:col-span-2 border-t border-slate-100 pt-6 mt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Penempatan Cabang
              </label>
              <select name="branch" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none cursor-pointer">
                <option value="">-- Pilih Cabang --</option>
                {BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
              <p className="text-[10px] font-medium text-slate-400 mt-1">
                *Admin dan User hanya bisa melihat serta mengelola data di cabangnya sendiri.
              </p>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/users" className="px-6 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              Batal
            </Link>
            <button type="submit" className="px-8 py-3.5 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95">
              Simpan Akun Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}