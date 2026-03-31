import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  
  // Protected routes yang membutuhkan login
  const isProtected = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/students') ||
    pathname.startsWith('/subject')
  
  // Public routes
  const isPublicRoute = 
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password'

  // ===============================
  // BELUM LOGIN → KE LOGIN JIKA AKSES PROTECTED
  // ===============================
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ===============================
  // SUDAH LOGIN → JANGAN KE LOGIN/REGISTER
  // ===============================
  if (user && (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password')) {
    // Ambil role user dari database
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = userRole?.role
    
    // Redirect berdasarkan role
    if (role === 'admin' || role === 'guru') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      await supabase.auth.signOut()
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ===============================
  // VALIDASI ROLE UNTUK PROTECTED ROUTES
  // ===============================
  if (user && isProtected) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = userRole?.role
    
    if (role !== 'admin' && role !== 'guru') {
      await supabase.auth.signOut()
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/students/:path*',
    '/subject/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
}