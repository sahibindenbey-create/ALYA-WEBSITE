import { promises as fs } from 'fs';
import path from 'path';
import sql from 'mssql';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const file = path.join(process.cwd(), 'data', 'store.json');
const empty = { orders: [], productOverrides: {}, customProducts: [], deletedProducts: [] };
let poolPromise = null;

function sqlConfigured() {
  return Boolean(process.env.SQL_SERVER && process.env.SQL_DATABASE && process.env.SQL_USER && process.env.SQL_PASSWORD);
}

async function getPool() {
  if (!sqlConfigured()) return null;
  if (!poolPromise) {
    poolPromise = sql.connect({
      server: process.env.SQL_SERVER,
      database: process.env.SQL_DATABASE,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      port: Number(process.env.SQL_PORT || 1433),
      options: {
        encrypt: String(process.env.SQL_ENCRYPT || 'false').toLowerCase() === 'true',
        trustServerCertificate: String(process.env.SQL_TRUST_SERVER_CERTIFICATE || 'true').toLowerCase() === 'true'
      },
      pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
    }).catch(error => { poolPromise = null; throw error; });
  }
  return poolPromise;
}

async function readFileStore() {
  try {
    return { ...empty, ...JSON.parse(await fs.readFile(file, 'utf8')) };
  } catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(empty, null, 2));
    return empty;
  }
}

async function readStore() {
  const pool = await getPool();
  if (!pool) return { state: await readFileStore(), source: 'file' };
  const result = await pool.request().input('id', sql.Int, 1).query('SELECT Payload FROM dbo.AlyaStoreState WHERE Id=@id');
  if (!result.recordset.length) return { state: empty, source: 'sql' };
  try { return { state: { ...empty, ...JSON.parse(result.recordset[0].Payload) }, source: 'sql' }; }
  catch { return { state: empty, source: 'sql' }; }
}

async function writeStore(next) {
  const pool = await getPool();
  if (!pool) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(next, null, 2));
    return 'file';
  }
  await pool.request()
    .input('id', sql.Int, 1)
    .input('payload', sql.NVarChar(sql.MAX), JSON.stringify(next))
    .query(`MERGE dbo.AlyaStoreState AS target
            USING (SELECT @id AS Id, @payload AS Payload) AS source
            ON target.Id = source.Id
            WHEN MATCHED THEN UPDATE SET Payload=source.Payload, UpdatedAt=SYSUTCDATETIME()
            WHEN NOT MATCHED THEN INSERT (Id, Payload) VALUES (source.Id, source.Payload);`);
  return 'sql';
}


