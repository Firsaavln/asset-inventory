import { prisma } from "@/lib/prisma"; // Sesuaikan path prisma lu
import AssetForm from "./AssetForm"; // Kita buat file ini di bawah
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AddAssetPage() {
  // Mengambil data kategori aktif dari database
  const categories = await prisma.category.findMany({
    orderBy: { category_name: 'asc' }
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2">
        <Link href="/assets" className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-all w-fit group">
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Daftar Aset
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Registrasi Aset Baru</h1>
          <p className="text-slate-500 font-medium mt-1">Lengkapi form di bawah untuk memasukkan aset ke dalam inventaris perusahaan.</p>
        </div>
      </div>

      {/* Panggil komponen Client Form dan oper data kategorinya */}
      <AssetForm initialCategories={categories} />
    </div>
  );
}