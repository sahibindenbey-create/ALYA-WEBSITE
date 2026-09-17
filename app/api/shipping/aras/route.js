export const runtime='nodejs';

const endpoint=()=>process.env.ARAS_API_URL||'https://customerws.araskargo.com.tr/arascargoservice.asmx';
const configured=()=>Boolean(process.env.ARAS_USERNAME&&process.env.ARAS_PASSWORD&&process.env.ARAS_INTEGRATION_CODE);
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
const tag=(xml,name)=>{const m=xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`,'i'));return m?m[1]:''};

async function soap(action,body){
 const r=await fetch(endpoint(),{method:'POST',headers:{'Content-Type':'text/xml; charset=utf-8',SOAPAction:`http://tempuri.org/${action}`},body:`<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${body}</soap:Body></soap:Envelope>`,cache:'no-store'});
 const text=await r.text();
 if(!r.ok)throw new Error(`Aras servisi HTTP ${r.status}`);
 return text;
}

function addressOf(order){
 const a=order.ShippingAddress||order.shippingAddress||{};
 return {name:a.name||[order.FirstName,order.LastName].filter(Boolean).join(' ')||order.ReceiverName||'ALYA HOMES Müşterisi',address:a.address||a.AddressLine||order.AddressLine||'',phone:a.phone||order.Phone||'',city:a.city||a.City||order.City||'',town:a.district||a.District||order.District||''};
}
function resultFrom(xml){return {resultCode:tag(xml,'ResultCode'),resultMessage:tag(xml,'ResultMessage'),invoiceKey:tag(xml,'InvoiceKey')}}

async function findExisting(integrationCode){
 const xml=`<GetOrderWithIntegrationCode xmlns="http://tempuri.org/"><userName>${esc(process.env.ARAS_USERNAME)}</userName><password>${esc(process.env.ARAS_PASSWORD)}</password><integrationCode>${esc(integrationCode)}</integrationCode></GetOrderWithIntegrationCode>`;
 const response=await soap('GetOrderWithIntegrationCode',xml);
 const order=response.match(/<Order(?:\\s[^>]*)?>([\\s\\S]*?)<\\/Order>/i)?.[1]||'';
 if(!order)return null;
 return {trackingNumber:tag(order,'TrackingNumber')||tag(order,'InvoiceKey')||tag(order,'TradingWaybillNumber'),invoiceKey:tag(order,'InvoiceKey'),waybillNumber:tag(order,'TradingWaybillNumber')};
}

async function barcodeFor(integrationCode){
 const xml=`<GetArasBarcode xmlns="http://tempuri.org/"><Username>${esc(process.env.ARAS_USERNAME)}</Username><Password>${esc(process.env.ARAS_PASSWORD)}</Password><integrationCode>${esc(integrationCode)}</integrationCode></GetArasBarcode>`;
 const response=await soap('GetArasBarcode',xml);
 return {trackingNumber:tag(response,'TrackingNumber'),barcode:tag(response,'Barcode'),waybillNumber:tag(response,'WaybillNumber'),message:tag(response,'Message')};
}

export async function GET(){return Response.json({provider:'Aras Kargo',configured:configured(),endpoint:endpoint(),capabilities:['gönderi kaydı','barkod','takip'],credentialsRequired:true});}

export async function POST(req){
 if(!configured())return Response.json({error:'Aras Kargo entegrasyon bilgileri .env dosyasına girilmemiş. ARAS_USERNAME, ARAS_PASSWORD ve ARAS_INTEGRATION_CODE gerekli.'},{status:503});
 try{
  const b=await req.json();
  const orderNo=String(b.orderNo||'').trim();
  if(!orderNo)return Response.json({error:'orderNo gerekli'},{status:400});
  const integrationCode=`${process.env.ARAS_INTEGRATION_CODE}-${orderNo}`;

  let existing=null;
  try{existing=await findExisting(integrationCode)}catch{}
  if(existing){
   let barcode={};
   try{barcode=await barcodeFor(integrationCode)}catch{}
   return Response.json({ok:true,existing:true,provider:'Aras Kargo',orderNo,integrationCode,invoiceKey:existing.invoiceKey||'',trackingNumber:barcode.trackingNumber||existing.trackingNumber||'',barcode:barcode.barcode||'',waybillNumber:barcode.waybillNumber||existing.waybillNumber||'',message:barcode.message||'Aras gönderisi daha önce oluşturulmuş.'});
  }

  const a=addressOf(b);
  const pieceCount=Math.max(1,Number(b.pieceCount||1));
  const weight=Number(b.weight||1);
  const orderXml=`<SetOrder xmlns="http://tempuri.org/"><orderInfo><Order><UserName>${esc(process.env.ARAS_USERNAME)}</UserName><Password>${esc(process.env.ARAS_PASSWORD)}</Password><TradingWaybillNumber>${esc(orderNo)}</TradingWaybillNumber><InvoiceNumber>${esc(orderNo)}</InvoiceNumber><ReceiverName>${esc(a.name)}</ReceiverName><ReceiverAddress>${esc(a.address)}</ReceiverAddress><ReceiverPhone1>${esc(a.phone)}</ReceiverPhone1><ReceiverCityName>${esc(a.city)}</ReceiverCityName><ReceiverTownName>${esc(a.town)}</ReceiverTownName><VolumetricWeight>${esc(weight)}</VolumetricWeight><Weight>${esc(weight)}</Weight><PieceCount>${pieceCount}</PieceCount><IntegrationCode>${esc(integrationCode)}</IntegrationCode><Description>${esc(`ALYA HOMES ${orderNo}`)}</Description><IsWorldWide>0</IsWorldWide><IsCod>0</IsCod></Order></orderInfo><userName>${esc(process.env.ARAS_USERNAME)}</userName><password>${esc(process.env.ARAS_PASSWORD)}</password></SetOrder>`;
  const created=await soap('SetOrder',orderXml);
  const createdResult=resultFrom(created);
  if(!createdResult.invoiceKey)return Response.json({error:createdResult.resultMessage||'Aras gönderi oluşturulamadı',aras:createdResult},{status:502});
  const barcode=await barcodeFor(integrationCode);
  return Response.json({ok:true,existing:false,provider:'Aras Kargo',orderNo,integrationCode,invoiceKey:createdResult.invoiceKey,trackingNumber:barcode.trackingNumber||createdResult.invoiceKey,barcode:barcode.barcode,waybillNumber:barcode.waybillNumber,message:barcode.message,aras:createdResult});
 }catch(e){return Response.json({error:e?.message||'Aras gönderisi oluşturulamadı'},{status:502});}
}
