import crypto from 'crypto';
import sql from 'mssql';

export const runtime='nodejs';
export const dynamic='force-dynamic';

let poolPromise=null;
const configured=()=>Boolean(process.env.SQL_SERVER&&process.env.SQL_DATABASE&&process.env.SQL_USER&&process.env.SQL_PASSWORD);

async function pool(){
  if(!configured())return null;
  if(!poolPromise)poolPromise=sql.connect({
    server:process.env.SQL_SERVER,
    database:process.env.SQL_DATABASE,
    user:process.env.SQL_USER,
    password:process.env.SQL_PASSWORD,
    port:Number(process.env.SQL_PORT||1433),
    options:{
      encrypt:String(process.env.SQL_ENCRYPT||'false').toLowerCase()==='true',
      trustServerCertificate:String(process.env.SQL_TRUST_SERVER_CERTIFICATE||'true')
    }
  }).catch(e=>{poolPromise=null;throw e});
  return poolPromise;
}

function safeEqual(a,b){
  try{
    const x=Buffer.from(String(a||''),'utf8'),y=Buffer.from(String(b||''),'utf8');
    return x.length===y.length&&crypto.timingSafeEqual(x,y);
  }catch{return false}
}

function normalizeStatus(value){
  const status=String(value||'').trim();
  const map={
    'Başarılı':'Ödendi',
    'Başarısız':'Başarısız',
    'İade':'İade Edildi',
    'İade Edildi':'İade Edildi',
    'Ödendi':'Ödendi',
    'Tamamlandı':'Ödendi',
    'Bekliyor':'Bekliyor'
  };
  return map[status]||null;
}

export async function POST(req){
  try{
    const raw=await req.text();
    const secret=process.env.PAYMENT_WEBHOOK_SECRET;
    if(!secret)return Response.json({error:'PAYMENT_WEBHOOK_SECRET yapılandırılmamış'},{status:503});

    const signature=req.headers.get('x-alya-signature')||'';
    const expected=crypto.createHmac('sha256',secret).update(raw).digest('hex');
    if(!safeEqual(signature,expected))return Response.json({error:'Geçersiz webhook imzası'},{status:401});

    const b=JSON.parse(raw);
    const reference=String(b.reference||'').trim();
    const status=normalizeStatus(b.status);
    const transactionId=b.transactionId?String(b.transactionId):null;

    if(!reference||!status)return Response.json({error:'reference ve geçerli status gerekli'},{status:400});

    const p=await pool();
    if(!p)return Response.json({error:'SQL bağlantısı yapılandırılmamış'},{status:503});

    const tx=new sql.Transaction(p);
    await tx.begin();
    try{
      const attempt=await new sql.Request(tx)
        .input('ref',sql.NVarChar(100),reference)
        .query(`SELECT TOP 1 Id,OrderId,Status FROM dbo.AlyaPaymentAttempts WITH (UPDLOCK,HOLDLOCK) WHERE Reference=@ref`);

      if(!attempt.recordset.length){
        await tx.rollback();
        return Response.json({error:'Ödeme referansı bulunamadı'},{status:404});
      }

      const current=attempt.recordset[0];
      if(current.Status===status){
        await tx.commit();
        return Response.json({ok:true,duplicate:true,status,reference});
      }

      await new sql.Request(tx)
        .input('ref',sql.NVarChar(100),reference)
        .input('status',sql.NVarChar(40),status)
        .input('txid',sql.NVarChar(160),transactionId)
        .query(`UPDATE dbo.AlyaPaymentAttempts SET Status=@status,ProviderTransactionId=COALESCE(@txid,ProviderTransactionId),LastWebhookAt=SYSUTCDATETIME(),UpdatedAt=SYSUTCDATETIME() WHERE Reference=@ref`);

      await new sql.Request(tx)
        .input('id',sql.BigInt,current.OrderId)
        .input('status',sql.NVarChar(40),status)
        .input('ref',sql.NVarChar(120),reference)
        .query(`UPDATE dbo.AlyaOrders SET PaymentStatus=@status,PaymentReference=@ref,UpdatedAt=SYSUTCDATETIME() WHERE Id=@id`);

      await tx.commit();
      return Response.json({ok:true,status,reference});
    }catch(e){
      try{await tx.rollback()}catch{}
      throw e;
    }
  }catch(e){
    return Response.json({error:e?.message||'Webhook işlenemedi'},{status:409});
  }
}
