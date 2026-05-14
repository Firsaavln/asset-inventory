import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

// Daftar halaman utama aplikasi kita
const protectedRoutes = ["/", "/assets", "/categories", "/assignments", "/disposals", "/users", "/logs"];

// 👇 UBAH DI SINI: Nama function diganti menjadi "proxy" atau jadikan default export
export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const sessionToken = req.cookies.get("session")?.value;

  const isProtectedRoute = protectedRoutes.some(route => path === route || path.startsWith(`${route}/`));

  // 1. BLOKIR USER BELUM LOGIN
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. CEK LOGIN TERBALIK (Udah login tapi ke halaman login)
  if (sessionToken && path === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3. ATURAN HAK AKSES (RBAC)
  if (sessionToken && isProtectedRoute) {
    const payload = await decrypt(sessionToken);
    
    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = payload.role as string;

    // --- ATURAN ADMIN ---
    if (role === "admin") {
      if (path.startsWith("/users") || path.startsWith("/logs")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // --- ATURAN USER BIASA ---
    if (role === "user") {
      const isAllowed = path === "/" || path.startsWith("/assets");
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], 
};