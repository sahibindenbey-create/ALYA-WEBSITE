import { customerEmailFromRequest } from '../../../lib/customer-auth';
import { isAdminRequest, unauthorized } from '../../../lib/auth';
import sql from 'mssql';
export const runtime='nodejs'; export const dynamic='force-dynamic';
let poolPromise=null;
const configured=()=>Boolean(process.env.SQL_SERVER&&process.env.SQL_DATABASE&&process.env.SQL_USER&&process.env.SQL_PASSWORD);
async function pool(){if(!configured())return null;if(!poolPromise)poolPromise=sql.connect({server:process.env.SQL_SERVER,database:process.env.SQL_DATABASE,user:process.env.SQL_USER,password:process.env.SQL_PASSWORD,port:Number(process.env.SQL_PORT||1433),options:{encrypt:String(process.env.SQL_ENCRYPT||'false').toLowerCase()==='true',trustServerCertificate:String(process.env.SQL_TRUST_SERVER_CERTIFICATE||'true')}}).catch(e=>{poolPromise=null;throw e});return poolPromise}
const CANCELLED='İptal edildi';
const safeJson=v=>{try{return v?JSON.parse(v):null}catch{return null}};
const roundMoney=value=>Math.round((Number(value)+Number.EPSILON)*100)/100;

async function priceOrderItems(tx,inputItems){
 const source=Array.isArray(inputItems)?inputItems:[];
 if(!source.length)throw new Error('Sepet boş');
 if(source.length>50)throw new Error('Bir siparişte en fazla 50 farklı ürün olabilir');
 const quantities=new Map();
 for(const item of source){
  const slug=String(item?.slug||'').trim();
  const qty=Number(item?.qty);
  if(!slug||!Number.isInteger(qty)||qty<1||qty>99)throw new Error('Geçersiz ürün veya miktar');
  const next=(quantities.get(slug)||0)+qty;
  if(next>99)throw new Error(`Ürün miktarı sınırı aşıldı: ${slug}`);
  quantities.set(slug,next);
 }
 const priced=[];
 for(const [slug,qty] of quantities){
  const result=await new sql.Request(tx).input('slug',sql.NVarChar(180),slug).query('SELECT TOP 1 Slug,Code,Name,Price,Discount,Stock,IsActive FROM dbo.AlyaProducts WITH (UPDLOCK,ROWLOCK) WHERE Slug=@slug');
  if(!result.recordset.length||result.recordset[0].IsActive===false)throw new Error(`Ürün satışta değil: ${slug}`);
  const product=result.recordset[0];
  const basePrice=Number(product.Price);
  const discount=Math.min(100,Math.max(0,Number(product.Discount)||0));
  if(!Number.isFinite(basePrice)||basePrice<0)throw new Error(`Ürün fiyatı geçersiz: ${slug}`);
  const price=roundMoney(basePrice*(1-discount/100));
  priced.push({slug,code:product.Code||null,name:product.Name||slug,price,qty});
 }
 return priced;
}

function shippingFor(subtotal){
 const threshold=Math.max(0,Number(process.env.FREE_SHIPPING_THRESHOLD||1000));
 const fee=Math.max(0,Number(process.env.STANDARD_SHIPPING_FEE||99));
 return roundMoney(subtotal>=threshold?0:fee);
}

async function findOrCreateCustomer(tx,c){const email=String(c.email||'').trim().toLowerCase();if(!email)return null;const q=new sql.Request(tx);const cr=await q.input('email',sql.NVarChar(320),email).query('SELECT Id FROM dbo.AlyaCustomers WITH (UPDLOCK,HOLDLOCK) WHERE Email=@email');if(cr.recordset.length)return cr.recordset[0].Id;const ins=new sql.Request(tx);const r=await ins.input('email',sql.NVarChar(320),email).input('first',sql.NVarChar(100),c.firstName||c.name||null).input('last',sql.NVarChar(100),c.lastName||null).input('phone',sql.NVarChar(50),c.phone||null).input('address',sql.NVarChar(500),c.address||c.addressLine||c.billingAddress?.addressLine||null).input('city',sql.NVarChar(100),c.city||c.billingAddress?.city||null).input('district',sql.NVarChar(100),c.district||c.billingAddress?.district||null).input('postal',sql.NVarChar(20),c.postalCode||c.billingAddress?.postalCode||null).input('customerType',sql.NVarChar(20),c.customerType||'Bireysel').input('companyName',sql.NVarChar(250),c.companyName||null).input('taxNumber',sql.NVarChar(50),c.taxNumber||null).input('taxOffice',sql.NVarChar(150),c.taxOffice||null).input('identityNumber',sql.NVarChar(20),c.identityNumber||null).query(`INSERT dbo.AlyaCustomers(Email,FirstName,LastName,Phone,AddressLine,City,District,PostalCode,CustomerType,CompanyName,TaxNumber,TaxOffice,IdentityNumber) OUTPUT INSERTED.Id VALUES(@email,@first,@last,@phone,@address,@city,@district,@postal,@customerType,@companyName,@taxNumber,@taxOffice,@identityNumber)`);return r.recordset[0].Id}

