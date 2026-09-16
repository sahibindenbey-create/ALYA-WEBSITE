import { cookies } from 'next/headers';
import crypto from 'crypto';
export const runtime='nodejs';
const safe=(a,b)=>a && b && crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
export async function POST(req){
 try{
  const b=await req.json();
  const user=String(b.username||''); const pass=String(b.password||'');
  const eu=process.env.ADMIN_USERNAME||''; const ep=process.env.ADMIN_PASSWORD||'';
  if(!safe(user,eu)||!safe(pass,ep)) return Response.json({error:'Kullanıcı adı veya şifre hatalı'},{status:401});
  const token=crypto.createHmac('sha256',process.env.ADMIN_SESSION_SECRET||ep).update(`${user}:${ep}`).digest('hex');
  const jar=await cookies(); jar.set('alya_admin',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*12});
  return Response.json({ok:true});
 }catch{return Response.json({error:'Geçersiz istek'},{status:400})}
}
