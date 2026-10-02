import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken, rateLimit, clientIp } from './lib/auth';

const configuredCatalogMode =
  process.env.SITE_MODE === 'catalog' ||
  process.env.NEXT_PUBLIC_SITE_MODE === 'catalog';

// Katalog sitesinde (alyahomes.com) satış akışı yoktur.
const catalogBlockedPaths = ['/cart', '/checkout', '/wishlist', '/account', '/order-success'];

// Müşteri akışı için herkese açık API uçları. Bunların DIŞINDAKİ tüm /api/* uçları yönetici oturumu ister.
// "commerce: true" olanlar katalog sitesinde (alyahomes.com) kapalıdır; yalnızca shop.alyahomes.com'da çalışır.
const PUBLIC_API = [
  { m: 'GET',  re: /^\/api\/products$/ },
  { m: 'GET',  re: /^\/api\/store$/ },                 // route içinde siparişler çıkarılır
  { m: 'GET',  re: /^\/api\/product-images$/ },
  { m: 'POST', re: /^\/api\/orders$/, commerce: true },
  { m: 'GET',  re: /^\/api\/orders$/, commerce: true },   // route içinde orderNo + e-posta eşleşmesi şart
  { m: 'POST', re: /^\/api\/payments$/, commerce: true },
  { m: 'GET',  re: /^\/api\/payments\/verify$/, commerce: true },
  { m: 'POST', re: /^\/api\/payments\/webhook$/ },     // route içinde HMAC imzası doğrulanır
  { m: 'POST', re: /^\/api\/admin\/login$/ },
  { m: 'POST', re: /^\/api\/admin\/logout$/ },
];

const json = (body, status, extra = {}) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', ...extra } });

// Origin başlığı varsa, istek yapılan Host ile aynı olmalı (iç port / proxy farklarına dayanıklı).
function sameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return true; // sunucudan sunucuya çağrılar ve bazı GET'ler
  try {
    const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(',')[0].trim().toLowerCase();
    return new URL(origin).host.toLowerCase() === host;
  } catch { return false; }
}

// Proxy/hosting arkasında iç adres (127.0.0.1:port) yerine dışarıdan görünen adrese yönlendir
function publicBase(req) {
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(',')[0].trim();
  const proto = (req.headers.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : req.nextUrl.protocol.replace(':', ''))).split(',')[0].trim();
  return host ? `${proto}://${host}` : req.url;
}

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const base = publicBase(req);
  const method = req.method.toUpperCase();
  const isApi = path.startsWith('/api/');
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const catalogMode =
    host === 'alyahomes.com' ||
    host === 'www.alyahomes.com' ||
    (!host.startsWith('shop.') && configuredCatalogMode);

  const shouldNoIndex =
    path.startsWith('/admin') ||
    catalogBlockedPaths.some((p) => path === p || path.startsWith(`${p}/`));

  // www -> çıplak alan adı (tekrarlayan içerik olmasın; canonical ile aynı)
  if (host === 'www.alyahomes.com' || host === 'www.shop.alyahomes.com') {
    return NextResponse.redirect(new URL(`${path}${req.nextUrl.search}`, base.replace('://www.', '://')), 308);
  }

  // Merchant fiyat feed'i yalnızca mağaza sitesinde (katalogda fiyat gösterilmez)
  if (catalogMode && path === '/google-merchant.xml') return new NextResponse('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });

  // Rehberler yalnızca katalog sitesinde
  if (!catalogMode && (path === '/rehberler' || path.startsWith('/rehberler/'))) {
    return NextResponse.redirect(new URL(`${path}${req.nextUrl.search}`, 'https://alyahomes.com'), 308);
  }
  if (catalogMode && catalogBlockedPaths.some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL('/collections/all', base));
  }

  if (path === '/admin/login') {
    const r = NextResponse.next(); r.headers.set('X-Robots-Tag', 'noindex, nofollow'); return r;
  }

  const needsAuthCheck = isApi || path === '/admin' || path.startsWith('/admin/');
  const isAdmin = needsAuthCheck ? await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value) : false;

  // ---- Yönetim sayfaları ----
  if (path === '/admin' || path.startsWith('/admin/')) {
    if (!isAdmin) return NextResponse.redirect(new URL('/admin/login', base));
    const r = NextResponse.next(); r.headers.set('X-Robots-Tag', 'noindex, nofollow'); r.headers.set('Cache-Control', 'no-store'); return r;
  }

  // ---- API (varsayılan: yönetici gerekir) ----
  if (isApi) {
    const ip = clientIp(req);
    const rule = PUBLIC_API.find((x) => x.m === method && x.re.test(path));

    if (rule) {
      if (rule.commerce && catalogMode && !isAdmin) return json({ error: 'Bu adres yalnızca online mağazada geçerlidir.' }, 404);
      if (method === 'POST' && !/webhook/.test(path) && !sameOrigin(req)) return json({ error: 'Geçersiz istek kaynağı' }, 403);
      if (method === 'POST' && path === '/api/orders')   { const r = rateLimit(`ord:${ip}`, 10, 10 * 60_000); if (!r.ok) return json({ error: 'Çok fazla istek' }, 429, { 'Retry-After': String(r.retryAfter) }); }
      if (method === 'POST' && path === '/api/payments') { const r = rateLimit(`pay:${ip}`, 30, 10 * 60_000); if (!r.ok) return json({ error: 'Çok fazla istek' }, 429, { 'Retry-After': String(r.retryAfter) }); }
      if (method === 'GET'  && path === '/api/orders' && !isAdmin) { const r = rateLimit(`lkp:${ip}`, 40, 10 * 60_000); if (!r.ok) return json({ error: 'Çok fazla istek' }, 429, { 'Retry-After': String(r.retryAfter) }); }
      if (method === 'GET'  && path === '/api/payments/verify') { const r = rateLimit(`ver:${ip}`, 60, 10 * 60_000); if (!r.ok) return json({ error: 'Çok fazla istek' }, 429); }
      const r = NextResponse.next(); r.headers.set('X-Robots-Tag', 'noindex, nofollow'); return r;
    }

    if (!isAdmin) return json({ error: 'Yetkisiz erişim' }, 401);
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !sameOrigin(req)) return json({ error: 'Geçersiz istek kaynağı' }, 403);
    return NextResponse.next();
  }

  const response = NextResponse.next();
  if (shouldNoIndex) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  // Tüm sayfalar (www yönlendirmesi, noindex ve yönetici/API koruması için); statik varlıklar hariç
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:webp|png|jpg|jpeg|svg|ico|css|js|woff2?|mp4|webm)$).*)'],
};
