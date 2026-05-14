"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordLog } from "@/lib/logger";

// 1. RESTORE ASET (Kembalikan ke status Available)
export async function restoreAssetAction(formData: FormData) {
  const id = Number(formData.get("id"));
  
  const asset = await prisma.asset.update({
    where: { id },
    data: { status: "Available" }
  });

  await recordLog("UPDATE", "ASSET", `Me-restore aset dari Gudang Disposal: ${asset.asset_code}`);

  revalidatePath("/disposals");
  revalidatePath("/assets");
  revalidatePath("/logs");
}

// 2. DELETE PERMANENT (Hapus selamanya dari Database)
export async function permanentDeleteAction(formData: FormData) {
  const id = Number(formData.get("id"));

  const asset = await prisma.asset.findUnique({ where: { id } });
  
  if (asset) {
    await prisma.asset.delete({ where: { id } });
    await recordLog("DELETE", "ASSET", `Menghapus aset secara permanen: ${asset.asset_code} - ${asset.asset_name}`);
  }

  revalidatePath("/disposals");
  revalidatePath("/logs");
}