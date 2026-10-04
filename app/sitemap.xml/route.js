import { headers } from "next/headers";
import { products } from "../products";
import {guides} from "../guides";
import {
  absoluteUrl,
  originForMode,
  siteModeFromHost,
} from "../seo";

export const dynamic = "force-dynamic";

const staticPages = [
  ["/", "1.0", "weekly"],
  ["/collections/all", "0.9", "weekly"],
  ["/collections/kurutmal%C4%B1klar", "0.9", "weekly"],
  ["/collections/%C3%BCt%C3%BC%20masalar%C4%B1", "0.9", "weekly"],
  ["/yardim", "0.5", "monthly"],
  ["/iletisim", "0.5", "monthly"],
  ["/iade-politikasi", "0.5", "monthly"],
  ["/guvenli_alisveris", "0.4", "monthly"],
  ["/guvenlik-sertifikalari", "0.3", "yearly"],
  ["/kisisel_verilerin_korunmasi", "0.2", "yearly"],
  ["/cerez_politikasi", "0.2", "yearly"],
  ["/uyelik_sozlesmesi", "0.2", "yearly"],
  ["/kullanim_kosullari", "0.2", "yearly"],
  ["/iletisim_aydinlatma_metni", "0.2", "yearly"],
  ["/ticari-iletisim-bilgilendirme-metni", "0.2", "yearly"],
];

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

function urlNode({ location, priority, frequency, image, imageTitle }) {
  return `<url><loc>${escapeXml(location)}</loc><changefreq>${frequency}</changefreq><priority>${priority}</priority>${
    image
      ? `<image:image><image:loc>${escapeXml(image)}</image:loc><image:title>${escapeXml(imageTitle)}</image:title></image:image>`
      : ""
  }</url>`;
}

export async function GET() {
  const host = (await headers()).get("host") || "";
  const mode=siteModeFromHost(host);
  const origin = originForMode(mode);
  const guidePages=mode==="catalog"?[
    ["/rehberler","0.8","weekly"],
    ...guides.map(guide=>[`/rehberler/${guide.slug}`,"0.7","monthly"]),
  ]:[];
  const nodes = [
    ...[...staticPages,...guidePages].map(([path, priority, frequency]) =>
      urlNode({
        location: absoluteUrl(origin, path),
        priority,
        frequency,
      }),
    ),
    // Katalogdaki ürün sayfalarının canonical'i mağazadadır; site haritasında yalnızca canonical adresler yer alır
    ...(mode === "catalog" && process.env.CATALOG_PRODUCT_CANONICAL !== "self" ? [] : products).map((product) =>
      urlNode({
        location: absoluteUrl(origin, `/products/${product.slug}`),
        priority: "0.8",
        frequency: "weekly",
        image: absoluteUrl(origin, product.image),
        imageTitle: `${product.name} ${product.code} | ALYA HOMES`,
      }),
    ),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${nodes.join("")}</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}