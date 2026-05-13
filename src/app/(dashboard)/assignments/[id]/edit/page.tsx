import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateAssignment } from "../../actions";
import Link from "next/link";
import { ArrowLeft, Save, User, Building2, Box, FileText } from "lucide-react";

export default async function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { asset: true }
  });

  if (!assignment) notFound();

  // Bikin Server Action lokal agar bisa passing ID
  const updateAction = updateAssignment.bind(null, id);

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
      <Link href="/assignments" className="flex items-center text-xs font-black text-slate-400 hover:text-indigo-600 gap-2 uppercase tracking-widest group w-fit">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Batal
      </Link>

      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-50 rounded-bl-full -z-10 opacity-60"></div>
        
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Update Assignment</h2>

        {/* INFO UNIT ASET (Read Only) */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4 mb-10">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
              <Box className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Unit</p>
              <p className="text-sm font-bold text-slate-800">{assignment.asset.asset_name}</p>
              <p className="text-[10px] font-bold text-indigo-500 font-mono">{assignment.asset.asset_code}</p>
           </div>
        </div>

        <form action={updateAction} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" /> Nama PIC Baru
              </label>
              <input type="text" name="borrower_name" defaultValue={assignment.borrower_name} required className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-bold text-slate-700 outline-none" />
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" /> Departemen Baru
              </label>
              <input type="text" name="department" defaultValue={assignment.department} required className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-bold text-slate-700 outline-none" />
            </div>

            <div className="md:col-span-2 space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> Update Catatan
              </label>
              <textarea name="notes" rows={3} defaultValue={assignment.notes || ""} className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-bold text-slate-700 outline-none resize-none"></textarea>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 hover:bg-amber-600 text-white p-5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3 group">
            <Save className="w-4 h-4" /> Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}