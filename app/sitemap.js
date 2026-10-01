import { SITE_URL, COLLECTIONS } from '../lib/site';
import { getCatalog } from '../lib/catalog';
export const revalidate = 3600;
export default async function sitemap() {
  const u = (p, priority, changeFrequency) => ({ url: `${SITE_URL}${p}`, changeFrequency, priority });
  const products = await getCatalog();
  return [
    u('/', 1, 'weekly'),
    u('/collections/all', 0.9, 'weekly'),
    ...COLLECTIONS.map((c) => u(`/collections/${c.slug}`, 0.9, 'weekly')),
    ...products.map((p) => u(`/products/${p.slug}`, 0.8, 'weekly')),
    u('/yardim', 0.5, 'monthly'), u('/iletisim', 0.5, 'monthly'), u('/iade-politikasi', 0.4, 'monthly'), u('/guvenli_alisveris', 0.3, 'yearly'),
    u('/kisisel_verilerin_korunmasi', 0.2, 'yearly'), u('/kullanim_kosullari', 0.2, 'yearly'), u('/cerez_politikasi', 0.2, 'yearly'),
  ];
}
