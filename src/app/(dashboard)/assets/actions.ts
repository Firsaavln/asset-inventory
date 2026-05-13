"use server";


import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function createAsset(formData: FormData) {
  try {
    // 1. Ambil data teks dari form
    const asset_name = formData.get("asset_name") as string;
    const category_id = Number(formData.get("category_id"));
    const managing_division = formData.get("managing_division") as string;
    const serial_number = formData.get("serial_number") as string || null;
    const condition = formData.get("condition") as string;
    const location = formData.get("location") as string || null;
    const price = formData.get("price") as string;
    const vendor_name = formData.get("vendor_name") as string || null;
    const description = formData.get("description") as string || null;
    const purchase_date = new Date(formData.get("purchase_date") as string);
    const warranty_date_raw = formData.get("warranty_date") as string;
    const warranty_date = warranty_date_raw ? new Date(warranty_date_raw) : null;

    // 2. Fungsi Helper untuk Upload File ke lokal folder (public/uploads)
    const handleFileUpload = async (fileKey: string) => {
      const file = formData.get(fileKey) as File;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Buat nama file unik
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const uploadDir = path.join(process.cwd(), "public/uploads");
        
        // Pastikan folder uploads ada (kalau belum, otomatis dibuat)
        await fs.mkdir(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);
        
        return `/uploads/${fileName}`; // Path yang disimpan ke database
      }
      return null;
    };

    // Eksekusi upload foto & invoice
    const asset_image = await handleFileUpload("asset_image");
    const invoice_file = await handleFileUpload("invoice_file");

    // 3. Generate Kode Aset Otomatis (Contoh: AST-2026-XYZ123)
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const asset_code = `AST-${new Date().getFullYear()}-${randomStr}`;

    // 4. Simpan ke Database
    await prisma.asset.create({
      data: {
        asset_code,
        asset_name,
        category_id,
        managing_division,
        serial_number,
        condition,
        location,
        price: Number(price), // Prisma desimal menerima Number
        vendor_name,
        description,
        purchase_date,
        warranty_date,
        asset_image,
        invoice_file,
        status: "Available", // Status default aset baru
      }
    });

    revalidatePath("/assets");
    return { success: true };

  } catch (error) {
    console.error("Gagal menyimpan aset:", error);
    throw new Error("Gagal menyimpan data ke database.");
  }
}

// 1. FUNGSI HAPUS ASET
export async function deleteAssetAction(id: number) {
  try {
    await prisma.asset.delete({ where: { id } });
    revalidatePath("/assets");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Aset gagal dihapus. Pastikan data tidak terkunci oleh riwayat peminjaman." };
  }
}

// 2. FUNGSI EXPORT EXCEL (Sesuai Filter yang Sedang Aktif)
export async function getAssetsForExport(q?: string, catId?: string, loc?: string) {
  const assets = await prisma.asset.findMany({
    where: {
      asset_name: { contains: q || "" },
      location: { contains: loc || "" },
      ...(catId ? { category_id: Number(catId) } : {})
    },
    include: { category: true }, // Tarik data kategori sekalian
    orderBy: { created_at: "desc" }
  });
  return assets;
}


export async function updateAsset(id: number, formData: FormData) {
    try {
      const asset_name = formData.get("asset_name") as string;
      const category_id = Number(formData.get("category_id"));
      const managing_division = formData.get("managing_division") as string;
      const serial_number = formData.get("serial_number") as string || null;
      const condition = formData.get("condition") as string;
      const location = formData.get("location") as string || null;
      const price = formData.get("price") as string;
      const vendor_name = formData.get("vendor_name") as string || null;
      const description = formData.get("description") as string || null;
      const status = formData.get("status") as string; // Tambahan status saat edit
      const purchase_date = new Date(formData.get("purchase_date") as string);
      const warranty_date_raw = formData.get("warranty_date") as string;
      const warranty_date = warranty_date_raw ? new Date(warranty_date_raw) : null;
  
      // Helper upload (sama seperti create)
      const handleFileUpload = async (fileKey: string) => {
        const file = formData.get(fileKey) as File;
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
          const uploadDir = path.join(process.cwd(), "public/uploads");
          await fs.mkdir(uploadDir, { recursive: true });
          const filePath = path.join(uploadDir, fileName);
          await fs.writeFile(filePath, buffer);
          return `/uploads/${fileName}`;
        }
        return null;
      };
  
      const new_image = await handleFileUpload("asset_image");
      const new_invoice = await handleFileUpload("invoice_file");
  
      // Persiapkan data update
      const updateData: any = {
        asset_name,
        category_id,
        managing_division,
        serial_number,
        condition,
        location,
        price: Number(price),
        vendor_name,
        description,
        status,
        purchase_date,
        warranty_date,
      };
  
      // Hanya ganti path jika user upload file baru
      if (new_image) updateData.asset_image = new_image;
      if (new_invoice) updateData.invoice_file = new_invoice;
  
      await prisma.asset.update({
        where: { id },
        data: updateData
      });
  
      revalidatePath("/assets");
      revalidatePath(`/assets/${id}`);
      return { success: true };
    } catch (error) {
      console.error(error);
      throw new Error("Gagal memperbarui aset.");
    }
  }