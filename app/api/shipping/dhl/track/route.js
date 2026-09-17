export const runtime='nodejs';

const endpoint=()=>process.env.DHL_TRACKING_API_URL||'https://api-eu.dhl.com/track/shipments';

export async function GET(req){
  const key=process.env.DHL_API_KEY;
  if(!key)return Response.json({error:'DHL API anahtarı .env dosyasına girilmemiş. DHL_API_KEY gerekli.',code:'DHL_NOT_CONFIGURED'},{status:503});

  const {searchParams}=new URL(req.url);
  const trackingNumber=String(searchParams.get('trackingNumber')||'').trim();
  if(!trackingNumber)return Response.json({error:'trackingNumber gerekli.'},{status:400});

  const service=String(searchParams.get('service')||'ecommerce-tr').trim();
  const originCountryCode=String(searchParams.get('originCountryCode')||'TR').trim().toUpperCase();
  const requesterCountryCode=String(searchParams.get('requesterCountryCode')||'TR').trim().toUpperCase();

  const url=new URL(endpoint());
  url.searchParams.set('trackingNumber',trackingNumber);
  url.searchParams.set('service',service);
  url.searchParams.set('originCountryCode',originCountryCode);
  url.searchParams.set('requesterCountryCode',requesterCountryCode);

  try{
    const r=await fetch(url,{headers:{Accept:'application/json','DHL-API-Key':key},cache:'no-store'});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)return Response.json({error:data?.detail||data?.message||`DHL tracking HTTP ${r.status}`,dhl:data},{status:r.status});
    return Response.json({ok:true,provider:'DHL eCommerce',trackingNumber,service,data},{headers:{'Cache-Control':'no-store'}});
  }catch(e){
    return Response.json({error:e?.message||'DHL takip servisine ulaşılamadı.'},{status:502});
  }
}
