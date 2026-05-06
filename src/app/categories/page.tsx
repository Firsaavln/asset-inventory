import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { Plus, Tags, Building, BriefcaseBusiness } from "lucide-react";

async function addCategory(formData: FormData) {
  "use server";
  const name = formData.get("category_name") as string;
  const dept = formData.get("owner_dept") as string;
  if (name && dept) {
    await prisma.category.create({ data: { category_name: name, owner_dept: dept } });
    revalidatePath("/categories"); 
  }
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Kategori Aset</h1>
        <p className="text-sm text-slate-500 mt-1">Pengelompokan barang untuk membedakan wewenang IT dan GA.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Plus className="w-4 h-4 text-indigo-600" /> Tambah Kategori
        </h2>
        <form action={addCategory} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Tags className="w-3 h-3"/> Nama Kategori</label>
            <input type="text" name="category_name" placeholder="Contoh: Meja Kerja" required className="w-full border border-slate-200 bg-slate-50 text-sm p-2.5 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Building className="w-3 h-3"/> Divisi Pengelola</label>
            <select name="owner_dept" className="w-full border border-slate-200 bg-slate-50 text-sm p-2.5 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
              <option value="IT">IT Support</option>
              <option value="GA">General Affair</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all flex justify-center items-center gap-2">
              <Plus className="w-4 h-4" /> Simpan
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Kategori</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengelola</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{cat.category_name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cat.owner_dept === 'IT' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' : 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-700/10'}`}>
                    <BriefcaseBusiness className="w-3 h-3" /> {cat.owner_dept}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{cat.created_at.toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}