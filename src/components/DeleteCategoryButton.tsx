"use client";

import { Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { deleteCategoryAction } from "@/app/(dashboard)/categories/actions";

interface Props {
  id: number;
  categoryName: string;
}

export default function DeleteCategoryButton({ id, categoryName }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Sedang menghapus...");

    try {
      const res = await deleteCategoryAction(id);
      
      if (res.success) {
        toast.success("Kategori Dihapus!", { 
          id: toastId,
          description: `"${categoryName}" berhasil dihapus dari sistem.`
        });
      } else {
        toast.error("Gagal Menghapus", { 
          id: toastId, 
          description: res.message 
        });
      }
    } catch (error) {
      toast.error("Terjadi Error", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const showConfirmation = () => {
    // Memunculkan Toast Konfirmasi di Atas (tanpa blur layar)
    toast.error(`Hapus "${categoryName}"?`, {
      description: "Tindakan ini permanen dan tidak bisa dibatalkan.",
      duration: 8000, // Tahan 8 detik biar nggak cepet hilang
      action: {
        label: "Ya, Hapus",
        onClick: () => executeDelete(),
      },
      cancel: {
        label: "Batal",
        onClick: () => {}, // Nggak ngapa-ngapain, otomatis nutup
      },
    });
  };

  return (
    <button 
      type="button"
      onClick={showConfirmation}
      disabled={isDeleting}
      className="p-2.5 text-rose-500 bg-rose-50 hover:text-white hover:bg-rose-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-rose-200 active:scale-95 disabled:opacity-50"
      title="Hapus Kategori"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash className="w-4 h-4" />
      )}
    </button>
  );
}