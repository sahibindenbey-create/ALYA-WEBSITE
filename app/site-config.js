export const SITE_MODE =
  process.env.NEXT_PUBLIC_SITE_MODE === "catalog" ? "catalog" : "shop";

export const isCatalogMode = SITE_MODE === "catalog";

export const SHOP_URL = "https://shop.alyahomes.com";

export const shopProductUrl = (slug) =>
  `${SHOP_URL.replace(/\/$/, "")}/products/${slug}`;