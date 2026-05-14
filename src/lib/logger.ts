import { prisma } from "@/lib/prisma";

type LogAction = "CREATE" | "UPDATE" | "DELETE" | "SYNC" | "LOGIN";
type LogEntity = "ASSET" | "ASSIGNMENT" | "USER" | "CATEGORY" | "SYSTEM";

export async function recordLog(
  action: LogAction,
  entity: LogEntity,
  detail: string,
  userName: string = "System", // Nantinya bisa diambil dari session
  userRole: string = "system"
) {
  try {
    await prisma.log.create({
      data: {
        action,
        entity,
        detail,
        user: userName,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("Gagal mencatat log ke database:", error);
  }
}