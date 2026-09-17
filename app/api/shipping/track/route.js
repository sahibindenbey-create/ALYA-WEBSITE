export const runtime='nodejs';

const providerKey=v=>String(v||'').trim().toLowerCase();
const aliases={
 aras:'Aras Kargo','aras kargo':'Aras Kargo',
 dhl:'DHL eCommerce','dhl ecommerce':'DHL eCommerce'
};

export async function GET(req){
  const {searchParams}=new URL(req.url);
  const raw=providerKey(searchParams.get('carrier')||searchParams.get('provider'));
  const carrier=aliases[raw]||searchParams.get('carrier')||searchParams.get('provider');
  const trackingNumber=String(searchParams.get('trackingNumber')||'').trim();
  if(!carrier)return Response.json({error:'Kargo firması gerekli.'},{status:400});
  if(!trackingNumber)return Response.json({error:'trackingNumber gerekli.'},{status:400});

  if(carrier==='DHL eCommerce'){
    const url=new URL('/api/shipping/dhl/track',new URL(req.url).origin);
    url.searchParams.set('trackingNumber',trackingNumber);
    if(searchParams.get('service'))url.searchParams.set('service',searchParams.get('service'));
    if(searchParams.get('originCountryCode'))url.searchParams.set('originCountryCode',searchParams.get('originCountryCode'));
    if(searchParams.get('requesterCountryCode'))url.searchParams.set('requesterCountryCode',searchParams.get('requesterCountryCode'));
    const r=await fetch(url,{cache:'no-store'});
    const data=await r.json().catch(()=>({error:'Kargo servisi geçersiz yanıt döndürdü.'}));
    return Response.json({...data,provider:carrier},{status:r.status});
  }

  return Response.json({
    error:`${carrier} için takip adaptörü henüz aktif değil.`,
    provider:carrier,
    trackingNumber,
    code:'PROVIDER_NOT_CONFIGURED'
  },{status:501});
}
