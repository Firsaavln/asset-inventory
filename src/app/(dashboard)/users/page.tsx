import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Plus, ShieldCheck, Pencil, Trash2, Shield } from "lucide-react";
import Pagination from "@/components/Pagination"; // 👈 Import Pagination
import { deleteUser } from "./actions";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // Paginasi Config
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const ITEMS_PER_PAGE = 10;

  // Hitung total data
  const totalItems = await prisma.user.count();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            Manajemen Akun <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Kelola akses administrator dan staf operasional.</p>
        </div>
        <Link href="/users/add" className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all uppercase tracking-widest active:scale-95">
          <Plus className="w-4 h-4" /> Tambah Akun
        </Link>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi User</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level Akses</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Penempatan</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm
                        ${user.role === 'superadmin' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-600'}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                      ${user.role === 'superadmin' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {user.role === 'superadmin' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">{user.branch || "Pusat"}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/users/${user.id}/edit`} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      
                      {user.username !== "superadmin" && (
                        <form action={async () => {
                          "use server";
                          await deleteUser(user.id);
                        }}>
                          <button type="submit" className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}