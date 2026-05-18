import { prisma } from "@/lib/prisma";
import { 
  Box, CheckCircle2, Send, Laptop, 
  BriefcaseBusiness, Activity, TrendingUp, 
  Wrench, ArrowRight, AlertOctagon, 
  PieChart, ShieldAlert, Clock,
  BarChart3, Building2, AlertTriangle, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";

// 🔥 WAJIB: Matikan cache agar Dashboard selalu menampilkan data real-time per admin
export const dynamic = "force-dynamic";

// Helper Format Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR", 
    maximumFractionDigits: 0 
  }).format(angka);
};

export default async function DashboardPage() {
  // 🔥 1. AMBIL DATA SESSION & CABANG
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;
  const userRole = payload?.role as string;
  const userBranch = payload?.branch as string;

  const isSuperAdmin = userRole?.toLowerCase() === "superadmin";

  // 🔥 2. BUAT FILTER FIREWALL CABANG (IDOR PROTECTION)
  const baseWhere: any = {};
  if (!isSuperAdmin) {
    baseWhere.branch = userBranch || "UNKNOWN_BRANCH";
  }

  // Persiapan untuk filter Garansi (30 Hari ke depan)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // --- QUERY DATABASE DENGAN INJEKSI FIREWALL & METRIK BARU ---
  const [
    totalAssetsRaw,
    availableAssets,
    assignedAssets,
    maintenanceAssets,
    damagedAssets,
    disposedAssets,
    totalValueData,
    financialRiskData, // 🔥 BARU: Hitung nilai aset rusak/maintenance
    expiringWarrantyCount, // 🔥 BARU: Hitung garansi mau habis
    recentAssets, // Perbaikan penamaan variabel
    itAssetsCount,
    gaAssetsCount,
    assAssetsCount,
    mktAssetsCount
  ] = await Promise.all([
    prisma.asset.count({ where: { ...baseWhere } }),
    prisma.asset.count({ where: { ...baseWhere, status: "Available" } }),
    prisma.asset.count({ where: { ...baseWhere, status: "Assigned" } }),
    prisma.asset.count({ where: { ...baseWhere, status: "Maintenance" } }),
    prisma.asset.count({ where: { ...baseWhere, status: "Damaged" } }),
    prisma.asset.count({ where: { ...baseWhere, status: "Disposed" } }),
    prisma.asset.aggregate({ _sum: { price: true }, where: { ...baseWhere, status: { not: "Disposed" } } }), 
    prisma.asset.aggregate({ _sum: { price: true }, where: { ...baseWhere, status: { in: ["Maintenance", "Damaged"] } } }), 
    prisma.asset.count({ where: { ...baseWhere, status: { not: "Disposed" }, warranty_date: { gte: today, lte: thirtyDaysFromNow } } }),
    prisma.asset.findMany({
      take: 6,
      where: { ...baseWhere, status: { not: "Disposed" } },
      orderBy: { created_at: "desc" },
      include: { category: true }
    }),
    prisma.asset.count({ where: { ...baseWhere, managing_division: "IT", status: { not: "Disposed" } } }),
    prisma.asset.count({ where: { ...baseWhere, managing_division: "GA", status: { not: "Disposed" } } }),
    prisma.asset.count({ where: { ...baseWhere, managing_division: "ASS", status: { not: "Disposed" } } }),
    prisma.asset.count({ where: { ...baseWhere, managing_division: "MKT", status: { not: "Disposed" } } }),
  ]);

  // --- KALKULASI METRIK INSIGHT ---
  const activeAssets = totalAssetsRaw - disposedAssets; 
  const totalValue = Number(totalValueData._sum.price || 0);
  const financialRiskValue = Number(financialRiskData._sum.price || 0);
  const problematicAssets = maintenanceAssets + damagedAssets;
  
  // Persentase
  const utilizationRate = activeAssets > 0 ? Math.round((assignedAssets / activeAssets) * 100) : 0;
  const healthyRate = activeAssets > 0 ? Math.round(((availableAssets + assignedAssets) / activeAssets) * 100) : 0;
  const riskRate = activeAssets > 0 ? Math.round((problematicAssets / activeAssets) * 100) : 0;

  const currentDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto space-y-6 lg:space-y-8 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-bl-full -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/30 rounded-tr-full -z-10 pointer-events-none"></div>
        
        <div className="space-y-4 relative z-10 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] sm:text-xs font-bold text-slate-500">
              <Clock className="w-3.5 h-3.5" /> {currentDate}
            </div>
            {/* 🔥 Indikator Cabang */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5" /> {isSuperAdmin ? "Semua Cabang (HO)" : userBranch}
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Dashboard Utama
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium max-w-2xl leading-relaxed">
            Ringkasan eksekutif pemanfaatan aset operasional perusahaan. Pantau nilai investasi, tingkat utilisasi, dan kesehatan inventaris secara real-time.
          </p>
        </div>

        {/* Total Investasi Highlight (Responsive Fix) */}
        <div className="flex items-center gap-4 sm:gap-5 p-5 sm:p-6 bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] text-white shadow-xl shadow-slate-900/20 relative overflow-hidden w-full xl:w-auto xl:min-w-[320px] shrink-0">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
           <div className="p-3 sm:p-4 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl shrink-0">
             <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-300" />
           </div>
           <div className="overflow-hidden">
             <p className="text-[9px] sm:text-[11px] font-bold text-indigo-200 uppercase tracking-[0.2em] mb-1 truncate">Total Investasi Aktif</p>
             <p className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight truncate">{formatRupiah(totalValue)}</p>
           </div>
        </div>
      </div>

      {/* 🔥 EXECUTIVE QUICK INSIGHTS (METRIK BARU) */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-500 text-white rounded-xl shadow-sm shrink-0"><AlertTriangle className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Nilai Risiko (Aset Rusak/Servis)</p>
            <p className="text-sm sm:text-lg font-black text-slate-800">{formatRupiah(financialRiskValue)}</p>
          </div>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow-sm shrink-0"><ShieldCheck className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Peringatan Garansi {"(< 30 Hari)"}</p>
            <p className="text-sm sm:text-lg font-black text-slate-800">{expiringWarrantyCount} Unit Mendekati Kedaluwarsa</p>
          </div>
        </div>
      </div> */}

      {/* --- KPI CARDS (4 Kolom) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Total Aset Aktif */}
        <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-4 sm:gap-5 group hover:border-blue-200 transition-colors">
          <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform shrink-0"><Box className="w-6 h-6 sm:w-7 sm:h-7" /></div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Unit Aktif</p>
            <div className="flex items-end gap-1.5 sm:gap-2 flex-wrap">
              <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">{activeAssets}</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mb-0.5">/ {totalAssetsRaw} Tercatat</p>
            </div>
          </div>
        </div>

        {/* Card 2: Utilisasi (Dipinjamkan) */}
        <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-4 sm:gap-5 group hover:border-emerald-200 transition-colors">
          <div className="p-3 sm:p-4 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform shrink-0"><Activity className="w-6 h-6 sm:w-7 sm:h-7" /></div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tingkat Utilisasi</p>
            <div className="flex items-end gap-1.5 sm:gap-2 flex-wrap">
              <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">{utilizationRate}%</p>
              <p className="text-[10px] sm:text-xs font-bold text-emerald-500 mb-0.5 flex items-center gap-1">({assignedAssets} Unit)</p>
            </div>
          </div>
        </div>

        {/* Card 3: Ready to Use (Tersedia) */}
        <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-4 sm:gap-5 group hover:border-indigo-200 transition-colors">
          <div className="p-3 sm:p-4 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform shrink-0"><CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" /></div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Siap Digunakan</p>
            <div className="flex items-end gap-1.5 sm:gap-2 flex-wrap">
              <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">{availableAssets}</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mb-0.5">Unit Tersedia</p>
            </div>
          </div>
        </div>

        {/* Card 4: Butuh Perhatian (Rusak/Maintenance) */}
        <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-4 sm:gap-5 group hover:border-rose-200 transition-colors">
          <div className="p-3 sm:p-4 bg-rose-50 text-rose-600 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform shrink-0"><ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" /></div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Butuh Perhatian</p>
            <div className="flex items-end gap-1.5 sm:gap-2 flex-wrap">
              <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">{problematicAssets}</p>
              <p className="text-[10px] sm:text-xs font-bold text-rose-500 mb-0.5 flex items-center gap-1">({riskRate}% Risiko)</p>
            </div>
          </div>
        </div>

      </div>

      {/* --- TENGAH: GRAFIK & DISTRIBUSI --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* KIRI: Health & Status Progress */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-200/60 p-6 sm:p-8 flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Distribusi Status Unit
            </h2>
            <span className="px-3 py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 rounded-lg w-fit">Kesehatan: {healthyRate}%</span>
          </div>
          
          <div className="space-y-5 sm:space-y-6">
            {/* Tersedia */}
            <div>
              <div className="flex justify-between text-[11px] sm:text-xs font-bold mb-2">
                <span className="text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> Tersedia (Gudang)</span>
                <span className="text-slate-800">{availableAssets} Unit</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${activeAssets > 0 ? (availableAssets / activeAssets) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Dipinjamkan */}
            <div>
              <div className="flex justify-between text-[11px] sm:text-xs font-bold mb-2">
                <span className="text-slate-500 flex items-center gap-1.5"><Send className="w-3.5 h-3.5"/> Dipinjamkan (Beroperasi)</span>
                <span className="text-slate-800">{assignedAssets} Unit</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${activeAssets > 0 ? (assignedAssets / activeAssets) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Maintenance */}
            <div>
              <div className="flex justify-between text-[11px] sm:text-xs font-bold mb-2">
                <span className="text-slate-500 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5"/> Dalam Perbaikan</span>
                <span className="text-slate-800">{maintenanceAssets} Unit</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: `${activeAssets > 0 ? (maintenanceAssets / activeAssets) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Rusak */}
            <div>
              <div className="flex justify-between text-[11px] sm:text-xs font-bold mb-2">
                <span className="text-slate-500 flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5"/> Rusak / Afkir</span>
                <span className="text-slate-800">{damagedAssets} Unit</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${activeAssets > 0 ? (damagedAssets / activeAssets) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* KANAN: Modern Donut Chart - Distribusi Divisi */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-200/60 p-6 sm:p-8 flex flex-col justify-between">
           <div className="mb-6 sm:mb-8">
             <h2 className="text-base sm:text-lg font-black text-slate-800 mb-1.5 sm:mb-2 flex items-center gap-2">
               <BriefcaseBusiness className="w-5 h-5 text-indigo-600" /> Beban Pengelolaan Divisi
             </h2>
             <p className="text-[11px] sm:text-xs font-medium text-slate-500">Peta sebaran tanggung jawab aset berdasarkan departemen.</p>
           </div>
           
           {/* KALKULASI PERSENTASE UNTUK CONIC GRADIENT */}
           {(() => {
             const totalDivAssets = itAssetsCount + gaAssetsCount + assAssetsCount + mktAssetsCount;
             const safeTotal = totalDivAssets || 1; // Mencegah pembagian dengan angka 0

             // Hitung persentase murni untuk masing-masing divisi
             const itPct = Math.round((itAssetsCount / safeTotal) * 100);
             const gaPct = Math.round((gaAssetsCount / safeTotal) * 100);
             const assPct = Math.round((assAssetsCount / safeTotal) * 100);
             const mktPct = totalDivAssets > 0 ? 100 - (itPct + gaPct + assPct) : 0; // Sisa persentase untuk akurasi total 100%

             // Titik potong akumulatif untuk CSS conic-gradient
             const m1 = itPct;
             const m2 = m1 + gaPct;
             const m3 = m2 + assPct;

             // Jika semua data kosong, tampilkan warna abu-abu netral
             const chartStyle = totalDivAssets === 0 
               ? { background: '#f1f5f9' }
               : { background: `conic-gradient(#3b82f6 0% ${m1}%, #10b981 ${m1}% ${m2}%, #8b5cf6 ${m2}% ${m3}%, #f43f5e ${m3}% 100%)` };

             return (
               // Responsif: flex-col di HP (chart di atas, legenda di bawah), flex-row di Desktop (saling berdampingan)
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 xl:gap-12 flex-1">
                 
                 {/* 1. KOTAK VISUAL DONUT CHART (Responsive Size) */}
                 <div 
                   className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105 duration-500" 
                   style={chartStyle}
                 >
                   {/* Lubang Tengah Donut */}
                   <div className="w-[100px] h-[100px] sm:w-[114px] sm:h-[114px] bg-white rounded-full flex flex-col items-center justify-center shadow-inner select-none">
                     <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{totalDivAssets}</span>
                     <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total Unit</span>
                   </div>
                 </div>

                 {/* 2. KOTAK LEGENDA / DATA GRID */}
                 <div className="grid grid-cols-2 gap-3 w-full flex-1">
                   
                   {/* DIVISI IT (Blue Theme) */}
                   <div className="p-3 sm:p-4 bg-slate-50/60 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all group">
                     <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40 shrink-0"></div>
                       <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Divisi IT</p>
                     </div>
                     <div className="flex items-baseline gap-1.5">
                       <p className="text-lg sm:text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{itAssetsCount}</p>
                       <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">{itPct}%</p>
                     </div>
                   </div>

                   {/* DIVISI GA (Emerald Theme) */}
                   <div className="p-3 sm:p-4 bg-slate-50/60 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-all group">
                     <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40 shrink-0"></div>
                       <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Divisi GA</p>
                     </div>
                     <div className="flex items-baseline gap-1.5">
                       <p className="text-lg sm:text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">{gaAssetsCount}</p>
                       <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">{gaPct}%</p>
                     </div>
                   </div>

                   {/* DIVISI ASS (Purple Theme) */}
                   <div className="p-3 sm:p-4 bg-slate-50/60 rounded-2xl border border-slate-100 hover:border-purple-100 transition-all group">
                     <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/40 shrink-0"></div>
                       <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Divisi ASS</p>
                     </div>
                     <div className="flex items-baseline gap-1.5">
                       <p className="text-lg sm:text-2xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">{assAssetsCount}</p>
                       <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">{assPct}%</p>
                     </div>
                   </div>

                   {/* DIVISI MKT (Rose Theme) */}
                   <div className="p-3 sm:p-4 bg-slate-50/60 rounded-2xl border border-slate-100 hover:border-rose-100 transition-all group">
                     <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/40 shrink-0"></div>
                       <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Divisi MKT</p>
                     </div>
                     <div className="flex items-baseline gap-1.5">
                       <p className="text-lg sm:text-2xl font-black text-slate-800 group-hover:text-rose-600 transition-colors">{mktAssetsCount}</p>
                       <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">{mktPct}%</p>
                     </div>
                   </div>

                 </div>

               </div>
             );
           })()}
        </div>
      </div>

      {/* --- BAWAH: TABEL ASET TERBARU --- */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
        <div className="p-5 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/30">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
               <PieChart className="w-5 h-5 text-indigo-600" /> Registrasi Aset Terbaru
            </h2>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">Daftar unit yang baru saja dimasukkan ke dalam database sistem.</p>
          </div>
          <Link href="/assets" className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-[10px] sm:text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all uppercase tracking-widest active:scale-95">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Informasi Unit</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Kategori & Divisi</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tgl. Registrasi</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Status Saat Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAssets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-xs sm:text-sm font-bold text-slate-400">Belum ada aset terdaftar di cabang ini.</td>
                </tr>
              ) : (
                recentAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 sm:px-8 py-4 sm:py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3 sm:gap-4">
                         <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 text-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <Laptop className="w-4 h-4 sm:w-5 h-5" />
                         </div>
                         <div>
                            <div className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{asset.asset_name}</div>
                            <div className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 mt-0.5">{asset.asset_code}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-5 whitespace-nowrap">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-700">{asset.category.category_name}</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">DIV: {asset.managing_division}</p>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-5 whitespace-nowrap text-[11px] sm:text-xs font-bold text-slate-500">
                      {new Date(asset.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border
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