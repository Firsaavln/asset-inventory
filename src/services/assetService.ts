import { prisma } from "../lib/prisma";

export async function getAssets(userRole: string, userBranch: string) {
  // Gunakan undefined, jangan gunakan {} jika ingin mengambil semua data
  const whereClause = userRole === "superadmin" || userBranch === "ALL" 
    ? undefined 
    : { branch: userBranch };

  return await prisma.asset.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: { created_at: "desc" },
  });
}

export async function createAsset(data: {
  name: string; 
  category_id: number; 
  purchase_date: Date; 
  status: string;
  managing_division: string; // 🔥 FIX 1: Tambahkan divisi pengelola (IT, GA, HR) karena di schema WAJIB bray
  specification?: string; 
  purchase_price?: number; 
  vendor_name?: string; 
  warranty_expiry?: Date;
  branch: string;
}) {
  // Generate kode aset otomatis (Contoh: AST-202605-4321)
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const assetCode = `AST-${dateStr}-${randomNum}`;

  return await prisma.asset.create({
    data: {
      asset_code: assetCode,
      asset_name: data.name,
      category_id: data.category_id,
      status: data.status,
      purchase_date: data.purchase_date,
      managing_division: data.managing_division, // 🔥 FIX 2: Petakan ke kolom managing_division database
      description: data.specification ?? null,
      price: data.purchase_price ?? 0,            // 🔥 FIX 3: Kasih fallback 0 karena di database kolom Decimal ini wajib ada nilai
      vendor_name: data.vendor_name ?? null,
      warranty_date: data.warranty_expiry ?? null, // 🔥 FIX 4: Ubah dari 'warranty_expiry' menjadi 'warranty_date' sesuai schema
      branch: data.branch,
    },
  });
}