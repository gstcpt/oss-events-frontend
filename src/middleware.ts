import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isAuthenticated = request.cookies.has('auth_token');
    const { pathname } = request.nextUrl;

    const authRoutes = ['/login', '/register', '/forget-password', '/new-password', '/verify-email'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isDashboardRoute = pathname.startsWith('/dashboard');

    if (isAuthenticated) { if (isAuthRoute) { return NextResponse.redirect(new URL('/dashboard', request.url)); } } else { if (isDashboardRoute) { return NextResponse.redirect(new URL('/login', request.url)); } }

    return NextResponse.next();
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };