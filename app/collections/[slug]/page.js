import { permanentRedirect } from 'next/navigation';
import CollectionClient from './CollectionClient';
import JsonLd from '../../components/JsonLd';
import { getCatalog } from '../../../lib/catalog';
import { abs, COLLECTIONS, ALL_COLLECTION } from '../../../lib/site';
export const revalidate = 300;

function resolve(rawSlug) {
  const s = decodeURIComponent(rawSlug || 'all').toLocaleLowerCase('tr-TR');
  if (s === 'all') return { col: ALL_COLLECTION, redirect: null };
  const hit = COLLECTIONS.find((c) => c.slug === s);
  if (hit) return { col: hit, redirect: null };
  const legacy = COLLECTIONS.find((c) => c.legacy.includes(s));
  if (legacy) return { col: legacy, redirect: `/collections/${legacy.slug}` }; // eski Türkçe karakterli adres -> 301
  return { col: null, redirect: null };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { col } = resolve(slug);
  if (!col) return { title: 'Koleksiyon', robots: { index: false, follow: true } };
  return {
    title: col.title, description: col.description,
    alternates: { canonical: `/collections/${col.slug}` },
    openGraph: { type: 'website', title: `${col.title} | ALYA HOMES`, description: col.description, url: `/collections/${col.slug}`, images: [{ url: '/alya-homes-logo.png' }] },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const { col, redirect } = resolve(slug);
  if (redirect) permanentRedirect(redirect);
  let jsonLd = [];
  if (col) {
    const all = await getCatalog();
    const list = col.slug === 'all' ? all : all.filter((p) => p.category === col.category);
    const url = abs(`/collections/${col.slug}`);
    jsonLd = [
      { '@context': 'https://schema.org', '@type': 'CollectionPage', name: col.title, description: col.description, url, isPartOf: { '@id': abs('/#website') },
        mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/products/${p.slug}`), name: p.name })) } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana sayfa', item: abs('/') },
        { '@type': 'ListItem', position: 2, name: col.title, item: url } ] },
    ];
  }
  return <>{jsonLd.map((d, i) => <JsonLd key={i} data={d} />)}<CollectionClient slug={slug} /></>;
}
