import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Users, Plus, ShieldCheck, Pencil, 
  Trash2, Shield, UserCog, Building2, User 
} from "lucide-react";
import Pagination from "@/components/Pagination"; 
import { deleteUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // 🔥 1. DETEKSI IDENTITAS USER & SESSION LOGIC
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;
  
  if (!payload) redirect("/login");

  const actorRole = (payload.role as string).toLowerCase();
  const actorBranch = payload.branch as string;

  const isSuperAdmin = actorRole === "superadmin";
  const isReadOnlyUser = actorRole === "user";

  // Paginasi Config
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const ITEMS_PER_PAGE = 10;

  // 🔥 2. BANGUN FIREWALL IDOR (Isolasi Cabang & Proteksi Hirarki)
  const whereClause: any = {};
  if (!isSuperAdmin) {
    whereClause.branch = actorBranch || "UNKNOWN_BRANCH";
    
    // Admin biasa tidak boleh melihat atau mengutak-atik akun Superadmin
    if (actorRole === "admin") {
      whereClause.role = { not: "superadmin" };
    }
  }

  // Hitung total data
  const totalItems = await prisma.user.count({ where: whereClause });
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: [
      { role: 'asc' }, // Superadmin di atas, disusul admin, lalu user
      { name: 'asc' }
    ],
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 max-w-6xl mx-auto font-sans">
      
      {/* --- HEADER SECTION (RESPONSIVE & PREMIUM CARD) --- */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-5 sm:p-6 md:p-8 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50/40 to-transparent rounded-bl-full pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 hidden sm:flex shrink-0">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Manajemen Akun
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
               <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1.5 w-fit shrink-0">
                 <Building2 className="w-3.5 h-3.5" /> {isSuperAdmin ? "Semua Cabang (HO)" : actorBranch}
               </span>
               <p className="text-xs sm:text-sm text-slate-500 font-medium">Kelola akses administrator dan staf operasional.</p>
            </div>
          </div>
        </div>

        {/* 🔥 PROTEKSI UI: Tombol Tambah Akun disembunyikan untuk User biasa */}
        {!isReadOnlyUser && (
          <div className="relative z-10 w-full lg:w-auto shrink-0">
            <Link 
              href="/users/add" 
              className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-slate-900 text-white rounded-2xl text-xs sm:text-sm font-black shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all uppercase tracking-widest active:scale-95 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Tambah Akun
            </Link>
          </div>
        )}
      </header>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
        {users.length === 0 ? (
           <div className="p-16 sm:p-24 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
               <Users className="w-10 h-10 text-slate-300" />
             </div>
             <p className="text-slate-900 font-bold text-xl">Tidak Ada Data Akun</p>
             <p className="text-slate-500 text-sm mt-1">Belum ada akun terdaftar untuk wilayah {isSuperAdmin ? "sistem ini" : actorBranch}.</p>
           </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi User</th>
                    <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level Akses</th>
                    <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Penempatan</th>
                    <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => {
                    const roleLower = user.role.toLowerCase();
                    return (
                    <tr key={user.id} className="group hover:bg-slate-50/40 transition-colors duration-300">
                      
                      {/* INFORMASI USER */}
                      <td className="px-6 sm:px-8 py-5 sm:py-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-lg shrink-0 transition-transform group-hover:scale-105
                            ${roleLower === 'superadmin' ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm' : 
                              roleLower === 'admin' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-black text-slate-800 line-clamp-1">{user.name}</p>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5">@{user.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* LEVEL AKSES */}
                      <td className="px-6 sm:px-8 py-5 sm:py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border whitespace-nowrap
                          ${roleLower === 'superadmin' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                            roleLower === 'admin' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                          {roleLower === 'superadmin' ? <ShieldCheck className="w-3.5 h-3.5" /> : 
                           roleLower === 'admin' ? <Shield className="w-3.5 h-3.5" /> : 
                           <User className="w-3.5 h-3.5" />}
                          {user.role}
                        </span>
                      </td>

                      {/* PENEMPATAN */}
                      <td className="px-6 sm:px-8 py-5 sm:py-6">
                         <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 whitespace-nowrap">
                           <Building2 className="w-4 h-4 text-slate-300" /> {user.branch || "Pusat (HO)"}
                         </div>
                      </td>

                      {/* KONTROL AKSI */}
                      <td className="px-6 sm:px-8 py-5 sm:py-6 text-right">
                        {!isReadOnlyUser ? (
                          <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                            
                            <Link href={`/users/${user.id}/edit`} className="p-2 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg sm:rounded-xl transition-all active:scale-95" title="Edit Akun">
                              <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Link>
                            
                            {/* Cegah user menghapus akun 'superadmin' utama atau dirinya sendiri */}
                            {user.username !== "superadmin" && user.id !== payload?.id && (
                              <form action={async () => {
                                "use server";
                                await deleteUser(user.id);
                              }}>
                                <button type="submit" className="p-2 sm:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-all active:scale-95" title="Hapus Akun">
                                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                              </form>
                            )}

                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 tracking-widest px-3 py-1.5">TERKUNCI</span>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </>
        )}
      </div>
    </div>
  );
}