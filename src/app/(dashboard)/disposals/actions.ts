"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordLog } from "@/lib/logger";
import { cookies } from "next/headers"; // 👈 Import untuk deteksi session
import { decrypt } from "@/lib/auth";   // 👈 Import untuk deteksi session

// ==========================================
// HELPER: AMBIL DATA USER DARI SESSION
// ==========================================
async function getActor() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (token) {
    const payload = await decrypt(token);
    if (payload) return { 
      name: payload.name as string, 
      role: payload.role as string,
      branch: payload.branch as string 
    };
  }
  return { name: "System", role: "ADMIN", branch: "HO - Head Office" };
}

// 1. RESTORE ASET (Kembalikan ke status Available dengan Secure Firewall)
export async function restoreAssetAction(formData: FormData) {
  const actor = await getActor();
  const id = Number(formData.get("id"));
  
  // Ambil data aset terlebih dahulu untuk verifikasi cabang
  const existingAsset = await prisma.asset.findUnique({ where: { id } });
  if (!existingAsset) return { error: "Aset tidak ditemukan." };

  // 🔥 FIREWALL SECURITY CHECK
  const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
  if (!isSuperAdmin && existingAsset.branch !== actor.branch) {
    await recordLog("UPDATE", "ASSET", `[SECURITY ALERT] Akses Ilegal: Mencoba me-restore aset milik cabang ${existingAsset.branch}`, actor.name, actor.role);
    return { error: "Akses Ditolak: Anda tidak memiliki wewenang untuk mengelola aset di cabang ini." };
  }

  const asset = await prisma.asset.update({
    where: { id },
    data: { status: "Available" }
  });

  await recordLog("UPDATE", "ASSET", `Me-restore aset dari Gudang Disposal: ${asset.asset_code}`, actor.name, actor.role);

  revalidatePath("/disposals");
  revalidatePath("/assets");
  revalidatePath("/logs");
  return { success: true };
}

// 2. DELETE PERMANENT (Hapus selamanya dari Database dengan Secure Firewall)
export async function permanentDeleteAction(formData: FormData) {
  const actor = await getActor();
  const id = Number(formData.get("id"));

  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) return { error: "Aset tidak ditemukan." };

  // 🔥 FIREWALL SECURITY CHECK
  const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
  if (!isSuperAdmin && asset.branch !== actor.branch) {
    await recordLog("DELETE", "ASSET", `[SECURITY ALERT] Akses Ilegal: Mencoba menghapus permanen aset milik cabang ${asset.branch}`, actor.name, actor.role);
    return { error: "Akses Ditolak: Anda tidak memiliki wewenang untuk memusnahkan aset di cabang ini." };
  }

  await prisma.asset.delete({ where: { id } });
  await recordLog("DELETE", "ASSET", `Menghapus aset secara permanen: ${asset.asset_code} - ${asset.asset_name}`, actor.name, actor.role);

  revalidatePath("/disposals");
  revalidatePath("/logs");
  return { success: true };
}