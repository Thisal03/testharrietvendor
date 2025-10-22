import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Only protect dashboard routes - allow everything else
  if (pathname.startsWith('/dashboard') && !req.auth) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*'
  ],
};


