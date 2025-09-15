import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Allow access to auth pages and API routes
  if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Allow access to public assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }
  
  // Check if user is authenticated for protected routes
  if (!req.auth && pathname.startsWith('/dashboard')) {
    const signInUrl = new URL('/auth/sign-in', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
