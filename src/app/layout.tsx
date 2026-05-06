import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Monitor, Tags, Box, Send } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asset Management Portal",
  description: "IT & GA Asset Management System",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex h-screen overflow-hidden`}>
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col print:hidden">
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <Box className="w-6 h-6 text-indigo-600 mr-2" />
            <span className="text-lg font-bold text-slate-800">Asset<span className="text-indigo-600">Portal</span></span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link href="/assets" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors">
              <Monitor className="w-5 h-5" />
              Data Aset
            </Link>
            <Link href="/categories" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors">
              <Tags className="w-5 h-5" />
              Kategori
            </Link>
            <Link href="/assignments" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors">
  <Send className="w-5 h-5" />
  Serah Terima
</Link>
          </nav>
          <div className="p-4 border-t border-slate-200 text-xs text-slate-400 text-center">
            &copy; IT DEPT GEAI          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}