async function syncNormalized(pool, state) {
  // JSON state remains the compatibility source; these tables provide queryable SQL data.
  for (const p of [...(state.customProducts || [])]) {
    await pool.request()
      .input('slug', sql.NVarChar(180), p.slug)
      .input('code', sql.NVarChar(80), p.code || null)
      .input('name', sql.NVarChar(250), p.name || 'Yeni ürün')
      .input('category', sql.NVarChar(120), p.category || null)
      .input('price', sql.Decimal(18,2), p.price == null ? null : Number(p.price))
      .input('stock', sql.Int, p.stock == null ? null : Number(p.stock))
      .input('discount', sql.Decimal(5,2), p.discount == null ? null : Number(p.discount))
      .input('image', sql.NVarChar(500), p.image || null)
      .input('description', sql.NVarChar(sql.MAX), p.description || null)
      .query(`MERGE dbo.AlyaProducts AS t USING (SELECT @slug Slug) AS s ON t.Slug=s.Slug
        WHEN MATCHED THEN UPDATE SET Code=@code,Name=@name,Category=@category,Price=@price,Stock=@stock,Discount=@discount,Image=@image,Description=@description,IsActive=1,SourceType='custom',UpdatedAt=SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT(Slug,Code,Name,Category,Price,Stock,Discount,Image,Description,IsActive,SourceType) VALUES(@slug,@code,@name,@category,@price,@stock,@discount,@image,@description,1,'custom');`);
  }
  const orders = Array.isArray(state.orders) ? state.orders : [];
  for (const o of orders) {
    const c=o.customer||{};
    const email=String(c.email||'').trim().toLowerCase();
    let customerId=null;
    if(email){
      const cr=await pool.request().input('email',sql.NVarChar(320),email).query('SELECT Id FROM dbo.AlyaCustomers WHERE Email=@email');
      if(cr.recordset.length) customerId=cr.recordset[0].Id;
      else {
        const ins=await pool.request().input('email',sql.NVarChar(320),email).input('first',sql.NVarChar(100),c.firstName||c.ad||null).input('last',sql.NVarChar(100),c.lastName||c.soyad||null).input('phone',sql.NVarChar(50),c.phone||c.telefon||null).input('address',sql.NVarChar(500),c.address||c.addressLine||null).input('city',sql.NVarChar(100),c.city||null).input('district',sql.NVarChar(100),c.district||null).input('postal',sql.NVarChar(20),c.postalCode||null).query(`INSERT dbo.AlyaCustomers(Email,FirstName,LastName,Phone,AddressLine,City,District,PostalCode) OUTPUT INSERTED.Id VALUES(@email,@first,@last,@phone,@address,@city,@district,@postal)`);
        customerId=ins.recordset[0].Id;
      }
    }
    const existing=await pool.request().input('orderNo',sql.NVarChar(60),o.id).query('SELECT Id FROM dbo.AlyaOrders WHERE OrderNo=@orderNo');
    if(!existing.recordset.length){
      const ins=await pool.request().input('orderNo',sql.NVarChar(60),o.id).input('customerId',sql.BigInt,customerId).input('status',sql.NVarChar(60),o.status||'Sipariş alındı').input('payment',sql.NVarChar(60),c.paymentMethod||c.payment||null).input('subtotal',sql.Decimal(18,2),Number(o.subtotal)||0).input('shipping',sql.Decimal(18,2),Number(o.shipping)||0).input('total',sql.Decimal(18,2),Number(o.total)||0).input('created',sql.DateTime2, new Date(o.createdAt||Date.now())).query(`INSERT dbo.AlyaOrders(OrderNo,CustomerId,Status,PaymentMethod,Subtotal,Shipping,Total,CreatedAt) OUTPUT INSERTED.Id VALUES(@orderNo,@customerId,@status,@payment,@subtotal,@shipping,@total,@created)`);
      const orderId=ins.recordset[0].Id;
      for(const item of (o.items||[])) await pool.request().input('orderId',sql.BigInt,orderId).input('slug',sql.NVarChar(180),item.slug||'').input('code',sql.NVarChar(80),item.code||null).input('name',sql.NVarChar(250),item.name||'Ürün').input('unit',sql.Decimal(18,2),Number(item.price)||0).input('qty',sql.Int,Number(item.qty)||1).query('INSERT dbo.AlyaOrderItems(OrderId,ProductSlug,ProductCode,ProductName,UnitPrice,Quantity) VALUES(@orderId,@slug,@code,@name,@unit,@qty)');
    }
  }
}

export async function GET() {
  try {
    const { state, source } = await readStore();
    return Response.json({ ...state, source }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ ...empty, source: 'file', error: 'Veri kaynağına bağlanılamadı.' }, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const incoming = await request.json();
    const { state: current } = await readStore();
    const next = {
      orders: Array.isArray(incoming.orders) ? incoming.orders : current.orders,
      productOverrides: incoming.productOverrides && typeof incoming.productOverrides === 'object' ? incoming.productOverrides : current.productOverrides,
      customProducts: Array.isArray(incoming.customProducts) ? incoming.customProducts : current.customProducts,
      deletedProducts: Array.isArray(incoming.deletedProducts) ? incoming.deletedProducts : current.deletedProducts
    };
    const source = await writeStore(next);
    if (source === 'sql') { try { const pool = await getPool(); if (pool) await syncNormalized(pool, next); } catch (syncError) { /* state write succeeded; normalized sync can be retried */ } }
    return Response.json({ ok: true, source, normalized: source === 'sql', ...next });
  } catch (error) {
    return Response.json({ ok: false, error: 'Store verisi kaydedilemedi.' }, { status: 400 });
  }
}
