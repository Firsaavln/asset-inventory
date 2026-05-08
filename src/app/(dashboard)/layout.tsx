"use client";
import Link from "next/link";
import { 
  LayoutDashboard, Monitor, Tags, Box, Send, 
  LogOut, RefreshCw, ChevronRight 
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Box className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-lg font-bold text-slate-800">Asset<span className="text-indigo-600">Portal</span></span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <Link href="/" className="flex items-center justify-between group px-3 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" /> Dashboard
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
          </Link>

          <Link href="/assets" className="flex items-center justify-between group px-3 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" /> Data Aset
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
          </Link>

          <Link href="/categories" className="flex items-center justify-between group px-3 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            <div className="flex items-center gap-3">
              <Tags className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" /> Kategori
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
          </Link>

          <Link href="/assignments" className="flex items-center justify-between group px-3 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            <div className="flex items-center gap-3">
              <Send className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" /> Serah Terima
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button onClick={() => router.refresh()} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all">
            <RefreshCw className="w-4 h-4" /> Hapus Cache
          </button>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}