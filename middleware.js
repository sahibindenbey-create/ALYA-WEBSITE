import { NextResponse } from 'next/server';

const ADMIN_COOKIE = 'alya_admin';
const encoder = new TextEncoder();
const configuredCatalogMode =
  process.env.SITE_MODE === 'catalog' ||
  process.env.NEXT_PUBLIC_SITE_MODE === 'catalog';

const catalogBlockedPaths = [
  '/cart',
  '/checkout',
  '/wishlist',
  '/account',
  '/order-success',
];

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
  if (path.startsWith('/api/store')) return req.method !== 'GET';
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
  const shouldNoIndex =
    path.startsWith('/admin') ||
    catalogBlockedPaths.some(
      (blockedPath) =>
        path === blockedPath || path.startsWith(`${blockedPath}/`),
    );
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const catalogMode =
    host === 'alyahomes.com' ||
    host === 'www.alyahomes.com' ||
    (!host.startsWith('shop.') && configuredCatalogMode);

  if (
    catalogMode &&
    catalogBlockedPaths.some(
      (blockedPath) =>
        path === blockedPath || path.startsWith(`${blockedPath}/`),
    )
  ) {
    return NextResponse.redirect(new URL('/collections/all', req.url));
  }

  if (path === '/admin/login' || path.startsWith('/api/admin/login')) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  const protectedRequest = path === '/admin' || path.startsWith('/admin/') || requiresAdmin(req, path);
  if (!protectedRequest) {
    const response = NextResponse.next();
    if (shouldNoIndex)
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  if (!(await isAdmin(req))) {
    if (isApi) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  if (isApi && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !isSameOrigin(req)) {
    return NextResponse.json({ error: 'Geçersiz istek kaynağı' }, { status: 403 });
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/orders/:path*',
    '/api/customers/:path*',
    '/api/products/:path*',
    '/api/stock/:path*',
    '/api/store/:path*',
    '/api/shipping/create/:path*',
    '/api/shipping/aras/:path*',
    '/api/shipping/ups/create/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/wishlist/:path*',
    '/account/:path*',
    '/order-success/:path*',
  ],
};
