"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) return { error: "Username dan Password wajib diisi!" };

  // Cari user di database
  const user = await prisma.user.findUnique({ where: { username } });

  // Cek kecocokan password (ingat, password di DB harus di-hash dengan bcrypt saat pembuatan user)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Username atau Password salah!" };
  }

  // Buat Payload / Isi Token
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 Jam
  const session = await encrypt({ 
    id: user.id, 
    name: user.name, 
    role: user.role, 
    branch: user.branch 
  });

  // Tanam Cookie di Browser secara aman (HttpOnly)
  const cookieStore = await cookies();
  cookieStore.set("session", session, { 
    expires, 
    // httpOnly: true, 
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/" 
  });

  redirect("/"); // Arahkan ke dashboard jika sukses
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0), path: "/" }); // Hapus cookie
  redirect("/login");
}