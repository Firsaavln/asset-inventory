import { prisma } from "@/lib/prisma";
import { ShieldAlert, Database, Laptop, PenTool, Trash, FilePlus, RefreshCcw } from "lucide-react";
import Pagination from "@/components/Pagination"; // 👈 Import Pagination

export const dynamic = 'force-dynamic';

export default async function SystemLogsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // Paginasi Config
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const ITEMS_PER_PAGE = 15; // Lebih banyak karena log bentuknya list

  // Hitung Total Log & Data
  const totalItems = await prisma.log.count();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

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
      default: return { icon: Database, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" };
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/60 pb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            System Audit Logs <ShieldAlert className="w-6 h-6 text-rose-500" />
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Laporan histori aktivitas operasi sistem secara mendetail (Live).</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 animate-pulse">
          <RefreshCcw className="w-3 h-3" /> Real-time Sync
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
        {auditLogs.length === 0 ? (
          <div className="text-center py-20 flex-1">
            <Database className="w-10 h-10 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">Belum ada rekaman log sistem.</p>
          </div>
        ) : (
          <>
            <div className="p-8 flex-1">
              <div className="relative border-l-2 border-slate-100 ml-6 space-y-8 py-4">
                {auditLogs.map((log) => {
                  const style = getLogStyle(log.action);
                  const LogIcon = style.icon;
                  return (
                    <div key={log.id} className="relative pl-10 group">
                      <div className={`absolute -left-[21px] top-0 w-10 h-10 rounded-full border-4 border-white ${style.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                        <LogIcon className={`w-4 h-4 ${style.color}`} />
                      </div>
                      <div className={`bg-slate-50 hover:bg-white border ${style.border} rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded ${style.bg} ${style.color}`}>
                              {log.action}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{log.entity}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' })}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mt-3 mb-4">{log.detail}</p>
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-200/60">
                          <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                            {log.user.charAt(0)}
                          </div>
                          <span className="text-xs font-black text-slate-800">{log.user}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">({log.role})</span>
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