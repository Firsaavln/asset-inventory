"use client";

import { Trash2 } from "lucide-react";
import { disposeAssetAction } from "@/app/(dashboard)/assets/actions";
import { useRouter } from "next/navigation";

export default function DisposeButton({ assetId }: { assetId: number }) {
  const router = useRouter();

  const handleDispose = async () => {
    if (confirm("Yakin ingin menarik aset ini ke Gudang Disposal?")) {
      const result = await disposeAssetAction(assetId);
      if (result.success) {
        router.push("/disposals");
      } else {
        alert(result.message);
      }
    }
  };

  return (
    <button 
      onClick={handleDispose}
      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-100 hover:border-rose-600 rounded-2xl font-bold transition-all active:scale-95 shadow-sm group text-sm"
      title="Tarik aset ke Gudang Disposal"
    >
      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Dispose
    </button>
  );
}