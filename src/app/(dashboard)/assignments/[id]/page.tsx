import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import { 
  ArrowLeft, Laptop, User, Building2, Calendar, 
  ShieldCheck, CreditCard, Store, Info, 
  MapPin, QrCode, FileText, LayoutGrid, 
  CheckCircle2, Box, Briefcase, ShieldAlert 
} from "lucide-react";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 🔥 1. AMBIL SESSION LOGIN UNTUK FIREWALL PROTEKSI
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;
  
  if (!payload) redirect("/login");

  const userRole = (payload.role as string).toLowerCase();
  const userBranch = payload.branch as string;

  const resolvedParams = await params;
  const data = await prisma.assignment.findUnique({
    where: { id: Number(resolvedParams.id) },
    include: { asset: { include: { category: true } } }
  });

  if (!data) return notFound();

  // 🔥 2. READ FIREWALL IDOR: Blokir Akses Jika Cabang Berbeda (Gunakan lowercase check)
  if (userRole !== "superadmin" && data.asset.branch !== userBranch) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-8">
          Anda mencoba mengakses dokumen rahasia milik <strong className="text-slate-800">{data.asset.branch}</strong>. Sistem keamanan mencatat aktivitas ini.
        </p>
        <Link href="/assignments" className="px-6 py-3 sm:py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-sm sm:text-base">
          Kembali ke Dashboard Saya
        </Link>
      </div>
    );
  }

  // Generate QR Code URL berdasarkan Asset Code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data.asset.asset_code}`;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      
      {/* --- HEADER NAVIGATION (RESPONSIVE CARD) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-5 sm:p-6 md:p-8 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Dekorasi Background Header */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50/40 to-transparent rounded-bl-full pointer-events-none"></div>
        
        <div className="space-y-3 relative z-10">
          <Link href="/assignments" className="flex items-center text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors w-fit group uppercase tracking-widest bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-slate-100 hover:border-indigo-100">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-1 transition-transform" /> 
            Back to Handover List
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Handover Details</h1>
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 w-fit">
              ID: #ASG-{data.id.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
        
        {/* Status Tag */}
        <div className="flex items-center gap-3 bg-emerald-50 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border border-emerald-100 relative z-10 shrink-0 w-full md:w-auto">
          <div className="p-2 bg-emerald-500 text-white rounded-full shadow-sm"><CheckCircle2 className="w-4 h-4" /></div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-emerald-600/60 uppercase leading-none mb-0.5">Assignment Status</p>
            <p className="text-sm sm:text-base font-bold text-emerald-700">Currently Assigned</p>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT SIDE: VISUAL IDENTITY (4 columns) */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8 flex flex-col">
          
          {/* ASSET PHOTO CARD */}
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-sm group flex-1 flex flex-col">
            <div className="aspect-video sm:aspect-square bg-slate-50 relative flex items-center justify-center border-b border-slate-100 overflow-hidden">
              {data.asset.asset_image ? (
                <img 
                  src={data.asset.asset_image} 
                  alt={data.asset.asset_name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <Laptop className="w-16 h-16 sm:w-20 sm:h-20 mb-2 opacity-20" />
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">No Physical Image</p>
                </div>
              )}
              {/* Overlay Label */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                <span className="px-3 py-1.5 bg-white/95 backdrop-blur text-slate-900 rounded-xl text-[9px] sm:text-[10px] font-black uppercase shadow-sm border border-slate-100">
                  Physical Unit
                </span>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 text-center flex-1 flex flex-col justify-center">
               <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{data.asset.asset_name}</h2>
               <p className="text-xs font-mono font-bold text-slate-400 mt-2.5 uppercase tracking-wider">{data.asset.asset_code}</p>
            </div>
          </div>

          {/* QR CODE CARD */}
          <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 text-white flex items-center justify-between shadow-xl shadow-slate-200 overflow-hidden relative shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
            <div className="space-y-3 relative z-10 flex-1 pr-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Asset QR Code</h3>
                <p className="text-slate-400 text-[10px] sm:text-xs leading-relaxed">Scan to verify asset authenticity.</p>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-white/5 w-fit px-2.5 py-1.5 rounded-lg">
                <QrCode className="w-3.5 h-3.5" /> Valid System QR
              </div>
            </div>
            <div className="bg-white p-2.5 sm:p-3 rounded-[1.25rem] shadow-inner relative z-10 shrink-0 transform group-hover:scale-105 transition-transform">
               <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: INFORMATION DETAILS (8 columns) */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* SECTION 1: ASSIGNMENT / HANDOVER INFO */}
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-indigo-50/50 rounded-bl-full -z-0 pointer-events-none" />
            
            <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10 relative z-10 border-b border-slate-100 pb-5 sm:pb-6">
               <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 shrink-0"><User className="w-5 h-5 sm:w-6 sm:h-6" /></div>
               <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest">Handover Information</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Data pemegang aset saat ini.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-6 sm:gap-x-10 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <User className="w-3.5 h-3.5 text-indigo-400" /> Borrower Name
                </div>
                <p className="text-lg sm:text-xl font-black text-slate-800 break-words">{data.borrower_name}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Department
                </div>
                <div className="px-3 sm:px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs sm:text-sm font-black w-fit uppercase tracking-wider border border-indigo-100/50">
                   {data.department}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Assign Date
                </div>
                <p className="text-sm sm:text-base font-bold text-slate-700">
                  {new Date(data.assign_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Info className="w-3.5 h-3.5 text-indigo-400" /> Notes / Purpose
                </div>
                <p className="text-xs sm:text-sm text-slate-600 italic font-medium leading-relaxed bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100">
                  "{data.notes || "No specific notes provided for this handover."}"
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: ASSET SPEC & FINANCIAL */}
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-emerald-50/50 rounded-bl-full -z-0 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 relative z-10 border-b border-slate-100 pb-5 sm:pb-6">
               <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100 shrink-0"><CreditCard className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest">Tech & Financial</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Detail spesifikasi dan nilai aset.</p>
                  </div>
               </div>
               {/* MANAGING DIVISION TAG */}
               <div className="flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 text-white rounded-xl shadow-lg w-fit self-start sm:self-auto">
                  <LayoutGrid className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">Manage By</p>
                    <p className="text-[10px] sm:text-xs font-bold leading-none">{data.asset.managing_division}</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10 relative z-10">
               <div className="space-y-1.5 md:col-span-1">
                 <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Value Amount</p>
                 <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">{formatRupiah(Number(data.asset.price))}</p>
               </div>
               <div className="space-y-1.5">
                 <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</p>
                 <p className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                   <Store className="w-4 h-4 text-slate-400 shrink-0" /> {data.asset.vendor_name || "N/A"}
                 </p>
               </div>
               <div className="space-y-1.5">
                 <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Warranty Until</p>
                 <p className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> 
                   {data.asset.warranty_date ? new Date(data.asset.warranty_date).toLocaleDateString('id-ID') : "No Warranty"}
                 </p>
               </div>
            </div>

            {/* ATTACHMENTS & DESCRIPTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">
               <div className="p-4 sm:p-5 md:p-6 bg-slate-50/80 rounded-2xl sm:rounded-3xl border border-slate-100 flex items-center justify-between group transition-colors hover:bg-slate-100">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-white rounded-xl shadow-sm text-rose-500 shrink-0"><FileText className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Invoice Attachment</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">Proof of Purchase</p>
                    </div>
                  </div>
                  {data.asset.invoice_file ? (
                    <a href={data.asset.invoice_file} target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 bg-white hover:bg-indigo-600 hover:text-white text-slate-600 rounded-xl transition-all shadow-sm active:scale-95">
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
                    </a>
                  ) : (
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Not Available</span>
                  )}
               </div>

               <div className="p-4 sm:p-5 md:p-6 bg-slate-50/80 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col justify-center transition-colors hover:bg-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Box className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tech Specification</p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium line-clamp-2 italic">
                    "{data.asset.description || "No specifications recorded."}"
                  </p>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}