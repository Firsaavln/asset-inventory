import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai menyuntikkan data Admin...");

  // Enkripsi password 'admin123'
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Upsert: Kalau email sudah ada, biarkan. Kalau belum, buat baru.
  const admin = await prisma.user.upsert({
    where: { email: "admin@gree.com" },
    update: {}, // Jangan ubah apa-apa kalau udah ada
    create: {
      name: "Firsawanto Saputra", // Nama lu sekalian nih Bos!
      email: "admin@gree.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Akun Admin berhasil dibuat!");
  console.log("---------------------------------");
  console.log(`Email    : ${admin.email}`);
  console.log(`Password : admin123`);
  console.log("---------------------------------");
}

main()
  .catch((e) => {
    console.error("Gagal melakukan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });