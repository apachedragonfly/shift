import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes, and auth routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/auth') ||
      pathname === '/' ||
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Define protected routes
  const protectedRoutes = ['/dashboard']

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Look for Supabase auth cookies
    const authToken = request.cookies.get('sb-access-token')?.value ||
                     request.cookies.get('supabase-auth-token')?.value ||
                     request.cookies.get('sb-refresh-token')?.value

    // If no auth cookies found, redirect to login
    if (!authToken) {
      console.log('No auth token found, redirecting to login')
      const loginUrl = new URL('/auth/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // If we have a token, let the AuthGuard component handle detailed verification
    console.log('Auth token found, allowing access to protected route')
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
} 