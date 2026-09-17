export const runtime='nodejs';

const base=()=>process.env.UPS_API_BASE||'https://onlinetools.ups.com';
const configured=()=>Boolean(process.env.UPS_CLIENT_ID&&process.env.UPS_CLIENT_SECRET&&process.env.UPS_ACCOUNT_NUMBER);

async function token(){
 const auth=Buffer.from(`${process.env.UPS_CLIENT_ID}:${process.env.UPS_CLIENT_SECRET}`).toString('base64');
 const r=await fetch(`${base()}/security/v1/oauth/token`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials',cache:'no-store'});
 const d=await r.json().catch(()=>({}));
 if(!r.ok||!d.access_token)throw new Error(d.response?.errors?.[0]?.message||d.error_description||'UPS OAuth erişim anahtarı alınamadı.');
 return d.access_token;
}

export async function GET(req){
 const {searchParams}=new URL(req.url);
 const trackingNumber=String(searchParams.get('trackingNumber')||searchParams.get('tracking')||'').trim();
 if(!trackingNumber)return Response.json({error:'trackingNumber gerekli.'},{status:400});
 if(!configured())return Response.json({error:'UPS API bilgileri .env dosyasına girilmemiş. UPS_CLIENT_ID, UPS_CLIENT_SECRET ve UPS_ACCOUNT_NUMBER gerekli.',code:'PROVIDER_NOT_CONFIGURED'},{status:503});
 try{
  const accessToken=await token();
  const transId=crypto.randomUUID().replaceAll('-','').slice(0,32);
  const r=await fetch(`${base()}/api/track/v1/details/${encodeURIComponent(trackingNumber)}?locale=tr_TR&returnSignature=false&returnMilestones=true`,{headers:{Authorization:`Bearer ${accessToken}`,transId,transactionSrc:'ALYA-HOMES',Accept:'application/json'},cache:'no-store'});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)return Response.json({error:data.response?.errors?.[0]?.message||'UPS takip servisi hata döndürdü.',ups:data},{status:r.status});
  return Response.json({ok:true,provider:'UPS',trackingNumber,data});
 }catch(e){return Response.json({error:e?.message||'UPS takip sorgusu başarısız.'},{status:502});}
}
