import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditAssetForm from "./EditAssetForm";
import { cookies } from "next/headers"; // 👈 Tambahan untuk session
import { decrypt } from "@/lib/auth";   // 👈 Tambahan untuk membaca session

export const dynamic = "force-dynamic";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const assetId = Number(resolvedParams.id);

  // ====================================================================
  // 🔥 INSIDE FIREWALL SECURE ENGINE: ACCESS & IDOR MITIGATION
  // ====================================================================
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;

  if (!payload) redirect("/login");

  const userRole = (payload.role as string).toLowerCase();
  const userBranch = payload.branch as string;

  // 1. PROTEKSI READ-ONLY ROLE:
  // Karena peran 'user' hanya boleh membaca, mereka dilarang keras masuk ke halaman edit.
  // Jika nekat ketik URL manual, langsung lempar ke 404.
  if (userRole === "user") {
    notFound();
  }

  // Tarik data paralel dari database
  const [rawAsset, categories] = await Promise.all([
    prisma.asset.findUnique({ where: { id: assetId } }),
    prisma.category.findMany({ select: { id: true, category_name: true } })
  ]);

  if (!rawAsset) notFound();

  // 2. PROTEKSI IDOR URL MANIPULATION:
  // Jika bukan superadmin, dan cabang aset berberda dengan cabang loginnya, TENDANG!
  if (userRole !== "superadmin" && rawAsset.branch !== userBranch) {
    notFound();
  }
  // ====================================================================

  // --- PROSES SERIALIZATION (Disempurnakan untuk Input HTML Date) ---
  const asset = {
    ...rawAsset,
    price: Number(rawAsset.price), 
    
    // 🔥 TIPS SAKTI: Menggunakan .split('T')[0] agar string tanggal berformat YYYY-MM-DD.
    // Jika hanya .toISOString(), formatnya '2026-05-16T00:00:00.000Z' yang bikin tag <input type="date"> di EditAssetForm jadi KOSONG/ERR.
    purchase_date: rawAsset.purchase_date ? rawAsset.purchase_date.toISOString().split('T')[0] : null,
    warranty_date: rawAsset.warranty_date ? rawAsset.warranty_date.toISOString().split('T')[0] : null,
    
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

      <EditAssetForm asset={asset} categories={categories} />
    </div>
  );
}