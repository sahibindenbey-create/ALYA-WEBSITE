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

const clean=v=>String(v??'').trim();
const addressOf=(b)=>b.ShippingAddress||b.shippingAddress||{};

export async function POST(req){
 if(!configured())return Response.json({error:'UPS API bilgileri .env dosyasına girilmemiş. UPS_CLIENT_ID, UPS_CLIENT_SECRET ve UPS_ACCOUNT_NUMBER gerekli.',code:'PROVIDER_NOT_CONFIGURED'},{status:503});
 try{
  const b=await req.json();
  const orderNo=clean(b.orderNo||b.OrderNo);
  if(!orderNo)return Response.json({error:'orderNo gerekli.'},{status:400});
  const a=addressOf(b);
  const receiverName=clean(a.name||b.ReceiverName||b.customer?.name)||'ALYA HOMES Müşterisi';
  const phone=clean(a.phone||b.Phone||b.customer?.phone);
  const city=clean(a.city||a.City||b.City);
  const district=clean(a.district||a.District||b.District);
  const addressLine=clean(a.address||a.AddressLine||b.AddressLine||b.customer?.address);
  const postalCode=clean(a.postalCode||a.PostalCode||b.PostalCode||'00000');
  const country=clean(a.countryCode||a.CountryCode||b.CountryCode||'TR').toUpperCase();
  const pieceCount=Math.max(1,Number(b.pieceCount||1));
  const weight=Math.max(0.01,Number(b.weight||1));
  const serviceCode=clean(b.serviceCode||process.env.UPS_SERVICE_CODE||'11');

  const accessToken=await token();
  const payload={
   ShipmentRequest:{
    Request:{RequestOption:'nonvalidate',TransactionReference:{CustomerContext:`ALYA HOMES ${orderNo}`}},
    Shipment:{
     Description:`ALYA HOMES ${orderNo}`,
     Shipper:{Name:clean(process.env.UPS_SHIPPER_NAME||'ALYA HOMES'),ShipperNumber:clean(process.env.UPS_ACCOUNT_NUMBER),Address:{AddressLine:[clean(process.env.UPS_SHIPPER_ADDRESS||'')],City:clean(process.env.UPS_SHIPPER_CITY||'Istanbul'),PostalCode:clean(process.env.UPS_SHIPPER_POSTAL_CODE||'34000'),CountryCode:clean(process.env.UPS_SHIPPER_COUNTRY||'TR').toUpperCase()}},
     ShipTo:{Name:receiverName,Phone:{Number:phone},Address:{AddressLine:[addressLine],City:city,PostalCode:postalCode,CountryCode:country}},
     PaymentInformation:{ShipmentCharge:{Type:'01',BillShipper:{AccountNumber:clean(process.env.UPS_ACCOUNT_NUMBER)}}},
     Service:{Code:serviceCode,Description:clean(b.serviceDescription||'UPS')},
     Package:Array.from({length:pieceCount},(_,i)=>({PackagingType:{Code:'02',Description:'Customer Supplied Package'},Description:`ALYA HOMES ${orderNo} - ${i+1}`,PackageWeight:{UnitOfMeasurement:{Code:'KGS',Description:'Kilograms'},Weight:String(weight/pieceCount)},ReferenceNumber:{Code:'00',Value:orderNo}})),
     ShipmentServiceOptions:{LabelDelivery:{LabelLinksIndicator:'Y'}}
    },
    LabelSpecification:{LabelImageFormat:{Code:'GIF',Description:'GIF'},HTTPUserAgent:'Mozilla/5.0',LabelStockSize:{Height:'6',Width:'4'}}
   }
  };

  const r=await fetch(`${base()}/api/shipments/v2409/shipments?additionaladdressvalidation=Y`,{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,transId:crypto.randomUUID().replaceAll('-','').slice(0,32),transactionSrc:'ALYA-HOMES','Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)return Response.json({error:data.response?.errors?.[0]?.message||data.response?.errors?.[0]?.code||'UPS gönderi oluşturulamadı.',ups:data},{status:r.status});

  const result=data.ShipmentResponse?.ShipmentResults||{};
  const packageResult=Array.isArray(result.PackageResults)?result.PackageResults[0]:result.PackageResults;
  const trackingNumber=result.ShipmentIdentificationNumber||packageResult?.TrackingNumber||'';
  const label=packageResult?.ShippingLabel?.GraphicImage||packageResult?.ShippingLabel?.HTMLImage||'';
  return Response.json({ok:true,provider:'UPS',orderNo,trackingNumber,label,labelFormat:packageResult?.ShippingLabel?.ImageFormat?.Code||'GIF',shipmentResults:result});
 }catch(e){return Response.json({error:e?.message||'UPS gönderisi oluşturulamadı.'},{status:502});}
}
