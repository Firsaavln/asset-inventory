import { prisma } from "@/lib/prisma";
import { Trash2, ShieldAlert, Laptop, AlertOctagon } from "lucide-react";
import DisposalActions from "@/components/DisposalActions"; 
import Pagination from "@/components/Pagination"; // 👈 Import Pagination

export default async function DisposalsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // Paginasi Config
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const ITEMS_PER_PAGE = 10;

  // Tentukan where clause
  const whereClause = { status: "Disposed" };

  // Hitung total dan ambil paginasi
  const totalItems = await prisma.asset.count({ where: whereClause });
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const disposedAssets = await prisma.asset.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: { updated_at: "desc" },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            Gudang Disposal <Trash2 className="w-6 h-6 text-rose-600" />
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Aset yang telah ditarik, rusak parah, atau menunggu penghapusan permanen.</p>
        </div>
        <div className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 shadow-sm">
          <AlertOctagon className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-black text-rose-600 uppercase tracking-widest">{totalItems} Aset Antrean</span>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
        {disposedAssets.length === 0 ? (
          <div className="text-center py-24 flex-1">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <ShieldAlert className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Gudang Disposal Kosong</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Belum ada aset yang ditarik dari peredaran.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Aset</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori & Divisi</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tgl. Dibuang</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Kontrol (Aksi)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {disposedAssets.map((asset) => (
                    <tr key={asset.id} className="group hover:bg-rose-50/30 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-rose-100 group-hover:text-rose-500 transition-colors">
                            <Laptop className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 line-through decoration-slate-300">{asset.asset_name}</p>
                            <p className="text-[10px] font-mono font-bold text-rose-500 mt-0.5">{asset.asset_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-700">{asset.category.category_name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">DIV: {asset.managing_division}</p>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-500">
                        {new Date(asset.updated_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <DisposalActions assetId={asset.id} />
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