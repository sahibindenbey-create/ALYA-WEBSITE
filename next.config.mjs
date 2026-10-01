/** @type {import('next').NextConfig} */
const extraForm = (process.env.CSP_FORM_ACTION_EXTRA || '').trim(); // örn: https://odeme.saglayici.com (kart ödemesi yönlendirme formu için)

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com", // Next.js satır içi RSC betikleri için (nonce'a geçilirse 'unsafe-inline' kaldırılabilir)
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${extraForm}`.trim(),
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
  poweredByHeader: false,      // X-Powered-By: Next.js bilgisini gizle
  reactStrictMode: true,
  compress: true,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Kişisel veri / yönetim alanları arama motorlarına ve önbelleğe kapalı
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }, { key: 'Cache-Control', value: 'no-store' }] },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
      // Ürün görselleri uzun süre önbelleğe alınabilir (LCP / Core Web Vitals)
      { source: '/products-real/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
      { source: '/products/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
    ];
  },
};
export default nextConfig;
