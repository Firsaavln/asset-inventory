import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Box } from "lucide-react";
import EditAssignmentForm from "./EditAssignmentForm"; // 👈 Kita buat komponen ini

export default async function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { asset: true }
  });

  if (!assignment) notFound();

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

        {/* 👈 Panggil Client Component untuk Form */}
        <EditAssignmentForm assignment={assignment} />
      </div>
    </div>
  );
}