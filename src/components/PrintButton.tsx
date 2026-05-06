"use client"; // Wajib ada agar tombol bisa diklik oleh user

import { Printer } from "lucide-react";

export default function PrintButton() {
  const handlePrint = () => {
    window.print(); // Memanggil fungsi Print bawaan browser
  };

  return (
    <button 
      onClick={handlePrint}
      className="mt-4 w-full bg-white border border-slate-300 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors flex justify-center items-center gap-2 print:hidden"
    >
      <Printer className="w-4 h-4" /> Print Label (Cetak)
    </button>
  );
}