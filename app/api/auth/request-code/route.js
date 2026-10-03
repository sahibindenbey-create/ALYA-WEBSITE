import { createChallenge, newCode, normalizeEmail, isEmail, customerAuthReady } from '../../../../lib/customer-auth';
import { sendLoginCode, mailConfigured } from '../../../../lib/mail';
import { rateLimit, clientIp } from '../../../../lib/auth';
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
export async function POST(req) {
  try {
    const b = await req.json(); const email = normalizeEmail(b?.email);
    if (!isEmail(email)) return Response.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400, headers: H });
    const a = rateLimit(`rc-ip:${clientIp(req)}`, 8, 15 * 60_000); const c = rateLimit(`rc-em:${email}`, 3, 10 * 60_000);
    if (!a.ok || !c.ok) return Response.json({ error: 'Çok fazla deneme. Lütfen birkaç dakika sonra tekrar deneyin.' }, { status: 429, headers: { ...H, 'Retry-After': String(Math.max(a.retryAfter, c.retryAfter)) } });
    if (!customerAuthReady()) return Response.json({ error: 'Giriş şu an kullanılamıyor.' }, { status: 503, headers: H });
    const code = newCode(); const challenge = await createChallenge(email, code);
    if (mailConfigured()) { await sendLoginCode(email, code); return Response.json({ ok: true, challenge }, { headers: H }); }
    if (process.env.NODE_ENV !== 'production') return Response.json({ ok: true, challenge, devCode: code }, { headers: H }); // yalnızca geliştirme
    return Response.json({ error: 'E-posta servisi yapılandırılmamış.' }, { status: 503, headers: H });
  } catch (e) { console.error('auth.request-code', e?.message); return Response.json({ error: 'Kod gönderilemedi. Lütfen tekrar deneyin.' }, { status: 500, headers: H }); }
}
