import { SITE_URL, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, COLLECTIONS } from '../../lib/site';
import { getCatalog } from '../../lib/catalog';
import { COMPANY } from '../company-info';
export const runtime = 'nodejs';
export const revalidate = 3600;
const tl = (n) => `${new Intl.NumberFormat('tr-TR').format(n)} TL`;
export async function GET() {
  const products = await getCatalog();
  const line = (p) => { const s = p.specs || {}; const bits = [s.kurutma && `kurutma uzunluğu ${s.kurutma}`, s.ütüleme && `ütüleme alanı ${s.ütüleme}`, s.ölçü && `ölçü ${s.ölçü}`, s.malzeme && s.malzeme].filter(Boolean).join(', '); return `- [${p.name} (${p.code})](${SITE_URL}/products/${p.slug}): ${p.category}${bits ? ', ' + bits : ''}${p.price ? `, ${tl(p.price)}` : ''}`; };
  const body = `# ALYA HOMES

> ALYA HOMES, işlevsel, dayanıklı ve sade tasarımlı ev yaşam ürünleri üretir ve satar: katlanabilir kurutmalıklar ve ütü masaları. Bu site markanın resmî online mağazasıdır (Türkiye, TRY).

## Şirket
- Ticari unvan: ${COMPANY.name}
- Adres: ${COMPANY.address}
- Telefon: ${COMPANY.phone}
- E-posta: ${COMPANY.email}
- Vergi dairesi / no: ${COMPANY.taxOffice} / ${COMPANY.taxNumber} · MERSİS: ${COMPANY.mersisNumber}

## Satın alma koşulları (site üzerinde yayımlanan bilgiler)
- Garanti: 3 yıl
- İade: teslimattan itibaren 30 gün içinde kolay iade
- Kargo: ${tl(FREE_SHIPPING_THRESHOLD)} ve üzeri siparişlerde ücretsiz; altında ${tl(SHIPPING_FEE)}
- Ödeme: kart veya havale/EFT; kart bilgileri sitede saklanmaz

## Koleksiyonlar
${COLLECTIONS.map((c) => `- [${c.title}](${SITE_URL}/collections/${c.slug}): ${c.description}`).join('\n')}
- [Tüm ürünler](${SITE_URL}/collections/all)

## Ürünler
${products.map(line).join('\n')}

## Yardım ve politikalar
- [Yardım Merkezi](${SITE_URL}/yardim)
- [İletişim](${SITE_URL}/iletisim)
- [İade Politikası](${SITE_URL}/iade-politikasi)
- [Kişisel Verilerin Korunması](${SITE_URL}/kisisel_verilerin_korunmasi)
- [Kullanım Koşulları](${SITE_URL}/kullanim_kosullari)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
