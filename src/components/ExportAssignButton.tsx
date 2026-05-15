"use client";

import { FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function ExportAssignButton({ data }: { data: any[] }) {
  const handleExport = () => {
    const worksheetData = data.map((assign) => ({
      "Asset Code": assign.asset.asset_code,
      "Asset Name": assign.asset.asset_name,
      "PIC Name": assign.borrower_name,
      "Department": assign.department,
      "Date": new Date(assign.assign_date).toLocaleDateString("id-ID"),
      "Kategori": assign.asset.category?.category_name || "-",
        "S/N": assign.asset.serial_number || "-",
        "Kondisi": assign.asset.condition,
        "Lokasi": assign.asset.location || "-",
        "Cabang": assign.asset.branch || "-",
        "Status": assign.asset.status,
        "Divisi Pengelola": assign.asset.managing_division,
        "Harga (IDR)": assign.asset.price, 
        "Vendor": assign.asset.vendor_name || "-",
        "Tgl Beli": assign.asset.purchase_date ? new Date(assign.asset.purchase_date).toLocaleDateString('id-ID') : "-",
        "Warranty": assign.asset.warranty_date ? new Date(assign.asset.warranty_date).toLocaleDateString('id-ID') : "-",
        "Link Foto": assign.asset.asset_image || "-",
        "Link Invoice": assign.asset.invoice_file || "-",
        "Deskripsi": assign.asset.description || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assignments");
    XLSX.writeFile(workbook, `Gree_Assignment_Report_${Date.now()}.xlsx`);
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 rounded-2xl text-[10px] font-black transition-all active:scale-95 shadow-sm uppercase tracking-widest group"
    >
      <FileSpreadsheet className="w-4 h-4 transition-colors" />
      Export Report
    </button>
  );
}