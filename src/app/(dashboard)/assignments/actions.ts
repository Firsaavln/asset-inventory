"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAssignment(formData: FormData) {
  const asset_id = parseInt(formData.get("asset_id") as string);
  const borrower_name = formData.get("borrower_name") as string;
  const department = formData.get("department") as string;
  const notes = formData.get("notes") as string || "";

  await prisma.$transaction([
    prisma.assignment.create({
      data: { asset_id, borrower_name, department, notes }
    }),
    prisma.asset.update({
      where: { id: asset_id },
      data: { status: "Assigned" }
    })
  ]);

  revalidatePath("/assignments");
  revalidatePath("/");
  redirect("/assignments");
}

export async function updateAssignment(id: number, formData: FormData) {
  const borrower_name = formData.get("borrower_name") as string;
  const department = formData.get("department") as string;
  const notes = formData.get("notes") as string || "";

  await prisma.assignment.update({
    where: { id },
    data: { borrower_name, department, notes }
  });

  revalidatePath("/assignments");
  redirect("/assignments");
}

export async function deleteAssignment(id: number, asset_id: number) {
  await prisma.$transaction([
    prisma.assignment.delete({ where: { id } }),
    prisma.asset.update({
      where: { id: asset_id },
      data: { status: "Available" }
    })
  ]);

  revalidatePath("/assignments");
  revalidatePath("/");
}