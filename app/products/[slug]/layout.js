import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { productSlugExists } from "../../../lib/slug-exists";
import { getProduct } from "../../products";
import {
  absoluteUrl,
  originForMode,
  productSeoDescription,
  serializeJsonLd,
  siteModeFromHost,
  SHOP_ORIGIN,
} from "../../seo";

async function context(slug) {
  const host = (await headers()).get("host") || "";
  const mode = siteModeFromHost(host);
  return { mode, origin: originForMode(mode), product: getProduct(slug) };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { mode, origin, product } = await context(slug);
  if (!product) return { title: "Ürün | ALYA HOMES", robots: { index: false, follow: true } };

  const isShop = mode === "shop";
  const title = isShop
    ? `${product.name} | ${product.category} Satın Al | ALYA HOMES`
    : `${product.name} ${product.code} | ${product.category} | ALYA HOMES`;
  const description = productSeoDescription(product, isShop);
  // Aynı ürün iki sitede de var: katalogdaki ürün sayfasının canonical'i mağaza sayfasıdır (yinelenen içerik olmasın).
  // Eski davranışa dönmek için ortam değişkeni: CATALOG_PRODUCT_CANONICAL=self
  const canonicalOrigin = mode === "catalog" && process.env.CATALOG_PRODUCT_CANONICAL !== "self" ? SHOP_ORIGIN : origin;
  const canonical = absoluteUrl(canonicalOrigin, `/products/${product.slug}`);
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
  if (!product) { if (!(await productSlugExists(slug))) notFound(); return children; }

  const canonical = absoluteUrl(origin, `/products/${product.slug}`);
  // Ürün videosu (public/products-real/<kod>/product-video.mp4) varsa VideoObject işaretlemesi
  const VIDEO_DATES = { "1402": "2026-09-29", "1403": "2026-09-29" };
  const folder = String(product.code || "").match(/\d{4}$/)?.[0] || "";
  const hasVideo = Boolean(VIDEO_DATES[folder]) && fs.existsSync(path.join(process.cwd(), "public", "products-real", folder, "product-video.mp4"));
  const videoSchema = hasVideo
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: `${product.name} ürün videosu`,
        description: `${product.name} (${product.code}) ürününün tanıtım videosu.`,
        thumbnailUrl: [absoluteUrl(origin, product.image)],
        uploadDate: VIDEO_DATES[folder],
        contentUrl: absoluteUrl(origin, `/products-real/${folder}/product-video.mp4`),
      }
    : null;
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
    ...(videoSchema ? { video: { "@type": "VideoObject", name: videoSchema.name, description: videoSchema.description, thumbnailUrl: videoSchema.thumbnailUrl, uploadDate: videoSchema.uploadDate, contentUrl: videoSchema.contentUrl } } : {}),
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
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "ALYA HOMES" },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: { "@type": "MonetaryAmount", value: Number(product.price) >= (Number(process.env.FREE_SHIPPING_THRESHOLD) || 1000) ? 0 : Number(process.env.STANDARD_SHIPPING_FEE) || 99, currency: "TRY" },
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "TR" },
              ...(process.env.SHIPPING_HANDLING_DAYS_MAX && process.env.SHIPPING_TRANSIT_DAYS_MAX ? { deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: Number(process.env.SHIPPING_HANDLING_DAYS_MIN || 0), maxValue: Number(process.env.SHIPPING_HANDLING_DAYS_MAX), unitCode: "DAY" }, transitTime: { "@type": "QuantitativeValue", minValue: Number(process.env.SHIPPING_TRANSIT_DAYS_MIN || 1), maxValue: Number(process.env.SHIPPING_TRANSIT_DAYS_MAX), unitCode: "DAY" } } } : {}),
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "TR",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 14,
              url: absoluteUrl(origin, "/iade-politikasi"),
            },
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
      {videoSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(videoSchema) }} />
      )}
    </>
  );
}