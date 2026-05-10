"use client";
import React, { useState } from "react";
import { 
  Box, Tags, Building2, Activity, Calendar, 
  ShieldCheck, Store, Image as ImageIcon, AlignLeft, 
  Plus, ArrowLeft, Save, Info, Loader2 
} from "lucide-react";
import Link from "next/link";
import { createAsset } from "./actions"; // Import fungsi backend kita

export default function AddAssetPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk menangani submit agar kita bisa kasih efek loading
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createAsset(formData); // Tembak ke Server Action
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data.");
      setIsSubmitting(false); // Matikan loading kalau error (kalau sukses dia akan otomatis redirect)
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Link href="/assets" className="flex items-center text-sm font-bold text-indigo-600 hover:gap-2 transition-all mb-2 group">
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar Aset
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tambah Aset Baru</h1>
          <p className="text-slate-500 font-medium">Input detail inventaris perangkat atau fasilitas ke dalam sistem.</p>
        </div>
      </div>

      {/* FORM DIMULAI DI SINI (action terhubung ke handleSubmit) */}
      <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI (70%): DATA UTAMA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Info className="w-5 h-5" /></div>
              <h2 className="text-lg font-bold text-slate-800">Informasi Dasar</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Box className="w-4 h-4 text-indigo-500" /> Nama Aset
                </label>
                {/* TAMBAHAN: Atribut name="asset_name" */}
                <input 
                  type="text" 
                  name="asset_name" 
                  required
                  placeholder="Contoh: MacBook Pro M3 Max 64GB" 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Tags className="w-4 h-4 text-indigo-500" /> Kategori
                </label>
                <select name="category" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none appearance-none font-medium">
                  <option value="">Pilih Kategori</option>
                  <option value="Laptop/PC">Laptop/PC</option>
                  <option value="Network Device">Network Device</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" /> Dept Pengelola
                </label>
                <select name="department" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none appearance-none font-medium">
                  <option value="">Pilih Departemen</option>
                  <option value="IT">IT Infrastructure</option>
                  <option value="GA">General Affair (GA)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" /> Kondisi Aset
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="cursor-pointer">
                    <input type="radio" name="condition" value="New" className="hidden peer" defaultChecked />
                    <div className="p-3 text-center rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 font-bold text-sm transition-all">New</div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="condition" value="Second" className="hidden peer" />
                    <div className="p-3 text-center rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 font-bold text-sm transition-all">Second</div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-500" /> Nama Vendor
                </label>
                <input 
                  type="text" 
                  name="vendor"
                  placeholder="PT Sinar Mulia" 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium" 
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><AlignLeft className="w-5 h-5" /></div>
              <h2 className="text-lg font-bold text-slate-800">Spesifikasi & Deskripsi</h2>
            </div>
            <textarea 
              name="description"
              rows={4}
              placeholder="Jelaskan spesifikasi detail aset di sini..."
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium resize-none"
            ></textarea>
          </div>
        </div>

        {/* KOLOM KANAN (30%): TIMELINE, PHOTO & TOMBOL SUBMIT */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-500" /> Foto Aset
            </h2>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center relative hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group cursor-pointer overflow-hidden">
              <input type="file" name="image" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Klik atau seret foto</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> Tanggal Pembelian
              </label>
              <input 
                type="date" 
                name="purchase_date"
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-slate-600" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" /> Masa Berlaku Warranty
              </label>
              <input 
                type="date" 
                name="warranty_date"
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-slate-600" 
              />
            </div>
          </div>

          {/* TOMBOL SUBMIT PINDAH KE SINI BIAR MASUK DI DALAM <form> */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
            ) : (
              <><Save className="w-5 h-5" /> Simpan Aset</>
            )}
          </button>

        </div>
      </form>
    </div>
  );
}