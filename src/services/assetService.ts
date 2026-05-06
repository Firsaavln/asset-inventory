// src/services/assetService.ts
import { prisma } from "../lib/prisma";

// Fungsi untuk mengambil semua aset beserta nama kategorinya
export async function getAssets() {
  return await prisma.asset.findMany({
    include: {
      category: true, // Menarik data dari tabel relasi (JOIN)
    },
    orderBy: { created_at: "desc" },
  });
}

// Fungsi untuk menambah aset baru
export async function createAsset(data: {
  name: string;
  category_id: number;
  purchase_date: Date;
}) {
  // Generate Asset Code unik (Bisa dipakai untuk QR Code nanti)
  // Format: AST-TahunBulan-RandomNumber (Contoh: AST-202605-1234)
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const assetCode = `AST-${dateStr}-${randomNum}`;

  return await prisma.asset.create({
    data: {
      asset_code: assetCode,
      name: data.name,
      category_id: data.category_id,
      purchase_date: data.purchase_date,
      status: "Available",
    },
  });
}