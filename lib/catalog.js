// Sunucu tarafı ürün verisi: statik katalog + (varsa) SQL'deki güncel fiyat/stok/aktiflik. SQL yoksa statik veri döner.
import sql from 'mssql';
import { products as staticProducts } from '../app/products';
let poolPromise = null; let cache = null; let cacheAt = 0;
const TTL = 5 * 60_000;
const configured = () => Boolean(process.env.SQL_SERVER && process.env.SQL_DATABASE && process.env.SQL_USER && process.env.SQL_PASSWORD);
async function pool() {
  if (!configured()) return null;
  if (!poolPromise) poolPromise = sql.connect({ server: process.env.SQL_SERVER, database: process.env.SQL_DATABASE, user: process.env.SQL_USER, password: process.env.SQL_PASSWORD, port: Number(process.env.SQL_PORT || 1433), options: { encrypt: String(process.env.SQL_ENCRYPT || 'false').toLowerCase() === 'true', trustServerCertificate: String(process.env.SQL_TRUST_SERVER_CERTIFICATE || 'true').toLowerCase() === 'true' }, requestTimeout: 4000, connectionTimeout: 4000 }).catch((e) => { poolPromise = null; throw e; });
  return poolPromise;
}
export async function getCatalog() {
  if (cache && Date.now() - cacheAt < TTL) return cache;
  let list = staticProducts.map((p) => ({ ...p, stock: null, active: true }));
  try {
    const p = await pool();
    if (p) {
      const r = await p.request().query('SELECT Slug,Name,Code,Category,Price,Stock,Image,Description,IsActive FROM dbo.AlyaProducts');
      const bySlug = new Map(r.recordset.map((x) => [x.Slug, x]));
      list = list.map((s) => { const d = bySlug.get(s.slug); if (!d) return s; bySlug.delete(s.slug); return { ...s, price: d.Price ?? s.price, stock: d.Stock ?? null, active: d.IsActive !== false, name: d.Name || s.name }; });
      for (const d of bySlug.values()) list.push({ slug: d.Slug, name: d.Name, code: d.Code, category: d.Category || 'Ürün', image: d.Image, price: d.Price, description: d.Description || '', specs: {}, stock: d.Stock ?? null, active: d.IsActive !== false });
    }
  } catch (e) { /* SQL erişilemezse statik katalog kullanılır */ }
  cache = list.filter((p) => p.active); cacheAt = Date.now();
  return cache;
}
export async function getCatalogProduct(slug) { return (await getCatalog()).find((p) => p.slug === slug) || null; }
