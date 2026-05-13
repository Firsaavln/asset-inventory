"use client"; // Wajib ada agar tombol bisa diklik oleh user

// import { Printer } from "lucide-react";

// export default function PrintLabelButton
// () {
//   const handlePrint = () => {
//     window.print(); // Memanggil fungsi Print bawaan browser
//   };

//   return (
//     <button 
//       onClick={handlePrint}
//       className="mt-4 w-full bg-white border border-slate-300 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors flex justify-center items-center gap-2 print:hidden"
//     >
//       <Printer className="w-4 h-4" /> Print Label (Cetak)
//     </button>
//   );


// "use client";
// import { Printer } from "lucide-react";

// export default function PrintLabelButton() {
//   return (
//     <button 
//       onClick={() => window.print()}
//       className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 border border-slate-200"
//     >
//       <Printer className="w-4 h-4" /> Cetak Label
//     </button>
//   );
// }

"use client";

import { Printer } from "lucide-react";

export default function PrintLabelButton() {
  const handlePrint = () => {
    // Fungsi ini hanya bisa jalan di Client (Browser)
    window.print();
  };

  return (
    <button 
      onClick={handlePrint}
      className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 border border-slate-200 shadow-sm"
      title="Cetak Halaman Ini"
    >
      <Printer className="w-5 h-5" /> Cetak Label
    </button>
  );
}