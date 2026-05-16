"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
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
      branch: payload.branch as string 
    };
  }
  return { name: "System", role: "ADMIN", branch: "HO - Head Office" };
}

// ==========================================
// HELPER: UPLOAD FILE (LOKAL)
// ==========================================
const handleFileUpload = async (formData: FormData, fileKey: string) => {
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

// ==========================================
// 1. CREATE ASSET (FIREWALL & SUPERADMIN SUPPORT)
// ==========================================
export async function createAsset(formData: FormData) {
  const actor = await getActor();
  
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
    const purchase_date = new Date(formData.get("purchase_date") as string);
    const warranty_date_raw = formData.get("warranty_date") as string;
    const warranty_date = warranty_date_raw ? new Date(warranty_date_raw) : null;

    // 🔥 LOGIKA CABANG:
    // Jika Superadmin, ambil input cabang dari form (jika ada), kalau tidak ada pakai cabang default superadmin.
    // Jika Admin biasa, paksa gunakan cabang tempat dia bertugas (actor.branch).
    const branchInput = formData.get("branch") as string;
    const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
    const finalBranch = isSuperAdmin && branchInput ? branchInput : actor.branch;

    const asset_image = await handleFileUpload(formData, "asset_image");
    const invoice_file = await handleFileUpload(formData, "invoice_file");

    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const asset_code = `AST-${new Date().getFullYear()}-${randomStr}`;

    await prisma.asset.create({
      data: {
        asset_code,
        asset_name,
        category_id,
        managing_division,
        serial_number,
        condition,
        location,
        branch: finalBranch, // 👈 Disematkan secara dinamis dan aman
        price: Number(price),
        vendor_name,
        description,
        purchase_date,
        warranty_date,
        asset_image,
        invoice_file,
        status: "Available",
      }
    });

    await recordLog("CREATE", "ASSET", `Menambahkan aset: ${asset_code} (${asset_name}) di ${finalBranch}`, actor.name, actor.role);

    revalidatePath("/assets");
    revalidatePath("/logs");

    return { success: true }; 

  } catch (error) {
    console.error("Gagal menyimpan aset:", error);
    return { success: false, error: "Gagal menyimpan data ke database." };
  }
}

// ==========================================
// 2. UPDATE ASSET (FIXED REDIRECT BUG & SECURED)
// ==========================================
export async function updateAsset(id: number, formData: FormData) {
  const actor = await getActor();

  try {
    const existingAsset = await prisma.asset.findUnique({ where: { id } });
    if (!existingAsset) return { success: false, error: "Aset tidak ditemukan." };
    
    // 🔥 FIREWALL LOGIC: Cek apakah Admin yang beda cabang mencoba mengubah aset ini
    const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
    if (!isSuperAdmin && existingAsset.branch !== actor.branch) {
      await recordLog("UPDATE", "ASSET", `[SECURITY ALERT] Akses Ilegal: Mencoba edit aset milik cabang ${existingAsset.branch}`, actor.name, actor.role);
      return { success: false, error: "Akses Ditolak: Anda tidak memiliki wewenang untuk aset di cabang ini." };
    }

    const updateData: any = {
      asset_name: formData.get("asset_name") as string,
      category_id: Number(formData.get("category_id")),
      managing_division: formData.get("managing_division") as string,
      serial_number: formData.get("serial_number") as string || null,
      condition: formData.get("condition") as string,
      location: formData.get("location") as string || null,
      price: Number(formData.get("price")),
      vendor_name: formData.get("vendor_name") as string || null,
      description: formData.get("description") as string || null,
      status: formData.get("status") as string,
      purchase_date: new Date(formData.get("purchase_date") as string),
      warranty_date: formData.get("warranty_date") ? new Date(formData.get("warranty_date") as string) : null,
    };

    const new_image = await handleFileUpload(formData, "asset_image");
    const new_invoice = await handleFileUpload(formData, "invoice_file");

    if (new_image) updateData.asset_image = new_image;
    if (new_invoice) updateData.invoice_file = new_invoice;

    const currentAsset = await prisma.asset.update({
      where: { id },
      data: updateData
    });

    await recordLog("UPDATE", "ASSET", `Update aset: ${currentAsset.asset_code} - ${updateData.asset_name}`, actor.name, actor.role);

    revalidatePath("/assets");
    revalidatePath(`/assets/${id}`);
    revalidatePath("/logs");

    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal memperbarui aset." };
  }
}

// ==========================================
// 3. DELETE ASSET (PERMANEN & SECURED)
// ==========================================
export async function deleteAssetAction(id: number) {
  const actor = await getActor();
  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) return { success: false, message: "Aset tidak ditemukan." };

    // 🔥 FIREWALL LOGIC: Proteksi Hapus Data Antar Cabang
    const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
    if (!isSuperAdmin && asset.branch !== actor.branch) {
      await recordLog("DELETE", "ASSET", `[SECURITY ALERT] Akses Ilegal: Mencoba hapus aset milik cabang ${asset.branch}`, actor.name, actor.role);
      return { success: false, message: "Akses Ditolak: Aset ini terdaftar di cabang lain." };
    }

    await prisma.asset.delete({ where: { id } });
    
    await recordLog("DELETE", "ASSET", `Hapus aset permanen: ${asset.asset_code} - ${asset.asset_name}`, actor.name, actor.role);

    revalidatePath("/assets");
    revalidatePath("/logs");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal hapus. Aset mungkin memiliki riwayat transaksi." };
  }
}

// ==========================================
// 4. DISPOSE ASSET (SECURED)
// ==========================================
export async function disposeAssetAction(id: number) {
  const actor = await getActor();
  try {
    const assetCheck = await prisma.asset.findUnique({ where: { id } });
    if (!assetCheck) return { success: false, message: "Aset tidak ditemukan." };

    // 🔥 FIREWALL LOGIC: Proteksi Pindah Gudang/Disposal
    const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
    if (!isSuperAdmin && assetCheck.branch !== actor.branch) {
      await recordLog("UPDATE", "ASSET", `[SECURITY ALERT] Akses Ilegal: Mencoba membuang aset cabang ${assetCheck.branch}`, actor.name, actor.role);
      return { success: false, message: "Akses Ditolak: Tidak memiliki izin modifikasi cabang tersebut." };
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: { status: "Disposed" }
    });

    await recordLog("UPDATE", "ASSET", `Pindah ke Disposal: ${asset.asset_code}`, actor.name, actor.role);

    revalidatePath("/assets");
    revalidatePath("/disposals");
    revalidatePath("/logs");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal memindahkan ke disposal." };
  }
}

// ==========================================
// 5. GET DATA UNTUK EXCEL (FIREWALL APPLIED)
// ==========================================
export async function getAssetsForExport(q?: string, catId?: string, loc?: string) {
  const actor = await getActor();

  const where: any = {
    asset_name: { contains: q || "" },
    location: { contains: loc || "" },
    status: { not: "Disposed" },
    ...(catId ? { category_id: Number(catId) } : {})
  };

  // 🔥 FILTER EXPORT CABANG
  const isSuperAdmin = actor.role.toLowerCase() === "superadmin";
  if (!isSuperAdmin) {
    where.branch = actor.branch || "UNKNOWN_BRANCH";
  }

  const assets = await prisma.asset.findMany({
    where,
    include: { category: true },
    orderBy: { created_at: "desc" }
  });

  return JSON.parse(JSON.stringify(assets)).map((item: any) => ({
    ...item,
    price: Number(item.price) 
  }));
}