import { getAssets, createAsset } from "../../../services/assetService";
import { prisma } from "../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { Plus, Laptop, Calendar, Tag, QrCode, Box, Activity, ShieldCheck, Store, CircleDollarSign, FileText } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export default async function AssetsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null; 

  const userRole = (session.user as any).role || "user";
  const userBranch = (session.user as any).branch || "HQ";

  const assets = await getAssets(userRole, userBranch);
  const categories = await prisma.category.findMany();

  const canEdit = userRole === "superadmin" || userRole === "admin";

  async function handleAddAsset(formData: FormData) {
    "use server";
    if (userRole !== "superadmin" && userRole !== "admin") throw new Error("Akses Ditolak");

    const name = formData.get("name") as string;
    const category_id = parseInt(formData.get("category_id") as string);
    const purchase_date = new Date(formData.get("purchase_date") as string);
    const status = formData.get("status") as string;
    
    const specification = formData.get("specification") as string;
    const vendor_name = formData.get("vendor_name") as string;
    const priceStr = formData.get("purchase_price") as string;
    const purchase_price = priceStr ? parseFloat(priceStr) : undefined;
    const warrantyStr = formData.get("warranty_expiry") as string;
    const warranty_expiry = warrantyStr ? new Date(warrantyStr) : undefined;

    if (name && category_id && purchase_date) {
      await createAsset({ 
        name, category_id, purchase_date, status, 
        specification, purchase_price, vendor_name, warranty_expiry,
        branch: userRole === "superadmin" ? "HQ" : userBranch 
      });
      revalidatePath("/assets");
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Aset</h1>
        <p className="text-base text-slate-500 mt-2">
          Pusat kendali inventaris - <span className="font-bold text-indigo-600 uppercase">Cabang: {userBranch}</span>
        </p>
      </div>

      {/* --- FORM INPUT HANYA MUNCUL UNTUK ADMIN & SUPERADMIN --- */}
      {canEdit && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Registrasi Aset Baru</h2>
          </div>
          
          <form action={handleAddAsset} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Laptop className="w-4 h-4 text-slate-400"/> Nama Barang</label>
                <input type="text" name="name" required placeholder="Contoh: ThinkPad T14" className="w-full border border-slate-200 bg-slate-50 text-slate-900 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4 text-slate-400"/> Kategori</label>
                <select name="category_id" required className="w-full border border-slate-200 bg-slate-50 text-slate-900 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                  <option value="">Pilih Kategori...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.category_name} ({cat.owner_dept})</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400"/> Tgl Pembelian</label>
                <input type="date" name="purchase_date" required className="w-full border border-slate-200 bg-slate-50 text-slate-900 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400"/> Status</label>
                <select name="status" required className="w-full border border-slate-200 bg-slate-50 text-slate-900 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                  <option value="Available">Available (Tersedia)</option>
                  <option value="Upgrading">Upgrading</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Broken">Broken</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Store className="w-4 h-4 text-slate-400"/> Nama Vendor</label>
                <input type="text" name="vendor_name" placeholder="Contoh: EnterKomputer" className="w-full border border-slate-200 bg-slate-50 text-slate-900 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><CircleDollarSign className="w-4 h-4 text-slate-400"/> Harga Beli (Rp)</label>
                <input type="number" name="purchase_price" placeholder="Contoh: 15000000" className="w-full border border-slate-200 bg-slate-50 text-slate-900 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-slate-400"/> Expired Garansi</label>
                <input type="date" name="warranty_expiry" className="w-full border border-slate-200 bg-slate-50 text-slate-900 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400"/> Spesifikasi Lengkap</label>
                <textarea name="specification" rows={2} placeholder="Detail RAM, Storage, dll..." className="w-full border border-slate-200 bg-slate-50 text-slate-900 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"></textarea>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-indigo-600 text-white text-sm font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all flex justify-center items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> Simpan Data Aset
                </button>
              </div>
            </div>
          </form>
        </div>
      )} 
      {/* ^^^ TADI ERROR KARENA BAGIAN INI KEPOTONG ^^^ */}

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Kode Aset</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Barang & Vendor</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Garansi / Harga</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-100 rounded-md group-hover:bg-indigo-100 transition-colors">
                        <QrCode className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                      </div>
                      <Link href={`/assets/${asset.id}`} className="text-sm font-mono font-bold text-indigo-600 tracking-tight hover:underline hover:text-indigo-800 transition-all cursor-pointer">
                        {asset.asset_code}
                      </Link>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-800">{asset.name}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{asset.vendor_name || asset.category?.category_name}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-semibold text-slate-700">
                      {asset.purchase_price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(asset.purchase_price) : "-"}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> 
                      {asset.warranty_expiry ? asset.warranty_expiry.toLocaleDateString('id-ID') : "Tanpa Garansi"}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-inset ${
                        asset.status === 'Available' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                        asset.status === 'Assigned' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 
                        asset.status === 'Upgrading' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' : 
                        'bg-red-50 text-red-700 ring-red-600/20'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        asset.status === 'Available' ? 'bg-emerald-500' : 
                        asset.status === 'Assigned' ? 'bg-blue-500' : 
                        asset.status === 'Upgrading' ? 'bg-purple-500' : 
                        'bg-red-500'
                      }`}></div>
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <Box className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium">Belum ada data aset yang terdaftar di cabang ini.</p>
                      {canEdit && <p className="text-xs mt-1 text-slate-400">Silakan input data aset baru melalui form di atas.</p>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}