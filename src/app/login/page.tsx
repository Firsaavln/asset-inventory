"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ShieldAlert, Cpu, Server, CheckCircle2 } from "lucide-react";
import { loginAction } from "./actions"; // 👈 Import fungsi manual yang kita buat

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError("");

    // 👈 Bungkus data ke FormData untuk dikirim ke Server Action
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    // 👈 Panggil server action kita
    const res = await loginAction(formData);

    // Jika ada error (misal password salah)
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
    // Note: Jika sukses, loginAction di server akan OTOMATIS melakukan redirect("/")
    // Jadi kita tidak perlu router.push("/") di sini lagi.
  };

  return (
    // flex-col untuk HP (ditumpuk), lg:flex-row untuk Desktop (dibelah kiri-kanan)
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans">
      
      {/* ================= BAGIAN KIRI: FORM LOGIN ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 min-h-screen lg:min-h-0 order-1">
        <div className="w-full max-w-md">
          
          {/* Logo & Judul Form */}
          <div className="mb-10 lg:mb-12">
            {/* 🔥 BARU: LOGO PNG DI ATAS FORM (Diperbesar, Center-Ready, & Auto-Responsive) */}
            <div className="mb-6 select-none flex items-center justify-start">
              <img 
                src="/logo.png" // 👈 Pastikan file logo.png ada di folder public/
                alt="Asset Portal Logo" 
                className="h-14 sm:h-16 w-auto object-contain max-w-[240px] sm:max-w-[280px] transition-all duration-300" 
              />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back.</h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base">Masuk ke sistem manajemen aset terpusat.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm pl-12 pr-4 py-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all placeholder:text-slate-400 font-medium outline-none" 
                  placeholder="Masukkan username Anda" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm pl-12 pr-4 py-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all placeholder:text-slate-400 font-medium outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading} 
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm py-4 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all flex justify-center items-center gap-2 mt-4 shadow-md disabled:opacity-70"
            >
              {loading ? "Memverifikasi..." : "Otorisasi Akses"}
            </button>
          </form>
          
        </div>
      </div>

      {/* ================= BAGIAN KANAN: BRANDING ENTERPRISE ================= */}
      <div className="w-full lg:w-1/2 bg-slate-900 relative overflow-hidden flex flex-col justify-center p-12 lg:p-24 min-h-[50vh] lg:min-h-screen order-2 lg:order-2 border-t lg:border-t-0 border-white/10">
        
        {/* Dekorasi Background Bulatan Cahaya */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600/40 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/30 rounded-full blur-[100px]"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Cpu className="w-8 h-8 text-indigo-300" />
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">Asset <span className="text-indigo-400">Portal</span></span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.15] tracking-tight mb-8">
            Infrastruktur Kuat.<br />
            <span className="text-indigo-400">Operasional Lancar.</span>
          </h2>
          
          <div className="space-y-4 mb-16">
            <div className="flex items-center gap-3 text-slate-300 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Pencatatan inventaris otomatis
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Pelacakan serah terima perangkat
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Multi-tenancy untuk antar cabang
            </div>
          </div>

          <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">
            &copy; 2026 PT Gree Electric Appliances Indonesia
          </div>
        </div>
      </div>

    </div>
  );
}