// alyahomes.com (katalog) fiyat göstermez; shop.alyahomes.com (mağaza) fiyat ve sepet gösterir.
import { siteModeFromHost } from '../app/seo';
export function isCatalogRequest(req) {
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(',')[0].trim();
  return siteModeFromHost(host) === 'catalog';
}
const PRICE_KEYS = ['price', 'Price', 'discount', 'Discount', 'oldPrice', 'comparePrice', 'salePrice'];
export function stripPrices(value) {
  if (Array.isArray(value)) return value.map(stripPrices);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) { if (!PRICE_KEYS.includes(k)) out[k] = stripPrices(v); }
    return out;
  }
  return value;
}
