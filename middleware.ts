import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  console.log('cek');
  

  // Halaman yang perlu dilindungi
  const protectedRoutes = ['/dashboard', '/grades'];

  // Cek apakah path saat ini termasuk protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    try {
      // Cek session dari cookies
      const token = req.cookies.get('sb-access-token')?.value;
      
      if (!token) {
        throw new Error('No token found');
      }

      // Verifikasi token dengan Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new Error('Invalid token');
      }

      // Lanjutkan request jika user valid
      return res;
    } catch (error) {
      // Redirect ke halaman login jika tidak terautentikasi
      const loginUrl = new URL('/login', req.url);
      // loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/grades/:path*',
  ],
};
