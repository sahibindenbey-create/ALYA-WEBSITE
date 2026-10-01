# ALYA HOMES — Güvenlik / SEO / GEO düzeltmeleri

## Yayına almadan ÖNCE yapılacaklar (sunucuda, kodda değil)
1. `.env` içinde: `ADMIN_USERNAME` (admin olmasın), `ADMIN_PASSWORD` (≥12 karakter), `ADMIN_SESSION_SECRET` (≥32 karakter, `openssl rand -base64 48`).
   Bunlar eksik/kısa ise yönetici girişi bilerek KAPALI kalır (503).
2. `SQL_USER`: `sa` yerine yalnızca bu veritabanında yetkili ayrı bir kullanıcı. `SQL_ENCRYPT=true`, `SQL_TRUST_SERVER_CERTIFICATE=false`.
3. `NEXT_PUBLIC_SITE_URL=https://shop.alyahomes.com`, `INTERNAL_BASE_URL=http://127.0.0.1:3002`.
4. `npm install && npm run build` ardından yeniden başlatın. Eski yönetici oturumları geçersiz olur (yeni giriş gerekir).
5. Cloudflare (kullanıyorsanız): /api/admin/login için rate-limit kuralı ekleyin; kod içi sınırlayıcı tek sunucu içindir.

## Güvenlik
- Next.js 15.5.3 -> 15.5.27, React 19.1.1 -> 19.1.9, sharp -> 0.35.5, postcss override. `npm audit`: 0 açık (önce 1 kritik + 2 yüksek).
- /api/* artık varsayılan olarak YÖNETİCİ ister; yalnızca müşteri akışı için gereken uçlar açık (middleware.js + route içi ikinci kontrol).
- Müşteri/sipariş verisi (kimlik no, adres, telefon) herkese açıktı: /api/orders listesi, /api/customers, /api/store siparişleri artık yönetici-only.
- Tek sipariş sorgusu artık sipariş no + e-posta eşleşmesi ister; kimlik no müşteriye geri dönmez.
- Sipariş fiyat/toplam/kargo sunucuda veritabanı fiyatından hesaplanır (istemciden gelen fiyat artık kullanılmaz). Sipariş no tahmin edilemez (crypto).
- Anonim kullanıcı stok düşürme / ürün fiyatı değiştirme / sipariş durumu değiştirme / kargo oluşturma yapamaz.
- Yönetici oturumu: süreli (8 sa), rastgele nonce'lu, HMAC imzalı token; gizli anahtar zorunlu (fail-closed); SameSite=Strict; 5 başarısız denemede 15 dk kilit.
- Güvenlik başlıkları: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP; X-Powered-By kapalı.
- Hata mesajlarında veritabanı/iç detay sızıntısı kaldırıldı. Kargo iç çağrıları Host başlığına güvenmez.
- Repo: `.gitignore` (.env, data/store.json), `README.md.tmp` silindi. Git geçmişi tarandı: sızmış gizli anahtar/veri bulunmadı.

## Derleme hataları (siteniz bu haliyle `next build` geçemiyordu)
- `@/lib/shipping` çözülemiyordu -> `jsconfig.json`.
- Aras route'unda bozuk regex -> düzeltildi.
- account/admin sayfalarında kapanmamış `}`; `??` + `||` karışımı; checkout/payment & order-success `Suspense` eksikti.

## SEO
- Sayfa başına benzersiz title/description/canonical/OpenGraph/Twitter (ürün + koleksiyon `generateMetadata`).
- `robots.txt`, `sitemap.xml` (37 URL), kişisel sayfalar (sepet, hesap, ödeme, admin) `noindex`.
- Türkçe karakterli koleksiyon adresleri -> temiz adres + kalıcı yönlendirme (`/collections/kurutmaliklar`, `/utu-masalari`).
- Footer'daki /iade-politikasi 404 idi -> sayfa eklendi. Boş içerikli /kampanyalar ve /guvenlik-sertifikalari `noindex`.
- Ürün sayfaları sunucuda render (önceden tamamen istemci tarafıydı).

## GEO (yapay zekâ aramaları)
- Product / Offer (TRY, stok, kargo, 30 gün iade, 3 yıl garanti), BreadcrumbList, CollectionPage+ItemList, Organization, WebSite JSON-LD.
- `/llms.txt` (şirket, koşullar, tüm ürünler) ve robots'ta GPTBot, ClaudeBot, PerplexityBot vb. için açık izin.
- Not: bu teknik altyapı AI'ın siteyi doğru okumasını sağlar; öneri/sıralama garantisi vermez.

## Sizin yapmanız gerekenler (kod dışı)
- Google Search Console + Bing Webmaster'a sitemap gönderin; `layout.js` içindeki `verification` satırını doldurun.
- Google Business Profile (Maltepe adresi), Trendyol/Hepsiburada vb. listeleri, gerçek müşteri yorumları (yorum şeması ancak gerçek yorumla eklenmeli).
- www.alyahomes.com'daki "Rehberler" linki `alyahomes.com/rehberler` (www'suz) — iki alan adı tek forma yönlenmeli, ve iki site arasında canonical/hreflang netleştirilmeli.
- Ürün görsellerine ürün başına gerçek alt metin; kategori/rehber içerikleri (ör. "balkon kurutmalık nasıl seçilir").
- Kart ödemesi sağlayıcısı seçilince CSP `form-action` için `CSP_FORM_ACTION_EXTRA` doldurulmalı.
- Müşteri girişi şu an parolasız (cihazda saklanan e-posta). Hesap/sipariş sorgusu için e-posta doğrulamalı gerçek üyelik eklenmeli.
