import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditAssetForm from "./EditAssetForm";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const assetId = Number(resolvedParams.id);

  const [rawAsset, categories] = await Promise.all([
    prisma.asset.findUnique({ where: { id: assetId } }),
    prisma.category.findMany({ select: { id: true, category_name: true } })
  ]);

  if (!rawAsset) notFound();

  // --- PROSES SERIALIZATION ---
  // Kita ubah Decimal & Date menjadi Plain Objects agar aman dilempar ke Client Component
  const asset = {
    ...rawAsset,
    price: Number(rawAsset.price), // Konversi Decimal ke Number
    purchase_date: rawAsset.purchase_date?.toISOString() || null, // Date ke String
    warranty_date: rawAsset.warranty_date?.toISOString() || null,
    created_at: rawAsset.created_at.toISOString(),
    updated_at: rawAsset.updated_at.toISOString(),
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 mb-4">
        <Link 
          href={`/assets/${asset.id}`} 
          className="flex items-center text-sm font-bold text-slate-500 hover:text-amber-600 transition-all w-fit group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Batal & Kembali ke Detail
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Edit Aset: {asset.asset_code}
        </h1>
      </div>

      {/* Sekarang variabel asset sudah berupa Plain Object yang didukung Next.js */}
      <EditAssetForm asset={asset} categories={categories} />
    </div>
  );
}