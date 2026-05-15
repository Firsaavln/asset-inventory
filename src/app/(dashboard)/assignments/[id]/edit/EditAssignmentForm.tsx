"use client";

import React, { useState } from "react";
import { updateAssignment } from "../../actions";
import { Save, User, Building2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Pastikan Anda menggunakan sonner untuk toast
import { useRouter } from "next/navigation";

export default function EditAssignmentForm({ assignment }: { assignment: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const toastId = toast.loading("Menyimpan pembaruan handover...");
    const formData = new FormData(e.currentTarget);

    try {
      const res = await updateAssignment(assignment.id, formData);
      
      // Jika actions mengembalikan error (misal diblokir firewall)
      if (res && res.success === false) {
          toast.error("Gagal Memperbarui", { id: toastId, description: res.message });
          setIsSubmitting(false);
          return;
      }

      // Jika berhasil
      toast.success("Assignment Diperbarui!", { id: toastId });
      setTimeout(() => {
          // Karena router.push dilakukan dari client, kita terhindar dari NEXT_REDIRECT error
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
        <div className="space-y-2.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" /> Nama PIC Baru
          </label>
          <input 
            type="text" 
            name="borrower_name" 
            defaultValue={assignment.borrower_name} 
            required 
            className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-bold text-slate-700 outline-none" 
          />
        </div>

        <div className="space-y-2.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" /> Departemen Baru
          </label>
          <input 
            type="text" 
            name="department" 
            defaultValue={assignment.department} 
            required 
            className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-bold text-slate-700 outline-none" 
          />
        </div>

        <div className="md:col-span-2 space-y-2.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" /> Update Catatan
          </label>
          <textarea 
            name="notes" 
            rows={3} 
            defaultValue={assignment.notes || ""} 
            className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-bold text-slate-700 outline-none resize-none"
          ></textarea>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-slate-900 hover:bg-amber-600 disabled:bg-slate-400 text-white p-5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3 group"
      >
        {isSubmitting ? (
           <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
        ) : (
           <><Save className="w-4 h-4" /> Simpan Perubahan</>
        )}
      </button>
    </form>
  );
}