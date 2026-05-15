"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordLog } from "@/lib/logger";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";

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
      branch: payload.branch as string // 🔥 Tambahan: Ambil data cabang
    };
  }
  return { name: "System", role: "ADMIN", branch: "HO - Head Office" };
}

// ==========================================
// 1. CREATE ASSIGNMENT (DENGAN FIREWALL & LOG)
// ==========================================
export async function createAssignment(formData: FormData) {
  const actor = await getActor();
  const asset_id = parseInt(formData.get("asset_id") as string);
  const borrower_name = formData.get("borrower_name") as string;
  const department = formData.get("department") as string;
  const notes = formData.get("notes") as string || "";

  try {
    const asset = await prisma.asset.findUnique({ where: { id: asset_id } });
    if (!asset) return { success: false, message: "Aset tidak ditemukan." };

    // 🔥 FIREWALL LOGIC: Cegah pinjam aset beda cabang
    if (actor.role !== "superadmin" && asset.branch !== actor.branch) {
      await recordLog("UPDATE", "ASSIGNMENT", `[SECURITY ALERT] Akses Ilegal: Mencoba handover aset cabang ${asset.branch}`, actor.name, actor.role);
      return { success: false, message: "Akses Ditolak: Aset berada di cabang lain." };
    }

    await prisma.$transaction([
      prisma.assignment.create({
        data: { asset_id, borrower_name, department, notes }
      }),
      prisma.asset.update({
        where: { id: asset_id },
        data: { status: "Assigned" }
      })
    ]);

    // 👈 CATAT KE LOG
    await recordLog(
      "CREATE", 
      "ASSIGNMENT", 
      `Handover aset: ${asset.asset_code} - ${asset.asset_name} kepada ${borrower_name} (${department})`,
      actor.name,
      actor.role
    );

    revalidatePath("/assignments");
    revalidatePath("/");
    revalidatePath("/logs");

    return { success: true }; // 👈 Kembalikan ini

  } catch (error) {
    return { success: false, message: "Gagal memproses data handover." };
  }
  
  // Catatan: redirect ditaruh di luar blok try-catch untuk mencegah error "NEXT_REDIRECT"
  redirect("/assignments");
}

// ==========================================
// 2. UPDATE ASSIGNMENT (DENGAN FIREWALL & LOG)
// ==========================================
export async function updateAssignment(id: number, formData: FormData) {
  const actor = await getActor();
  const borrower_name = formData.get("borrower_name") as string;
  const department = formData.get("department") as string;
  const notes = formData.get("notes") as string || "";

  try {
    // Ambil data assignment lama beserta asetnya
    const oldData = await prisma.assignment.findUnique({ 
      where: { id },
      include: { asset: true }
    });

    if (!oldData) return { success: false, message: "Data handover tidak ditemukan." };

    // 🔥 FIREWALL LOGIC: Cegah edit handover beda cabang
    if (actor.role !== "superadmin" && oldData.asset.branch !== actor.branch) {
      await recordLog("UPDATE", "ASSIGNMENT", `[SECURITY ALERT] Akses Ilegal: Mencoba edit handover cabang ${oldData.asset.branch}`, actor.name, actor.role);
      return { success: false, message: "Akses Ditolak: Anda tidak berhak mengubah data cabang ini." };
    }

    await prisma.assignment.update({
      where: { id },
      data: { borrower_name, department, notes }
    });

    // 👈 CATAT KE LOG
    await recordLog(
      "UPDATE", 
      "ASSIGNMENT", 
      `Update data handover aset ${oldData.asset.asset_code} untuk PIC: ${borrower_name}`,
      actor.name,
      actor.role
    );

    revalidatePath("/assignments");
    revalidatePath("/logs");
  } catch (error) {
    return { success: false, message: "Gagal memperbarui data." };
  }
  
  // redirect("/assignments");
}

// ==========================================
// 3. DELETE/RETURN ASSIGNMENT (DENGAN FIREWALL & LOG)
// ==========================================
export async function deleteAssignment(id: number, asset_id: number) {
  const actor = await getActor();
  
  try {
    // Cari info aset & penugasan sebelum dihapus datanya
    const asset = await prisma.asset.findUnique({ where: { id: asset_id } });
    const assignment = await prisma.assignment.findUnique({ where: { id } });

    if (!asset || !assignment) return { success: false, message: "Data tidak ditemukan." };

    // 🔥 FIREWALL LOGIC: Cegah pengembalian (return) aset beda cabang
    if (actor.role !== "superadmin" && asset.branch !== actor.branch) {
      await recordLog("DELETE", "ASSIGNMENT", `[SECURITY ALERT] Akses Ilegal: Mencoba return aset cabang ${asset.branch}`, actor.name, actor.role);
      return { success: false, message: "Akses Ditolak: Anda tidak berhak memproses aset cabang lain." };
    }

    await prisma.$transaction([
      prisma.assignment.delete({ where: { id } }),
      prisma.asset.update({
        where: { id: asset_id },
        data: { status: "Available" }
      })
    ]);

    // 👈 CATAT KE LOG (Label: RETURN)
    await recordLog(
      "DELETE", 
      "ASSIGNMENT", 
      `Aset dikembalikan oleh ${assignment.borrower_name}: ${asset.asset_code} - ${asset.asset_name}`,
      actor.name,
      actor.role
    );

    revalidatePath("/assignments");
    revalidatePath("/");
    revalidatePath("/logs");
    
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal memproses pengembalian aset." };
  }
}