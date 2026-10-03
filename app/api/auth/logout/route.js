import { cookies } from 'next/headers';
import { CUSTOMER_COOKIE } from '../../../../lib/customer-auth';
export const runtime = 'nodejs';
export async function POST() {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
