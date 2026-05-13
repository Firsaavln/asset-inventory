import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // 👈 Pastikan ini di-import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IT Asset Management",
  description: "Enterprise Asset Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        
        {/* PUSAT KOMANDO TOAST: Set ke top-center biar semua alert muncul di atas */}
        <Toaster position="top-center" richColors closeButton duration={3000} />
        
      </body>
    </html>
  );
}