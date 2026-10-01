import { SITE_URL } from '../lib/site';
const PRIVATE = ['/admin', '/api/', '/account', '/cart', '/checkout', '/wishlist', '/order-success'];
// Arama motoru + yapay zekâ asistanı tarayıcılarına açıkça izin (GEO). Eğitim amaçlı tarama istemiyorsanız ilgili botu buradan çıkarıp disallow edin.
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended'];
export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
