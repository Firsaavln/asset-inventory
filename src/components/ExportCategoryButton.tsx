"use client";

import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { getCategoriesForExport } from "@/app/(dashboard)/categories/actions";
import { MANAGING_DIVISIONS } from "@/lib/constants";

export default function ExportCategoryButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Menyiapkan file Excel...");

    try {
      const rawData = await getCategoriesForExport();

      // Format datanya biar pas di Excel gampang dibaca Bos
      const formattedData = rawData.map((item, index) => {
        // Cek nama divisi asli dari file constants
        const deptLabel = MANAGING_DIVISIONS.find(d => d.id === item.owner_dept)?.label || item.owner_dept;

        return {
          "No": index + 1,
          "Nama Kategori": item.category_name,
          "Divisi Pengelola": deptLabel,
          "Tanggal Dibuat": new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
        };
      });

      // Proses generate Excel
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Kategori");

      // Download file-nya
      XLSX.writeFile(workbook, `Data_Kategori_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success("Berhasil Export!", { id: toastId, description: "File Excel telah diunduh." });
    } catch (error) {
      toast.error("Gagal Export", { id: toastId, description: "Terjadi kesalahan saat memproses data." });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 border border-emerald-200"
    >
      {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
      Export Excel
    </button>
  );
}