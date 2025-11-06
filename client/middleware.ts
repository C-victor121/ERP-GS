import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  // Si no hay token, redirigir a /login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    // Conservar la ruta original para poder volver después del login
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay token, permitir el acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/productos/:path*',
    '/proveedores/:path*',
    '/proyectos/:path*',
    '/inventario/:path*',
    '/compras/:path*',
    '/ventas/:path*',
    '/contabilidad/:path*',
    '/usuarios/:path*',
  ],
};