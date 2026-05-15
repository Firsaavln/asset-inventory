"use client";

import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { getAssetsForExport } from "@/app/(dashboard)/assets/actions";
import { useSearchParams } from "next/navigation";

export default function ExportAssetButton() {
  const [isExporting, setIsExporting] = useState(false);
  const searchParams = useSearchParams();

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Menyiapkan Laporan Aset...");

    try {
      const q = searchParams.get("q") || undefined;
      const cat = searchParams.get("category") || undefined;
      const loc = searchParams.get("location") || undefined;

      // 1. Ambil data dari server
      const rawData = await getAssetsForExport(q, cat, loc);

      // 2. Mapping data (Gunakan type 'any' pada item untuk menghilangkan merah dengan cepat)
      // Pastikan menggunakan optional chaining (?.) untuk menghindari error null pada category
      const formattedData = rawData.map((item: any, index: number) => ({
        "No": index + 1,
        "Kode Aset": item.asset_code,
        "Nama Aset": item.asset_name,
        "Kategori": item.category?.category_name || "-",
        "S/N": item.serial_number || "-",
        "Kondisi": item.condition,
        "Lokasi": item.location || "-",
        "Cabang": item.branch || "-",
        "Status": item.status,
        "Divisi Pengelola": item.managing_division,
        "Harga (IDR)": item.price, 
        "Vendor": item.vendor_name || "-",
        "Tgl Beli": item.purchase_date ? new Date(item.purchase_date).toLocaleDateString('id-ID') : "-",
        "Warranty": item.warranty_date ? new Date(item.warranty_date).toLocaleDateString('id-ID') : "-",
        "Link Foto": item.asset_image || "-",
        "Link Invoice": item.invoice_file || "-",
        "Deskripsi": item.description || "-"
      }));

      // 3. Proses Excel
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Aset");

      XLSX.writeFile(workbook, `Laporan_Aset_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success("Berhasil Export!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Gagal Export", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl font-bold transition-all shadow-sm active:scale-95 border border-emerald-200 whitespace-nowrap"
    >
      {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
      Export Excel
    </button>
  );
}