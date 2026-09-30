import { products } from "../products";
import { absoluteUrl, SHOP_ORIGIN } from "../seo";

export const dynamic = "force-dynamic";

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

function itemNode(product) {
  return `<item>
<g:id>${escapeXml(product.code)}</g:id>
<title>${escapeXml(`${product.name} | ${product.category}`)}</title>
<description>${escapeXml(product.description)}</description>
<link>${escapeXml(absoluteUrl(SHOP_ORIGIN, `/products/${product.slug}`))}</link>
<g:image_link>${escapeXml(absoluteUrl(SHOP_ORIGIN, product.image))}</g:image_link>
<g:availability>in_stock</g:availability>
<g:price>${Number(product.price).toFixed(2)} TRY</g:price>
<g:brand>ALYA HOMES</g:brand>
<g:mpn>${escapeXml(product.code)}</g:mpn>
<g:condition>new</g:condition>
<g:product_type>${escapeXml(product.category)}</g:product_type>
</item>`;
}

export async function GET() {
  const saleableProducts = products.filter(
    (product) => Number.isFinite(Number(product.price)) && product.price > 0,
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>ALYA HOMES Shop</title>
<link>${SHOP_ORIGIN}</link>
<description>ALYA HOMES online mağaza ürün akışı</description>
${saleableProducts.map(itemNode).join("\n")}
</channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}