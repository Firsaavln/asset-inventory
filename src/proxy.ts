import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Ganti nama fungsi menjadi 'proxy' atau tetap default export
export default async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Proteksi: Jika belum login, lempar ke /login
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

// Konfigurasi path mana saja yang kena filter proxy ini
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};