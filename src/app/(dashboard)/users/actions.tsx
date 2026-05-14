"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { recordLog } from "@/lib/logger"; 
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";

async function getActor() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (token) {
    const payload = await decrypt(token);
    if (payload) return { name: payload.name as string, role: payload.role as string };
  }
  return { name: "System", role: "System" };
}

export async function addUser(formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const rawPassword = formData.get("password") as string;
  const role = formData.get("role") as string;
  const branch = formData.get("branch") as string;

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.user.create({
    data: { name, username, password: hashedPassword, role, branch }
  });

  const actor = await getActor();
  await recordLog("CREATE", "USER", `Membuat akun baru: ${name} (${role}) di ${branch}`, actor.name, actor.role);

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUser(formData: FormData) {
  const rawId = formData.get("id") as string; 
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const branch = formData.get("branch") as string;
  const rawPassword = formData.get("password") as string;

  // 🔥 KONVERSI KE NUMBER: Karena schema Anda menggunakan Integer
  const idNumber = parseInt(rawId, 10);

  const updateData: any = { name, role, branch };

  if (rawPassword && rawPassword.trim() !== "") {
    updateData.password = await bcrypt.hash(rawPassword, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: idNumber }, // 👈 Menggunakan id tipe number
    data: updateData
  });

  const actor = await getActor();
  await recordLog("UPDATE", "USER", `Memperbarui profil akun: ${updatedUser.name}`, actor.name, actor.role);

  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUser(id: number) { // 👈 Parameter diganti ke number
  const user = await prisma.user.findUnique({ 
    where: { id: id } 
  });
  
  if (user) {
    await prisma.user.delete({ 
      where: { id: id } 
    });
    
    const actor = await getActor();
    await recordLog("DELETE", "USER", `Menghapus akun: ${user.name}`, actor.name, actor.role);
  }

  revalidatePath("/users");
}