import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation"; // 👈 Tambah 'notFound' untuk stealth security
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditCategoryForm from "./EditCategoryForm"; 
import { cookies } from "next/headers"; // 👈 Tambahan untuk mendeteksi session cookie
import { decrypt } from "@/lib/auth";   // 👈 Tambahan untuk membaca payload data user

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  // 🔥 1. AMBIL SESSION LOGIN UNTUK FIREWALL PROTEKSI
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;

  if (!payload) redirect("/login");

  const userRole = (payload.role as string).toLowerCase();
  const userBranch = payload.branch as string;

  // 🔥 2. HAK AKSES READ-ONLY PROTECTION
  // Akun ber-role 'user' hanya memiliki izin baca. Akses ke halaman edit dilarang keras!
  if (userRole === "user") {
    notFound();
  }

  // 3. Resolve Params (Next.js 15) & Tarik data dari DB
  const resolvedParams = await params;
  const categoryId = Number(resolvedParams.id);

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  // Jika ID kategori acak-acakan atau memang tidak ada di DB
  if (!category) {
    notFound(); // Menggunakan 404 jauh lebih aman dari deteksi brute-force scan hacker
  }

  // 🔥 4. SECURITY FIREWALL IDOR: Memastikan data kategori yang di-edit terikat pada cabang yang sah
  if (userRole !== "superadmin" && (category as any).branch !== userBranch) {
    notFound();
  }

  // --- PROSES SERIALIZATION ---
  // Konversi data ke plain object agar 100% aman dikirim melintasi batas Server-Client Component
  const serializedCategory = JSON.parse(JSON.stringify(category));

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2 mb-8">
        <Link 
          href="/categories" 
          className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-all w-fit group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Batal & Kembali
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Edit Kategori</h1>
          <p className="text-slate-500 font-medium mt-1">Perbarui nama klasifikasi atau pindah wewenang departemen.</p>
        </div>
      </div>

      {/* PANGGIL CLIENT FORM & OPER DATA DARI DATABASE */}
      <EditCategoryForm category={serializedCategory} />
      
    </div>
  );
}