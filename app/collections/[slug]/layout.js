import { headers } from "next/headers";
import { products } from "../../products";
import {
  absoluteUrl,
  originForMode,
  serializeJsonLd,
  siteModeFromHost,
} from "../../seo";

const details = {
  all: {
    title: "Tüm Ürünler",
    description:
      "ALYA HOMES kurutmalık ve ütü masası koleksiyonunu keşfedin. İşlevsel, dayanıklı ve yer kazandıran ev yaşam ürünleri.",
  },
  "kurutmalıklar": {
    title: "Çamaşır Kurutmalıkları",
    description:
      "Katlanabilir, balkon tipi ve kanatlı ALYA HOMES çamaşır kurutmalıkları. Alüminyum ve dayanıklı gövde seçeneklerini inceleyin.",
  },
  "ütü masaları": {
    title: "Ütü Masaları",
    description:
      "ALYA HOMES alüminyum ve çelik ütü masaları. Ayarlanabilir yükseklik, geniş ütüleme alanı ve kolay saklama çözümleri.",
  },
};

async function collectionContext(rawSlug) {
  const host = (await headers()).get("host") || "";
  const mode = siteModeFromHost(host);
  const origin = originForMode(mode);
  const decoded = decodeURIComponent(rawSlug || "all").toLocaleLowerCase("tr-TR");
  const detail = details[decoded] || details.all;
  const items =
    decoded === "all"
      ? products
      : products.filter(
          (product) =>
            product.category.toLocaleLowerCase("tr-TR") === decoded,
        );
  return { mode, origin, decoded, detail, items };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { mode, origin, decoded, detail } = await collectionContext(slug);
  const canonical = absoluteUrl(
    origin,
    decoded === "all"
      ? "/collections/all"
      : `/collections/${encodeURIComponent(decoded)}`,
  );
  const title =
    mode === "shop"
      ? `${detail.title} Satın Al | ALYA HOMES`
      : `${detail.title} | ALYA HOMES`;

  return {
    metadataBase: new URL(origin),
    title,
    description: detail.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "ALYA HOMES",
      title,
      description: detail.description,
      url: canonical,
      images: [
        {
          url: absoluteUrl(
            origin,
            decoded === "ütü masaları"
              ? "/category-ironing-v2.webp"
              : "/category-drying-v2.webp",
          ),
          alt: detail.title,
        },
      ],
    },
  };
}

export default async function CollectionSeoLayout({ children, params }) {
  const { slug } = await params;
  const { origin, decoded, detail, items } = await collectionContext(slug);
  const canonical = absoluteUrl(
    origin,
    decoded === "all"
      ? "/collections/all"
      : `/collections/${encodeURIComponent(decoded)}`,
  );
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: detail.title,
    url: canonical,
    numberOfItems: items.length,
    itemListElement: items.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(origin, `/products/${product.slug}`),
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: origin,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: detail.title,
        item: canonical,
      },
    ],
  };

  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
    </>
  );
}