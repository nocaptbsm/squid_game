import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protect volunteer routes
  if (pathname.startsWith('/volunteer') && pathname !== '/volunteer/login') {
    const session = await auth()
    if (!session || !['ADMIN', 'VOLUNTEER'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/volunteer/login', request.url))
    }
  }

  // Protect player routes
  if (pathname.startsWith('/player') && pathname !== '/player/login') {
    const playerToken = request.cookies.get('player-token')
    if (!playerToken) {
      return NextResponse.redirect(new URL('/player/login', request.url))
    }
    // We could verify the JWT here, but Next.js middleware edge runtime 
    // doesn't support jsonwebtoken library directly without edge-compatible crypto.
    // For now, we check if token exists. The actual validation can happen in the API/page.
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/volunteer/:path*',
    '/player/:path*',
  ],
}
