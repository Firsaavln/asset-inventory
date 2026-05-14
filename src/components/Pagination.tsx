"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (totalPages <= 1) return null; // Sembunyikan jika cuma 1 halaman

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleNavigate = (page: number) => {
    router.push(createPageURL(page));
  };

  // Logika untuk membatasi jumlah tombol halaman yang tampil (misal: 1 2 3 ... 10)
  const generatePagination = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
    if (currentPage >= totalPages - 2) return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = generatePagination();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-[2.5rem]">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
        Halaman {currentPage} dari {totalPages}
      </p>
      
      <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center">
        {/* Tombol Previous */}
        <button
          onClick={() => handleNavigate(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">Prev</span>
        </button>

        {/* Angka Halaman */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            if (page === '...') {
              return <div key={index} className="px-2 text-slate-400"><MoreHorizontal className="w-4 h-4" /></div>;
            }
            const isCurrent = page === currentPage;
            return (
              <button
                key={index}
                onClick={() => handleNavigate(page as number)}
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all active:scale-95 ${
                  isCurrent 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Tombol Next */}
        <button
          onClick={() => handleNavigate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 group"
        >
          <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">Next</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}