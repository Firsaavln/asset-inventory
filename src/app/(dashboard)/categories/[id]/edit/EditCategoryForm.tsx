"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { MANAGING_DIVISIONS } from "@/lib/constants";
import { updateCategory } from "../../actions"; // Panggil fungsi update dari file action
import { 
  Tags, Building2, Save, Info, 
  Loader2, PencilLine 
} from "lucide-react";

// Tipe data yang dilempar dari Server Component
interface CategoryData {
  id: number;
  category_name: string;
  owner_dept: string;
}

export default function EditCategoryForm({ category }: { category: CategoryData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 1. Munculkan Toast Loading di atas
    const toastId = toast.loading("Memperbarui kategori...");
    const formData = new FormData(e.currentTarget);

    try {
      await updateCategory(category.id, formData);
      
      // 2. Ubah Toast Loading jadi Sukses
      toast.success("Perubahan Disimpan!", {
        id: toastId,
        description: `Kategori berhasil diperbarui.`,
      });

      setTimeout(() => router.push("/categories"), 1000);
      
    } catch (error) {
      // 3. Ubah Toast Loading jadi Error
      toast.error("Gagal Memperbarui", {
        id: toastId,
        description: "Pastikan koneksi jaringan Anda stabil.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
      
      {/* Dekorasi Background Amber (Mode Edit) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10"></div>
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600">
          <PencilLine className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Ubah Detail Kategori</h2>
      </div>

      <div className="space-y-6">
        {/* NAMA KATEGORI */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <Tags className="w-4 h-4 text-indigo-500" /> Nama Kategori <span className="text-rose-500">*</span>
          </label>
          <input 
            type="text" 
            name="category_name" 
            required
            defaultValue={category.category_name} // 👈 Isi otomatis data lama
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" 
          />
        </div>

        {/* DIVISI PENGELOLA */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" /> Divisi Pengelola <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select 
              name="owner_dept" 
              required 
              defaultValue={category.owner_dept} // 👈 Set pilihan lama
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-700 cursor-pointer appearance-none"
            >
              {MANAGING_DIVISIONS.map((div) => (
                <option key={div.id} value={div.id}>{div.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <p className="text-xs font-medium text-amber-600 ml-1 flex items-center gap-1.5 mt-2 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
            <Info className="w-4 h-4" /> Perubahan wewenang akan berdampak pada hak akses pengelolaan.
          </p>
        </div>
      </div>

      {/* TOMBOL AKSI */}
      <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-4">
        <Link href="/categories" className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
          Batal
        </Link>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:shadow-indigo-200 transition-all active:scale-95 group"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Memperbarui...</>
          ) : (
            <><Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> Simpan Perubahan</>
          )}
        </button>
      </div>
    </form>
  );
}