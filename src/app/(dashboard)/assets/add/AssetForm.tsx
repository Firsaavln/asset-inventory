"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MANAGING_DIVISIONS } from "@/lib/constants"; // Mengambil divisi secara dinamis
import { 
  Box, Tags, Building2, Calendar, 
  ShieldCheck, Image as ImageIcon, AlignLeft, 
  Plus, Save, Info, Loader2, Barcode, 
  CreditCard, CheckCircle2, MapPin, Store, FileText, Check
} from "lucide-react";
import { createAsset } from "../actions";

interface Category {
  id: number | string;
  category_name: string;
}

export default function AssetForm({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk Image Preview & Invoice Preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [invoiceName, setInvoiceName] = useState<string | null>(null);

  // Handler Preview Gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handler Preview Nama Invoice
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setInvoiceName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const toastId = toast.loading("Memproses data dan mengunggah file...");
    const formData = new FormData(e.currentTarget);

    try {
      await createAsset(formData);
      
      toast.success("Aset Berhasil Diregistrasi!", {
        id: toastId,
        description: "Data aset dan file lampiran telah tersimpan di sistem.",
      });

      // Redirect mulus ke halaman daftar aset
      setTimeout(() => router.push("/assets"), 1000);
      
    } catch (error) {
      toast.error("Gagal Menyimpan Data", {
        id: toastId,
        description: "Terjadi kesalahan server atau ukuran file terlalu besar.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      
      {/* --- KOLOM KIRI (70%): DATA UTAMA & FINANSIAL --- */}
      <div className="lg:col-span-2 space-y-6 lg:space-y-8">
        
        {/* BLOK 1: INFORMASI IDENTITAS */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600"><Info className="w-5 h-5" /></div>
            <h2 className="text-xl font-bold text-slate-800">Informasi Identitas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Box className="w-4 h-4 text-indigo-500" /> Nama Aset <span className="text-rose-500">*</span>
              </label>
              <input type="text" name="asset_name" required placeholder="Contoh: Dell Latitude 7420 Core i7" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" />
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Tags className="w-4 h-4 text-indigo-500" /> Kategori <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select name="category_id" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-700 cursor-pointer appearance-none">
                  <option value="">Pilih Kategori</option>
                  {initialCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" /> Divisi Pengelola <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select name="managing_division" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-700 cursor-pointer appearance-none">
                  <option value="">Pilih Divisi</option>
                  {/* BUGS FIXED: Menggunakan data constants agar sinkron */}
                  {MANAGING_DIVISIONS.map(div => (
                    <option key={div.id} value={div.id}>{div.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-indigo-500" /> Serial Number (SN)
              </label>
              <input type="text" name="serial_number" placeholder="Contoh: SN-ABC12345" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 uppercase" />
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Kondisi Aset <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select name="condition" required defaultValue="New" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-700 cursor-pointer appearance-none">
                  <option value="New">Baru (New)</option>
                  <option value="Good">Bekas - Baik (Good)</option>
                  <option value="Fair">Bekas - Wajar (Fair)</option>
                  <option value="Damaged">Rusak (Needs Repair)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" /> Lokasi Penempatan
              </label>
              <input type="text" name="location" placeholder="Contoh: Ruang Server Lt. 3" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" />
            </div>
          </div>
        </div>

        {/* BLOK 2: FINANSIAL & VENDOR */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10"></div>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600"><CreditCard className="w-5 h-5" /></div>
            <h2 className="text-xl font-bold text-slate-800">Finansial & Vendor</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" /> Harga Beli <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold">Rp</span>
                </div>
                <input type="number" name="price" required min="0" placeholder="0" className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-500" /> Nama Vendor / Toko
              </label>
              <input type="text" name="vendor_name" placeholder="Contoh: PT Komputindo Global..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700" />
            </div>

            <div className="md:col-span-2 space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-emerald-500" /> Catatan Spesifikasi
              </label>
              <textarea name="description" rows={3} placeholder="Tuliskan detail spesifikasi RAM, Storage, warna, dll..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium resize-none text-slate-700"></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* --- KOLOM KANAN (30%): MEDIA, TIMELINE & SUBMIT --- */}
      <div className="space-y-6 lg:space-y-8 flex flex-col">
        
        {/* BLOK 3: MEDIA (FOTO & INVOICE) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10"></div>
          
          {/* Upload Foto Fisik dengan Preview */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-500" /> Foto Fisik Aset
            </h2>
            <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] p-2 text-center relative hover:border-indigo-400 transition-all group cursor-pointer overflow-hidden h-40 flex flex-col items-center justify-center bg-slate-50">
              <input type="file" name="asset_image" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">Pilih Foto (Max 5MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Upload Invoice dengan Indikator */}
          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" /> Invoice / Nota
            </h2>
            <div className={`border-2 border-dashed rounded-[1.5rem] p-6 text-center relative transition-all group cursor-pointer overflow-hidden flex flex-col items-center justify-center
              ${invoiceName ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 bg-slate-50'}
            `}>
              <input type="file" name="invoice_file" accept=".pdf,image/*" onChange={handleInvoiceChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              
              <div className={`w-10 h-10 bg-white shadow-sm border rounded-full flex items-center justify-center mb-2 transition-all duration-300
                ${invoiceName ? 'border-emerald-200 text-emerald-600' : 'border-slate-100 text-slate-400 group-hover:text-emerald-600 group-hover:scale-110'}
              `}>
                {invoiceName ? <Check className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <p className={`text-xs font-bold line-clamp-1 px-4
                ${invoiceName ? 'text-emerald-700' : 'text-slate-600 group-hover:text-emerald-700'}
              `}>
                {invoiceName || "Pilih File PDF/Img"}
              </p>
            </div>
          </div>
        </div>

        {/* BLOK 4: TIMELINE */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10"></div>
          
          <div className="space-y-2.5 relative z-10">
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" /> Tanggal Beli <span className="text-rose-500">*</span>
            </label>
            <input type="date" name="purchase_date" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-600" />
          </div>

          <div className="space-y-2.5 relative z-10">
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Akhir Garansi
            </label>
            <input type="date" name="warranty_date" className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-600" />
          </div>
        </div>

        {/* TOMBOL SUBMIT */}
        <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-400 text-white px-6 py-5 rounded-[1.5rem] font-bold shadow-xl shadow-slate-200 hover:shadow-indigo-200 transition-all active:scale-95 group">
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan & Uploading...</>
          ) : (
            <><Save className="w-6 h-6 group-hover:scale-110 transition-transform" /> Simpan Data Aset</>
          )}
        </button>

      </div>
    </form>
  );
}