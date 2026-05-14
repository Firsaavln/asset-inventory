import { prisma } from "@/lib/prisma";
import { 
  Box, CheckCircle2, Send, Laptop, 
  BriefcaseBusiness, Activity, TrendingUp, 
  Wrench, ArrowRight, AlertOctagon, 
  PieChart, ShieldAlert, Clock,
  BarChart3
} from "lucide-react";
import Link from "next/link";

// Helper Format Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR", 
    maximumFractionDigits: 0 
  }).format(angka);
};

export default async function DashboardPage() {
  // --- QUERY DATABASE ---
  const [
    totalAssetsRaw,
    availableAssets,
    assignedAssets,
    maintenanceAssets,
    damagedAssets,
    disposedAssets,
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
    prisma.asset.count({ where: { status: "Disposed" } }),
    prisma.asset.aggregate({ _sum: { price: true }, where: { status: { not: "Disposed" } } }), // Nilai aset aktif saja
    prisma.asset.findMany({
      take: 6,
      where: { status: { not: "Disposed" } },
      orderBy: { created_at: "desc" },
      include: { category: true }
    }),
    prisma.asset.count({ where: { managing_division: "IT", status: { not: "Disposed" } } }),
    prisma.asset.count({ where: { managing_division: "GA", status: { not: "Disposed" } } }),
    prisma.asset.count({ where: { managing_division: "HR", status: { not: "Disposed" } } }),
  ]);

  // --- KALKULASI METRIK INSIGHT ---
  const activeAssets = totalAssetsRaw - disposedAssets; 
  const totalValue = Number(totalValueData._sum.price || 0);
  const problematicAssets = maintenanceAssets + damagedAssets;
  
  // Persentase
  const utilizationRate = activeAssets > 0 ? Math.round((assignedAssets / activeAssets) * 100) : 0;
  const healthyRate = activeAssets > 0 ? Math.round(((availableAssets + assignedAssets) / activeAssets) * 100) : 0;
  const riskRate = activeAssets > 0 ? Math.round((problematicAssets / activeAssets) * 100) : 0;

  const currentDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto space-y-6 lg:space-y-8 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-bl-full -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/30 rounded-tr-full -z-10"></div>
        
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 mb-2">
            <Clock className="w-3.5 h-3.5" /> {currentDate}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Dashboard Utama
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium max-w-2xl leading-relaxed">
            Ringkasan eksekutif pemanfaatan aset operasional perusahaan. Pantau nilai investasi, tingkat utilisasi, dan kesehatan inventaris secara real-time.
          </p>
        </div>

        {/* Total Investasi Highlight */}
        <div className="flex items-center gap-5 p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-900/20 relative overflow-hidden shrink-0 min-w-[320px]">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
           <div className="p-4 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl shrink-0">
             <TrendingUp className="w-8 h-8 text-indigo-300" />
           </div>
           <div>
             <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-[0.2em] mb-1">Total Investasi Aktif</p>
             <p className="text-2xl sm:text-3xl font-black tracking-tight">{formatRupiah(totalValue)}</p>
           </div>
        </div>
      </div>

      {/* --- KPI CARDS (4 Kolom) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Total Aset Aktif */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:border-blue-200 transition-colors">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Box className="w-7 h-7" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Unit Aktif</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-slate-800">{activeAssets}</p>
              <p className="text-xs font-bold text-slate-400 mb-1">/ {totalAssetsRaw} Tercatat</p>
            </div>
          </div>
        </div>

        {/* Card 2: Utilisasi (Dipinjamkan) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:border-emerald-200 transition-colors">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform"><Activity className="w-7 h-7" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tingkat Utilisasi</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-slate-800">{utilizationRate}%</p>
              <p className="text-xs font-bold text-emerald-500 mb-1 flex items-center gap-1">({assignedAssets} Unit)</p>
            </div>
          </div>
        </div>

        {/* Card 3: Ready to Use (Tersedia) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:border-indigo-200 transition-colors">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform"><CheckCircle2 className="w-7 h-7" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Siap Digunakan</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-slate-800">{availableAssets}</p>
              <p className="text-xs font-bold text-slate-400 mb-1">Unit Tersedia</p>
            </div>
          </div>
        </div>

        {/* Card 4: Butuh Perhatian (Rusak/Maintenance) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:border-rose-200 transition-colors">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform"><ShieldAlert className="w-7 h-7" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Butuh Perhatian</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-slate-800">{problematicAssets}</p>
              <p className="text-xs font-bold text-rose-500 mb-1 flex items-center gap-1">({riskRate}% Risiko)</p>
            </div>
          </div>
        </div>

      </div>

      {/* --- TENGAH: GRAFIK & DISTRIBUSI --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KIRI: Health & Status Progress */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Distribusi Status Unit
            </h2>
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 rounded-lg">Kesehatan: {healthyRate}%</span>
          </div>
          
          <div className="space-y-6">
            {/* Tersedia */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> Tersedia (Gudang)</span>
                <span className="text-slate-800">{availableAssets} Unit</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${activeAssets > 0 ? (availableAssets / activeAssets) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Dipinjamkan */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500 flex items-center gap-1.5"><Send className="w-3.5 h-3.5"/> Dipinjamkan (Beroperasi)</span>
                <span className="text-slate-800">{assignedAssets} Unit</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${activeAssets > 0 ? (assignedAssets / activeAssets) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Maintenance */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5"/> Dalam Perbaikan</span>
                <span className="text-slate-800">{maintenanceAssets} Unit</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: `${activeAssets > 0 ? (maintenanceAssets / activeAssets) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Rusak */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500 flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5"/> Rusak / Afkir</span>
                <span className="text-slate-800">{damagedAssets} Unit</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${activeAssets > 0 ? (damagedAssets / activeAssets) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* KANAN: Distribusi Divisi */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 p-8 flex flex-col">
           <h2 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
             <BriefcaseBusiness className="w-5 h-5 text-indigo-600" /> Beban Pengelolaan Divisi
           </h2>
           <p className="text-xs font-medium text-slate-500 mb-8">Peta sebaran tanggung jawab aset berdasarkan departemen.</p>
           
           <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="flex flex-col justify-center text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-colors">
                 <Laptop className="w-8 h-8 mx-auto mb-4 text-blue-500" />
                 <p className="text-4xl font-black text-slate-800 mb-1">{itAssetsCount}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Divisi IT</p>
              </div>
              <div className="flex flex-col justify-center text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-emerald-200 transition-colors">
                 <BriefcaseBusiness className="w-8 h-8 mx-auto mb-4 text-emerald-500" />
                 <p className="text-4xl font-black text-slate-800 mb-1">{gaAssetsCount}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Divisi GA</p>
              </div>
              <div className="flex flex-col justify-center text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-purple-200 transition-colors">
                 <Box className="w-8 h-8 mx-auto mb-4 text-purple-500" />
                 <p className="text-4xl font-black text-slate-800 mb-1">{hrAssetsCount}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Divisi HR</p>
              </div>
           </div>
        </div>
      </div>

      {/* --- BAWAH: TABEL ASET TERBARU --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/30">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
               <PieChart className="w-5 h-5 text-indigo-600" /> Registrasi Aset Terbaru
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Daftar unit yang baru saja dimasukkan ke dalam database sistem.</p>
          </div>
          <Link href="/assets" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all uppercase tracking-widest">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Informasi Unit</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Kategori & Divisi</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tgl. Registrasi</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Status Saat Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAssignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-sm font-bold text-slate-400">Belum ada aset terdaftar.</td>
                </tr>
              ) : (
                recentAssignments.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Laptop className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{asset.asset_name}</div>
                            <div className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{asset.asset_code}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <p className="text-xs font-bold text-slate-700">{asset.category.category_name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">DIV: {asset.managing_division}</p>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-slate-500">
                      {new Date(asset.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border
                          ${asset.status === 'Available' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                            asset.status === 'Assigned' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'}
                        `}>
                          {asset.status === 'Damaged' ? 'Rusak' : 
                           asset.status === 'Maintenance' ? 'Perbaikan' : 
                           asset.status === 'Assigned' ? 'Dipinjam' : 'Tersedia'}
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}