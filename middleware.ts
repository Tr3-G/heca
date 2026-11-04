import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const tokenCookie =
    request.cookies.get('heca_token')?.value ||
    request.cookies.get('token')?.value ||
    request.cookies.get('heca_session')?.value;

  // Protect /admin routes, excluding /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!tokenCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /admin/login, redirect to /admin
  if (pathname === '/admin/login') {
    if (tokenCookie) {
      const adminUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
