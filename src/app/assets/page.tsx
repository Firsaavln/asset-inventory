import { getAssets, createAsset } from "../../services/assetService";
import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { Plus, Laptop, Calendar, Tag, QrCode, Activity, ShieldCheck, Store, CircleDollarSign, FileText } from "lucide-react";
import Link from "next/link";

export default async function AssetsPage() {
  const assets = await getAssets();
  const categories = await prisma.category.findMany();

  async function handleAddAsset(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const category_id = parseInt(formData.get("category_id") as string);
    const purchase_date = new Date(formData.get("purchase_date") as string);
    const status = formData.get("status") as string;
    
    // Field Opsional
    const specification = formData.get("specification") as string;
    const vendor_name = formData.get("vendor_name") as string;
    const priceStr = formData.get("purchase_price") as string;
    const purchase_price = priceStr ? parseFloat(priceStr) : undefined;
    const warrantyStr = formData.get("warranty_expiry") as string;
    const warranty_expiry = warrantyStr ? new Date(warrantyStr) : undefined;

    if (name && category_id && purchase_date) {
      await createAsset({ 
        name, category_id, purchase_date, status, 
        specification, purchase_price, vendor_name, warranty_expiry 
      });
      revalidatePath("/assets");
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Aset</h1>
          <p className="text-base text-slate-500 mt-2">Pusat kendali inventaris, spesifikasi teknis, dan informasi vendor.</p>
        </div>
      </div>

      {/* --- FORM INPUT (BISA DIBUKA TUTUP / ACCORDION) --- */}
      <details className="group bg-white rounded-2xl shadow-sm border border-slate-200 mb-10 overflow-hidden open:ring-2 open:ring-indigo-100 transition-all">
        {/* Tombol Pembuka Form */}
        <summary className="p-6 cursor-pointer list-none flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg group-open:bg-indigo-600 group-open:text-white transition-colors">
              <Plus className="w-5 h-5 text-indigo-600 group-open:text-white" />
            </div>
            <span>Registrasi Aset Baru (Klik untuk membuka form)</span>
          </div>
        </summary>
        
        {/* Isi Form Lengkap */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
          <form action={handleAddAsset} className="space-y-6">
            
            {/* Baris 1: Info Dasar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Laptop className="w-4 h-4 text-slate-400"/> Nama Barang *</label>
                <input type="text" name="name" required placeholder="Contoh: ThinkPad T14 Gen 3" className="w-full border border-slate-200 bg-white text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4 text-slate-400"/> Kategori *</label>
                <select name="category_id" required className="w-full border border-slate-200 bg-white text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm">
                  <option value="">Pilih Kategori...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.category_name} ({cat.owner_dept})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400"/> Status Awal *</label>
                <select name="status" required className="w-full border border-slate-200 bg-white text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm">
                  <option value="Available">Available (Tersedia)</option>
                  <option value="Upgrading">Upgrading / Diperbarui</option>
                  <option value="Maintenance">Maintenance / Servis</option>
                  <option value="Broken">Broken / Rusak</option>
                </select>
              </div>
            </div>

            {/* Baris 2: Info Finansial & Garansi */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400"/> Tgl Beli *</label>
                <input type="date" name="purchase_date" required className="w-full border border-slate-200 bg-white text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><CircleDollarSign className="w-4 h-4 text-slate-400"/> Harga Beli (Rp)</label>
                <input type="number" name="purchase_price" placeholder="Contoh: 15000000" className="w-full border border-slate-200 bg-white text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Store className="w-4 h-4 text-slate-400"/> Nama Vendor</label>
                <input type="text" name="vendor_name" placeholder="Contoh: EnterKomputer" className="w-full border border-slate-200 bg-white text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-slate-400"/> Expired Garansi</label>
                <input type="date" name="warranty_expiry" className="w-full border border-slate-200 bg-white text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
              </div>
            </div>

            {/* Baris 3: Spesifikasi Teknis */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400"/> Spesifikasi Lengkap / Catatan Upgrade</label>
              <textarea name="specification" rows={3} placeholder="Contoh: Intel Core i7 12th Gen, 16GB RAM, 512GB SSD..." className="w-full border border-slate-200 bg-white text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"></textarea>
            </div>

            {/* Tombol Simpan */}
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-indigo-600 text-white text-sm font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all flex justify-center items-center gap-2 shadow-sm">
                Simpan Aset ke Database
              </button>
            </div>
          </form>
        </div>
      </details>

      {/* --- TABEL DATA --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Kode Aset</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Barang & Vendor</th>
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
                      <Link href={`/assets/${asset.id}`} className="text-sm font-mono font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                        {asset.asset_code}
                      </Link>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-800">{asset.name}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{asset.vendor_name || "-"}</div>
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
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">Belum ada aset terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}