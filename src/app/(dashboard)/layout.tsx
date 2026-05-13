"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, Monitor, Tags, Box, Send, 
  LogOut, RefreshCw, Menu, X, User, ChevronRight,
  Trash2
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Menutup sidebar otomatis saat pindah halaman di mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Data Menu Utama (Ditambah Disposal)
  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Data Aset", href: "/assets", icon: Monitor },
    { name: "Kategori", href: "/categories", icon: Tags },
    { name: "Serah Terima", href: "/assignments", icon: Send },
    { name: "Disposal Aset", href: "/disposals", icon: Trash2 }, // 👈 Menu Baru
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- OVERLAY MOBILE --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 opacity-100"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col
      `}>
        {/* LOGO AREA */}
        <div className="h-20 flex items-center px-8 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Asset<span className="text-indigo-600">Portal</span>
            </span>
          </div>
          <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            // startsWith ditambahkan biar kalau lu buka /assets/add, menu Data Aset tetap nyala.

            return (
              <Link 
                key={item.name}
                href={item.href}
                className={`
                  relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
                  ${isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold" 
                    : "text-slate-500 hover:bg-indigo-50/80 hover:text-indigo-600 font-semibold"}
                `}
              >
                {/* Efek kilap saat active */}
                {isActive && (
                   <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600 group-hover:scale-110"}`} />
                  <span className="text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-indigo-200 relative z-10" />}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM AREA: USER PROFILE & ACTION */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          {/* USER CARD */}
          <div className="flex items-center gap-3 p-3 mb-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <User className="w-5 h-5" />
             </div>
             <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-900 truncate">{(session?.user as any)?.name || "User Admin"}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter truncate">{(session?.user as any)?.role || "Staff"}</p>
             </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="flex-1 flex items-center justify-center gap-2 p-3 text-[10px] font-black text-slate-500 bg-white border border-slate-200 rounded-xl hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 group"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" /> SYNC
            </button>
            <button 
              onClick={() => signOut()} 
              className="flex-1 flex items-center justify-center gap-2 p-3 text-[10px] font-black text-rose-500 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 group"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> KELUAR
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-30 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl lg:hidden hover:bg-slate-100 transition-all active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
             <div className="text-right flex flex-col justify-center">
                <p className="text-xs sm:text-sm font-black text-slate-900 leading-none truncate max-w-[200px] sm:max-w-xs">
                  PT Gree Electric Appliances Indonesia
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  Indonesia Branch
                </p>
             </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-0 md:p-4 custom-scrollbar scroll-smooth bg-slate-50/50">
          <div className="min-h-full rounded-none md:rounded-[2rem] md:border border-slate-200 bg-slate-50 md:bg-transparent overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}