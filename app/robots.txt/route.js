import { headers } from "next/headers";
import { originForMode, siteModeFromHost } from "../seo";

export const dynamic = "force-dynamic";

const privatePaths = [
  "/admin",
  "/api",
  "/account",
  "/cart",
  "/checkout",
  "/order-success",
  "/wishlist",
];

function rulesFor(userAgent) {
  return [
    `User-agent: ${userAgent}`,
    "Allow: /",
    ...privatePaths.map((path) => `Disallow: ${path}`),
  ].join("\n");
}

export async function GET() {
  const host = (await headers()).get("host") || "";
  const origin = originForMode(siteModeFromHost(host));
  const body = [
    rulesFor("*"),
    rulesFor("OAI-SearchBot"),
    rulesFor("ChatGPT-User"),
    rulesFor("GPTBot"),
    rulesFor("ClaudeBot"),
    rulesFor("Claude-SearchBot"),
    rulesFor("Claude-User"),
    rulesFor("PerplexityBot"),
    rulesFor("Perplexity-User"),
    rulesFor("Google-Extended"),
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}