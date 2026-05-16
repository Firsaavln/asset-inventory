import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import { Trash2, ShieldAlert, Laptop, AlertOctagon, Building2 } from "lucide-react";
import DisposalActions from "@/components/DisposalActions"; 
import Pagination from "@/components/Pagination"; 

export const dynamic = "force-dynamic";

export default async function DisposalsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // 🔥 1. DETEKSI IDENTITAS USER & OTORISASI WILAYAH CABANG
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;
  const userRole = payload?.role as string;
  const userBranch = payload?.branch as string;

  const isSuperAdmin = userRole?.toLowerCase() === "superadmin";
  
  // 🔥 2. FEATURE: Flag pembatasan Read-Only UI
  const isReadOnlyUser = userRole?.toLowerCase() === "user";

  // Paginasi Config
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const ITEMS_PER_PAGE = 10;

  // 🔥 3. BANGUN STRICT FIREWALL IDOR (Kunci Akses Cabang)
  const whereClause: any = { status: "Disposed" };
  if (!isSuperAdmin) {
    whereClause.branch = userBranch || "UNKNOWN_BRANCH";
  }

  // Hitung total dan ambil paginasi dengan filter aktif
  const totalItems = await prisma.asset.count({ where: whereClause });
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const disposedAssets = await prisma.asset.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: { updated_at: "desc" },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* --- HEADER SECTION (RESPONSIVE & PREMIUM CARD) --- */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-50/40 to-transparent rounded-bl-full pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200 hidden sm:flex shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Gudang Disposal
            </h1>
            {/* Label Indikator Cabang Active */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
               <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest border border-rose-100 flex items-center gap-1.5 w-fit shrink-0">
                 <Building2 className="w-3.5 h-3.5" /> {isSuperAdmin ? "Semua Cabang (HO)" : userBranch}
               </span>
               <p className="text-xs sm:text-sm text-slate-500 font-medium">Aset ditarik, rusak parah, atau menunggu dihapus.</p>
            </div>
          </div>
        </div>

        {/* Indikator Total Antrean */}
        <div className="px-4 sm:px-5 py-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 shadow-sm relative z-10 w-fit shrink-0">
          <div className="p-1.5 bg-white rounded-lg shadow-sm">
            <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Total Antrean</span>
            <span className="text-sm sm:text-base font-black text-rose-600 uppercase tracking-widest leading-none">{totalItems} Aset</span>
          </div>
        </div>
      </header>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
        {disposedAssets.length === 0 ? (
          <div className="text-center py-20 sm:py-28 flex-1 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
              <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-widest mb-1">Gudang Disposal Kosong</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Belum ada aset ditarik dari peredaran di {isSuperAdmin ? "Sistem ini" : `cabang ${userBranch}`}.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Informasi Aset</th>
                    <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Kategori & Divisi</th>
                    <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tgl. Dibuang</th>
                    <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Kontrol (Aksi)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {disposedAssets.map((asset) => (
                    <tr key={asset.id} className="group hover:bg-rose-50/40 transition-colors duration-300">
                      
                      {/* INFO ASET */}
                      <td className="px-6 sm:px-8 py-5 sm:py-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors shadow-sm">
                            <Laptop className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base font-black text-slate-800 line-through decoration-slate-300/80 truncate">{asset.asset_name}</p>
                            <p className="text-[10px] sm:text-xs font-mono font-bold text-rose-500 mt-1 uppercase">{asset.asset_code}</p>
                          </div>
                        </div>
                      </td>

                      {/* KATEGORI & DIVISI */}
                      <td className="px-6 sm:px-8 py-5 sm:py-6">
                        <p className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">{asset.category.category_name}</p>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">DIV: {asset.managing_division}</p>
                      </td>

                      {/* TANGGAL */}
                      <td className="px-6 sm:px-8 py-5 sm:py-6 text-xs sm:text-sm font-bold text-slate-500 whitespace-nowrap">
                        {new Date(asset.updated_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      
                      {/* 🔥 KONTROL AKSI (FIXED: Selalu Tampil di Mobile, Hover di Desktop) */}
                      <td className="px-6 sm:px-8 py-5 sm:py-6 text-right">
                        <div className="flex items-center justify-end opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 ease-in-out">
                          {!isReadOnlyUser ? (
                            <DisposalActions assetId={asset.id} />
                          ) : (
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">READ ONLY</span>
                          )}
                        </div>
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </>
        )}
      </div>
    </div>
  );
}