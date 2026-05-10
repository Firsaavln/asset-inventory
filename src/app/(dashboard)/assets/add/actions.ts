"use server";

import { prisma } from "@/lib/prisma"; // Sesuaikan path prisma lu
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAsset(formData: FormData) {
  // 1. Tangkap semua data dari form berdasarkan atribut 'name'
  const name = formData.get("asset_name") as string;
  const category = formData.get("category") as string;
  const department = formData.get("department") as string;
  const condition = formData.get("condition") as string;
  const vendor = formData.get("vendor") as string;
  const description = formData.get("description") as string;
  const purchaseDate = formData.get("purchase_date") as string;
  const warrantyDate = formData.get("warranty_date") as string;
  
  // Catatan DevOps: Untuk file gambar (foto aset), biasanya kita upload dulu ke AWS S3, Supabase Storage, atau folder public.
  // Untuk sementara, kita anggap file berhasil diupload dan kita simpan path/nama filenya.
  const imageFile = formData.get("image") as File;
  const imageName = imageFile?.size > 0 ? imageFile.name : null;

  try {
    // 2. Simpan ke Database via Prisma
    // NANTI SESUAIKAN: Nama field di bawah ini (name, category_id, dll) sesuaikan dengan schema.prisma lu nanti
    await prisma.asset.create({
      data: {
        name: name,
        asset_code: `AST-${new Date().getTime().toString().slice(-6)}`, // Generate kode otomatis
        category_id: 1, // Kategori dummy, nanti sesuaikan relasinya
        status: "Available",
        condition: condition,
        vendor: vendor,
        description: description,
        purchase_date: purchaseDate ? new Date(purchaseDate) : new Date(),
        warranty_expired: warrantyDate ? new Date(warrantyDate) : null,
        image_url: imageName,
      },
    });

    // 3. Bersihkan cache halaman daftar aset biar data barunya langsung muncul
    revalidatePath("/assets");
    
  } catch (error) {
    console.error("Gagal menyimpan aset:", error);
    throw new Error("Gagal menyimpan data ke database.");
  }

  // 4. Redirect kembali ke halaman daftar aset setelah sukses
  redirect("/assets");
}