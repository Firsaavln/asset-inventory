import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import AddAssignmentForm from "./AddAssignmentForm"; // 👈 Komponen yang akan kita buat

export const dynamic = "force-dynamic";

export default async function AddAssignmentPage() {
  // 1. Ambil data session
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;
  const userRole = payload?.role as string;
  const userBranch = payload?.branch as string;

  const isSuperAdmin = userRole?.toLowerCase() === "superadmin";
  const whereClause: any = { 
    status: "Available" 
  };

  // Jika bukan Superadmin, hanya boleh lihat aset "Available" di cabangnya sendiri
  if (!isSuperAdmin) {
    // 🔥 PERBAIKAN: Hapus mode: "insensitive" karena MySQL sudah otomatis
    whereClause.branch = userBranch || "UNKNOWN_BRANCH";
  }

  const availableAssets = await prisma.asset.findMany({
    where: whereClause,
    select: { id: true, asset_code: true, asset_name: true },
    orderBy: { asset_name: "asc" }
  });

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
      <Link href="/assignments" className="flex items-center text-xs font-black text-slate-400 hover:text-indigo-600 gap-2 uppercase tracking-widest group w-fit">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar
      </Link>

      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-full -z-10"></div>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Assignment</h2>
            <p className="text-sm text-slate-500 font-medium">Serah terima unit aset di <span className="text-indigo-600 font-bold">{isSuperAdmin ? "Semua Cabang" : userBranch}</span>.</p>
          </div>
        </div>

        {/* 👈 Panggil Client Component Form */}
        <AddAssignmentForm availableAssets={availableAssets} />
      </div>
    </div>
  );
}