async function decrementForOrder(tx,orderNo,items){for(const item of items){const slug=String(item.slug||'').trim();const qty=Math.max(1,Number(item.qty)||0);if(!slug||!qty)throw new Error('Sipariş kaleminde ürün veya miktar eksik');const q=new sql.Request(tx);const product=await q.input('slug',sql.NVarChar(180),slug).query('SELECT Stock,Name FROM dbo.AlyaProducts WITH (UPDLOCK,ROWLOCK) WHERE Slug=@slug');if(!product.recordset.length)throw new Error(`Ürün bulunamadı: ${slug}`);const previous=Number(product.recordset[0].Stock)||0;if(previous<qty)throw new Error(`Yetersiz stok: ${product.recordset[0].Name||slug} (mevcut ${previous}, gereken ${qty})`);const next=previous-qty;await new sql.Request(tx).input('slug',sql.NVarChar(180),slug).input('stock',sql.Int,next).query('UPDATE dbo.AlyaProducts SET Stock=@stock,UpdatedAt=SYSUTCDATETIME() WHERE Slug=@slug');await new sql.Request(tx).input('slug',sql.NVarChar(180),slug).input('type',sql.NVarChar(30),'Sipariş Çıkışı').input('qty',sql.Int,-qty).input('previous',sql.Int,previous).input('next',sql.Int,next).input('orderNo',sql.NVarChar(60),orderNo).input('note',sql.NVarChar(500),`Sipariş ${orderNo}`).query('INSERT dbo.AlyaStockMovements(ProductSlug,MovementType,Quantity,PreviousStock,NewStock,OrderNo,Note) VALUES(@slug,@type,@qty,@previous,@next,@orderNo,@note)')}}

async function restoreForOrder(tx,orderNo){const movements=await new sql.Request(tx).input('orderNo',sql.NVarChar(60),orderNo).query(`SELECT ProductSlug,ABS(SUM(Quantity)) AS Quantity FROM dbo.AlyaStockMovements WITH (UPDLOCK,HOLDLOCK) WHERE OrderNo=@orderNo GROUP BY ProductSlug HAVING SUM(Quantity)<0`);for(const m of movements.recordset){const qty=Math.abs(Number(m.Quantity)||0);if(!qty)continue;const p=await new sql.Request(tx).input('slug',sql.NVarChar(180),m.ProductSlug).query('SELECT Stock,Name FROM dbo.AlyaProducts WITH (UPDLOCK,ROWLOCK) WHERE Slug=@slug');if(!p.recordset.length)throw new Error(`Ürün bulunamadı: ${m.ProductSlug}`);const previous=Number(p.recordset[0].Stock)||0;const next=previous+qty;await new sql.Request(tx).input('slug',sql.NVarChar(180),m.ProductSlug).input('stock',sql.Int,next).query('UPDATE dbo.AlyaProducts SET Stock=@stock,UpdatedAt=SYSUTCDATETIME() WHERE Slug=@slug');await new sql.Request(tx).input('slug',sql.NVarChar(180),m.ProductSlug).input('type',sql.NVarChar(30),'Sipariş İptal İadesi').input('qty',sql.Int,qty).input('previous',sql.Int,previous).input('next',sql.Int,next).input('orderNo',sql.NVarChar(60),orderNo).input('note',sql.NVarChar(500),`İptal edilen sipariş ${orderNo}`).query('INSERT dbo.AlyaStockMovements(ProductSlug,MovementType,Quantity,PreviousStock,NewStock,OrderNo,Note) VALUES(@slug,@type,@qty,@previous,@next,@orderNo,@note)')}}

