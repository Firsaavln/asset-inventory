// "use client";

// import { Trash, Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import { useState } from "react";
// // 🔥 PERBAIKAN 1: Import action milik Asset, bukan Category
// import { deleteAssetAction } from "@/app/(dashboard)/assets/actions";

// interface Props {
//   id: number;
//   assetName: string; // 🔥 PERBAIKAN 2: Sesuaikan nama props dengan yang dipanggil di page.tsx
// }

// export default function DeleteAssetButton({ id, assetName }: Props) {
//   const [isDeleting, setIsDeleting] = useState(false);

//   const executeDelete = async () => {
//     setIsDeleting(true);
//     const toastId = toast.loading("Sedang menghapus...");

//     try {
//       // 🔥 PERBAIKAN 3: Panggil deleteAssetAction
//       const res = await deleteAssetAction(id);
      
//       if (res?.success) {
//         toast.success("Aset Dihapus!", { 
//           id: toastId,
//           description: `"${assetName}" berhasil dihapus dari sistem.`
//         });
//       } else {
//         toast.error("Gagal Menghapus", { 
//           id: toastId, 
//           // Pakai optional chaining untuk jaga-jaga kalau message undefined
//           description: res?.message || "Terjadi kesalahan." 
//         });
//       }
//     } catch (error) {
//       toast.error("Terjadi Error", { id: toastId });
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const showConfirmation = () => {
//     // Memunculkan Toast Konfirmasi di Atas (tanpa blur layar)
//     toast.error(`Hapus "${assetName}"?`, {
//       description: "Tindakan ini permanen dan tidak bisa dibatalkan.",
//       duration: 8000, // Tahan 8 detik biar nggak cepet hilang
//       action: {
//         label: "Ya, Hapus",
//         onClick: () => executeDelete(),
//       },
//       cancel: {
//         label: "Batal",
//         onClick: () => {}, // Nggak ngapa-ngapain, otomatis nutup
//       },
//     });
//   };

//   return (
//     <button 
//       type="button"
//       onClick={showConfirmation}
//       disabled={isDeleting}
//       className="p-2.5 text-rose-500 bg-rose-50 hover:text-white hover:bg-rose-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-rose-200 active:scale-95 disabled:opacity-50"
//       title="Hapus Aset"
//     >
//       {isDeleting ? (
//         <Loader2 className="w-4 h-4 animate-spin" />
//       ) : (
//         <Trash className="w-4 h-4" />
//       )}
//     </button>
//   );
// }