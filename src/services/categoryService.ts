import { prisma } from "@/lib/prisma";

export const CategoryService = {
  async getAllCategories() {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { assets: true } } }
    });
  },

  async createCategory(name: string, ownerDept: string) {
    return await prisma.category.create({
      data: { name, owner_dept: ownerDept },
    });
  },

  async deleteCategory(id: number) {
    return await prisma.category.delete({
      where: { id },
    });
  }
};