async function hasOutgoing(tx,orderNo){const r=await new sql.Request(tx).input('orderNo',sql.NVarChar(60),orderNo).query(`SELECT COUNT(*) AS Count FROM (SELECT ProductSlug FROM dbo.AlyaStockMovements WHERE OrderNo=@orderNo GROUP BY ProductSlug HAVING SUM(Quantity)<0) x`);return Number(r.recordset[0]?.Count||0)>0}

export async function GET(req){try{const admin=await isAdminRequest(req);const sess=admin?'':await customerEmailFromRequest(req);const p=await pool();if(!p)return Response.json({source:'file',orders:[]});const {searchParams}=new URL(req.url);const email=String(searchParams.get('email')||'').trim().toLowerCase();const orderNo=String(searchParams.get('orderNo')||'').trim();if(orderNo){const q=new sql.Request(p);const h=await q.input('orderNo',sql.NVarChar(60),orderNo).query(`SELECT TOP 1 o.Id,o.OrderNo,o.Status,o.PaymentMethod,o.PaymentStatus,o.Carrier,o.TrackingNumber,o.Subtotal,o.Shipping,o.Total,o.CreatedAt,o.UpdatedAt,o.CustomerType,o.CompanyName,o.TaxNumber,o.TaxOffice,o.IdentityNumber,o.BillingAddressJson,o.ShippingAddressJson,o.SameAddress,c.Email,c.FirstName,c.LastName,c.Phone,c.AddressLine,c.City,c.District,c.PostalCode,c.CustomerType AS CustomerCustomerType,c.CompanyName AS CustomerCompanyName,c.TaxNumber AS CustomerTaxNumber,c.TaxOffice AS CustomerTaxOffice,c.IdentityNumber AS CustomerIdentityNumber FROM dbo.AlyaOrders o LEFT JOIN dbo.AlyaCustomers c ON c.Id=o.CustomerId WHERE o.OrderNo=@orderNo`);if(!h.recordset.length)return Response.json({source:'sql',order:null},{status:404});if(!admin&&String(h.recordset[0].Email||'').trim().toLowerCase()!==(email||sess))return Response.json({source:'sql',order:null},{status:404});const history=await new sql.Request(p).input('orderId',sql.BigInt,h.recordset[0].Id).query(`SELECT Status,Note,CreatedAt FROM dbo.AlyaOrderStatusHistory WHERE OrderId=@orderId ORDER BY CreatedAt`);const items=await new sql.Request(p).input('orderId',sql.BigInt,h.recordset[0].Id).query(`SELECT ProductSlug,ProductCode,ProductName,UnitPrice,Quantity,LineTotal FROM dbo.AlyaOrderItems WHERE OrderId=@orderId ORDER BY Id`);const row={...h.recordset[0]};if(!admin){delete row.IdentityNumber;delete row.CustomerIdentityNumber;}return Response.json({source:'sql',order:{...row,BillingAddress:safeJson(row.BillingAddressJson),ShippingAddress:safeJson(row.ShippingAddressJson),history:history.recordset,items:items.recordset}},{headers:{'Cache-Control':'no-store'}})}if(!admin&&!(sess&&email&&sess===email))return Response.json({error:'Yetkisiz erişim'},{status:401});const q=new sql.Request(p);let r;if(email)r=await q.input('email',sql.NVarChar(320),email).query(`SELECT o.Id,o.OrderNo,o.Status,o.PaymentMethod,o.PaymentStatus,o.Carrier,o.TrackingNumber,o.Subtotal,o.Shipping,o.Total,o.CreatedAt,o.UpdatedAt,o.CustomerType,o.CompanyName,o.TaxNumber,o.TaxOffice,o.IdentityNumber,o.BillingAddressJson,o.ShippingAddressJson,o.SameAddress,c.Email,c.FirstName,c.LastName,c.Phone FROM dbo.AlyaOrders o LEFT JOIN dbo.AlyaCustomers c ON c.Id=o.CustomerId WHERE c.Email=@email ORDER BY o.CreatedAt DESC`);else r=await q.query(`SELECT o.Id,o.OrderNo,o.Status,o.PaymentMethod,o.PaymentStatus,o.Carrier,o.TrackingNumber,o.Subtotal,o.Shipping,o.Total,o.CreatedAt,o.UpdatedAt,o.CustomerType,o.CompanyName,o.TaxNumber,o.TaxOffice,o.IdentityNumber,o.BillingAddressJson,o.ShippingAddressJson,o.SameAddress,c.Email,c.FirstName,c.LastName,c.Phone FROM dbo.AlyaOrders o LEFT JOIN dbo.AlyaCustomers c ON c.Id=o.CustomerId ORDER BY o.CreatedAt DESC`);return Response.json({source:'sql',orders:r.recordset.map(row=>({...row,BillingAddress:safeJson(row.BillingAddressJson),ShippingAddress:safeJson(row.ShippingAddressJson)}))},{headers:{'Cache-Control':'no-store'}})}catch(e){return Response.json({source:'error',orders:[]},{status:500})}}

