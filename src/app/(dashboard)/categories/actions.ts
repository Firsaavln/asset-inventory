"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// FUNGSI CREATE
export async function createCategory(formData: FormData) {
  const name = formData.get("category_name") as string;
  const dept = formData.get("owner_dept") as string;

  if (!name || !dept) throw new Error("Data tidak lengkap");

  const newCategory = await prisma.category.create({
    data: { 
      category_name: name, 
      owner_dept: dept 
    },
  });

  revalidatePath("/categories");
  return newCategory;
}

// FUNGSI UPDATE (Untuk sinkronisasi)
export async function updateCategory(id: number, formData: FormData) {
  const name = formData.get("category_name") as string;
  const dept = formData.get("owner_dept") as string;

  if (!name || !dept) throw new Error("Data tidak lengkap");

  const updated = await prisma.category.update({
    where: { id },
    data: { category_name: name, owner_dept: dept },
  });

  revalidatePath("/categories");
  return updated;
}


export async function deleteCategoryAction(id: number) {
    try {
      await prisma.category.delete({
        where: { id }
      });
      
      revalidatePath("/categories");
      return { success: true };
      
    } catch (error) {
      return { success: false, message: "Kategori gagal dihapus. Pastikan tidak ada aset yang masih memakai kategori ini." };
    }
  }


  // ... (fungsi create, update, delete yang udah ada biarin aja)

// FUNGSI BARU UNTUK EXPORT EXCEL
export async function getCategoriesForExport() {
    const data = await prisma.category.findMany({
      orderBy: { created_at: "desc" },
      select: { id: true, category_name: true, owner_dept: true, created_at: true }
    });
    return data;
  }