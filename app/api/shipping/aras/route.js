export const runtime='nodejs';

const endpoint=()=>process.env.ARAS_API_URL||'https://customerws.araskargo.com.tr/arascargoservice.asmx';
const configured=()=>Boolean(process.env.ARAS_USERNAME&&process.env.ARAS_PASSWORD&&process.env.ARAS_CUSTOMER_CODE&&process.env.ARAS_INTEGRATION_CODE);

function xmlEscape(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;')}

async function soap(action,body){
 const response=await fetch(endpoint(),{method:'POST',headers:{'Content-Type':'text/xml; charset=utf-8',SOAPAction:`http://tempuri.org/${action}`},body:`<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${body}</soap:Body></soap:Envelope>`,cache:'no-store'});
 const text=await response.text();
 if(!response.ok)throw new Error(`Aras servisi HTTP ${response.status}`);
 return text;
}

export async function GET(){
 return Response.json({provider:'Aras Kargo',configured:configured(),endpoint:endpoint(),capabilities:['gönderi kaydı','barkod','takip'],credentialsRequired:true});
}

export async function POST(req){
 if(!configured())return Response.json({error:'Aras Kargo entegrasyon bilgileri .env dosyasına girilmemiş. ARAS_USERNAME, ARAS_PASSWORD, ARAS_CUSTOMER_CODE ve ARAS_INTEGRATION_CODE gerekli.'},{status:503});
 try{
  const b=await req.json();
  const orderNo=String(b.orderNo||'').trim();
  if(!orderNo)return Response.json({error:'orderNo gerekli'},{status:400});
  // Aras'ın kurumsal SOAP servisi müşteriye özel operasyonlar sunuyor. Gerçek gönderi kaydı için Aras'ın hesabınıza tanımladığı operasyon/şema kullanılmalıdır.
  // Bu endpoint şimdilik güvenli bağlantı ve kimlik bilgisi kontrolünü yapar; hesap özelindeki Create/Save operasyonu tanımlanmadan sahte barkod üretmez.
  const probe=await soap('GetCargoInfo',`<GetCargoInfo xmlns="http://tempuri.org/"><username>${xmlEscape(process.env.ARAS_USERNAME)}</username><password>${xmlEscape(process.env.ARAS_PASSWORD)}</password><customerCode>${xmlEscape(process.env.ARAS_CUSTOMER_CODE)}</customerCode><integrationCode>${xmlEscape(process.env.ARAS_INTEGRATION_CODE)}</integrationCode></GetCargoInfo>`);
  return Response.json({ok:true,provider:'Aras Kargo',orderNo,connected:true,probe:probe.slice(0,1000),message:'Aras hesabına bağlantı başarılı. Gönderi oluşturma operasyonu hesap özelindeki entegrasyon tanımına göre tamamlanacak.'});
 }catch(e){return Response.json({error:e?.message||'Aras Kargo bağlantısı başarısız'},{status:502});}
}
