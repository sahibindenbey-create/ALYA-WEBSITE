import { customerEmailFromRequest } from '../../../../lib/customer-auth';
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic';
export async function GET(req) {
  return Response.json({ email: (await customerEmailFromRequest(req)) || null }, { headers: { 'Cache-Control': 'no-store' } });
}
