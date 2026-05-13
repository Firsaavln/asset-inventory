import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";
import { MANAGING_DIVISIONS } from "@/lib/constants";
import PrintLabelButton from "@/components/PrintLabelButton"; // 👈 Komponen Client
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
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <Link 
            href="/assets" 
            className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all w-fit group"
          >
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
            Kembali ke Inventaris
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{asset.asset_code}</h1>
            
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
              asset.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
              asset.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
              asset.status === 'Maintenance' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {asset.status}
            </span>
          </div>
        </div>

        {/* TOMBOL AKSI ATAS */}
        <div className="flex items-center gap-3">
          
          {/* Panggil komponen Client di sini, JANGAN pakai tag <button> langsung */}
          <PrintLabelButton />

          <Link 
            href={`/assets/${asset.id}/edit`}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:shadow-indigo-200 transition-all active:scale-95 group"
          >
            <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Edit Data
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* --- KOLOM KIRI (INFO UTAMA) --- */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600"><Box className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold text-slate-800">Detail Fisik</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MonitorSmartphone className="w-3.5 h-3.5"/> Nama Aset</p>
                  <p className="text-lg font-bold text-slate-900">{asset.asset_name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5"/> Kategori</p>
                  <p className="text-lg font-bold text-slate-900">{asset.category.category_name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><BarcodeIcon className="w-3.5 h-3.5"/> Serial Number</p>
                  <p className="text-base font-mono font-bold text-slate-800">{asset.serial_number || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> Kondisi</p>
                  <p className="text-base font-bold text-slate-800">{asset.condition}</p>
                </div>
                <div className="sm:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Penempatan</p>
                    <p className="text-base font-bold text-slate-800">{asset.location || "Belum Di-set"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Wewenang</p>
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-lg uppercase tracking-wider">{deptLabel}</span>
                  </div>
                </div>
              </div>

              {/* Area QR Code */}
              <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl w-full md:w-48">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-3">
                  <QRCode value={asset.asset_code} size={120} level="H" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scan Label</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600"><CreditCard className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold text-slate-800">Pembelian & Vendor</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Nilai Buku (Harga Beli)</p>
                <p className="text-3xl font-black text-slate-900">{formatRupiah(Number(asset.price))}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Store className="w-3.5 h-3.5"/> Vendor Penyedia</p>
                <p className="text-base font-bold text-slate-800">{asset.vendor_name || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Tgl Pembelian</p>
                <p className="text-base font-bold text-slate-800">{new Date(asset.purchase_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/> Masa Garansi</p>
                <p className="text-base font-bold text-slate-800">{asset.warranty_date ? new Date(asset.warranty_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</p>
              </div>
            </div>
            {asset.description && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Catatan Khusus</p>
                <p className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">{asset.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* --- KOLOM KANAN (MEDIA) --- */}
        <div className="space-y-6 lg:space-y-8 flex flex-col">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden flex-1 flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10"></div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600"><ImageIcon className="w-5 h-5" /></div> Media & Dokumen
            </h2>

            <div className="mb-6 flex-1 flex flex-col">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Foto Aset</p>
              {asset.asset_image ? (
                <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group relative">
                  <img src={asset.asset_image} alt={asset.asset_name} className="w-full h-full object-cover" />
                  <a href={asset.asset_image} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-lg">Lihat Penuh</span>
                  </a>
                </div>
              ) : (
                <div className="w-full h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-bold">Tidak ada foto</span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 mt-auto">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Dokumen Invoice</p>
              {asset.invoice_file ? (
                <a href={asset.invoice_file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all">
                  <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm"><FileText className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-900">Lihat Dokumen</p>
                  </div>
                </a>
              ) : (
                 <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-400">
                  <div className="p-2 bg-white rounded-lg"><FileText className="w-5 h-5 opacity-50" /></div>
                  <p className="text-sm font-bold">Invoice belum diunggah</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}