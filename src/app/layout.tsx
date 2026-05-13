import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider"; // 👈 1. Import Provider-nya
import { Toaster } from "sonner"; // Kalau lu pakai Sonner untuk notifikasi

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asset Portal - PT Gree Electric",
  description: "Sistem Manajemen Aset IT & General Affair",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* 👇 2. Bungkus children dengan AuthProvider */}
        <AuthProvider>
          {children}
          {/* Taruh komponen global seperti Toaster di dalam body */}
          <Toaster richColors position="top-right" /> 
        </AuthProvider>
      </body>
    </html>
  );
}