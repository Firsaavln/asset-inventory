import { prisma } from "@/lib/prisma";
import { Box, CheckCircle2, Send, Laptop, BriefcaseBusiness, Activity } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  // --- MENGAMBIL DATA METRIK ---
  const totalAssets = await prisma.asset.count();
  const availableAssets = await prisma.asset.count({ where: { status: "Available" } });
  const assignedAssets = await prisma.asset.count({ where: { status: "Assigned" } });

  const categoriesIT = await prisma.category.findMany({ where: { owner_dept: "IT" }, select: { id: true } });
  const totalITAssets = await prisma.asset.count({
    where: { category_id: { in: categoriesIT.map(c => c.id) } }
  });
  const totalGAAssets = totalAssets - totalITAssets;

  const recentAssignments = await prisma.assignment.findMany({
    take: 5,
    orderBy: { assign_date: "desc" },
    include: { asset: true },
  });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Utama</h1>
        <p className="text-base text-slate-500 mt-2">Ringkasan utilisasi aset IT dan Fasilitas General Affair.</p>
      </div>

      {/* --- KARTU METRIK UTAMA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-xl"><Box className="w-8 h-8 text-blue-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Aset</p>
            <p className="text-3xl font-extrabold text-slate-800">{totalAssets}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-orange-50 rounded-xl"><Send className="w-8 h-8 text-orange-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Dipinjamkan</p>
            <p className="text-3xl font-extrabold text-slate-800">{assignedAssets}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 rounded-xl"><Laptop className="w-8 h-8 text-indigo-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aset IT</p>
            <p className="text-3xl font-extrabold text-slate-800">{totalITAssets}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl"><BriefcaseBusiness className="w-8 h-8 text-emerald-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aset GA</p>
            <p className="text-3xl font-extrabold text-slate-800">{totalGAAssets}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BAGIAN KIRI */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" /> Status Ketersediaan
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Tersedia</span>
                <span className="text-slate-900">{availableAssets} item</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${totalAssets > 0 ? (availableAssets / totalAssets) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-600 flex items-center gap-2"><Send className="w-4 h-4 text-orange-500"/> Terpakai</span>
                <span className="text-slate-900">{assignedAssets} item</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Aktivitas Serah Terima</h2>
            <Link href="/assignments" className="text-sm font-bold text-indigo-600 hover:underline">Lihat Semua</Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full text-left">
              <tbody className="divide-y divide-slate-100">
                {recentAssignments.map((assign) => (
                  <tr key={assign.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800">{assign.asset.asset_name}</div>
                      <div className="text-xs font-mono font-bold text-indigo-600 mt-1">{assign.asset.asset_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{assign.borrower_name} <span className="font-medium text-slate-500">({assign.department})</span></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-xs font-medium text-slate-500">{new Date(assign.assign_date).toLocaleDateString('id-ID')}</div>
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