export async function POST(req){
 const tx=new sql.Transaction();
 try{
  const b=await req.json();
  const orderNo=String(b.id||'').trim();
  if(!/^ALY-[A-Za-z0-9-]{4,56}$/.test(orderNo))return Response.json({error:'Geçersiz sipariş numarası'},{status:400});
  const customer=b.customer||{};
  const email=String(customer.email||'').trim().toLowerCase();
  if(!email||email.length>320||!email.includes('@'))return Response.json({error:'Geçerli e-posta adresi gerekli'},{status:400});
  const paymentMethod=String(customer.paymentMethod||customer.payment||'').trim();
  if(!['Kart','Havale/EFT'].includes(paymentMethod))return Response.json({error:'Geçersiz ödeme yöntemi'},{status:400});
  const p=await pool();
  if(!p)return Response.json({error:'SQL bağlantısı yapılandırılmamış'},{status:503});
  await tx.begin(p);
  const existing=await new sql.Request(tx).input('no',sql.NVarChar(60),orderNo).query('SELECT Id FROM dbo.AlyaOrders WITH (UPDLOCK,HOLDLOCK) WHERE OrderNo=@no');
  if(existing.recordset.length){await tx.rollback();return Response.json({error:'Sipariş numarası zaten kullanılıyor'},{status:409});}
  const items=await priceOrderItems(tx,b.items);
  const subtotal=roundMoney(items.reduce((sum,item)=>sum+item.price*item.qty,0));
  const shipping=shippingFor(subtotal);
  const total=roundMoney(subtotal+shipping);
  await decrementForOrder(tx,orderNo,items);
  const customerId=await findOrCreateCustomer(tx,{...customer,email});
  const status='Sipariş alındı';
  const billing=customer.billingAddress||null;
  const shippingAddress=customer.shippingAddress||null;
  const ins=await new sql.Request(tx)
   .input('no',sql.NVarChar(60),orderNo)
   .input('customerId',sql.BigInt,customerId)
   .input('status',sql.NVarChar(60),status)
   .input('payment',sql.NVarChar(60),paymentMethod)
   .input('paymentStatus',sql.NVarChar(40),'Bekliyor')
   .input('carrier',sql.NVarChar(100),null)
   .input('tracking',sql.NVarChar(120),null)
   .input('subtotal',sql.Decimal(18,2),subtotal)
   .input('shipping',sql.Decimal(18,2),shipping)
   .input('total',sql.Decimal(18,2),total)
   .input('created',sql.DateTime2,new Date())
   .input('customerType',sql.NVarChar(20),customer.customerType||'Bireysel')
   .input('companyName',sql.NVarChar(250),customer.companyName||null)
   .input('taxNumber',sql.NVarChar(50),customer.taxNumber||null)
   .input('taxOffice',sql.NVarChar(150),customer.taxOffice||null)
   .input('identityNumber',sql.NVarChar(20),customer.identityNumber||null)
   .input('billingJson',sql.NVarChar(sql.MAX),billing?JSON.stringify(billing):null)
   .input('shippingJson',sql.NVarChar(sql.MAX),shippingAddress?JSON.stringify(shippingAddress):null)
   .input('sameAddress',sql.Bit,customer.sameAddress?1:0)
   .query(`INSERT dbo.AlyaOrders(OrderNo,CustomerId,Status,PaymentMethod,PaymentStatus,Carrier,TrackingNumber,Subtotal,Shipping,Total,CreatedAt,CustomerType,CompanyName,TaxNumber,TaxOffice,IdentityNumber,BillingAddressJson,ShippingAddressJson,SameAddress) OUTPUT INSERTED.Id VALUES(@no,@customerId,@status,@payment,@paymentStatus,@carrier,@tracking,@subtotal,@shipping,@total,@created,@customerType,@companyName,@taxNumber,@taxOffice,@identityNumber,@billingJson,@shippingJson,@sameAddress)`);
  const orderId=ins.recordset[0].Id;
  await new sql.Request(tx).input('orderId',sql.BigInt,orderId).input('status',sql.NVarChar(60),status).query('INSERT dbo.AlyaOrderStatusHistory(OrderId,Status,Note) VALUES(@orderId,@status,N\'Sipariş oluşturuldu\')');
  for(const item of items)await new sql.Request(tx).input('orderId',sql.BigInt,orderId).input('slug',sql.NVarChar(180),item.slug).input('code',sql.NVarChar(80),item.code).input('name',sql.NVarChar(250),item.name).input('unit',sql.Decimal(18,2),item.price).input('qty',sql.Int,item.qty).query('INSERT dbo.AlyaOrderItems(OrderId,ProductSlug,ProductCode,ProductName,UnitPrice,Quantity) VALUES(@orderId,@slug,@code,@name,@unit,@qty)');
  await tx.commit();
  return Response.json({ok:true,source:'sql',stockUpdated:true,id:orderId,orderNo,subtotal,shipping,total});
 }catch(e){
  try{await tx.rollback()}catch{}
  console.error('orders.POST',e?.message);return Response.json({error:/^(Yetersiz stok|Ürün bulunamadı|Ürün satışa|Sepet boş|Sipariş kaleminde|Geçersiz)/.test(String(e?.message||''))?e.message:'Sipariş kaydedilemedi'},{status:409});
 }
}

