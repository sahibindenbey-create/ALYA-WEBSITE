import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken, rateLimit, clientIp } from './lib/auth';

// Herkese açık (müşteri) API uçları: [METHOD, regex]. Bunların dışındaki TÜM /api/* uçları yönetici oturumu ister.
const PUBLIC_API = [
  ['GET', /^\/api\/products$/],
  ['GET', /^\/api\/store$/],            // route içinde: yönetici değilse siparişler çıkarılır
  ['POST', /^\/api\/orders$/],
  ['GET', /^\/api\/orders$/],           // route içinde: orderNo + e-posta eşleşmesi zorunlu
  ['POST', /^\/api\/payments$/],
  ['GET', /^\/api\/payments\/verify$/],
  ['POST', /^\/api\/payments\/webhook$/], // route içinde HMAC imzası doğrulanır
  ['GET', /^\/api\/product-images$/],
  ['POST', /^\/api\/admin\/login$/],
  ['POST', /^\/api\/admin\/logout$/],
];

const json = (body, status) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();
  const isAdmin = await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);

  // --- Yönetim paneli sayfaları ---
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (pathname === '/admin/login') return NextResponse.next();
    return isAdmin ? NextResponse.next() : NextResponse.redirect(new URL('/admin/login', req.url));
  }

  // --- API ---
  if (pathname.startsWith('/api/')) {
    const ip = clientIp(req);
    // Sipariş / ödeme oluşturma: IP başına oran sınırı
    if (method === 'POST' && pathname === '/api/orders') { const r = rateLimit(`ord:${ip}`, 10, 10 * 60_000); if (!r.ok) return json({ error: 'Çok fazla istek' }, 429); }
    if (method === 'POST' && pathname === '/api/payments') { const r = rateLimit(`pay:${ip}`, 30, 10 * 60_000); if (!r.ok) return json({ error: 'Çok fazla istek' }, 429); }
    if (method === 'GET' && pathname === '/api/orders') { const r = rateLimit(`lkp:${ip}`, 60, 10 * 60_000); if (!r.ok && !isAdmin) return json({ error: 'Çok fazla istek' }, 429); }

    const open = PUBLIC_API.some(([m, re]) => m === method && re.test(pathname));
    if (open || isAdmin) return NextResponse.next();
    return json({ error: 'Yetkisiz' }, 401);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/:path*'] };
