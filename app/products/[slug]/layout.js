import { headers } from "next/headers";
import { getProduct } from "../../products";
import {
  absoluteUrl,
  originForMode,
  productSeoDescription,
  serializeJsonLd,
  siteModeFromHost,
} from "../../seo";

async function context(slug) {
  const host = (await headers()).get("host") || "";
  const mode = siteModeFromHost(host);
  return { mode, origin: originForMode(mode), product: getProduct(slug) };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { mode, origin, product } = await context(slug);
  if (!product) return { title: "Ürün bulunamadı | ALYA HOMES" };

  const isShop = mode === "shop";
  const title = isShop
    ? `${product.name} | ${product.category} Satın Al | ALYA HOMES`
    : `${product.name} ${product.code} | ${product.category} | ALYA HOMES`;
  const description = productSeoDescription(product, isShop);
  const canonical = absoluteUrl(origin, `/products/${product.slug}`);
  const image = absoluteUrl(origin, product.image);

  return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "ALYA HOMES",
      title,
      description,
      url: canonical,
      images: [{ url: image, alt: `${product.name} ${product.code}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductSeoLayout({ children, params }) {
  const { slug } = await params;
  const { mode, origin, product } = await context(slug);
  if (!product) return children;

  const canonical = absoluteUrl(origin, `/products/${product.slug}`);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [absoluteUrl(origin, product.image)],
    sku: product.code,
    mpn: product.code,
    category: product.category,
    brand: { "@type": "Brand", name: "ALYA HOMES" },
    manufacturer: { "@type": "Organization", name: "ALYA HOMES" },
    url: canonical,
    additionalProperty: Object.entries(product.specs || {}).map(
      ([name, value]) => ({
        "@type": "PropertyValue",
        name,
        value,
      }),
    ),
    ...(mode === "shop" && product.price != null
      ? {
          offers: {
            "@type": "Offer",
            url: canonical,
            priceCurrency: "TRY",
            price: product.price,
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "ALYA HOMES" },
          },
        }
      : {}),
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
        name: product.category,
        item: absoluteUrl(
          origin,
          `/collections/${encodeURIComponent(product.category.toLocaleLowerCase("tr-TR"))}`,
        ),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: canonical,
      },
    ],
  };

  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
    </>
  );
}