const PROVIDERS={
  aras:{key:'aras',name:'Aras Kargo',env:['ARAS_USERNAME','ARAS_PASSWORD','ARAS_CUSTOMER_CODE']},
  yurtici:{key:'yurtici',name:'Yurtiçi Kargo',env:['YURTICI_USERNAME','YURTICI_PASSWORD','YURTICI_CUSTOMER_CODE']},
  surat:{key:'surat',name:'Sürat Kargo',env:['SURAT_USERNAME','SURAT_PASSWORD','SURAT_CUSTOMER_CODE']},
  ptt:{key:'ptt',name:'PTT Kargo',env:['PTT_USERNAME','PTT_PASSWORD','PTT_CUSTOMER_CODE']},
  dhl:{key:'dhl',name:'DHL eCommerce',env:['DHL_USERNAME','DHL_PASSWORD','DHL_CUSTOMER_CODE']},
  ups:{key:'ups',name:'UPS',env:['UPS_USERNAME','UPS_PASSWORD','UPS_ACCOUNT_NUMBER']}
};

const xmlEscape=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const tag=(name,value)=>`<${name}>${xmlEscape(value)}</${name}>`;
const responseValue=(xml,name)=>{const m=String(xml||'').match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`,'i'));return m?m[1].trim():''};
const arasConfigured=()=>Boolean(process.env.ARAS_USERNAME&&process.env.ARAS_PASSWORD&&process.env.ARAS_CUSTOMER_CODE);

export function getShippingProviders(){
  return Object.values(PROVIDERS).map(p=>({...p,configured:p.env.every(key=>Boolean(process.env[key]))}));
}
export function getShippingProvider(key){return PROVIDERS[String(key||'').toLowerCase()]||null;}

export function getShipmentPayload(order){
  const address=order?.ShippingAddress||order?.BillingAddress||{};
  return {
    orderNo:order?.OrderNo||order?.orderNo||'',
    recipient:{name:[address.firstName,address.lastName].filter(Boolean).join(' ')||[order?.FirstName,order?.LastName].filter(Boolean).join(' '),phone:address.phone||order?.Phone||'',email:order?.Email||''},
    address:{line:address.addressLine||address.address||order?.AddressLine||'',district:address.district||order?.District||'',city:address.city||order?.City||'',postalCode:address.postalCode||order?.PostalCode||''},
    packageCount:1,
    reference:order?.OrderNo||order?.orderNo||''
  };
}

async function arasSetOrder(order){
  if(!arasConfigured())throw new Error('Aras Kargo entegrasyon bilgileri tanımlanmamış');
  const payload=getShipmentPayload(order);const address=payload.address;const recipient=payload.recipient;
  const url=process.env.ARAS_SET_ORDER_URL||'https://customerws.araskargo.com.tr/arascargoservice.asmx';
  const integrationCode=payload.orderNo;
  const body=`<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><SetOrder xmlns="http://tempuri.org/"><orderInfo><Order>${tag('UserName',process.env.ARAS_USERNAME)}${tag('Password',process.env.ARAS_PASSWORD)}${tag('TradingWaybillNumber',integrationCode)}${tag('InvoiceNumber',integrationCode)}${tag('ReceiverName',recipient.name)}${tag('ReceiverAddress',address.line)}${tag('ReceiverPhone1',recipient.phone)}${tag('ReceiverPhone2','')}${tag('Country','Türkiye')}${tag('CountryCode','TR')}${tag('CityCode',address.city)}${tag('TownCode',address.district)}${tag('ReceiverDistrictName',address.district)}${tag('ReceiverQuarterName','')}${tag('ReceiverAvenueName','')}${tag('ReceiverStreetName','')}${tag('PayorTypeCode',process.env.ARAS_PAYOR_TYPE_CODE||'1')}${tag('IsWorldWide','0')}${tag('IsCod','0')}${tag('UnitID',process.env.ARAS_UNIT_ID||'')}<PieceDetails><PieceDetail xsi:nil="true" /></PieceDetails>${tag('SenderAccountAddressId',process.env.ARAS_SENDER_ADDRESS_ID||'')}</Order></orderInfo>${tag('userName',process.env.ARAS_USERNAME)}${tag('password',process.env.ARAS_PASSWORD)}</SetOrder></soap:Body></soap:Envelope>`;
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'text/xml; charset=utf-8',SOAPAction:'"http://tempuri.org/SetOrder"'},body});
  const text=await r.text();if(!r.ok)throw new Error(`Aras SetOrder HTTP ${r.status}`);
  const resultCode=responseValue(text,'ResultCode');const resultMessage=responseValue(text,'ResultMessage');const invoiceKey=responseValue(text,'InvoiceKey');
  if(resultCode&&resultCode!=='0'&&resultCode.toLowerCase()!=='success')throw new Error(resultMessage||`Aras gönderi hatası (${resultCode})`);
  return {provider:'aras',status:'created',trackingNumber:invoiceKey||integrationCode,integrationCode,invoiceKey,resultMessage};
}

async function arasTrack(trackingNumber){
  if(!arasConfigured())throw new Error('Aras Kargo entegrasyon bilgileri tanımlanmamış');
  const url=process.env.ARAS_TRACK_URL||'https://customerws.araskargo.com.tr/arascargoservice.asmx';
  const body=`<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetCargoInfo xmlns="http://tempuri.org/">${tag('username',process.env.ARAS_USERNAME)}${tag('password',process.env.ARAS_PASSWORD)}${tag('customerCode',process.env.ARAS_CUSTOMER_CODE)}${tag('integrationCode',trackingNumber)}</GetCargoInfo></soap:Body></soap:Envelope>`;
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'text/xml; charset=utf-8',SOAPAction:'"http://tempuri.org/GetCargoInfo"'},body});
  const text=await r.text();if(!r.ok)throw new Error(`Aras takip HTTP ${r.status}`);return {provider:'aras',trackingNumber,raw:text};
}

export async function createShipment(providerKey,order){
  const provider=getShippingProvider(providerKey);if(!provider)throw new Error('Desteklenmeyen kargo firması');
  if(providerKey==='aras')return arasSetOrder(order);
  if(!provider.env.every(key=>Boolean(process.env[key])))throw new Error(`${provider.name} entegrasyon bilgileri henüz tanımlanmamış`);
  throw new Error(`${provider.name} bağlantısı hazırlandı ancak servis kimlik bilgileri ve firma API sözleşmesi bekleniyor`);
}
export async function trackShipment(providerKey,trackingNumber){
  const provider=getShippingProvider(providerKey);if(!provider)throw new Error('Desteklenmeyen kargo firması');if(!trackingNumber)throw new Error('Takip numarası gerekli');
  if(providerKey==='aras')return arasTrack(trackingNumber);
  throw new Error(`${provider.name} takip servisi için API erişimi tanımlanmamış`);
}
