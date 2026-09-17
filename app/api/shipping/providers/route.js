export const runtime='nodejs';

const providers=[
 {id:'aras',name:'Aras Kargo',type:'soap',env:['ARAS_USERNAME','ARAS_PASSWORD','ARAS_INTEGRATION_CODE'],create:true,track:true,label:true},
 {id:'yurtici',name:'Yurtiçi Kargo',type:'official-api',env:['YURTICI_USERNAME','YURTICI_PASSWORD','YURTICI_CUSTOMER_CODE'],create:false,track:true,label:false},
 {id:'surat',name:'Sürat Kargo',type:'official-api',env:['SURAT_USERNAME','SURAT_PASSWORD','SURAT_CUSTOMER_CODE'],create:false,track:true,label:false},
 {id:'ptt',name:'PTT Kargo',type:'official-api',env:['PTT_USERNAME','PTT_PASSWORD','PTT_CUSTOMER_CODE'],create:false,track:true,label:false},
 {id:'dhl',name:'DHL eCommerce',type:'rest',env:['DHL_API_KEY','DHL_API_SECRET','DHL_ACCOUNT_NUMBER'],create:false,track:true,label:true},
 {id:'ups',name:'UPS',type:'rest',env:['UPS_CLIENT_ID','UPS_CLIENT_SECRET','UPS_ACCOUNT_NUMBER'],create:true,track:true,label:true},
 {id:'hepsijet',name:'HepsiJET',type:'official-api',env:['HEPSIJET_API_KEY','HEPSIJET_API_SECRET'],create:false,track:true,label:false},
 {id:'kolay-gelsin',name:'Kolay Gelsin',type:'official-api',env:['KOLAYGELSIN_API_KEY'],create:false,track:true,label:false}
];

export async function GET(){
 return Response.json({providers:providers.map(p=>({...p,configured:p.env.every(k=>Boolean(process.env[k]))}))},{headers:{'Cache-Control':'no-store'}});
}
