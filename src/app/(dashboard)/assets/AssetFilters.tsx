"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, FolderTree } from "lucide-react";
import { useTransition, useState, useEffect } from "react";

export default function AssetFilters({ categories }: { categories: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State lokal biar pas ngetik nggak lag
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [cat, setCat] = useState(searchParams.get("category") || "");
  const [loc, setLoc] = useState(searchParams.get("location") || "");

  // Efek debounce: Update URL 500ms setelah user berhenti ngetik/milih
  useEffect(() => {
    const delay = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (cat) params.set("category", cat);
        if (loc) params.set("location", loc);
        
        // Reset page ke 1 setiap kali filter diubah
        params.set("page", "1"); 

        router.push(`/assets?${params.toString()}`);
      });
    }, 500);

    return () => clearTimeout(delay);
  }, [q, cat, loc, router]);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 mb-6 relative">
      {/* Indikator Loading Tipis saat filter berjalan */}
      {isPending && <div className="absolute top-0 left-0 h-1 bg-indigo-500 rounded-t-2xl animate-pulse w-full"></div>}

      {/* FILTER 1: PENCARIAN NAMA / KODE */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input 
          type="text" 
          placeholder="Cari nama aset atau serial..." 
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 transition-all"
        />
      </div>

      {/* FILTER 2: KATEGORI */}
      <div className="md:w-64 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FolderTree className="w-4 h-4 text-slate-400" />
        </div>
        <select 
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 appearance-none cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {/* FILTER 3: LOKASI FISIK RUANGAN */}
      <div className="md:w-64 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MapPin className="w-4 h-4 text-slate-400" />
        </div>
        <input 
          type="text" 
          placeholder="Filter Ruangan (Cth: 101)" 
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 transition-all"
        />
      </div>
    </div>
  );
}