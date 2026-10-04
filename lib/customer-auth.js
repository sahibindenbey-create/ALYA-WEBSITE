// Müşteri girişi: e-postaya gönderilen 6 haneli kod + imzalı oturum çerezi (Web Crypto: Edge ve Node'da çalışır).
// Veritabanı gerekmez: kod "challenge" adlı imzalı bir jetonla eşleştirilir, kodun kendisi sunucuda saklanmaz.
export const CUSTOMER_COOKIE = 'alya_cust';
export const CODE_SECONDS = 10 * 60;
export const CUSTOMER_SESSION_SECONDS = 60 * 60 * 24 * 30;

const enc = new TextEncoder();
const toHex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const b64u = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

function secret() {
  const own = process.env.CUSTOMER_SESSION_SECRET || '';
  if (own.length >= 32) return own;
  const admin = process.env.ADMIN_SESSION_SECRET || '';
  return admin.length >= 32 ? `${admin}::customer` : ''; // yönetici anahtarından türetilir; bulunmazsa giriş kapalı
}
async function hmac(msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}
function same(a, b) {
  const x = enc.encode(String(a)); const y = enc.encode(String(b));
  let d = x.length ^ y.length; const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) d |= (x[i] || 0) ^ (y[i] || 0);
  return d === 0;
}
export const normalizeEmail = (e) => String(e || '').trim().toLowerCase();
export const isEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length <= 320;
export const customerAuthReady = () => Boolean(secret());

export function newCode() {
  const n = new Uint32Array(1); crypto.getRandomValues(n);
  return String(n[0] % 1000000).padStart(6, '0');
}
export async function createChallenge(email, code) {
  const exp = Math.floor(Date.now() / 1000) + CODE_SECONDS;
  const nonce = toHex(crypto.getRandomValues(new Uint8Array(12)));
  return `${exp}.${nonce}.${await hmac(`c|${normalizeEmail(email)}|${code}|${exp}|${nonce}`)}`;
}
export async function verifyChallenge(email, code, challenge) {
  try {
    if (!secret()) return false;
    const [exp, nonce, sig] = String(challenge || '').split('.');
    if (!exp || !nonce || !sig || Number(exp) < Math.floor(Date.now() / 1000)) return false;
    return same(sig, await hmac(`c|${normalizeEmail(email)}|${String(code || '').trim()}|${exp}|${nonce}`));
  } catch { return false; }
}
export async function createCustomerToken(email) {
  const exp = Math.floor(Date.now() / 1000) + CUSTOMER_SESSION_SECONDS;
  const body = `${exp}.${b64u(normalizeEmail(email))}`;
  return `${body}.${await hmac(`s|${body}`)}`;
}
// Geçerliyse e-postayı, değilse '' döner
export async function verifyCustomerToken(token) {
  try {
    if (!secret() || !token) return '';
    const [exp, em, sig] = String(token).split('.');
    if (!exp || !em || !sig || Number(exp) < Math.floor(Date.now() / 1000)) return '';
    if (!same(sig, await hmac(`s|${exp}.${em}`))) return '';
    return unb64u(em);
  } catch { return ''; }
}
export function cookieValue(header, name) {
  const m = String(header || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : '';
}
export async function customerEmailFromRequest(req) {
  return verifyCustomerToken(cookieValue(req.headers.get('cookie'), CUSTOMER_COOKIE));
}
