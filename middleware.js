import {NextResponse} from 'next/server';
import crypto from 'crypto';
function expected(){const p=process.env.ADMIN_PASSWORD||'';return crypto.createHmac('sha256',process.env.ADMIN_SESSION_SECRET||p).update(`${process.env.ADMIN_USERNAME||''}:${p}`).digest('hex')}
export function middleware(req){const path=req.nextUrl.pathname;if(path==='/admin/login'||path.startsWith('/api/admin/login'))return NextResponse.next();if(path==='/admin'||path.startsWith('/admin/')){if(req.cookies.get('alya_admin')?.value===expected())return NextResponse.next();return NextResponse.redirect(new URL('/admin/login',req.url));}return NextResponse.next()}
export const config={matcher:['/admin/:path*']};
