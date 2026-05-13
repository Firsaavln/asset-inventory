import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddCategoryForm from "./AddCategoryForm"; // Import komponen client

export default function AddCategoryPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2 mb-8">
        <Link 
          href="/categories" 
          className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-all w-fit group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Daftar Kategori
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Kategori Baru</h1>
          <p className="text-slate-500 font-medium mt-1">Tambahkan klasifikasi aset baru untuk mempermudah inventarisasi.</p>
        </div>
      </div>

      {/* PANGGIL CLIENT FORM YANG KONSISTEN */}
      <AddCategoryForm />
      
    </div>
  );
}