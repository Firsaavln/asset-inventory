import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Laptop, Pencil, RotateCcw, User, Building2, Eye } from "lucide-react";
import ExportAssignButton from "../../../components/ExportAssignButton"; 
import Pagination from "@/components/Pagination"; 
import { deleteAssignment } from "./actions";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // 🔥 1. AMBIL DATA USER DARI SESSION
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;
  const userRole = payload?.role as string;
  const userBranch = payload?.branch as string;

  // 🔥 FEATURE: Proteksi tingkat visibilitas akun Read-Only User
  const isReadOnlyUser = userRole?.toLowerCase() === "user";

  // 🐛 DEBUGGING: Cek terminal VSCode Bapak untuk melihat hasil ini saat halaman direfresh!
  console.log("=== DEBUG SESSION HANDOVER ===");
  console.log("Role:", userRole);
  console.log("Branch:", userBranch);
  console.log("==============================");

  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const ITEMS_PER_PAGE = 10;

  // 🔥 2. BUILD STRICT FIREWALL (FAIL-SAFE)
  const whereClause: any = {};
  
  if (userRole?.toLowerCase() !== "superadmin") {
    // Jika bukan superadmin, WAJIB difilter berdasarkan cabang.
    // Jika userBranch ternyata kosong (undefined), paksa cari cabang "UNKNOWN_BRANCH"
    // agar data tidak bocor menampilkan semuanya.
    whereClause.asset = {
      branch: userBranch || "UNKNOWN_BRANCH"
    };
  }

  // Hitung total data
  const totalItems = await prisma.assignment.count({ where: whereClause });
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1; // Cegah NaN jika 0

  // Ambil data Paginasi
  const rawAssignments = await prisma.assignment.findMany({
    where: whereClause,
    orderBy: { assign_date: "desc" },
    include: { asset: true },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  // Serialization Fix
  const activeAssignments = rawAssignments.map(item => ({
    ...item,
    assign_date: item.assign_date.toISOString(),
    asset: {
      ...item.asset,
      price: Number(item.asset.price), 
      purchase_date: item.asset.purchase_date?.toISOString() || null,
      warranty_date: item.asset.warranty_date?.toISOString() || null,
      created_at: item.asset.created_at.toISOString(),
      updated_at: item.asset.updated_at.toISOString(),
    }
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 lg:space-y-10">
      
      {/* HEADER SECTION (DIOPTIMALKAN UNTUK MOBILE & DESKTOP) */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Handover Management</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
             <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1">
               <Building2 className="w-3 h-3" /> {userRole?.toLowerCase() === "superadmin" ? "Semua Cabang (HO)" : (userBranch || "Cabang Tidak Diketahui")}
             </span>
             <p className="text-slate-500 text-sm font-medium italic">Monitoring distribusi aset.</p>
          </div>
        </div>
        
        {/* WADAH TOMBOL RESPONSIF */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
          <ExportAssignButton data={activeAssignments} /> 
          
          {/* 🔥 PROTEKSI UI: Sembunyikan tombol New Handover jika rolenya 'user' */}
          {!isReadOnlyUser && (
            <Link 
              href="/assignments/add" 
              className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 bg-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 uppercase tracking-widest"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> New Handover
            </Link>
          )}
        </div>
      </header>

      {/* DATA TABLE SECTION */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
                <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">PIC & Dept</th>
                <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeAssignments.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                  <td className="px-6 sm:px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <Laptop className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 line-clamp-1">{item.asset.asset_name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase">{item.asset.asset_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="line-clamp-1">{item.borrower_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-0 sm:ml-5 bg-indigo-50/50 w-fit px-2 py-0.5 rounded">
                        <Building2 className="w-3 h-3" /> {item.department}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-6">
                    {/* 🔥 RESPONSIVE ACTIONS: Selalu terlihat di Mobile (opacity-100), fade-in di Desktop (lg:opacity-0) */}
                    <div className="flex items-center justify-end gap-2 sm:gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                      
                      {/* Tombol Detail/View (Boleh diakses semua) */}
                      <Link href={`/assignments/${item.id}`} className="p-2 sm:p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg sm:rounded-xl transition-all" title="View Details">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>

                      {/* 🔥 PROTEKSI UI: Sembunyikan Edit & Delete/Return jika peran user adalah Read-Only */}
                      {!isReadOnlyUser && (
                        <>
                          <Link href={`/assignments/${item.id}/edit`} className="p-2 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg sm:rounded-xl transition-all" title="Edit Handover">
                            <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Link>
                          
                          <form action={async () => {
                            "use server";
                            await deleteAssignment(item.id, item.asset_id);
                          }}>
                            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg sm:rounded-xl text-[10px] font-black transition-all active:scale-95 border border-rose-100/50 uppercase tracking-widest" title="Return Asset">
                              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Return</span>
                            </button>
                          </form>
                        </>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activeAssignments.length === 0 && (
             <div className="p-12 sm:p-20 text-center flex flex-col items-center justify-center space-y-3 border-t border-slate-50">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                 <Laptop className="w-8 h-8" />
               </div>
               <p className="text-slate-500 font-bold text-sm">Belum ada data Handover di {userRole?.toLowerCase() === "superadmin" ? "sistem ini" : (userBranch || "cabang ini")}.</p>
             </div>
          )}
        </div>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}