import { prisma } from "../../../lib/prisma";
import QRCode from "react-qr-code";
import { Tag, Calendar, User, Box, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "../../../components/PrintButton";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const assetId = parseInt(resolvedParams.id, 10);

  if (isNaN(assetId)) return notFound();

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      category: true,
      assignments: { orderBy: { assign_date: "desc" } },
    },
  });

  if (!asset) return notFound();

  const qrValue = `http://localhost:3000/assets/${asset.id}`;
  const currentAssignment = asset.status === "Assigned" && asset.assignments.length > 0 ? asset.assignments[0] : null;

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto print:p-0 print:m-0">
      
      {/* 
        INJEKSI CSS KHUSUS PRINT
        Ini memaksa browser mengatur ukuran kertas pas 50x25mm dan menghilangkan margin default
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: 50mm 25mm; margin: 0; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Sembunyikan URL/Tanggal default dari browser di pojok kertas */
          @page { margin-top: 0; margin-bottom: 0; }
        }
      `}} />

      {/* --- BAGIAN 1: TAMPILAN MONITOR --- */}
      <div className="print:hidden">
        <Link href="/assets" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Aset
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="md:flex">
            <div className="p-8 md:w-2/3 border-b md:border-b-0 md:border-r border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 rounded-xl"><Box className="w-6 h-6 text-indigo-600" /></div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{asset.name}</h1>
                  <p className="text-sm font-mono font-bold text-slate-500 mt-1">{asset.asset_code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Tag className="w-3 h-3"/> Kategori</p>
                  <p className="text-sm font-semibold text-slate-800">{asset.category.category_name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Tgl Beli</p>
                  <p className="text-sm font-semibold text-slate-800">{asset.purchase_date.toLocaleDateString('id-ID')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><User className="w-3 h-3"/> Status Kepemilikan</p>
                  {currentAssignment ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                      <p className="text-sm font-bold text-slate-800">{currentAssignment.borrower_name} <span className="text-slate-500 font-medium">({currentAssignment.department})</span></p>
                    </div>
                  ) : (
                    <span className="inline-flex mt-2 items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Tersedia di IT/GA</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 md:w-1/3 flex flex-col items-center justify-center bg-slate-50">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <QRCode value={qrValue} size={150} />
              </div>
              <PrintButton />
            </div>
          </div>
        </div>
      </div>


      {/* --- BAGIAN 2: TAMPILAN KERTAS CETAK (LABEL 50x25mm) --- */}
      <div className="hidden print:flex w-[50mm] h-[25mm] bg-white text-black p-[2mm] items-center box-border overflow-hidden">
        
        {/* Kiri: QR Code */}
        <div className="shrink-0 flex items-center justify-center">
          <QRCode value={qrValue} size={55} />
        </div>
        
        {/* Kanan: Data Spesifik (Nama, Kode, Pemilik) */}
        <div className="ml-[3mm] flex flex-col justify-center w-full">
          
          {/* Nama Asset */}
          <p className="text-[10px] font-bold leading-tight line-clamp-1 mb-0.5">
            {asset.name}
          </p>
          
          {/* Kode Asset */}
          <p className="text-[8px] font-mono font-bold text-gray-800 mb-1.5">
            {asset.asset_code}
          </p>

          {/* Nama Pemilik */}
          <div className="text-[8px] leading-tight">
            <span className="text-gray-500 font-semibold">User:</span><br/>
            <span className="font-bold text-[9px] line-clamp-1">
              {currentAssignment ? currentAssignment.borrower_name : "Tersedia (IT/GA)"}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}