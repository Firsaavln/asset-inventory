import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditCategoryForm from "./EditCategoryForm"; // 👈 Import komponen client

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. Resolve Params (Next.js 15) & Tarik data dari DB
  const resolvedParams = await params;
  const categoryId = Number(resolvedParams.id);

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    redirect("/categories");
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2 mb-8">
        <Link 
          href="/categories" 
          className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-all w-fit group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Batal & Kembali
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Edit Kategori</h1>
          <p className="text-slate-500 font-medium mt-1">Perbarui nama klasifikasi atau pindah wewenang departemen.</p>
        </div>
      </div>

      {/* PANGGIL CLIENT FORM & OPER DATA DARI DATABASE */}
      <EditCategoryForm category={category} />
      
    </div>
  );
}