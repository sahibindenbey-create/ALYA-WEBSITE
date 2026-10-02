import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createAdminToken, SESSION_SECONDS, rateLimit, clientIp } from '../../../../lib/auth';
export const runtime = 'nodejs';
const h = (v) => crypto.createHash('sha256').update(String(v)).digest();
const same = (a, b) => crypto.timingSafeEqual(h(a), h(b));
export async function POST(req) {
  const lim = rateLimit(`login:${clientIp(req)}`, 5, 15 * 60_000);
  if (!lim.ok) return Response.json({ error: 'Çok fazla deneme. Daha sonra tekrar deneyin.' }, { status: 429, headers: { 'Retry-After': String(lim.retryAfter) } });
  try {
    const eu = process.env.ADMIN_USERNAME || ''; const ep = process.env.ADMIN_PASSWORD || ''; const es = process.env.ADMIN_SESSION_SECRET || '';
    if (!eu || ep.length < 12 || es.length < 32) return Response.json({ error: 'Yönetici girişi yapılandırılmamış' }, { status: 503 });
    const b = await req.json();
    const ok = same(b?.username ?? '', eu) & same(b?.password ?? '', ep);
    if (!ok) { await new Promise((r) => setTimeout(r, 400)); return Response.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 }); }
    const jar = await cookies();
    jar.set('alya_admin', await createAdminToken(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: SESSION_SECONDS });
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: 'Geçersiz istek' }, { status: 400 }); }
}