export async function PATCH(req){ if(!(await isAdminRequest(req)))return unauthorized();const tx=new sql.Transaction();try{const b=await req.json();if(!b.orderNo||!b.status)return Response.json({error:'orderNo ve status gerekli'},{status:400});const p=await pool();if(!p)return Response.json({error:'SQL bağlantısı yapılandırılmamış'},{status:503});await tx.begin(p);const order=await new sql.Request(tx).input('no',sql.NVarChar(60),b.orderNo).query(`SELECT Id,Status FROM dbo.AlyaOrders WITH (UPDLOCK,HOLDLOCK) WHERE OrderNo=@no`);if(!order.recordset.length){await tx.rollback();return Response.json({error:'Sipariş bulunamadı'},{status:404})}const oldStatus=order.recordset[0].Status;const newStatus=String(b.status);if(oldStatus!==CANCELLED&&newStatus===CANCELLED){if(await hasOutgoing(tx,b.orderNo))await restoreForOrder(tx,b.orderNo);}else if(oldStatus===CANCELLED&&newStatus!==CANCELLED){const items=await new sql.Request(tx).input('id',sql.BigInt,order.recordset[0].Id).query(`SELECT ProductSlug slug, Quantity qty, ProductCode code, ProductName name, UnitPrice price FROM dbo.AlyaOrderItems WHERE OrderId=@id`).then(r=>r.recordset.map(x=>({slug:x.slug,qty:x.qty,code:x.code,name:x.name,price:x.price})));await decrementForOrder(tx,b.orderNo,items);}await new sql.Request(tx).input('no',sql.NVarChar(60),b.orderNo).input('status',sql.NVarChar(60),newStatus).input('paymentStatus',sql.NVarChar(40),b.paymentStatus||null).input('carrier',sql.NVarChar(100),b.carrier||null).input('tracking',sql.NVarChar(120),b.trackingNumber||null).query('UPDATE dbo.AlyaOrders SET Status=@status, PaymentStatus=COALESCE(@paymentStatus,PaymentStatus), Carrier=COALESCE(@carrier,Carrier), TrackingNumber=COALESCE(@tracking,TrackingNumber), UpdatedAt=SYSUTCDATETIME() WHERE OrderNo=@no');await new sql.Request(tx).input('no',sql.NVarChar(60),b.orderNo).input('status',sql.NVarChar(60),newStatus).input('note',sql.NVarChar(500),b.note||null).query('INSERT dbo.AlyaOrderStatusHistory(OrderId,Status,Note) SELECT Id,@status,@note FROM dbo.AlyaOrders WHERE OrderNo=@no');await tx.commit();return Response.json({ok:true,source:'sql',previousStatus:oldStatus,status:newStatus,stockAction:oldStatus!==newStatus?(newStatus===CANCELLED?'restore':'decrement'):'none'})}catch(e){try{await tx.rollback()}catch{}console.error('orders.PATCH',e?.message);return Response.json({error:'Sipariş güncellenemedi'},{status:409})}}
