import { headers } from "next/headers";
import HomePage from "./page-client";
import {
  absoluteUrl,
  originForMode,
  siteModeFromHost,
} from "./seo";

export async function generateMetadata() {
  const host = (await headers()).get("host") || "";
  const mode = siteModeFromHost(host);
  const origin = originForMode(mode);
  const catalog = mode === "catalog";
  const title = catalog
    ? "ALYA HOMES | Kurutmalık ve Ütü Masası"
    : "ALYA HOMES Shop | Kurutmalık ve Ütü Masası";
  const description = catalog
    ? "ALYA HOMES kurutmalık ve ütü masası koleksiyonu. İşlevsel, dayanıklı ve yer kazandıran ev yaşam ürünlerini keşfedin."
    : "ALYA HOMES kurutmalık ve ütü masası modellerini online inceleyin ve güvenle satın alın.";
  const image = absoluteUrl(origin, "/home-hero-v2.webp");

  return {
    title,
    description,
    alternates: { canonical: origin },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "ALYA HOMES",
      title,
      description,
      url: origin,
      images: [
        {
          url: image,
          width: 1600,
          height: 900,
          alt: "ALYA HOMES ev yaşam ürünleri",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function Home() {
  return <HomePage />;
}