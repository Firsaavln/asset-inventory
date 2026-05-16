import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import Link from "next/link";
import { 
  ShieldAlert, Database, Laptop, PenTool, 
  Trash, FilePlus, RefreshCcw, Activity, 
  TerminalSquare 
} from "lucide-react";
import Pagination from "@/components/Pagination"; 

export const dynamic = 'force-dynamic';

export default async function SystemLogsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // 🔥 1. DETEKSI IDENTITAS & ABSOLUTE FIREWALL (Defense in Depth)
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;
  
  const userRole = payload?.role?.toLowerCase();

  // 🔥 PROTEKSI HARGA MATI: HANYA Superadmin yang bisa melihat System Logs!
  if (userRole !== "superadmin") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
          <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">Area Terlarang</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-8 font-medium">
          Halaman <strong>System Logs</strong> diklasifikasikan sebagai data rahasia tingkat tinggi. Akses Anda telah ditolak dan dicatat oleh sistem keamanan.
        </p>
        <Link href="/" className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-95 text-sm sm:text-base">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  // Paginasi Config
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const ITEMS_PER_PAGE = 15; // Lebih banyak karena log bentuknya list

  // Hitung Total Log & Data
  const totalItems = await prisma.log.count();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const auditLogs = await prisma.log.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE
  });

  const getLogStyle = (action: string) => {
    switch (action) {
      case "CREATE": return { icon: FilePlus, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" };
      case "UPDATE": return { icon: PenTool, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" };
      case "DELETE": return { icon: Trash, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" };
      default: return { icon: Database, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-100" };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 max-w-5xl mx-auto font-sans">
      
      {/* --- HEADER SECTION (PREMIUM CARD) --- */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-800 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full pointer-events-none blur-3xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-slate-800/80 text-white rounded-2xl border border-slate-700/50 hidden sm:flex shrink-0 shadow-inner">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              System Audit Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Laporan histori aktivitas operasi sistem secara mendetail.</p>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-emerald-500/20 relative z-10 w-fit shrink-0 backdrop-blur-sm">
          <RefreshCcw className="w-3.5 h-3.5 animate-spin-slow" /> Real-time Sync
        </div>
      </header>

      {/* --- TIMELINE SECTION --- */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {auditLogs.length === 0 ? (
          <div className="text-center py-20 sm:py-28 flex flex-col items-center justify-center flex-1 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm mx-auto mb-4">
              <Database className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
            </div>
            <p className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-widest">Log Kosong</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Belum ada rekaman aktivitas sistem yang tercatat.</p>
          </div>
        ) : (
          <>
            <div className="p-4 sm:p-8 md:p-10 flex-1 custom-scrollbar overflow-x-hidden">
              {/* Garis Vertikal Timeline */}
              <div className="relative border-l-2 border-slate-100 ml-4 sm:ml-6 space-y-6 sm:space-y-8 py-4 before:absolute before:top-0 before:-left-[5px] before:w-2 before:h-2 before:bg-slate-200 before:rounded-full after:absolute after:bottom-0 after:-left-[5px] after:w-2 after:h-2 after:bg-slate-200 after:rounded-full">
                
                {auditLogs.map((log) => {
                  const style = getLogStyle(log.action);
                  const LogIcon = style.icon;
                  return (
                    <div key={log.id} className="relative pl-6 sm:pl-10 group">
                      
                      {/* Lingkaran Ikon (Responsive Offset) */}
                      <div className={`absolute -left-[17px] sm:-left-[21px] top-0 sm:top-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-white ${style.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 z-10`}>
                        <LogIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${style.color}`} />
                      </div>
                      
                      {/* Kartu Detail Log */}
                      <div className={`bg-slate-50 hover:bg-white border ${style.border} rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-5 transition-all duration-300 shadow-sm hover:shadow-md relative`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg ${style.bg} ${style.color} border border-white/50`}>
                              {log.action}
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                              <TerminalSquare className="w-3 h-3 text-slate-400" />
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-widest">{log.entity}</span>
                            </div>
                          </div>
                          
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 bg-slate-100/50 px-2.5 py-1 rounded-md w-fit">
                            {new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed mb-4 sm:mb-5">
                          {log.detail}
                        </p>
                        
                        {/* Footer Kartu (User Pelaku) */}
                        <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200/60">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-200/50 border border-slate-200 flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-600 shadow-sm">
                            {log.user.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs sm:text-sm font-black text-slate-800">{log.user}</span>
                          <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            log.role.toLowerCase() === 'superadmin' ? 'bg-rose-50 text-rose-600' :
                            log.role.toLowerCase() === 'admin' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {log.role}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </>
        )}
      </div>
    </div>
  );
}