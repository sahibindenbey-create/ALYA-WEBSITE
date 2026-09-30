import { products } from "../app/products.js";
import {guides} from "../app/guides.js";

const INDEXNOW_KEY = "7af3cbcc4ad75d2d399226c821b89fb0";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const ORIGINS = ["https://alyahomes.com", "https://shop.alyahomes.com"];
const STATIC_PATHS = [
  "/",
  "/collections/all",
  "/collections/kurutmal%C4%B1klar",
  "/collections/%C3%BCt%C3%BC%20masalar%C4%B1",
  "/yardim",
  "/iletisim",
  "/iade-politikasi",
  "/guvenli_alisveris",
  "/kampanyalar",
];

const productPaths = products.map((product) => `/products/${product.slug}`);
const guidePaths = ["/rehberler",...guides.map((guide)=>`/rehberler/${guide.slug}`)];

for (const origin of ORIGINS) {
  const host = new URL(origin).host;
  const urlList = [...STATIC_PATHS, ...productPaths,...(host==="alyahomes.com"?guidePaths:[])].map(
    (path) => new URL(path, `${origin}/`).toString(),
  );
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${origin}/${INDEXNOW_KEY}.txt`,
    urlList,
  };

  if (process.env.INDEXNOW_DRY_RUN === "1") {
    console.log(`${host}: ${urlList.length} URLs ready`);
    continue;
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (![200, 202].includes(response.status)) {
    throw new Error(`${host}: IndexNow returned HTTP ${response.status}`);
  }
  console.log(`${host}: ${urlList.length} URLs submitted (HTTP ${response.status})`);
}