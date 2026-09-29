"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { products } from "./products";
import { useStore } from "./store";
import { isCatalogMode } from "./site-config";
import {useI18n} from "./i18n";

const money = (n) =>
  n == null
    ? "Fiyat için iletişime geçin"
    : new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
      }).format(n);

function ProductCard({ product, onAdd }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const {category}=useI18n();
  return (
    <article className="product">
      <Link href={`/products/${product.slug}`}>
        <div className="product-image">
          <span>{category(product.category)}</span>
          {!isCatalogMode && (
            <button
              aria-label="Favorilere ekle"
              className={isWishlisted(product.slug) ? "wish-active" : ""}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
            >
              <Heart
                size={18}
                fill={isWishlisted(product.slug) ? "currentColor" : "none"}
              />
            </button>
          )}
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-meta">
          <span className="code">{product.code}</span>
          <h3>{product.name}</h3>
          {!isCatalogMode && <p>{money(product.price)}</p>}
        </div>
      </Link>
      {!isCatalogMode && (
        <button className="add" onClick={() => onAdd(product)}>
          {product.price == null ? "Fiyat iste" : "Sepete ekle"}
        </button>
      )}
    </article>
  );
}

export default function Home() {
  const {t,category}=useI18n();
  const { addToCart } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [added, setAdded] = useState("");
  const featured = products.slice(0, 4);
  const newProducts = products.slice(5, 9);
  const dryingProduct =
    products.find((p) => p.code === "AHDRY1409") || products[8] || products[0];
  const dryingCategoryImage = "/category-drying-v2.webp";
  const featureDryingImage = "/home-feature-drying-v2.webp";
  const boardCategoryImage = "/category-ironing-v2.webp";
  const onAdd = (product) => {
    if (product.price == null) {
      window.location.href = `/products/${product.slug}`;
      return;
    }
    if (addToCart(product)) {
      setAdded(product.name);
      window.setTimeout(() => setAdded(""), 2200);
    }
  };
  return (
    <main className="retail-home">
      {!isCatalogMode && added && (
        <div className="add-toast">
          Sepete eklendi <strong>{added}</strong>
        </div>
      )}
      <section className="hero">
        <div className="hero-copy">
          <p>{t("ALYA HOMES / AKILLI EV ÇÖZÜMLERİ")}</p>
          <h1>
            {t("Günlük hayatı hafifleten tasarım.")}
          </h1>
          <span>
            {t("İşlevsel, dayanıklı ve zamansız ürünlerle evinizde daha düzenli alanlar oluşturun.")}
          </span>
          <Link href="/collections/all" className="button">
            {t("Şimdi keşfet")} <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="section products-section">
        <div className="section-heading">
          <div>
            <small>{t("ÖNE ÇIKANLAR")}</small>
            <h2>{t("Ev için akıllı seçimler")}</h2>
          </div>
          <Link href="/collections/all">
            {t("Tümünü gör")} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="products">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} onAdd={onAdd} />
          ))}
        </div>
      </section>

      <section className="feature">
        <div className="feature-image">
          <img src={featureDryingImage} alt={dryingProduct.name} />
        </div>
        <div className="feature-copy">
          <small>{t("ALAN KAZANDIRAN ÇÖZÜMLER")}</small>
          <h2>{t("Her santimetreyi işe dönüştürün.")}</h2>
          <p>
            {t("Katlanabilir ve kompakt ürünlerle yaşam alanınızı verimli kullanın. Sağlam malzemeler ve sade çizgiler günlük rutininize kolaylık katar.")}
          </p>
          <Link href="/collections/kurutmalıklar" className="button outline">
            {t("Koleksiyonu incele")} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="section new-arrivals">
        <div className="section-heading">
          <div>
            <small>{t("YENİ SEÇİMLER")}</small>
            <h2>{t("Günlük kullanım için tasarlandı")}</h2>
          </div>
          <Link href="/collections/all">
            {t("Tüm ürünler")} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="products">
          {newProducts.map((p) => (
            <ProductCard key={p.slug} product={p} onAdd={onAdd} />
          ))}
        </div>
      </section>

      <section className="section categories">
        <div className="section-heading">
          <div>
            <small>{t("EVİNİZ, SİZİN DÜZENİNİZ")}</small>
            <h2>{t("Koleksiyonları keşfedin")}</h2>
          </div>
        </div>
        <div className="category-grid">
          <Link href="/collections/kurutmalıklar" className="category">
            <div className="category-image">
              <img src={dryingCategoryImage} alt="Kurutmalıklar" />
            </div>
            <div>
              <h3>{category("Kurutmalıklar")}</h3>
              <span>
                {t("Ürünlere git")} <ArrowRight size={15} />
              </span>
            </div>
          </Link>
          <Link href="/collections/ütü%20masaları" className="category">
            <div className="category-image">
              <img src={boardCategoryImage} alt="Ütü masaları" />
            </div>
            <div>
              <h3>{category("Ütü Masaları")}</h3>
              <span>
                {t("Ürünlere git")} <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="quotes">
        <p>
          “{t("İyi tasarım, evdeki küçük sorunları fark eder ve onları zahmetsiz çözümlere dönüştürür.")}”
        </p>
        <span>ALYA HOMES</span>
      </section>

      <section className="design-story">
        <div className="design-story-intro">
          <small>{t("TASARIM FELSEFEMİZ")}</small>
          <h2>
            {t("Daha az karmaşa. Daha iyi yaşam.")}
          </h2>
          <p>
            {t("Her üründe işlevi, dayanıklılığı ve sade estetiği bir araya getiriyoruz.")}
          </p>
        </div>
        <div className="story-grid">
          <div>
            <ShieldCheck size={22} />
            <h3>{t("Uzun ömürlü")}</h3>
            <p>{t("Günlük kullanıma uygun, dayanıklı malzemeler.")}</p>
          </div>
          <div>
            <Sparkles size={22} />
            <h3>{t("Düşünülmüş detaylar")}</h3>
            <p>{t("Her hareketi kolaylaştıran pratik çözümler.")}</p>
          </div>
          <div>
            <RotateCcw size={22} />
            <h3>{t("Kolay kullanım")}</h3>
            <p>{t("Katlanabilir, taşınabilir ve yer kazandıran yapılar.")}</p>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div>
          <Truck size={20} />
          <strong>{isCatalogMode ? t("İşlevsel tasarım") : "Ücretsiz kargo"}</strong>
          <span>
            {isCatalogMode
              ? t("Günlük yaşamı kolaylaştıran çözümler")
              : "1.000 TL üzeri siparişlerde"}
          </span>
        </div>
        <div>
          <ShieldCheck size={20} />
          <strong>{isCatalogMode ? t("Dayanıklı yapı") : "Güvenli alışveriş"}</strong>
          <span>
            {isCatalogMode ? t("Uzun ömürlü malzeme seçimi") : "Korunan ödeme akışı"}
          </span>
        </div>
        <div>
          <Sparkles size={20} />
          <strong>{t("3 yıl garanti")}</strong>
          <span>{t("Güvenle kullanın")}</span>
        </div>
        <div>
          <RotateCcw size={20} />
          <strong>{isCatalogMode ? t("Ürün desteği") : "Kolay iade"}</strong>
          <span>{isCatalogMode ? t("ALYA HOMES iletişim desteği") : "30 gün içinde"}</span>
        </div>
      </section>

      <section className="newsletter">
        <small>{t("ALYA HOMES BÜLTENİ")}</small>
        <h2>{t("İlk siz haberdar olun.")}</h2>
        <p>
          {t("Yeni ürünler, ilham veren fikirler ve kampanyalar e-postanıza gelsin.")}
        </p>
        {newsletterSent ? (
          <div className="newsletter-success">
            {t("Teşekkürler. Kaydınız alındı.")}
          </div>
        ) : (
          <form
            className="signup"
            onSubmit={(e) => {
              e.preventDefault();
              if (newsletterEmail.trim()) setNewsletterSent(true);
            }}
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={t("E-posta adresiniz")}
            />
            <button>{t("Kayıt ol")}</button>
          </form>
        )}
      </section>
    </main>
  );
}
