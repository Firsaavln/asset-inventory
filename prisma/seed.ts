import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper Randomizer
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomEl = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('🌱 Memulai proses seeding data PT Gree Appliances Indonesia...');

  // ==========================================
  // 1. DATA USERS (1 Superadmin + 10 Admin Cabang)
  // ==========================================
  const branches = [
    "HO - Head Office Jakarta", "Cabang Bekasi", "Cabang Wonosobo", 
    "Cabang Tegal", "Cabang Bangka", "Cabang Bandung", 
    "Cabang Surabaya", "Cabang Semarang", "Cabang Medan", "Cabang Bali"
  ];

  // Enkripsi password "password123"
  const hashedPassword = await bcrypt.hash("password123", 10); 

  const usersData = [
    { username: "firsawanto", name: "Firsawanto Saputra", role: "superadmin", branch: "HO - Head Office Jakarta", password: hashedPassword },
    ...branches.map((branch, i) => ({
      username: `admin${i + 1}`,
      name: `Admin ${branch.replace('Cabang ', '')}`,
      role: "admin",
      branch: branch,
      password: hashedPassword
    }))
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: { password: hashedPassword }, 
      create: u,
    });
  }
  console.log(`✅ Berhasil membuat/update 11 Akun Login dengan Password Hashed.`);

  // ==========================================
  // 2. DATA KATEGORI (50 Kategori)
  // ==========================================
  const categoryNames = [
    // IT
    "Laptop Windows", "MacBook", "PC Desktop", "Monitor", "Printer Laser", 
    "Printer Inkjet", "Scanner", "Proyektor", "Server", "Router/Switch",
    "UPS", "Keyboard & Mouse", "Webcam", "Headset", "Tablet", 
    "Smartphone Operasional", "Smart TV", "CCTV Camera", "NVR/DVR", "Access Point",
    "Kabel Jaringan", "Rack Server", "Firewall Device", "NAS Storage", "External HDD",
    // GA (General Affairs)
    "Mobil Operasional", "Mobil Direksi", "Motor Operasional", "Meja Kerja", "Kursi Ergonomis",
    "Lemari Arsip", "Brankas", "AC Split", "AC Standing", "Air Purifier",
    "Dispenser", "Kulkas Pantri", "Microwave", "Mesin Kopi", "Sofa Tamu",
    "Meja Rapat", "Papan Tulis", "Mesin Absensi", "Genset", "Apar (Pemadam)",
    // Tools / Peralatan Khusus
    "Impact Wrench", "Socket Set Mekanik", "Multitester", "Toolbox Set", "Bor Listrik"
  ];

  const categories = [];
  for (let i = 0; i < 50; i++) {
    const isIT = i < 25;
    const isTools = i >= 45;
    const cat = await prisma.category.create({
      data: {
        category_name: categoryNames[i],
        owner_dept: isIT ? "IT" : (isTools ? "ENGINEERING" : "GA"),
        branch: randomEl(branches) 
      }
    });
    categories.push(cat);
  }
  console.log(`✅ Berhasil membuat 50 Kategori.`);

  // ==========================================
  // 3. DATA ASET (150 Aset)
  // ==========================================
  const assets = [];
  const vendors = ["PT Bhinneka Mentari", "PT Astrido", "Toko Komputer Harco", "Gree Official Store", "IKEA Indonesia", "Tekiro Official"];
  const conditions = ["Baru", "Baik", "Normal", "Minus Sedikit"];

  for (let i = 1; i <= 150; i++) {
    const category = randomEl(categories);
    const branch = randomEl(branches);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const assetImage = `https://dummyimage.com/600x400/4f46e5/ffffff&text=Asset+${i}`;
    const invoiceFile = `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;

    const asset = await prisma.asset.create({
      data: {
        asset_code: `AST-2026-${randomStr}`,
        asset_name: `${category.category_name} - Unit ${i}`,
        category_id: category.id,
        managing_division: category.owner_dept,
        serial_number: `SN-${Date.now().toString().slice(-6)}-${i}`,
        condition: randomEl(conditions),
        location: `Ruangan ${randomInt(101, 505)}`,
        branch: branch,
        price: randomInt(1500000, 25000000), 
        vendor_name: randomEl(vendors),
        description: `Pengadaan batch 2026 untuk cabang ${branch}.`,
        purchase_date: new Date(new Date().setDate(new Date().getDate() - randomInt(10, 365))), 
        warranty_date: new Date(new Date().setFullYear(new Date().getFullYear() + randomInt(1, 3))), 
        asset_image: assetImage,
        invoice_file: invoiceFile,
        status: "Available" 
      }
    });
    assets.push(asset);
  }
  console.log(`✅ Berhasil membuat 150 Aset dengan foto & invoice dummy.`);

  // ==========================================
  // 4. DATA ASSIGNMENT / HANDOVER (100 Data)
  // ==========================================
  const departments = ["IT Infrastructure", "Sales & Marketing", "Finance & Tax", "HR & Legal", "Engineering"];
  const firstNames = ["Budi", "Siti", "Andi", "Rina", "Joko", "Dewi", "Agus", "Ayu", "Rizky", "Putri"];
  const lastNames = ["Santoso", "Wijaya", "Pratama", "Lestari", "Setiawan", "Sari", "Nugroho", "Indah"];

  for (let i = 0; i < 100; i++) {
    const assetToAssign = assets[i];
    const picName = `${randomEl(firstNames)} ${randomEl(lastNames)}`;
    
    await prisma.assignment.create({
      data: {
        asset_id: assetToAssign.id,
        borrower_name: picName,
        department: randomEl(departments),
        notes: `Diserahkan beserta kelengkapan standar (kabel power, charger). Kondisi ${assetToAssign.condition}.`,
        assign_date: new Date(new Date().setDate(new Date().getDate() - randomInt(1, 60))) 
      }
    });

    await prisma.asset.update({
      where: { id: assetToAssign.id },
      data: { status: "Assigned" }
    });
  }
  console.log(`✅ Berhasil membuat 100 riwayat Handover dan update status aset.`);

  console.log('🎉 Seeding Selesai! Database PT Gree Appliances Indonesia siap digunakan.');
}

main()
  .catch((e) => {
    console.error("❌ Terjadi error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });