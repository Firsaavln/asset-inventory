import { prisma } from "@/lib/prisma";
import { updateUser } from "../../actions";
import Link from "next/link";
import { ArrowLeft, UserCog, Shield, Building2, ShieldAlert } from "lucide-react"; // 👈 Tambah ShieldAlert
import { BRANCHES } from "@/lib/constants"; 
import { redirect, notFound } from "next/navigation"; 
import { cookies } from "next/headers"; 
import { decrypt } from "@/lib/auth";   

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  // 🔥 1. AMBIL SESSION LOGIN UNTUK FIREWALL SECURED ENGINE
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;

  if (!payload) redirect("/login");

  const actorRole = (payload.role as string).toLowerCase();
  const actorBranch = payload.branch as string;

  // 🔥 2. HAK AKSES READ-ONLY PROTECTION (UI ELEGAN)
  // Akun ber-role 'user' dilarang keras masuk ke area manajemen konfigurasi user!
  if (actorRole === "user") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
          Akun Anda memiliki level akses <strong>Read-Only</strong>. Anda tidak diizinkan untuk memodifikasi konfigurasi akun pengguna di sistem ini.
        </p>
        <Link href="/users" className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          Kembali ke Manajemen Akun
        </Link>
      </div>
    );
  }

  const resolvedParams = await params;
  
  // Konversi ID ke Number karena database Anda Integer
  const userId = parseInt(resolvedParams.id, 10);

  // Jika hasil parsing bukan angka, balikkan ke list
  if (isNaN(userId)) {
    redirect("/users");
  }

  // Ambil data user menggunakan ID angka
  const user = await prisma.user.findUnique({
    where: { id: userId } 
  });

  if (!user) {
    notFound(); // Menggunakan 404 jauh lebih aman agar hacker bingung tebak ID akun
  }

  // 🔥 3. SECURITY FIREWALL IDOR PROTEKSI (KONTROL WILAYAH ADMIN)
  // Jika dia Admin biasa, dia hanya bisa mengedit user di cabangnya sendiri.
  // Dan Admin biasa dilarang keras mengubah profil milik seorang Superadmin!
  // Kita biarkan pakai notFound() di sini agar hacker tidak tahu kalau ID tersebut valid
  if (actorRole === "admin") {
    if (user.branch !== actorBranch || user.role.toLowerCase() === "superadmin") {
      notFound();
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* HEADER */}
      <header className="flex items-center gap-4">
        <Link href="/users" className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            Edit Akun Pengguna
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Ubah nama, wewenang, atau penempatan cabang.</p>
        </div>
      </header>

      {/* FORM CARD */}
      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">@{user.username}</h2>
            <p className="text-xs font-medium text-slate-500">Kosongkan kolom password jika tidak ingin mengubahnya.</p>
          </div>
        </div>

        <form action={updateUser} className="p-6 sm:p-10 space-y-6">
          {/* Kirim ID user ke server action */}
          <input type="hidden" name="id" value={user.id} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NAMA LENGKAP */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Lengkap</label>
              <input 
                type="text" name="name" required defaultValue={user.name}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none" 
              />
            </div>

            {/* USERNAME (Read-only) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Username</label>
              <input 
                type="text" defaultValue={user.username} readOnly
                className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed outline-none" 
              />
            </div>

            {/* PASSWORD BARU */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password Baru</label>
              <input 
                type="password" name="password" placeholder="Biarkan kosong jika tidak diubah" minLength={6}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none" 
              />
            </div>

            {/* LEVEL AKSES (ROLE) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Level Akses
              </label>
              <select name="role" required defaultValue={user.role} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none cursor-pointer">
                <option value="user">User (Viewer & Data Aset)</option>
                <option value="admin">Admin (CRUD Aset Cabang)</option>
                <option value="superadmin">Superadmin (Akses Penuh)</option>
              </select>
            </div>

            {/* PENEMPATAN CABANG */}
            <div className="space-y-2 md:col-span-2 border-t border-slate-100 pt-6 mt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Penempatan Cabang
              </label>
              <select name="branch" required defaultValue={user.branch || ""} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none cursor-pointer">
                <option value="">-- Pilih Cabang --</option>
                {BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/users" className="px-6 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              Batal
            </Link>
            <button type="submit" className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}