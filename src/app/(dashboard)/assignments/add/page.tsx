import { prisma } from "@/lib/prisma";
import { createAssignment } from "../actions";
import Link from "next/link";
import { ArrowLeft, Send, Laptop, User, Building2, FileText } from "lucide-react";

export default async function AddAssignmentPage() {
  const availableAssets = await prisma.asset.findMany({
    where: { status: "Available" },
    select: { id: true, asset_code: true, asset_name: true }
  });

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
      <Link href="/assignments" className="flex items-center text-xs font-black text-slate-400 hover:text-indigo-600 gap-2 uppercase tracking-widest group w-fit">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar
      </Link>

      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-full -z-10"></div>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Assignment</h2>
            <p className="text-sm text-slate-500 font-medium">Serah terima unit aset ke personil baru.</p>
          </div>
        </div>

        <form action={createAssignment} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-500" /> Aset Tersedia
              </label>
              <select name="asset_id" required className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none">
                <option value="">-- Pilih aset untuk dipinjamkan --</option>
                {availableAssets.map(a => (
                  <option key={a.id} value={a.id}>{a.asset_name} ({a.asset_code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" /> Nama PIC (Peminjam)
              </label>
              <input type="text" name="borrower_name" required placeholder="Contoh: Firsawanto Saputra" className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none" />
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" /> Departemen
              </label>
              <input type="text" name="department" required placeholder="Contoh: IT Infrastructure" className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none" />
            </div>

            <div className="md:col-span-2 space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Catatan Tambahan
              </label>
              <textarea name="notes" rows={3} placeholder="Kondisi saat diserahkan, kelengkapan, dll..." className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none resize-none"></textarea>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white p-5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3 group">
            Proses Serah Terima <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}