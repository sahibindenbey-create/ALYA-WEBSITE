import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_COOKIE = 'alya_admin';

function expectedToken() {
  const username = process.env.ADMIN_USERNAME || '';
  const password = process.env.ADMIN_PASSWORD || '';
  const secret = process.env.ADMIN_SESSION_SECRET || '';
  if (!username || !password || !secret) return null;
  return crypto.createHmac('sha256', secret).update(`${username}:${password}`).digest('hex');
}

function safeEqual(a, b) {
  try {
    const left = Buffer.from(String(a || ''), 'utf8');
    const right = Buffer.from(String(b || ''), 'utf8');
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function isAdmin(req) {
  const expected = expectedToken();
  return Boolean(expected && safeEqual(req.cookies.get(ADMIN_COOKIE)?.value, expected));
}

function requiresAdmin(req, path) {
  if (path.startsWith('/api/customers')) return true;
  if (path.startsWith('/api/stock')) return true;
  if (path.startsWith('/api/orders')) return req.method !== 'POST';
  if (path.startsWith('/api/products')) return req.method !== 'GET';
  if (path.startsWith('/api/shipping/create')) return true;
  if (path.startsWith('/api/shipping/aras')) return true;
  if (path.startsWith('/api/shipping/ups/create')) return true;
  return false;
}

function isSameOrigin(req) {
  const origin = req.headers.get('origin');
  return Boolean(origin && origin === req.nextUrl.origin);
}

export function middleware(req) {
  const path = req.nextUrl.pathname;
  const isApi = path.startsWith('/api/');

  if (path === '/admin/login' || path.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  const protectedRequest = path === '/admin' || path.startsWith('/admin/') || requiresAdmin(req, path);
  if (!protectedRequest) return NextResponse.next();

  if (!isAdmin(req)) {
    if (isApi) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  if (isApi && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !isSameOrigin(req)) {
    return NextResponse.json({ error: 'Geçersiz istek kaynağı' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/orders/:path*',
    '/api/customers/:path*',
    '/api/products/:path*',
    '/api/stock/:path*',
    '/api/shipping/create/:path*',
    '/api/shipping/aras/:path*',
    '/api/shipping/ups/create/:path*',
  ],
};
