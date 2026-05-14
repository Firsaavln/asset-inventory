"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Monitor, Tags, Box, Send, 
  LogOut, RefreshCw, Menu, X, User, ChevronRight,
  Trash2, Users, ShieldAlert, Building2
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Tutup sidebar dan dropdown profile setiap kali pindah halaman
  useEffect(() => { 
    setIsSidebarOpen(false); 
    setIsProfileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    // Arahkan ke halaman login (Bisa disesuaikan nanti jika sudah ada halaman login)
    router.push("/login");
  };

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Data Aset", href: "/assets", icon: Monitor },
    { name: "Kategori", href: "/categories", icon: Tags },
    { name: "Serah Terima", href: "/assignments", icon: Send },
    { name: "Disposal Aset", href: "/disposals", icon: Trash2 },
    { name: "Manajemen Akun", href: "/users", icon: Users },
    { name: "System Logs", href: "/logs", icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        
        {/* LOGO AREA */}
        <div className="h-20 flex items-center px-8 justify-between shrink-0 border-b border-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Asset<span className="text-indigo-600">Portal</span></span>
          </div>
          <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Master Menu</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.name} href={item.href} className={`relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden ${isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold" : "text-slate-500 hover:bg-indigo-50/80 hover:text-indigo-600 font-semibold"}`}>
                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>}
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600 group-hover:scale-110"}`} />
                  <span className="text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-indigo-200 relative z-10" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* --- HEADER --- */}
        <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30 sticky top-0 shadow-sm shadow-slate-100/50">
          
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl lg:hidden hover:bg-slate-100 active:scale-95 transition-all">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            
            <div className="hidden sm:flex flex-col items-end text-right">
               <p className="text-[11px] sm:text-xs font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                 PT Gree Electric <Building2 className="w-3.5 h-3.5 text-indigo-500" />
               </p>
               <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">HQ & Infrastructure</p>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200/80"></div>

            {/* Profile Dropdown Widget */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 sm:p-1.5 sm:pr-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-full transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4 sm:w-4 sm:h-4" />
                </div>
                <div className="hidden md:block text-left mr-1">
                  <p className="text-[11px] font-black text-slate-800 leading-none">Firsawanto Saputra</p>
                  <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-1.5 leading-none">Supervisor</p>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 hidden md:block transition-transform duration-300 ${isProfileOpen ? 'rotate-90 text-indigo-600' : ''}`} />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <div className="px-4 py-3 border-b border-slate-100 md:hidden bg-slate-50/50">
                      <p className="text-xs font-black text-slate-800">Firsawanto Saputra</p>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Supervisor</p>
                    </div>

                    <button onClick={() => window.location.reload()} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      <RefreshCw className="w-4 h-4" /> Sinkronisasi Data
                    </button>
                    
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100">
                      <LogOut className="w-4 h-4" /> Keluar Aplikasi
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-0 md:p-4 custom-scrollbar scroll-smooth bg-slate-50/50">
          <div className="min-h-full rounded-none md:rounded-[2rem] md:border border-slate-200 bg-slate-50 md:bg-transparent overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}