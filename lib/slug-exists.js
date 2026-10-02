// Sunucuda ürün var mı? Statik katalog + (yapılandırılmışsa) SQL'e yönetici panelinden eklenen ürünler.
// SQL hata verirse "var" kabul edilir (fail-open): geçici veritabanı sorunu sayfaları 404'e çevirmesin.
import sql from 'mssql';
import { getProduct } from '../app/products';
let poolPromise = null; const cache = new Map(); const TTL = 5 * 60_000;
const configured = () => Boolean(process.env.SQL_SERVER && process.env.SQL_DATABASE && process.env.SQL_USER && process.env.SQL_PASSWORD);
async function pool() {
  if (!configured()) return null;
  if (!poolPromise) poolPromise = sql.connect({ server: process.env.SQL_SERVER, database: process.env.SQL_DATABASE, user: process.env.SQL_USER, password: process.env.SQL_PASSWORD, port: Number(process.env.SQL_PORT || 1433), options: { encrypt: String(process.env.SQL_ENCRYPT || 'false').toLowerCase() === 'true', trustServerCertificate: String(process.env.SQL_TRUST_SERVER_CERTIFICATE || 'true').toLowerCase() === 'true' }, requestTimeout: 3000, connectionTimeout: 3000 }).catch((e) => { poolPromise = null; throw e; });
  return poolPromise;
}
export async function productSlugExists(slug) {
  if (getProduct(slug)) return true;
  const key = String(slug); const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  try {
    const p = await pool(); if (!p) return false;
    const r = await p.request().input('s', sql.NVarChar(180), key).query('SELECT TOP 1 1 AS x FROM dbo.AlyaProducts WHERE Slug=@s AND (IsActive IS NULL OR IsActive=1)');
    const v = r.recordset.length > 0; cache.set(key, { v, t: Date.now() }); return v;
  } catch { return true; }
}
