import { cookies } from 'next/headers';
export const runtime = 'nodejs';
export async function POST() {
  const jar = await cookies();
  jar.set('alya_admin', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
