"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Monitor, Tags, Box, Send, 
  LogOut, RefreshCw, Menu, X, User as UserIcon, ChevronRight,
  Trash2, Users, ShieldAlert, Building2
} from "lucide-react";
import { logoutAction } from "@/app/login/actions"; 

interface UserProps {
  user: {
    name: string;
    role: string;
    branch?: string;
  };
  children: React.ReactNode;
}

export default function DashboardClientLayout({ children, user }: UserProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => { 
    setIsSidebarOpen(false); 
    setIsProfileOpen(false);
  }, [pathname]);

  const allMenuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Data Aset", href: "/assets", icon: Monitor },
    { name: "Kategori", href: "/categories", icon: Tags },
    { name: "Serah Terima", href: "/assignments", icon: Send },
    { name: "Disposal Aset", href: "/disposals", icon: Trash2 },
    { name: "Manajemen Akun", href: "/users", icon: Users },
    { name: "System Logs", href: "/logs", icon: ShieldAlert },
  ];

  // RBAC SIDEBAR FILTERING
  const menuItems = allMenuItems.filter((item) => {
    if (user.role === "superadmin") return true; 
    
    if (user.role === "admin") {
      return !["Manajemen Akun", "System Logs"].includes(item.name);
    }
    
    if (user.role === "user") {
      return ["Dashboard", "Data Aset"].includes(item.name);
    }
    
    return false;
  });

  const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 font-sans">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col justify-between`}>
        
        {/* Bagian Atas Sidebar (Logo & Navigasi) */}
        <div className="flex flex-col overflow-hidden flex-1">
          <div className="h-20 flex items-center px-6 justify-between shrink-0 border-b border-slate-100/50">
            <div className="flex items-center gap-3 select-none w-full">
              {/* 🔥 LOGO PNG DI-BESARKAN & RESPONSIVE */}
              <img 
                src="/logo.png" 
                alt="Asset Portal Logo" 
                className="h-14 sm:h-16 w-auto object-contain max-w-[240px] sm:max-w-[260px] transition-all" 
              />
            </div>
            <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg shrink-0" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Master Menu</p>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.name} href={item.href} className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${isActive ? "bg-indigo-600 text-white font-bold" : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 font-semibold"}`}>
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-indigo-200" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mini Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50 hidden lg:block">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">IT Departement • Production Mode</p>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30 sticky top-0 shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl lg:hidden">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            <div className="hidden sm:flex flex-col items-end text-right">
               <p className="text-[11px] sm:text-xs font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                 {user.branch || "PT Gree Electric"} <Building2 className="w-3.5 h-3.5 text-indigo-500" />
               </p>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200/80"></div>

            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 p-1 sm:p-1.5 sm:pr-4 bg-slate-50 border border-slate-200 rounded-full group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {initials}
                </div>
                <div className="hidden md:block text-left mr-1">
                  <p className="text-[11px] font-black text-slate-800 leading-none">{user.name}</p>
                  <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-1.5 leading-none">{user.role}</p>
                </div>
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 py-2">
                    <div className="px-4 py-3 border-b border-slate-100 md:hidden bg-slate-50/50">
                      <p className="text-xs font-black text-slate-800">{user.name}</p>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">{user.role}</p>
                    </div>
                    <form action={logoutAction} className="w-full">
                      <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50">
                        <LogOut className="w-4 h-4" /> Keluar Aplikasi
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 🔥 MAIN ENGINE SCROLL: Mengunci viewport utama untuk scroll lancar */}
        <main className="flex-1 overflow-y-auto p-0 md:p-4 bg-slate-50/50 flex flex-col justify-between">
          
          {/* 🔥 SOLUSI SCROLL CHOKING: Mengganti overflow-hidden menjadi overflow-visible */}
          <div className="w-full rounded-none md:rounded-[2rem] md:border border-slate-200 bg-slate-50 md:bg-transparent overflow-visible">
            {children}
          </div>

          {/* 🔥 FOOTER UTAMA PERUSAHAAN (Sits safely underneath the contents) */}
          <footer className="py-6 mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shrink-0 border-t border-slate-200/20 md:border-t-0">
            © {currentYear} PT GREE ELECTRIC APPLIANCES INDONESIA
          </footer>

        </main>
      </div>
    </div>
  );
}