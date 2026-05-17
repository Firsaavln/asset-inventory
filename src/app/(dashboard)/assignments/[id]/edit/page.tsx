import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Box, ShieldAlert } from "lucide-react"; // 👈 Tambah ShieldAlert untuk UI Penolakan
import EditAssignmentForm from "./EditAssignmentForm"; 
import { cookies } from "next/headers"; // 👈 Tambahan Session Reader
import { decrypt } from "@/lib/auth";   // 👈 Tambahan Decrypt Engine

export const dynamic = "force-dynamic";

export default async function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  // 🔥 1. AMBIL SESSION LOGIN UNTUK FIREWALL PROTEKSI
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;

  if (!payload) redirect("/login");

  const userRole = (payload.role as string).toLowerCase();
  const userBranch = payload.branch as string;

  // 🔥 2. HAK AKSES READ-ONLY PROTECTION (DIOPTIMALKAN UX-NYA)
  // Akun ber-role 'user' dilarang keras memodifikasi transaksi data
  // Jika nekat nembak URL, hadang dengan layar Akses Ditolak yang elegan!
  if (userRole === "user") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
          Akun Anda memiliki level akses <strong>Read-Only</strong>. Anda tidak diizinkan untuk memodifikasi riwayat serah terima aset di sistem ini.
        </p>
        <Link href="/assignments" className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          Kembali ke Daftar Serah Terima
        </Link>
      </div>
    );
  }

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { asset: true }
  });

  if (!assignment) notFound();

  // 🔥 3. SECURITY FIREWALL IDOR: Deteksi manipulasi URL cabang luar HO
  // Jika aset ini bukan milik cabang si Admin, lempar 404 agar dikira datanya tidak ada
  if (userRole !== "superadmin" && assignment.asset.branch !== userBranch) {
    notFound();
  }

  // --- PROSES SERIALIZATION ---
  // Konversi objek tanggal dan angka Decimal murni menjadi plain text/number agar didukung Client Form
  const serializedAssignment = JSON.parse(JSON.stringify(assignment));

  // ====================================================================
  // 🔥 4. RENDER UI UTAMA (TIDAK ADA YANG BERUBAH)
  // ====================================================================
  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
      <Link href="/assignments" className="flex items-center text-xs font-black text-slate-400 hover:text-indigo-600 gap-2 uppercase tracking-widest group w-fit">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Batal
      </Link>

      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-50 rounded-bl-full -z-10 opacity-60"></div>
        
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Update Assignment</h2>

        {/* INFO UNIT ASET (Read Only) */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4 mb-10">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
              <Box className="w-6 h-6" />
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Unit</p>
             <p className="text-sm font-bold text-slate-800">{assignment.asset.asset_name}</p>
             <p className="text-[10px] font-bold text-indigo-500 font-mono">{assignment.asset.asset_code}</p>
           </div>
        </div>

        {/* Kirim data plain object yang sudah tervalidasi 100% aman ke Client Form */}
        <EditAssignmentForm assignment={serializedAssignment} />
      </div>
    </div>
  );
}