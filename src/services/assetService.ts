import { prisma } from "../lib/prisma";

export async function getAssets(userRole: string, userBranch: string) {
  // PERBAIKAN: Gunakan undefined, jangan gunakan {}
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
  name: string; category_id: number; purchase_date: Date; status: string;
  specification?: string; purchase_price?: number; vendor_name?: string; warranty_expiry?: Date;
  branch: string;
}) {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const assetCode = `AST-${dateStr}-${randomNum}`;

  return await prisma.asset.create({
    data: {
      asset_code: assetCode,
      name: data.name,
      category_id: data.category_id,
      status: data.status,
      purchase_date: data.purchase_date,
      specification: data.specification,
      purchase_price: data.purchase_price,
      vendor_name: data.vendor_name,
      warranty_expiry: data.warranty_expiry,
      branch: data.branch,
    },
  });
}