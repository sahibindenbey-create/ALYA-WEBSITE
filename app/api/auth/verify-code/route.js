import { cookies } from 'next/headers';
import { verifyChallenge, createCustomerToken, normalizeEmail, isEmail, CUSTOMER_COOKIE, CUSTOMER_SESSION_SECONDS } from '../../../../lib/customer-auth';
import { rateLimit, clientIp } from '../../../../lib/auth';
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
export async function POST(req) {
  try {
    const b = await req.json(); const email = normalizeEmail(b?.email); const code = String(b?.code || '').trim();
    if (!isEmail(email) || !/^\d{6}$/.test(code)) return Response.json({ error: 'Kod geçersiz.' }, { status: 400, headers: H });
    const a = rateLimit(`vc-ip:${clientIp(req)}`, 20, 15 * 60_000); const c = rateLimit(`vc-em:${email}`, 6, 10 * 60_000);
    if (!a.ok || !c.ok) return Response.json({ error: 'Çok fazla deneme. Lütfen birkaç dakika sonra tekrar deneyin.' }, { status: 429, headers: H });
    if (!(await verifyChallenge(email, code, b?.challenge))) return Response.json({ error: 'Kod hatalı veya süresi dolmuş.' }, { status: 401, headers: H });
    const jar = await cookies();
    jar.set(CUSTOMER_COOKIE, await createCustomerToken(email), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: CUSTOMER_SESSION_SECONDS });
    return Response.json({ ok: true, email }, { headers: H });
  } catch { return Response.json({ error: 'Doğrulama yapılamadı.' }, { status: 400, headers: H }); }
}
