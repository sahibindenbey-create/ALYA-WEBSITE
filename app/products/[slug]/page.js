import ProductClient from './ProductClient';
import JsonLd from '../../components/JsonLd';
import { getCatalogProduct } from '../../../lib/catalog';
import { abs, BRAND, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, collectionByCategory } from '../../../lib/site';
export const revalidate = 300;

const specText = (p) => Object.entries(p.specs || {}).filter(([k]) => ['kurutma', 'ütüleme', 'ölçü', 'malzeme'].includes(k)).map(([, v]) => v).join(', ');

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getCatalogProduct(slug);
  if (!p) return { title: 'Ürün', robots: { index: false, follow: true } };
  const title = `${p.name} ${p.code} | ${p.category}`;
  const description = `${p.name} (${p.code}) — ${p.description} ${specText(p) ? specText(p) + '. ' : ''}3 yıl garanti, 30 gün iade.`.slice(0, 300);
  const image = abs(p.image);
  return {
    title: { absolute: `${title} | ${BRAND}` }, description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { type: 'website', title, description, url: `/products/${p.slug}`, images: [{ url: image, alt: p.name }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const p = await getCatalogProduct(slug);
  let jsonLd = null;
  if (p) {
    const url = abs(`/products/${p.slug}`);
    const col = collectionByCategory(p.category);
    const inStock = p.stock == null || Number(p.stock) > 0;
    const product = {
      '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`,
      name: p.name, sku: p.code, mpn: p.code, category: p.category, description: p.description,
      image: [abs(p.image)], url, brand: { '@type': 'Brand', name: BRAND },
      ...(Object.keys(p.specs || {}).length ? { additionalProperty: Object.entries(p.specs).map(([name, value]) => ({ '@type': 'PropertyValue', name, value: String(value) })) } : {}),
    };
    if (p.price != null && Number(p.price) > 0) {
      product.warranty = { '@type': 'WarrantyPromise', durationOfWarranty: { '@type': 'QuantitativeValue', value: 3, unitCode: 'ANN' } };
      product.offers = {
        '@type': 'Offer', url, priceCurrency: 'TRY', price: Number(p.price).toFixed(2),
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': abs('/#organization') },
        shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: Number(p.price) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE, currency: 'TRY' }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'TR' } },
        hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', applicableCountry: 'TR', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 30 },
      };
    }
    const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana sayfa', item: abs('/') },
      { '@type': 'ListItem', position: 2, name: p.category, item: abs(col ? `/collections/${col.slug}` : '/collections/all') },
      { '@type': 'ListItem', position: 3, name: p.name, item: url } ] };
    jsonLd = [product, crumbs];
  }
  return <>{jsonLd && jsonLd.map((d, i) => <JsonLd key={i} data={d} />)}<ProductClient slug={slug} /></>;
}
