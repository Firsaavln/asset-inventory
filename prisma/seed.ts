import { PrismaClient } from '@prisma/client';
import { fakerID_ID as faker } from '@faker-js/faker';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Memulai proses seeding data...");

  // 1. Bersihkan Database (Opsional: Hati-hati data asli hilang)
  await prisma.assignment.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Buat Akun Admin Utama
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      username: "superadmin",
      password: hashedAdminPassword,
      name: "System Administrator",
      role: "superadmin",
      branch: "ALL"
    }
  });

  // 3. Buat 30 Kategori (Campuran IT, GA, HR)
  const depts = ["IT", "GA", "HR", "PROD"];
  const categoryNames = [
    "Laptop", "Monitor", "Smartphone", "Server", "Keyboard", "Mouse", "Printer",
    "Scanner", "Router", "Switch", "UPS", "Projector", "Tablet", "Camera",
    "Headset", "AC Unit", "Meja Kantor", "Kursi Ergonimic", "Lemari Besi",
    "Toolkit Set", "Mesin Bor", "Kunci Impact", "Multimeter", "Generator",
    "ID Card Printer", "Fingerprint Scanner", "CCTV", "Telepon IP", "Smart TV", "Modem"
  ];

  const categories = [];
  for (let i = 0; i < 30; i++) {
    const cat = await prisma.category.create({
      data: {
        category_name: categoryNames[i] || `Kategori ${i + 1}`,
        owner_dept: depts[Math.floor(Math.random() * depts.length)],
      }
    });
    categories.push(cat);
  }
  console.log("✅ 30 Kategori berhasil dibuat.");

  // 4. Buat 150 Aset
  const brands = ["Lenovo", "Dell", "HP", "Apple", "Asus", "Tekiro", "Krisbow", "Gree", "Samsung"];
  const conditions = ["New", "Good", "Fair", "Damaged"];
  const statuses = ["Available", "Assigned", "Maintenance", "Damaged"];
  
  const assets = [];
  for (let i = 0; i < 150; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    
    const asset = await prisma.asset.create({
      data: {
        asset_code: `AST-${faker.string.alphanumeric(6).toUpperCase()}`,
        asset_name: `${brand} ${cat.category_name} ${faker.commerce.productAdjective()}`,
        category_id: cat.id,
        managing_division: cat.owner_dept,
        serial_number: faker.string.alphanumeric(12).toUpperCase(),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        status: "Available", // Set default available dulu, nanti diupdate lewat assignment
        location: `Gudang ${faker.helpers.arrayElement(['A', 'B', 'C'])}, Rak ${faker.number.int({min: 1, max: 20})}`,
        price: faker.number.int({ min: 500000, max: 25000000 }),
        vendor_name: faker.company.name(),
        purchase_date: faker.date.past({ years: 2 }),
        warranty_date: faker.date.future({ years: 1 }),
        description: `Spesifikasi standar untuk kebutuhan operasional PT Gree.`,
      }
    });
    assets.push(asset);
  }
  console.log("✅ 150 Aset berhasil dibuat.");

  // 5. Buat 100 Assignment (Peminjaman)
  // Ambil 100 aset pertama untuk dipinjamkan (memastikan 1 aset 1 PIC)
  const shuffledAssets = assets.sort(() => 0.5 - Math.random()).slice(0, 100);
  const departments = ["Finance", "Marketing", "Production", "R&D", "Logistics", "IT Support"];

  for (let i = 0; i < 100; i++) {
    const targetAsset = shuffledAssets[i];

    // Buat riwayat peminjaman
    await prisma.assignment.create({
      data: {
        asset_id: targetAsset.id,
        borrower_name: faker.person.fullName(),
        department: departments[Math.floor(Math.random() * departments.length)],
        assign_date: faker.date.recent({ days: 30 }),
        notes: "Serah terima aset untuk kebutuhan kerja remote/kantor."
      }
    });

    // Update status aset tersebut menjadi 'Assigned'
    await prisma.asset.update({
      where: { id: targetAsset.id },
      data: { status: "Assigned" }
    });
  }
  console.log("✅ 100 Assignment berhasil dibuat.");
  console.log("✨ Seeding selesai! Database lu sekarang penuh dengan data cantik.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });