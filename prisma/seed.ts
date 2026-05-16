import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'; // Pastikan lu udah install bcryptjs: npm install bcryptjs

const prisma = new PrismaClient();

const BRANCHES = [
  "HO - Head Office", "Jakarta", "Bekasi", "Tangerang", "Bandung", 
  "Semarang", "Yogyakarta", "Surabaya", "Bali", "Lampung", 
  "Palembang", "Pekanbaru", "Medan", "Pontianak", "Samarinda", "Makassar"
];

const DIVISIONS = ["IT", "GA", "ASS", "MKT"];
const CONDITIONS = ["Sangat Baik", "Lecet Pemakaian", "Perlu Servis Ringan"];
const STATUSES = ["Available", "Maintenance", "Damaged"]; // Assigned akan diset otomatis saat proses assignment

// Helper untuk Random Data
const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const generateRandomPrice = () => Math.floor(Math.random() * (15000000 - 500000 + 1) + 500000); // 500k - 15jt

async function main() {
  console.log('⏳ Memulai proses Reset & Seeding Data...');

  // ==========================================
  // 1. RESET DATA SEBELUMNYA (DARI BAWAH KE ATAS)
  // ==========================================
  console.log('🧹 Menghapus data lama...');
  await prisma.assignment.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.category.deleteMany();
  if ((prisma as any).log) {
    await (prisma as any).log.deleteMany(); // Hapus log jika model Log terdefinisi
  }
  await prisma.user.deleteMany();

  // ==========================================
  // 2. SEEDING USERS
  // ==========================================
  console.log('👤 Membuat 33 User Akun...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 2.a. Superadmin
  await prisma.user.create({
    data: {
      name: 'Bapak Superadmin',
      username: 'superadmin',
      password: defaultPassword,
      role: 'Superadmin',
      branch: 'HO - Head Office',
    }
  });

  // 2.b. Admin & User per Cabang
  const userPayloads = [];
  for (const branch of BRANCHES) {
    const branchCode = branch.split(' ')[0].toLowerCase(); // cth: jakarta
    
    // Admin Cabang
    userPayloads.push({
      name: `Admin ${branch.split(' ')[0]}`,
      username: `admin_${branchCode}`,
      password: defaultPassword,
      role: 'Admin',
      branch: branch,
    });

    // User Cabang (Read-Only)
    userPayloads.push({
      name: `User ${branch.split(' ')[0]}`,
      username: `user_${branchCode}`,
      password: defaultPassword,
      role: 'User',
      branch: branch,
    });
  }
  await prisma.user.createMany({ data: userPayloads });

 // ==========================================
  // 3. SEEDING KATEGORI (50 Kategori)
  // ==========================================
  console.log('📁 Membuat 50 Kategori Aset...');
  const categoryPayloads = [];
  for (let i = 1; i <= 50; i++) {
    const ownerDept = DIVISIONS[i % 4]; // Membagi rata ke 4 divisi
    categoryPayloads.push({
      category_name: `Kategori ${ownerDept} - ${i}`,
      owner_dept: ownerDept,
      branch: getRandomElement(BRANCHES), // 👈 WAJIB ADA BIAR ADMIN CABANG BISA LIHAT KATEGORINYA
    });
  }
  await prisma.category.createMany({ data: categoryPayloads });
  const createdCategories = await prisma.category.findMany();

  // ==========================================
  // 4. SEEDING ASET (400 Aset)
  // ==========================================
  console.log('💻 Membuat 400 Aset...');
  const assetPayloads = [];
  const currentDate = new Date();

  for (let i = 1; i <= 400; i++) {
    const category = getRandomElement(createdCategories);
    
    // Bikin garansi random
    const warrantyDate = new Date();
    warrantyDate.setDate(currentDate.getDate() + (Math.random() * 730 - 365)); // -1 tahun s/d +1 tahun

    assetPayloads.push({
      asset_code: `AST-${category.owner_dept}-${i.toString().padStart(4, '0')}`,
      asset_name: `Unit Aset ${category.category_name} #${i}`,
      category_id: category.id,
      managing_division: category.owner_dept,
      branch: getRandomElement(BRANCHES),
      status: getRandomElement(STATUSES),
      condition: getRandomElement(CONDITIONS),
      price: generateRandomPrice(),
      vendor_name: `PT Vendor Global ${i % 10}`,
      purchase_date: new Date(currentDate.getTime() - Math.random() * 10000000000), // Random past date
      warranty_date: warrantyDate,
      location: `Ruangan Operasional ${i % 5}`,
      serial_number: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      description: `Ini adalah deskripsi dummy untuk aset nomor ${i}. Berfungsi dengan baik.`,
      asset_image: `https://dummyimage.com/600x400/e2e8f0/475569.png&text=Foto+Aset+${i}`,
      invoice_file: `https://dummyimage.com/600x800/f8fafc/0f172a.png&text=Invoice+Aset+${i}`,
    });
  }
  await prisma.asset.createMany({ data: assetPayloads });
  
  // ==========================================
  // 5. SEEDING ASSIGNMENT (350 Serah Terima)
  // ==========================================
  console.log('🤝 Membuat 350 Data Serah Terima (Assignments)...');
  
  // Ambil 350 aset secara acak untuk diserah-terimakan
  const allAssets = await prisma.asset.findMany({ take: 350 });
  const assignmentPayloads = [];
  
  for (const asset of allAssets) {
    assignmentPayloads.push({
      asset_id: asset.id,
      borrower_name: `Karyawan Dummy ${asset.id}`,
      department: getRandomElement(['Finance', 'Marketing', 'Operasional', 'HRD', 'Support']),
      assign_date: new Date(currentDate.getTime() - Math.random() * 5000000000), 
      notes: "Digunakan untuk keperluan operasional harian cabang.",
    });
  }
  
  await prisma.assignment.createMany({ data: assignmentPayloads });

  // Update status aset yang di-assign menjadi 'Assigned'
  const assignedAssetIds = allAssets.map(a => a.id);
  await prisma.asset.updateMany({
    where: { id: { in: assignedAssetIds } },
    data: { status: 'Assigned' }
  });

  console.log('✅ Seeding Selesai Bray! Database lu sekarang udah penuh gizi!');
  console.log('🔑 Password untuk semua akun adalah: password123');
}

main()
  .catch((e) => {
    console.error('❌ Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });