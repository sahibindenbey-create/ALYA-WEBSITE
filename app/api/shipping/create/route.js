export const runtime='nodejs';

const routes={
 'Aras Kargo':'/api/shipping/aras',
};

const providerKey=v=>String(v||'').trim().toLowerCase();
const aliases={
 aras:'Aras Kargo',
 'aras kargo':'Aras Kargo',
 yurtici:'Yurtiçi Kargo',
 'yurtiçi':'Yurtiçi Kargo',
 'yurtiçi kargo':'Yurtiçi Kargo',
 surat:'Sürat Kargo',
 'sürat':'Sürat Kargo',
 'sürat kargo':'Sürat Kargo',
 ptt:'PTT Kargo',
 'ptt kargo':'PTT Kargo',
 dhl:'DHL eCommerce',
 'dhl ecommerce':'DHL eCommerce',
 ups:'UPS',
 hepsijet:'HepsiJET',
 'kolay gelsin':'Kolay Gelsin'
};

export async function POST(req){
 try{
  const body=await req.json();
  const raw=providerKey(body.carrier||body.provider);
  const carrier=aliases[raw]||body.carrier||body.provider;
  const path=routes[carrier];
  if(!carrier)return Response.json({error:'Kargo firması gerekli.'},{status:400});
  if(!path)return Response.json({
   error:`${carrier} için resmi API kimlik bilgileri henüz tanımlanmadı.`,
   provider:carrier,
   code:'PROVIDER_NOT_CONFIGURED',
   next:'Kargo firmasından API/web servis kullanıcı bilgileri alındığında bu gateway üzerinden aktif edilecek.'
  },{status:501});

  const origin=new URL(req.url).origin;
  const r=await fetch(`${origin}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
  const data=await r.json().catch(()=>({error:'Kargo servisi geçersiz yanıt döndürdü.'}));
  return Response.json({...data,provider:carrier},{status:r.status});
 }catch(e){return Response.json({error:e?.message||'Kargo gönderisi oluşturulamadı.'},{status:502})}
}
