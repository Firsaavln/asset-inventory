import { prisma } from "@/lib/prisma";
import { 
  Box, CheckCircle2, Send, Laptop, 
  BriefcaseBusiness, Activity, TrendingUp, 
  Wrench, ArrowRight, AlertOctagon, PieChart
} from "lucide-react";
import Link from "next/link";

// Helper Format Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR", 
    minimumFractionDigits: 0 
  }).format(angka);
};

export default async function DashboardPage() {
  // --- QUERY DATABASE ---
  const [
    totalAssets,
    availableAssets,
    assignedAssets,
    maintenanceAssets,
    damagedAssets,
    totalValueData,
    recentAssignments,
    itAssetsCount,
    gaAssetsCount,
    hrAssetsCount
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: "Available" } }),
    prisma.asset.count({ where: { status: "Assigned" } }),
    prisma.asset.count({ where: { status: "Maintenance" } }),
    prisma.asset.count({ where: { status: "Damaged" } }),
    prisma.asset.aggregate({ _sum: { price: true } }),
    prisma.asset.findMany({
      take: 6,
      orderBy: { created_at: "desc" },
      include: { category: true }
    }),
    prisma.asset.count({ where: { managing_division: "IT" } }),
    prisma.asset.count({ where: { managing_division: "GA" } }),
    prisma.asset.count({ where: { managing_division: "HR" } }),
  ]);

  const totalValue = Number(totalValueData._sum.price || 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto space-y-6 lg:space-y-8">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <PieChart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dashboard Utama
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-xl">
            Ringkasan eksekutif utilisasi aset operasional dan fasilitas perusahaan secara real-time.
          </p>
        </div>

        <div className="flex items-center pt-4 md:pt-0 border-t md:border-none border-slate-100">
           {/* Total Investasi (Insight Tunggal di Header) */}
           <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
               <TrendingUp className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Investasi (Nilai Buku)</p>
               <p className="text-xl sm:text-2xl font-black text-indigo-600">{formatRupiah(totalValue)}</p>
             </div>
           </div>
        </div>
      </div>

      {/* --- INSIGHT BAR (Responsive Scroll on Mobile) --- */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex divide-x divide-slate-100 w-max lg:w-full">
          
          {/* 1. TOTAL */}
          <div className="flex items-center gap-4 p-5 sm:p-6 lg:p-8 w-[220px] lg:w-full hover:bg-slate-50 transition-colors group cursor-default">
            <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Total Unit</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800">{totalAssets}</p>
            </div>
          </div>

          {/* 2. AVAILABLE */}
          <div className="flex items-center gap-4 p-5 sm:p-6 lg:p-8 w-[220px] lg:w-full hover:bg-slate-50 transition-colors group cursor-default">
            <div className="p-3 sm:p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Tersedia</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800">{availableAssets}</p>
            </div>
          </div>

          {/* 3. ASSIGNED */}
          <div className="flex items-center gap-4 p-5 sm:p-6 lg:p-8 w-[220px] lg:w-full hover:bg-slate-50 transition-colors group cursor-default">
            <div className="p-3 sm:p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Dipinjam</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800">{assignedAssets}</p>
            </div>
          </div>

          {/* 4. MAINTENANCE */}
          <div className="flex items-center gap-4 p-5 sm:p-6 lg:p-8 w-[220px] lg:w-full hover:bg-slate-50 transition-colors group cursor-default">
            <div className="p-3 sm:p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Perbaikan</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800">{maintenanceAssets}</p>
            </div>
          </div>

          {/* 5. DAMAGED */}
          <div className="flex items-center gap-4 p-5 sm:p-6 lg:p-8 w-[220px] lg:w-full hover:bg-slate-50 transition-colors group cursor-default">
            <div className="p-3 sm:p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Afkir / Rusak</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800">{damagedAssets}</p>
            </div>
          </div>

        </div>
      </div>

      {/* --- BAGIAN BAWAH: GRAFIK UTILISASI & TABEL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* KOLOM KIRI: STATUS UTILISASI & DIVISI */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Progress Bar Status */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" /> Rasio Ketersediaan
            </h2>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500">Tersedia</span>
                  <span className="text-emerald-600">{totalAssets > 0 ? Math.round((availableAssets/totalAssets)*100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${totalAssets > 0 ? (availableAssets / totalAssets) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500">Dipinjamkan</span>
                  <span className="text-orange-600">{totalAssets > 0 ? Math.round((assignedAssets/totalAssets)*100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500">Bermasalah (Perbaikan/Rusak)</span>
                  <span className="text-rose-600">{totalAssets > 0 ? Math.round(((maintenanceAssets + damagedAssets)/totalAssets)*100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden gap-0.5">
                  <div className="bg-amber-400 h-full transition-all duration-1000" style={{ width: `${totalAssets > 0 ? (maintenanceAssets / totalAssets) * 100 : 0}%` }}></div>
                  <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${totalAssets > 0 ? (damagedAssets / totalAssets) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Distribusi Pengelola Divisi */}
          <div className="bg-slate-900 rounded-[2rem] shadow-xl p-6 sm:p-8 text-white relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 opacity-10"><BriefcaseBusiness className="w-48 h-48" /></div>
             <h2 className="text-lg font-bold mb-6 relative z-10">Beban Pengelolaan Divisi</h2>
             <div className="grid grid-cols-3 gap-3 relative z-10">
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/20 transition-all">
                   <Laptop className="w-6 h-6 mx-auto mb-3 text-blue-400" />
                   <p className="text-2xl font-black">{itAssetsCount}</p>
                   <p className="text-[10px] font-bold uppercase opacity-60 mt-1">Aset IT</p>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/20 transition-all">
                   <BriefcaseBusiness className="w-6 h-6 mx-auto mb-3 text-emerald-400" />
                   <p className="text-2xl font-black">{gaAssetsCount}</p>
                   <p className="text-[10px] font-bold uppercase opacity-60 mt-1">Aset GA</p>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/20 transition-all">
                   <Box className="w-6 h-6 mx-auto mb-3 text-purple-400" />
                   <p className="text-2xl font-black">{hrAssetsCount}</p>
                   <p className="text-[10px] font-bold uppercase opacity-60 mt-1">Aset HR</p>
                </div>
             </div>
          </div>
        </div>

        {/* KOLOM KANAN: TABEL ASET TERBARU */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Registrasi Aset Terbaru</h2>
              <p className="text-xs font-medium text-slate-500 mt-1">Daftar unit yang baru saja dimasukkan ke dalam sistem database.</p>
            </div>
            <Link href="/assets" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
              Kelola Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Informasi Unit</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Kategori</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tgl. Registrasi</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Status Saat Ini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAssignments.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{asset.asset_name}</div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 mt-1 bg-slate-100 inline-block px-1.5 py-0.5 rounded">{asset.asset_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {asset.category.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                        {new Date(asset.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                       <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                         ${asset.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                           asset.status === 'Assigned' ? 'bg-orange-100 text-orange-700' : 
                           asset.status === 'Maintenance' ? 'bg-amber-100 text-amber-700' :
                           'bg-rose-100 text-rose-700'}
                       `}>
                         {asset.status === 'Damaged' ? 'Rusak' : 
                          asset.status === 'Maintenance' ? 'Perbaikan' : 
                          asset.status === 'Assigned' ? 'Dipinjam' : 'Tersedia'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}