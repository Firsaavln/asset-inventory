import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";
import { MANAGING_DIVISIONS } from "@/lib/constants";

// 👇 IMPORT KOMPONEN CLIENT (Gunakan @ agar tidak error path)
import PrintLabelButton from "@/components/PrintLabelButton"; 
import DisposeButton from "@/components/DisposeButton"; 

import { 
  ArrowLeft, Edit, MonitorSmartphone, MapPin, 
  Tag, Box, CreditCard, Store, Calendar, 
  ShieldCheck, FileText, Image as ImageIcon, 
  Barcode as BarcodeIcon, CheckCircle2 
} from "lucide-react";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const assetId = Number(resolvedParams.id);

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { category: true }
  });

  if (!asset) notFound();

  const deptLabel = MANAGING_DIVISIONS.find(d => d.id === asset.managing_division)?.label || asset.managing_division;

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
        <div className="flex flex-col gap-2">
          <Link 
            href="/assets" 
            className="flex items-center text-[11px] font-black text-slate-400 hover:text-indigo-600 transition-all w-fit group uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> 
            Kembali ke Inventaris
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{asset.asset_code}</h1>
            
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
              asset.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
              asset.status === 'Assigned' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
              asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-600 border-amber-200' :
              'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              {asset.status}
            </span>
          </div>
        </div>

        {/* --- TOMBOL AKSI ATAS --- */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <div className="flex-1 sm:flex-none">
            <PrintLabelButton />
          </div>

          <Link 
            href={`/assets/${asset.id}/edit`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-3.5 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:shadow-indigo-200 transition-all active:scale-95 group text-sm"
          >
            <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Edit Data
          </Link>

          {/* 👇 TOMBOL DISPOSAL YANG SUDAH RAPI & SEJAJAR */}
          {asset.status !== "Disposed" && (
            <DisposeButton assetId={asset.id} />
          )}

        </div>
      </div>

      {/* --- GRID KONTEN BAWAH (TIDAK ADA YANG DIHAPUS) --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* --- KOLOM KIRI (INFO UTAMA) --- */}
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          
          {/* CARD DETAIL FISIK */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-bl-full -z-10"></div>
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-100"><Box className="w-5 h-5" /></div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Detail Spesifikasi</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8 w-full">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><MonitorSmartphone className="w-3.5 h-3.5 text-indigo-500"/> Nama Unit Aset</p>
                  <p className="text-base font-bold text-slate-900">{asset.asset_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-indigo-500"/> Kategori Barang</p>
                  <p className="text-base font-bold text-slate-900">{asset.category.category_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><BarcodeIcon className="w-3.5 h-3.5 text-indigo-500"/> Serial Number</p>
                  <p className="text-base font-mono font-bold text-slate-800 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg w-fit">{asset.serial_number || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-500"/> Kondisi Fisik</p>
                  <p className="text-base font-bold text-slate-800">{asset.condition}</p>
                </div>
                
                {/* Wewenang & Lokasi */}
                <div className="sm:col-span-2 p-5 bg-slate-50/50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500"/> Penempatan / Lokasi</p>
                    <p className="text-base font-bold text-slate-900">{asset.location || "Belum Di-set"}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Divisi Wewenang</p>
                    <span className="inline-block px-3 py-1.5 bg-white border border-indigo-100 text-indigo-700 text-xs font-black rounded-xl shadow-sm uppercase tracking-wider">{deptLabel}</span>
                  </div>
                </div>
              </div>

              {/* Area QR Code */}
              <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-white border border-slate-200 shadow-sm rounded-3xl w-full md:w-56 group">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-4 group-hover:scale-105 transition-transform duration-300">
                  <QRCode value={asset.asset_code} size={140} level="H" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">QR Code Label<br/>Internal Scanner</p>
              </div>
            </div>
          </div>

          {/* CARD FINANSIAL & GARANSI */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-full -z-10"></div>
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-emerald-500 rounded-2xl text-white shadow-md shadow-emerald-100"><CreditCard className="w-5 h-5" /></div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Finansial & Vendor</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-8">
              <div className="md:col-span-2 bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Nilai Buku (Harga Perolehan)</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{formatRupiah(Number(asset.price))}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Store className="w-3.5 h-3.5 text-slate-400"/> Vendor Penyedia</p>
                <p className="text-base font-bold text-slate-800">{asset.vendor_name || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400"/> Tgl Pembelian</p>
                <p className="text-base font-bold text-slate-800">{new Date(asset.purchase_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500"/> Masa Berlaku Garansi</p>
                <p className="text-base font-bold text-slate-800">{asset.warranty_date ? new Date(asset.warranty_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Tanpa Garansi"}</p>
              </div>
            </div>

            {asset.description && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Catatan Khusus</p>
                <p className="text-sm font-medium text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 leading-relaxed">{asset.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* --- KOLOM KANAN (MEDIA) --- */}
        <div className="space-y-6 lg:space-y-8 flex flex-col">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden flex-1 flex flex-col h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-bl-full -z-10"></div>
            
            <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-amber-500 rounded-2xl text-white shadow-md shadow-amber-100"><ImageIcon className="w-5 h-5" /></div> Media Dokumen
            </h2>

            {/* Foto Section */}
            <div className="mb-8 flex-1 flex flex-col">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dokumentasi Visual</p>
              {asset.asset_image ? (
                <div className="w-full h-56 md:h-64 rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm group relative bg-slate-100">
                  <img src={asset.asset_image} alt={asset.asset_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <a href={asset.asset_image} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white text-slate-900 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">Buka Penuh</span>
                  </a>
                </div>
              ) : (
                <div className="w-full h-56 md:h-64 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-10 h-10 mb-3 opacity-40" />
                  <span className="text-xs font-bold uppercase tracking-widest">Tidak ada foto</span>
                </div>
              )}
            </div>

            {/* Invoice Section */}
            <div className="pt-6 border-t border-slate-100 mt-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Salinan Invoice / Nota</p>
              {asset.invoice_file ? (
                <a href={asset.invoice_file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl transition-all group">
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><FileText className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 group-hover:text-emerald-700 transition-colors">Lihat Dokumen Asli</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Format PDF / Gambar</p>
                  </div>
                </a>
              ) : (
                 <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
                  <div className="p-3 bg-white rounded-xl shadow-sm"><FileText className="w-5 h-5 opacity-40" /></div>
                  <div>
                    <p className="text-sm font-bold">Invoice Kosong</p>
                    <p className="text-[10px] font-medium mt-0.5">Belum diunggah</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}