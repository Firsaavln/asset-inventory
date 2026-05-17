import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react"; // 👈 Tambahan ShieldAlert
import EditAssetForm from "./EditAssetForm";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";

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
  const isSuperAdmin = userRole === "superadmin";

  // 1. PROTEKSI READ-ONLY ROLE (Konsisten dengan halaman Add)
  if (userRole === "user") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
          Akun Anda memiliki level akses <strong>Read-Only</strong>. Anda tidak diizinkan untuk menambah, mengubah, atau menghapus data di sistem ini.
        </p>
        <Link href={`/assets/${assetId}`} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
          Kembali ke Detail Aset
        </Link>
      </div>
    );
  }

  // 2. FIREWALL IDOR UNTUK PILIHAN KATEGORI
  const whereClause: any = {};
  if (!isSuperAdmin) {
    whereClause.branch = userBranch || "UNKNOWN_BRANCH";
  }

  // Tarik data paralel dari database (Kategori sekarang terlindungi dari IDOR)
  const [rawAsset, categories] = await Promise.all([
    prisma.asset.findUnique({ where: { id: assetId } }),
    prisma.category.findMany({ 
      where: whereClause, // 👈 Filter Kategori Berdasarkan Cabang Admin
      select: { id: true, category_name: true } 
    })
  ]);

  if (!rawAsset) notFound();

  // 3. PROTEKSI IDOR URL MANIPULATION (Untuk Aset Utama):
  // Jika bukan superadmin, dan cabang aset berbeda dengan cabang loginnya, LEMPAR 404!
  if (!isSuperAdmin && rawAsset.branch !== userBranch) {
    notFound(); // Dibuat 404 agar penyerang mengira data aset tersebut memang tidak ada
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

      {/* Komponen form sama sekali tidak disentuh */}
      <EditAssetForm asset={asset} categories={categories} />
    </div>
  );
}