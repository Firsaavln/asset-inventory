"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordLog } from "@/lib/logger"; // 👈 Import Logger
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
      role: payload.role as string 
    };
  }
  return { name: "System", role: "ADMIN" };
}

// ==========================================
// 1. CREATE ASSIGNMENT (DENGAN LOG)
// ==========================================
export async function createAssignment(formData: FormData) {
  const actor = await getActor();
  const asset_id = parseInt(formData.get("asset_id") as string);
  const borrower_name = formData.get("borrower_name") as string;
  const department = formData.get("department") as string;
  const notes = formData.get("notes") as string || "";

  // Ambil detail aset dulu buat pesan log yang jelas
  const asset = await prisma.asset.findUnique({ where: { id: asset_id } });

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
    `Handover aset: ${asset?.asset_code} - ${asset?.asset_name} kepada ${borrower_name} (${department})`,
    actor.name,
    actor.role
  );

  revalidatePath("/assignments");
  revalidatePath("/");
  revalidatePath("/logs");
  redirect("/assignments");
}

// ==========================================
// 2. UPDATE ASSIGNMENT (DENGAN LOG)
// ==========================================
export async function updateAssignment(id: number, formData: FormData) {
  const actor = await getActor();
  const borrower_name = formData.get("borrower_name") as string;
  const department = formData.get("department") as string;
  const notes = formData.get("notes") as string || "";

  // Ambil data assignment lama untuk log
  const oldData = await prisma.assignment.findUnique({ 
    where: { id },
    include: { asset: true }
  });

  await prisma.assignment.update({
    where: { id },
    data: { borrower_name, department, notes }
  });

  // 👈 CATAT KE LOG
  await recordLog(
    "UPDATE", 
    "ASSIGNMENT", 
    `Update data handover aset ${oldData?.asset.asset_code} untuk PIC: ${borrower_name}`,
    actor.name,
    actor.role
  );

  revalidatePath("/assignments");
  revalidatePath("/logs");
  redirect("/assignments");
}

// ==========================================
// 3. DELETE/RETURN ASSIGNMENT (DENGAN LOG)
// ==========================================
export async function deleteAssignment(id: number, asset_id: number) {
  const actor = await getActor();
  
  // Cari info aset dulu sebelum dihapus datanya
  const asset = await prisma.asset.findUnique({ where: { id: asset_id } });
  const assignment = await prisma.assignment.findUnique({ where: { id } });

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
    `Aset dikembalikan oleh ${assignment?.borrower_name}: ${asset?.asset_code} - ${asset?.asset_name}`,
    actor.name,
    actor.role
  );

  revalidatePath("/assignments");
  revalidatePath("/");
  revalidatePath("/logs");
}