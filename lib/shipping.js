const PROVIDERS={
  aras:{key:'aras',name:'Aras Kargo',env:['ARAS_USERNAME','ARAS_PASSWORD','ARAS_CUSTOMER_CODE']},
  yurtici:{key:'yurtici',name:'Yurtiçi Kargo',env:['YURTICI_USERNAME','YURTICI_PASSWORD','YURTICI_CUSTOMER_CODE']},
  surat:{key:'surat',name:'Sürat Kargo',env:['SURAT_USERNAME','SURAT_PASSWORD','SURAT_CUSTOMER_CODE']},
  ptt:{key:'ptt',name:'PTT Kargo',env:['PTT_USERNAME','PTT_PASSWORD','PTT_CUSTOMER_CODE']},
  dhl:{key:'dhl',name:'DHL eCommerce',env:['DHL_USERNAME','DHL_PASSWORD','DHL_CUSTOMER_CODE']},
  ups:{key:'ups',name:'UPS',env:['UPS_USERNAME','UPS_PASSWORD','UPS_ACCOUNT_NUMBER']}
};

export function getShippingProviders(){
  return Object.values(PROVIDERS).map(p=>({
    ...p,
    configured:p.env.every(key=>Boolean(process.env[key]))
  }));
}

export function getShippingProvider(key){return PROVIDERS[String(key||'').toLowerCase()]||null;}

export function getShipmentPayload(order){
  const address=order?.ShippingAddress||order?.BillingAddress||{};
  return {
    orderNo:order?.OrderNo||order?.orderNo||'',
    recipient:{
      name:[address.firstName,address.lastName].filter(Boolean).join(' ')||[order?.FirstName,order?.LastName].filter(Boolean).join(' '),
      phone:address.phone||order?.Phone||'',
      email:order?.Email||''
    },
    address:{
      line:address.addressLine||address.address||order?.AddressLine||'',
      district:address.district||order?.District||'',
      city:address.city||order?.City||'',
      postalCode:address.postalCode||order?.PostalCode||''
    },
    packageCount:1,
    reference:order?.OrderNo||order?.orderNo||''
  };
}

export async function createShipment(providerKey,order){
  const provider=getShippingProvider(providerKey);
  if(!provider)throw new Error('Desteklenmeyen kargo firması');
  if(!provider.env.every(key=>Boolean(process.env[key])))throw new Error(`${provider.name} entegrasyon bilgileri henüz tanımlanmamış`);
  if(providerKey==='aras'){
    throw new Error('Aras Kargo bağlantısı için kurumsal entegrasyon hesabı tanımlanmalı');
  }
  throw new Error(`${provider.name} bağlantısı hazırlandı ancak servis kimlik bilgileri ve firma API sözleşmesi bekleniyor`);
}

export async function trackShipment(providerKey,trackingNumber){
  const provider=getShippingProvider(providerKey);
  if(!provider)throw new Error('Desteklenmeyen kargo firması');
  if(!trackingNumber)throw new Error('Takip numarası gerekli');
  throw new Error(`${provider.name} takip servisi için API erişimi tanımlanmamış`);
}
