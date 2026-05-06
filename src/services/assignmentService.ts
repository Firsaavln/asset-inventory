// src/services/assignmentService.ts
import { prisma } from "../lib/prisma";

export async function getActiveAssignments() {
  return await prisma.assignment.findMany({
    where: { return_date: null }, // Hanya ambil yang sedang dipinjam
    include: { asset: true },
    orderBy: { assign_date: "desc" },
  });
}

export async function getAvailableAssets() {
  return await prisma.asset.findMany({
    where: { status: "Available" },
  });
}

export async function assignAsset(data: { asset_id: number; borrower_name: string; department: string; notes: string }) {
  // Gunakan Transaction: Buat catatan peminjaman SEKALIGUS ubah status barang
  return await prisma.$transaction([
    prisma.assignment.create({
      data: {
        asset_id: data.asset_id,
        borrower_name: data.borrower_name,
        department: data.department,
        notes: data.notes,
      },
    }),
    prisma.asset.update({
      where: { id: data.asset_id },
      data: { status: "Assigned" },
    }),
  ]);
}