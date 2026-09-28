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
  return (
    <article className="product">
      <Link href={`/products/${product.slug}`}>
        <div className="product-image">
          <span>{product.category}</span>
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
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-meta">
          <span className="code">{product.code}</span>
          <h3>{product.name}</h3>
          <p>{money(product.price)}</p>
        </div>
      </Link>
      <button className="add" onClick={() => onAdd(product)}>
        {product.price == null ? "Fiyat iste" : "Sepete ekle"}
      </button>
    </article>
  );
}

export default function Home() {
  const { addToCart } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [added, setAdded] = useState("");
  const featured = products.slice(0, 4);
  const newProducts = products.slice(5, 9);
  const dryingProduct =
    products.find((p) => p.code === "AHDRY1409") || products[8] || products[0];
  const dryingCategoryImage = "/category-drying.webp";
  const boardCategoryImage = "/category-ironing.webp";
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
      {added && (
        <div className="add-toast">
          Sepete eklendi <strong>{added}</strong>
        </div>
      )}
      <section className="hero">
        <div className="hero-copy">
          <p>ALYA HOMES / AKILLI EV ÇÖZÜMLERİ</p>
          <h1>
            Günlük hayatı
            <br />
            hafifleten tasarım.
          </h1>
          <span>
            İşlevsel, dayanıklı ve zamansız ürünlerle evinizde daha düzenli
            alanlar oluşturun.
          </span>
          <Link href="/collections/all" className="button">
            Şimdi keşfet <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="section products-section">
        <div className="section-heading">
          <div>
            <small>ÖNE ÇIKANLAR</small>
            <h2>Ev için akıllı seçimler</h2>
          </div>
          <Link href="/collections/all">
            Tümünü gör <ArrowRight size={16} />
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
          <img src={dryingProduct.image} alt={dryingProduct.name} />
        </div>
        <div className="feature-copy">
          <small>ALAN KAZANDIRAN ÇÖZÜMLER</small>
          <h2>Her santimetreyi işe dönüştürün.</h2>
          <p>
            Katlanabilir ve kompakt ürünlerle yaşam alanınızı verimli kullanın.
            Sağlam malzemeler ve sade çizgiler günlük rutininize kolaylık katar.
          </p>
          <Link href="/collections/kurutmalıklar" className="button outline">
            Koleksiyonu incele <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="section new-arrivals">
        <div className="section-heading">
          <div>
            <small>YENİ SEÇİMLER</small>
            <h2>Günlük kullanım için tasarlandı</h2>
          </div>
          <Link href="/collections/all">
            Tüm ürünler <ArrowRight size={16} />
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
            <small>EVİNİZ, SİZİN DÜZENİNİZ</small>
            <h2>Koleksiyonları keşfedin</h2>
          </div>
        </div>
        <div className="category-grid">
          <Link href="/collections/kurutmalıklar" className="category">
            <div className="category-image">
              <img src={dryingCategoryImage} alt="Kurutmalıklar" />
            </div>
            <div>
              <h3>Kurutmalıklar</h3>
              <span>
                Ürünlere git <ArrowRight size={15} />
              </span>
            </div>
          </Link>
          <Link href="/collections/ütü%20masaları" className="category">
            <div className="category-image">
              <img src={boardCategoryImage} alt="Ütü masaları" />
            </div>
            <div>
              <h3>Ütü Masaları</h3>
              <span>
                Ürünlere git <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="quotes">
        <p>
          “İyi tasarım, evdeki küçük sorunları fark eder ve onları zahmetsiz
          çözümlere dönüştürür.”
        </p>
        <span>ALYA HOMES</span>
      </section>

      <section className="design-story">
        <div className="design-story-intro">
          <small>TASARIM FELSEFEMİZ</small>
          <h2>
            Daha az karmaşa.
            <br />
            Daha iyi yaşam.
          </h2>
          <p>
            Her üründe işlevi, dayanıklılığı ve sade estetiği bir araya
            getiriyoruz.
          </p>
        </div>
        <div className="story-grid">
          <div>
            <ShieldCheck size={22} />
            <h3>Uzun ömürlü</h3>
            <p>Günlük kullanıma uygun, dayanıklı malzemeler.</p>
          </div>
          <div>
            <Sparkles size={22} />
            <h3>Düşünülmüş detaylar</h3>
            <p>Her hareketi kolaylaştıran pratik çözümler.</p>
          </div>
          <div>
            <RotateCcw size={22} />
            <h3>Kolay kullanım</h3>
            <p>Katlanabilir, taşınabilir ve yer kazandıran yapılar.</p>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div>
          <Truck size={20} />
          <strong>Ücretsiz kargo</strong>
          <span>1.000 TL üzeri siparişlerde</span>
        </div>
        <div>
          <ShieldCheck size={20} />
          <strong>Güvenli alışveriş</strong>
          <span>Korunan ödeme akışı</span>
        </div>
        <div>
          <Sparkles size={20} />
          <strong>3 yıl garanti</strong>
          <span>Güvenle kullanın</span>
        </div>
        <div>
          <RotateCcw size={20} />
          <strong>Kolay iade</strong>
          <span>30 gün içinde</span>
        </div>
      </section>

      <section className="newsletter">
        <small>ALYA HOMES BÜLTENİ</small>
        <h2>İlk siz haberdar olun.</h2>
        <p>
          Yeni ürünler, ilham veren fikirler ve kampanyalar e-postanıza gelsin.
        </p>
        {newsletterSent ? (
          <div className="newsletter-success">
            Teşekkürler. Kaydınız alındı.
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
              placeholder="E-posta adresiniz"
            />
            <button>Kayıt ol</button>
          </form>
        )}
      </section>
    </main>
  );
}
