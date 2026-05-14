import { createUser } from "../actions";
import Link from "next/link";
import { ArrowLeft, UserPlus, User, Key, Shield, Building2 } from "lucide-react";

export default function AddUserPage() {
  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
      <Link href="/users" className="flex items-center text-xs font-black text-slate-400 hover:text-indigo-600 gap-2 uppercase tracking-widest group w-fit">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali
      </Link>

      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-full -z-10"></div>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pendaftaran Akun Baru</h2>
            <p className="text-sm text-slate-500 font-medium">Buat akses untuk staf atau administrator.</p>
          </div>
        </div>

        <form action={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 space-y-2.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Nama Lengkap
            </label>
            <input type="text" name="name" required placeholder="Contoh: Budi Santoso" className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none" />
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Username
            </label>
            <input type="text" name="username" required placeholder="budi.s" className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none lowercase" />
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-500" /> Password
            </label>
            <input type="password" name="password" required placeholder="••••••••" className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none" />
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" /> Level Akses
            </label>
            <select name="role" className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none cursor-pointer">
              <option value="staff">Staff (Hanya lihat aset)</option>
              <option value="admin">Admin (Kelola aset)</option>
              <option value="superadmin">Superadmin (Akses Penuh)</option>
            </select>
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" /> Penempatan Cabang
            </label>
            <input type="text" name="branch" defaultValue="Pusat" className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none" />
          </div>

          <div className="md:col-span-2 pt-4">
            <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white p-5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3">
              <UserPlus className="w-5 h-5" /> Buat Akun Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}