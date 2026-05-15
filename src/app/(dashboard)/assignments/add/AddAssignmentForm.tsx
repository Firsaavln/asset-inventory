"use client";

import React, { useState } from "react";
import { createAssignment } from "../actions";
import { Laptop, User, Building2, FileText, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddAssignmentForm({ availableAssets }: { availableAssets: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const toastId = toast.loading("Memproses serah terima aset...");
    const formData = new FormData(e.currentTarget);

    try {
      const res = await createAssignment(formData);
      
      if (res && res.success === false) {
          toast.error("Gagal!", { id: toastId, description: res.message });
          setIsSubmitting(false);
          return;
      }

      toast.success("Assignment Berhasil!", { id: toastId, description: "Aset telah diserahkan." });
      setTimeout(() => {
          router.push("/assignments");
      }, 1000);

    } catch (error) {
      toast.error("Terjadi kesalahan sistem", { id: toastId });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:col-span-2 space-y-2.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <Laptop className="w-4 h-4 text-indigo-500" /> Pilih Aset Tersedia
          </label>
          <select name="asset_id" required className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none">
            <option value="">-- Pilih aset untuk dipinjamkan --</option>
            {availableAssets.map(a => (
              <option key={a.id} value={a.id}>{a.asset_name} ({a.asset_code})</option>
            ))}
          </select>
          {availableAssets.length === 0 && (
            <p className="text-xs font-bold text-rose-500 ml-2 mt-2">
              *Tidak ada aset yang tersedia di cabang Anda saat ini.
            </p>
          )}
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

      <button 
        type="submit" 
        disabled={isSubmitting || availableAssets.length === 0}
        className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3 group"
      >
        {isSubmitting ? (
           <><Loader2 className="w-4 h-4 animate-spin" /> Sedang Memproses...</>
        ) : (
           <>Proses Serah Terima <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
        )}
      </button>
    </form>
  );
}