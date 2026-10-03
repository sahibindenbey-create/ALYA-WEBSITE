/** @type {import('next').NextConfig} */
// İki site (alyahomes.com ve shop.alyahomes.com) aynı koddan çalışır; başlıklar ikisi için de geçerlidir.
const extraForm = (process.env.CSP_FORM_ACTION_EXTRA || '').trim(); // kart ödeme sağlayıcısının yönlendirme adresi
const GA = 'https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net';
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${GA}`,
  "font-src 'self' data:",
  `connect-src 'self' ${GA}`,
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${extraForm}`.trim(),
  "frame-ancestors 'none'",
].join('; ');
// Yeni CSP'nin sitede bir şeyi bozup bozmadığını görmek için: CSP_REPORT_ONLY=true (engellemez, tarayıcı konsoluna yazar)
const cspHeader = process.env.CSP_REPORT_ONLY === 'true' ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';

const securityHeaders = [
  { key: cspHeader, value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];
export default {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/admin/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      // Ürün görselleri/videoları ve logolar: uzun süre önbellek (tekrar ziyaret ve LCP için)
      { source: '/products-real/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
      { source: '/products/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
      ...['/alya-homes-logo.png','/alya-homes-logo-footer.png'].map((source) => ({ source, headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] })),
    ];
  },
};
