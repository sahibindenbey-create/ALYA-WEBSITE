import { NextResponse } from 'next/server';

const ADMIN_COOKIE = 'alya_admin';
const encoder = new TextEncoder();

async function expectedToken() {
  const username = process.env.ADMIN_USERNAME || '';
  const password = process.env.ADMIN_PASSWORD || '';
  const secret = process.env.ADMIN_SESSION_SECRET || '';
  if (!username || !password || !secret) return null;

  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${username}:${password}`),
  );
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  const left = String(a || '');
  const right = String(b || '');
  if (!left || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function isAdmin(req) {
  const expected = await expectedToken();
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

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isApi = path.startsWith('/api/');

  if (path === '/admin/login' || path.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  const protectedRequest = path === '/admin' || path.startsWith('/admin/') || requiresAdmin(req, path);
  if (!protectedRequest) return NextResponse.next();

  if (!(await isAdmin(req))) {
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
