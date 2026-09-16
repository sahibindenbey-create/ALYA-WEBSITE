export const runtime='nodejs';
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
export async function POST(req){try{const b=await req.json();const subtotal=Math.max(0,num(b.subtotal));const freeThreshold=num(process.env.FREE_SHIPPING_THRESHOLD,1000);const standard=num(process.env.STANDARD_SHIPPING_FEE,99);const shipping=subtotal>=freeThreshold?0:standard;return Response.json({ok:true,carrier:process.env.DEFAULT_CARRIER||'Standart Kargo',shipping,freeShipping:shipping===0,threshold:freeThreshold})}catch{return Response.json({error:'Kargo hesaplanamadı'},{status:400})}}
