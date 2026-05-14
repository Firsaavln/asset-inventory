import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateUser, resetPassword } from "../../actions";
import Link from "next/link";
import { ArrowLeft, Save, User, Key, Shield, Building2, LockKeyhole } from "lucide-react";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  // Bind ID ke Server Actions
  const updateProfileAction = updateUser.bind(null, id);
  const resetPasswordAction = resetPassword.bind(null, id);

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      <Link href="/users" className="flex items-center text-xs font-black text-slate-400 hover:text-indigo-600 gap-2 uppercase tracking-widest group w-fit">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Manajemen Akun
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BAGIAN 1: EDIT PROFIL */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-60"></div>
          
          <div className="mb-8 border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Informasi Profil</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Perbarui data identitas dan hak akses akun.</p>
          </div>

          <form action={updateProfileAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-indigo-500" /> Nama Lengkap
              </label>
              <input type="text" name="name" defaultValue={user.name} required className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-indigo-500" /> Username
              </label>
              <input type="text" name="username" defaultValue={user.username} required className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-500" /> Level Akses
              </label>
              <select name="role" defaultValue={user.role} className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none cursor-pointer">
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Cabang / Divisi
              </label>
              <input type="text" name="branch" defaultValue={user.branch || ""} className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none" />
            </div>

            <div className="md:col-span-2 pt-2">
              <button type="submit" className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 w-full sm:w-auto">
                <Save className="w-4 h-4" /> Simpan Profil
              </button>
            </div>
          </form>
        </div>

        {/* BAGIAN 2: RESET PASSWORD */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <LockKeyhole className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Keamanan Akun</h3>
            <p className="text-[11px] text-slate-500 font-medium mb-6">Paksa pembaruan kata sandi jika staf lupa akses login mereka.</p>

            <form action={resetPasswordAction} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-rose-500" /> Kata Sandi Baru
                </label>
                <input 
                  type="password" 
                  name="new_password" 
                  required 
                  placeholder="Minimal 8 karakter..."
                  className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-rose-500 text-sm font-bold text-slate-700 outline-none" 
                />
              </div>

              <button type="submit" className="w-full bg-white hover:bg-rose-600 text-rose-600 hover:text-white border-2 border-rose-100 hover:border-rose-600 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                Reset Password
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}