import { prisma } from "@/lib/prisma";

export const CategoryService = {
  async getAllCategories() {
    return await prisma.category.findMany({
      orderBy: { category_name: "asc" }, // 🔥 FIX 1: Ubah 'name' jadi 'category_name' sesuai database bray
      include: { _count: { select: { assets: true } } }
    });
  },

  async createCategory(name: string, ownerDept: string) {
    return await prisma.category.create({
      data: { 
        category_name: name, // 🔥 FIX 2: Petakan parameter 'name' ke kolom 'category_name' database
        owner_dept: ownerDept 
      },
    });
  },

  async deleteCategory(id: number) {
    return await prisma.category.delete({
      where: { id },
    });
  }
};