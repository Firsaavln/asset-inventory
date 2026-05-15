import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import { 
  ArrowLeft, Laptop, User, Building2, Calendar, 
  ShieldCheck, CreditCard, Store, Info, 
  MapPin, QrCode, FileText, LayoutGrid, 
  CheckCircle2, Box, Briefcase, ShieldAlert // 👈 Tambah ShieldAlert
} from "lucide-react";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 🔥 1. AMBIL SESSION LOGIN UNTUK FIREWALL
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = token ? await decrypt(token) : null;
  const userRole = payload?.role as string;
  const userBranch = payload?.branch as string;

  const resolvedParams = await params;
  const data = await prisma.assignment.findUnique({
    where: { id: Number(resolvedParams.id) },
    include: { asset: { include: { category: true } } }
  });

  if (!data) return notFound();

  // 🔥 2. READ FIREWALL: Blokir Akses Jika Cabang Berbeda
  if (userRole !== "superadmin" && data.asset.branch !== userBranch) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Anda mencoba mengakses dokumen rahasia milik <strong className="text-slate-800">{data.asset.branch}</strong>. Sistem keamanan mencatat aktivitas ini.
        </p>
        <Link href="/assignments" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
          Kembali ke Dashboard Saya
        </Link>
      </div>
    );
  }

  // Generate QR Code URL berdasarkan Asset Code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.asset.asset_code}`;

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER NAVIGATION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link href="/assignments" className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Handover List
          </Link>
          <div className="flex items-center gap-4 mt-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Handover Details</h1>
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              ID: #ASG-{data.id.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
        
        {/* Status Tag */}
        <div className="flex items-center gap-3 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-[10px] font-black text-emerald-600/50 uppercase leading-none">Assignment Status</p>
            <p className="text-sm font-bold text-emerald-700">Currently Assigned</p>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDE: VISUAL IDENTITY (4 columns) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* ASSET PHOTO CARD */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-sm group">
            <div className="aspect-square bg-slate-100 relative">
              {data.asset.asset_image ? (
                <img 
                  src={data.asset.asset_image} 
                  alt={data.asset.asset_name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <Laptop className="w-20 h-20 mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No Physical Image</p>
                </div>
              )}
              {/* Overlay Label */}
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1.5 bg-white/90 backdrop-blur text-slate-900 rounded-xl text-[10px] font-black uppercase shadow-sm">
                  Physical Unit
                </span>
              </div>
            </div>
            
            <div className="p-8 text-center border-t border-slate-50">
               <h2 className="text-2xl font-black text-slate-900 leading-tight">{data.asset.asset_name}</h2>
               <p className="text-xs font-mono font-bold text-slate-400 mt-2 uppercase tracking-tighter">{data.asset.asset_code}</p>
            </div>
          </div>

          {/* QR CODE CARD */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center justify-between shadow-xl shadow-slate-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="space-y-4 relative z-10">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Asset QR Code</h3>
                <p className="text-slate-400 text-xs">Scan to verify asset authenticity.</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <QrCode className="w-4 h-4" /> Valid System QR
              </div>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-inner relative z-10">
               <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: INFORMATION DETAILS (8 columns) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SECTION 1: ASSIGNMENT / HANDOVER INFO */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-bl-full -z-0" />
            
            <div className="flex items-center gap-3 mb-10 relative z-10">
               <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><User className="w-5 h-5" /></div>
               <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Handover Information</h3>
                  <p className="text-xs text-slate-500 font-medium">Data pemegang aset saat ini.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <User className="w-3 h-3" /> Borrower Name
                </div>
                <p className="text-xl font-bold text-slate-800">{data.borrower_name}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Building2 className="w-3 h-3" /> Department
                </div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold w-fit">
                   {data.department}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Calendar className="w-3 h-3" /> Assign Date
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {new Date(data.assign_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Info className="w-3 h-3" /> Notes / Purpose
                </div>
                <p className="text-sm text-slate-500 italic font-medium">"{data.notes || "No specific notes provided for this handover."}"</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: ASSET SPEC & FINANCIAL */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 lg:p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100"><CreditCard className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Technical & Financial</h3>
                    <p className="text-xs text-slate-500 font-medium">Detail spesifikasi dan nilai aset.</p>
                  </div>
               </div>
               {/* MANAGING DIVISION TAG */}
               <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg">
                  <LayoutGrid className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Managing Div</p>
                    <p className="text-[10px] font-bold">{data.asset.managing_division}</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Value Amount</p>
                 <p className="text-lg font-black text-emerald-600">{formatRupiah(Number(data.asset.price))}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</p>
                 <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                   <Store className="w-4 h-4 text-slate-300" /> {data.asset.vendor_name || "N/A"}
                 </p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warranty Until</p>
                 <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-rose-400" /> 
                   {data.asset.warranty_date ? new Date(data.asset.warranty_date).toLocaleDateString('id-ID') : "No Warranty"}
                 </p>
               </div>
            </div>

            {/* ATTACHMENTS & DESCRIPTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-rose-500"><FileText className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Invoice Attachment</p>
                      <p className="text-xs font-bold text-slate-700 mt-1">Proof of Purchase</p>
                    </div>
                  </div>
                  {data.asset.invoice_file ? (
                    <a href={data.asset.invoice_file} target="_blank" className="p-2 bg-white hover:bg-slate-900 hover:text-white rounded-lg transition-all shadow-sm">
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </a>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300">Not Available</span>
                  )}
               </div>

               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Box className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase">Tech Specification</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2 italic">
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