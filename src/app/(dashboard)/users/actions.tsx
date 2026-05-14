"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { recordLog } from "@/lib/logger";

// 1. Tambah User
export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const rawPassword = formData.get("password") as string;
  const role = formData.get("role") as string;
  const branch = formData.get("branch") as string || "Pusat";

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // 👇 INI YANG TADI HILANG: Simpan ke Database
  await prisma.user.create({
    data: { name, username, password: hashedPassword, role, branch }
  });

  // 👈 CATAT KE LOG
  await recordLog("CREATE", "USER", `Membuat akun baru untuk: ${name} (${role})`, "Admin", "superadmin");

  revalidatePath("/users");
  revalidatePath("/logs"); // Beri tahu halaman logs untuk update
  redirect("/users");
}

// 2. Update Profil User
export async function updateUser(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const role = formData.get("role") as string;
  const branch = formData.get("branch") as string;

  await prisma.user.update({
    where: { id },
    data: { name, username, role, branch }
  });

  // 👈 CATAT KE LOG
  await recordLog("UPDATE", "USER", `Memperbarui profil akun: ${name} (${role})`, "Admin", "superadmin");

  revalidatePath("/users");
  revalidatePath("/logs");
  redirect("/users");
}

// 3. Reset Password User
export async function resetPassword(id: number, formData: FormData) {
  const rawPassword = formData.get("new_password") as string;
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });

  // 👈 CATAT KE LOG
  await recordLog("UPDATE", "USER", `Melakukan reset password pada akun: ${updatedUser.name}`, "Admin", "superadmin");

  revalidatePath("/users");
  revalidatePath("/logs");
  // Tidak redirect agar user tetap di halaman edit dan melihat notifikasi/perubahan
}

// 4. Hapus User
export async function deleteUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  
  if (user) {
    await prisma.user.delete({ where: { id } });
    // 👈 CATAT KE LOG
    await recordLog("DELETE", "USER", `Menghapus akun: ${user.name}`, "Admin", "superadmin");
  }

  revalidatePath("/users");
  revalidatePath("/logs");
}