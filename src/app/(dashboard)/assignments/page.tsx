// src/app/assignments/page.tsx
import { getAvailableAssets, getActiveAssignments, assignAsset } from "../../../services/assignmentService";
import { revalidatePath } from "next/cache";
import { Send, User, Building2, ClipboardList, Laptop } from "lucide-react";

export default async function AssignmentsPage() {
  const availableAssets = await getAvailableAssets();
  const activeAssignments = await getActiveAssignments();

  async function handleAssignment(formData: FormData) {
    "use server";
    const asset_id = parseInt(formData.get("asset_id") as string);
    const borrower_name = formData.get("borrower_name") as string;
    const department = formData.get("department") as string;
    const notes = formData.get("notes") as string;

    if (asset_id && borrower_name && department) {
      await assignAsset({ asset_id, borrower_name, department, notes });
      // Refresh 2 halaman sekaligus karena status aset berubah
      revalidatePath("/assignments");
      revalidatePath("/assets"); 
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Serah Terima Aset</h1>
        <p className="text-base text-slate-500 mt-2">Catat peminjaman barang ke karyawan dan lacak kepemilikannya.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Send className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Form Peminjaman Baru</h2>
        </div>
        
        <form action={handleAssignment} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Laptop className="w-4 h-4 text-slate-400"/> Pilih Aset (Status: Available)</label>
            <select name="asset_id" required className="w-full border border-slate-200 bg-slate-50 text-slate-900 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
              <option value="">Pilih barang yang tersedia...</option>
              {availableAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>[{asset.asset_code}] - {asset.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400"/> Nama Peminjam</label>
            <input type="text" name="borrower_name" required placeholder="Contoh: Budi" className="w-full border border-slate-200 bg-slate-50 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400"/> Divisi</label>
            <input type="text" name="department" required placeholder="Contoh: Finance" className="w-full border border-slate-200 bg-slate-50 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" disabled={availableAssets.length === 0} className="w-full bg-indigo-600 text-white text-sm font-bold px-4 py-3 rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex justify-center items-center gap-2 shadow-sm">
              Proses Serah Terima
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-600" /> Daftar Aset Sedang Dipinjam
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Aset</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Peminjam</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Tanggal Pinjam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeAssignments.map((assign) => (
                <tr key={assign.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-800">{assign.asset.name}</div>
                    <div className="text-xs font-mono font-medium text-indigo-600 mt-1">{assign.asset.asset_code}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-800">{assign.borrower_name}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{assign.department}</div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">
                    {assign.assign_date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {activeAssignments.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-sm font-medium text-slate-400">
                    Belum ada aset yang dipinjamkan.
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