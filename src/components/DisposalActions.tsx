"use client";

import { Trash2, ArchiveRestore } from "lucide-react";
import { permanentDeleteAction, restoreAssetAction } from "@/app/(dashboard)/disposals/actions";

export default function DisposalActions({ assetId }: { assetId: number }) {
  const handleRestore = async () => {
    if (confirm("Kembalikan aset ini ke daftar Inventaris (Available)?")) {
      const formData = new FormData();
      formData.append("id", assetId.toString());
      await restoreAssetAction(formData);
    }
  };

  const handleDelete = async () => {
    if (confirm("Peringatan: Yakin ingin MENGHAPUS PERMANEN aset ini? Data dan riwayatnya tidak bisa dikembalikan!")) {
      const formData = new FormData();
      formData.append("id", assetId.toString());
      await permanentDeleteAction(formData);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={handleRestore}
        title="Kembalikan Aset" 
        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl text-[10px] font-black transition-all active:scale-95 border border-emerald-100 uppercase tracking-wider"
      >
        <ArchiveRestore className="w-3.5 h-3.5" /> Restore
      </button>

      <button 
        onClick={handleDelete}
        title="Hapus Permanen" 
        className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-[10px] font-black transition-all active:scale-95 border border-rose-100 uppercase tracking-wider"
      >
        <Trash2 className="w-3.5 h-3.5" /> Musnahkan
      </button>
    </div>
  );
}