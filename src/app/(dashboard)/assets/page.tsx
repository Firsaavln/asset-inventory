import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers"; // 👈 Import cookies
import { decrypt } from "@/lib/auth";   // 👈 Import auth decryptor
import { 
  Plus, MonitorSmartphone, Pencil, LayoutGrid, MapPin, Tag, Building2
} from "lucide-react";
import AssetFilters from "./AssetFilters";
import ExportAssetButton from "@/components/ExportAssetButton";
// import DeleteAssetButton from "@/components/DeleteAssetButton"; 
import Pagination from "@/components/Pagination"; 

export const dynamic = "force-dynamic"; // 🔥 Matikan cache agar aman

// Helper untuk format rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

export default async function AssetsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  
  // 🔥 1. AMBIL DATA SESSION & CABANG
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;
  const userRole = payload?.role as string;
  const userBranch = payload?.branch as string;

  const isSuperAdmin = userRole?.toLowerCase() === "superadmin";

  // Ambil URL parameter untuk filter dan pagination
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const cat = resolvedParams.category || "";
  const loc = resolvedParams.location || "";
  
  // Setup parameter Pagination
  const currentPage = Number(resolvedParams.page) || 1;
  const ITEMS_PER_PAGE = 10; 

  // 🔥 2. FILTER KATEGORI DI DROPDOWN (Sesuai Cabang)
  const catWhereClause: any = {};
  if (!isSuperAdmin) {
    catWhereClause.branch = userBranch || "UNKNOWN_BRANCH";
  }
  const categories = await prisma.category.findMany({ 
    where: catWhereClause,
    select: { id: true, category_name: true } 
  });

  // 🔥 3. FIREWALL UTAMA (Filter Aset Sesuai Cabang)
  const whereClause: any = {
    asset_name: { contains: q },
    location: { contains: loc }, // Ini mencari di field 'location' (contoh: Ruangan 101)
    status: { not: "Disposed" },
    ...(cat ? { category_id: Number(cat) } : {})
  };

  // Kunci data ke cabang admin yang sedang login
  if (!isSuperAdmin) {
    whereClause.branch = userBranch || "UNKNOWN_BRANCH";
  }

  // Hitung TOTAL data untuk menentukan jumlah halaman
  const totalItems = await prisma.asset.count({ where: whereClause });
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // Tarik data aset yang difilter sesuai halaman aktif (SKIP & TAKE)
  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: { created_at: "desc" },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE
  });

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-2xl -z-10"></div>
        
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 hidden sm:block">
            <MonitorSmartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Inventaris Aset</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
               <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1.5 w-fit">
                 <Building2 className="w-3.5 h-3.5" /> {isSuperAdmin ? "Semua Cabang (HO)" : userBranch}
               </span>
               <p className="text-sm font-medium text-slate-500">Kelola data fisik, finansial, dan lokasi aset.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExportAssetButton />
          <Link href="/assets/add" className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap">
            <Plus className="w-5 h-5" /> Registrasi Aset
          </Link>
        </div>
      </div>

      {/* --- PENCARIAN & FILTER BAR --- */}
      <AssetFilters categories={categories} />

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Detail Aset</th>
                <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Kategori & Lokasi</th>
                <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Nilai Buku</th>
                <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* DETAIL ASET */}
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {asset.asset_image ? (
                          <img src={asset.asset_image} alt={asset.asset_name} className="w-full h-full object-cover" />
                        ) : (
                          <LayoutGrid className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{asset.asset_name}</p>
                        <p className="text-xs font-mono font-medium text-slate-500 mt-1">{asset.asset_code}</p>
                      </div>
                    </div>
                  </td>

                  {/* KATEGORI & LOKASI */}
                  <td className="px-6 py-5 space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <Tag className="w-3 h-3" /> {asset.category.category_name}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" /> {asset.location || "Lokasi Belum Di-set"}
                    </div>
                  </td>

                  {/* HARGA / NILAI */}
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-emerald-600">{formatRupiah(Number(asset.price))}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Kondisi: {asset.condition}</p>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                      asset.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                      asset.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                      asset.status === 'Maintenance' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        asset.status === 'Available' ? 'bg-emerald-500' :
                        asset.status === 'Assigned' ? 'bg-blue-500' :
                        asset.status === 'Maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></div>
                      {asset.status}
                    </span>
                  </td>

                  {/* AKSI */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/assets/${asset.id}`}
                        className="p-2.5 text-sky-500 bg-sky-50 hover:text-white hover:bg-sky-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-sky-200 active:scale-95"
                        title="Lihat Detail Aset"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </Link>

                      <Link 
                        href={`/assets/${asset.id}/edit`}
                        className="p-2.5 text-indigo-500 bg-indigo-50 hover:text-white hover:bg-indigo-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-indigo-200 active:scale-95"
                        title="Edit Aset"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      
                      {/* <DeleteAssetButton id={asset.id} assetName={asset.asset_name} /> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* EMPTY STATE */}
          {assets.length === 0 && (
             <div className="p-20 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <MonitorSmartphone className="w-10 h-10 text-slate-300" />
               </div>
               <p className="text-slate-900 font-bold text-xl">Tidak Ada Data Aset</p>
               <p className="text-slate-500 text-sm mt-1">Di cabang {isSuperAdmin ? "Sistem" : userBranch}. Coba sesuaikan filter pencarian.</p>
             </div>
          )}
        </div>

        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}