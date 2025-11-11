import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/about', '/pricing', '/contact']
  
  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard']

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if user has authentication token (you can expand this logic)
  const token = request.cookies.get('sb-access-token')
  
  // If trying to access protected route without authentication
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // If authenticated user tries to access login/signup, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}