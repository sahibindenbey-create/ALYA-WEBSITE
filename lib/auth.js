// Yönetici oturumu: imzalı, süreli, rastgele nonce'lu token (Web Crypto -> Edge ve Node'da çalışır).
// Token biçimi:  <expUnixSec>.<nonce>.<hmacHex>
// ADMIN_SESSION_SECRET tanımlı değilse HİÇBİR token geçerli sayılmaz (fail-closed).
export const ADMIN_COOKIE = 'alya_admin';
export const SESSION_SECONDS = 60 * 60 * 8; // 8 saat

const enc = new TextEncoder();
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET || '';
  return s.length >= 32 ? s : ''; // en az 32 karakter zorunlu
}

async function hmac(message) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

// Sabit zamanlı karşılaştırma
export function safeEqualStr(a, b) {
  const x = enc.encode(String(a)); const y = enc.encode(String(b));
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

export async function createAdminToken() {
  if (!secret()) throw new Error('ADMIN_SESSION_SECRET en az 32 karakter olmalı');
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const nonce = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const body = `${exp}.${nonce}`;
  return `${body}.${await hmac(body)}`;
}

export async function verifyAdminToken(token) {
  try {
    if (!secret() || !token) return false;
    const [exp, nonce, sig] = String(token).split('.');
    if (!exp || !nonce || !sig) return false;
    if (!Number.isFinite(Number(exp)) || Number(exp) < Math.floor(Date.now() / 1000)) return false;
    return safeEqualStr(sig, await hmac(`${exp}.${nonce}`));
  } catch { return false; }
}

export function cookieFromHeader(header, name = ADMIN_COOKIE) {
  const m = String(header || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : '';
}

// Route handler içinde kullanım:  if (!(await isAdminRequest(req))) return unauthorized();
export async function isAdminRequest(req) {
  return verifyAdminToken(cookieFromHeader(req.headers.get('cookie')));
}
export const unauthorized = () => Response.json({ error: 'Yetkisiz' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });

// Basit bellek içi oran sınırlayıcı (tek sunuculu `next start` için yeterli; çok sunucuda Redis/Cloudflare kuralı kullanın)
const buckets = new Map();
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const b = buckets.get(key) || { n: 0, reset: now + windowMs };
  if (now > b.reset) { b.n = 0; b.reset = now + windowMs; }
  b.n += 1; buckets.set(key, b);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
  return { ok: b.n <= limit, retryAfter: Math.ceil((b.reset - now) / 1000) };
}
export const clientIp = (req) => req.headers.get('cf-connecting-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
