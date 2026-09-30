export const CATALOG_ORIGIN = "https://alyahomes.com";
export const SHOP_ORIGIN = "https://shop.alyahomes.com";

export function siteModeFromHost(rawHost = "") {
  const host = rawHost.split(":")[0].toLowerCase();
  if (host === "alyahomes.com" || host === "www.alyahomes.com") return "catalog";
  if (host === "shop.alyahomes.com" || host === "www.shop.alyahomes.com")
    return "shop";
  return process.env.SITE_MODE === "catalog" ? "catalog" : "shop";
}

export function originForMode(mode) {
  return mode === "catalog" ? CATALOG_ORIGIN : SHOP_ORIGIN;
}

export function absoluteUrl(origin, path = "/") {
  return new URL(path, `${origin}/`).toString();
}

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function productSeoDescription(product, isShop = false) {
  const specs = Object.values(product.specs || {})
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
  const action = isShop ? " Online fiyat ve ürün detaylarını inceleyin." : "";
  const description = `${product.description}${specs ? ` Öne çıkan özellikler: ${specs}.` : ""}${action}`;
  if (description.length <= 158) return description;
  return `${description.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}