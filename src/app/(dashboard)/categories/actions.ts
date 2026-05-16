"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordLog } from "@/lib/logger"; 
import { cookies } from "next/headers"; // 👈 Tambahan untuk session
import { decrypt } from "@/lib/auth";   // 👈 Tambahan untuk session

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

// FUNGSI CREATE (Ditambah Auto-Branch Assignment)
export async function createCategory(formData: FormData) {
  const actor = await getActor();
  const name = formData.get("category_name") as string;
  const dept = formData.get("owner_dept") as string;

  if (!name || !dept) throw new Error("Data tidak lengkap");

  // 🔥 Jika Superadmin buat kategori, cek apakah ada input branch spesifik, jika tidak pakai HO.
  // Jika Admin biasa, paksa kunci ke cabangnya sendiri.
  const branchInput = formData.get("branch") as string;
  const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
  const finalBranch = isSuperAdmin && branchInput ? branchInput : actor.branch;

  const newCategory = await prisma.category.create({
    data: { 
      category_name: name, 
      owner_dept: dept,
      branch: finalBranch // 🔥 Cabang disematkan otomatis ke database
    },
  });

  await recordLog("CREATE", "CATEGORY", `Membuat kategori baru: ${name} (${dept}) di ${finalBranch}`, actor.name, actor.role);

  revalidatePath("/categories");
  revalidatePath("/logs"); 
  return newCategory;
}

// FUNGSI UPDATE (Dengan Firewall Antar Cabang)
export async function updateCategory(id: number, formData: FormData) {
  const actor = await getActor();
  const name = formData.get("category_name") as string;
  const dept = formData.get("owner_dept") as string;

  if (!name || !dept) throw new Error("Data tidak lengkap");

  // 🔥 FIREWALL CHECK
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new Error("Kategori tidak ditemukan");

  const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
  if (!isSuperAdmin && existing.branch !== actor.branch) {
    await recordLog("UPDATE", "CATEGORY", `[SECURITY ALERT] Akses Ilegal: Mencoba edit kategori cabang ${existing.branch}`, actor.name, actor.role);
    throw new Error("Akses Ditolak: Anda tidak berwenang memodifikasi kategori cabang lain.");
  }

  const updated = await prisma.category.update({
    where: { id },
    data: { category_name: name, owner_dept: dept },
  });

  await recordLog("UPDATE", "CATEGORY", `Memperbarui kategori: ${name}`, actor.name, actor.role);

  revalidatePath("/categories");
  revalidatePath("/logs"); 
  return updated;
}

// FUNGSI DELETE (Dengan Firewall Antar Cabang)
export async function deleteCategoryAction(id: number) {
  const actor = await getActor();
  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return { success: false, message: "Kategori tidak ditemukan." };

    // 🔥 FIREWALL CHECK
    const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
    if (!isSuperAdmin && category.branch !== actor.branch) {
      await recordLog("DELETE", "CATEGORY", `[SECURITY ALERT] Akses Ilegal: Mencoba hapus kategori cabang ${category.branch}`, actor.name, actor.role);
      return { success: false, message: "Akses Ditolak: Kategori ini milik cabang lain." };
    }

    await prisma.category.delete({
      where: { id }
    });
    
    await recordLog("DELETE", "CATEGORY", `Menghapus kategori: ${category.category_name}`, actor.name, actor.role);

    revalidatePath("/categories");
    revalidatePath("/logs"); 
    return { success: true };
    
  } catch (error) {
    return { success: false, message: "Kategori gagal dihapus. Pastikan tidak ada aset yang masih memakai kategori ini." };
  }
}

// FUNGSI EXPORT EXCEL (Dengan Firewall Filter Data)
export async function getCategoriesForExport() {
  const actor = await getActor();
  const whereClause: any = {};

  // 🔥 Jika bukan superadmin, hanya data cabang sendiri yang boleh dieksport
  const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
  if (!isSuperAdmin) {
    whereClause.branch = actor.branch || "UNKNOWN_BRANCH";
  }

  const data = await prisma.category.findMany({
    where: whereClause, // 👈 Pasang firewall filter
    orderBy: { created_at: "desc" },
    select: { id: true, category_name: true, owner_dept: true, created_at: true }
  });
  return data;
}