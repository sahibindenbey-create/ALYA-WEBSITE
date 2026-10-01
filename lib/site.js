import { COMPANY } from '../app/company-info';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.alyahomes.com').replace(/\/$/, '');
export const abs = (p = '/') => (/^https?:/i.test(p) ? p : `${SITE_URL}${p.startsWith('/') ? '' : '/'}${p}`);
export const BRAND = 'ALYA HOMES';
export const FREE_SHIPPING_THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD) || 1000;
export const SHIPPING_FEE = Number(process.env.STANDARD_SHIPPING_FEE) || 99;

// Temiz (ASCII) koleksiyon adresleri; eski Türkçe karakterli adresler 301 ile buraya yönlenir.
export const COLLECTIONS = [
  { slug: 'kurutmaliklar', legacy: ['kurutmalıklar'], category: 'Kurutmalıklar', title: 'Kurutmalıklar',
    description: 'İç ve dış mekân kullanımı için alüminyum ve paslanmaz gövdeli, katlanabilir ve balkon tipi kurutmalık modelleri. 3 yıl garanti, 30 gün iade.' },
  { slug: 'utu-masalari', legacy: ['ütü masaları', 'ütü masalari'], category: 'Ütü Masaları', title: 'Ütü Masaları',
    description: 'Alüminyum ve çelik gövdeli, ayarlanabilir yükseklikli ütü masası modelleri. ALYA HOMES ütü masalarını keşfedin.' },
];
export const ALL_COLLECTION = { slug: 'all', title: 'Tüm Ürünler', description: 'ALYA HOMES kurutmalık ve ütü masası koleksiyonunun tamamı: işlevsel, dayanıklı ve sade tasarımlı ev yaşam ürünleri.' };
export const collectionByCategory = (c) => COLLECTIONS.find((x) => x.category === c);
export const orgJsonLd = () => ({
  '@context': 'https://schema.org', '@type': 'Organization', '@id': abs('/#organization'),
  name: BRAND, legalName: COMPANY.name, url: abs('/'), logo: abs('/alya-homes-logo.png'),
  email: COMPANY.email, telephone: '+90 216 594 78 60', taxID: COMPANY.taxNumber,
  address: { '@type': 'PostalAddress', streetAddress: 'Cevizli Mah. Tugay Yolu Cad. Maltepe Park AVM No:67/B4-18/19', addressLocality: 'Maltepe', addressRegion: 'İstanbul', addressCountry: 'TR' },
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service', telephone: '+90 216 594 78 60', email: COMPANY.email, areaServed: 'TR', availableLanguage: ['tr'] }],
});
