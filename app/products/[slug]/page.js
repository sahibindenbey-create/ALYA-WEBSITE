"use client";
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight, Mail, X, Check, Truck, ShieldCheck } from 'lucide-react';
import { use, useMemo, useState } from 'react';
import { useStore } from '../../store';
import ProductGallery from '../../components/ProductGallery';

const money = n => n == null
  ? 'Fiyat bilgisi için iletişime geçin'
  : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

const makeFeatures = p => {
  const features = [];
  const specs = p.specs || {};
  if (p.category === 'Kurutmalıklar') {
    features.push('Alüminyum ve paslanmaz gövde');
    if (/BALCONY/i.test(p.name)) features.push('Balkon kullanımına uygun ayarlanabilir yapı');
    else features.push('Katlanabilir ve kolay saklanabilir tasarım');
    if (/RAW/i.test(p.name)) features.push('RAW seri yüzey ve gövde tasarımı');
    else features.push('Geniş kurutma kapasitesi');
  } else if (p.category === 'Ütü Masaları') {
    features.push(specs.malzeme ? `${specs.malzeme} gövde yapısı` : 'Dayanıklı gövde yapısı');
    features.push('Ayarlanabilir çalışma yüksekliği');
    if (/PROBOARD/i.test(p.name)) features.push('Geniş ütüleme alanı ve güçlü taşıyıcı yapı');
    if (/EASYBOARD/i.test(p.name)) features.push('Pratik kullanım ve kolay saklama');
    if (/STEEL/i.test(p.name)) features.push('Çelik konstrüksiyon');
    if (/HYBRID/i.test(p.name)) features.push('Alüminyum tabla ve çelik ayak kombinasyonu');
  }
  return [...new Set(features)].slice(0, 5);
};

export default function ProductPage({ params }) {
  const { slug } = use(params);
  const { addToCart, toggleWishlist, isWishlisted, getProduct, getProducts } = useStore();
  const p = getProduct(slug);
  const products = getProducts();
  const [notify, setNotify] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const related = useMemo(
    () => p ? products.filter(x => x.category === p.category && x.slug !== p.slug).slice(0, 4) : [],
    [p, products]
  );

  if (!p) return <main className="not-found"><h1>Ürün bulunamadı</h1><Link href="/collections/all">Ürünlere dön</Link></main>;

  const wish = isWishlisted(p.slug);
  const features = makeFeatures(p);
  const specs = Object.entries(p.specs || {});

  return (
    <main className="alya-product-page">
      <div className="alya-product-breadcrumbs">
        <Link href="/">Ana sayfa</Link><span>/</span>
        <Link href={`/collections/${encodeURIComponent(p.category.toLowerCase())}`}>{p.category}</Link><span>/</span>
        <strong>{p.name}</strong>
      </div>

      <section className="alya-product-main">
        <div className="alya-product-media">
          <ProductGallery product={p} />
          <p className="alya-image-note">Ürün görseli temsilidir. Renk ve yüzey detayları ürün serisine göre değişebilir.</p>
        </div>

        <div className="alya-product-info">
          <span className="alya-eyebrow">{p.category}</span>
          <h1>{p.name}</h1>
          <p className="alya-product-code">Ürün Kodu: {p.code}</p>
          <div className="alya-price">{money(p.price)}</div>
          <p className="alya-description">{p.description}</p>

          <div className="alya-feature-list">
            {features.map(feature => <div key={feature}><Check size={17} /><span>{feature}</span></div>)}
          </div>

          {p.price == null ? (
            <>
              <div className="alya-detail-note">Bu ürünün online satış fiyatı henüz tanımlanmadı. Fiyat, stok ve toplu alım bilgisi için bizimle iletişime geçebilirsiniz.</div>
              <button className="alya-primary-button" onClick={() => setNotify(true)}><Mail size={18} /> Stok geldiğinde haber ver</button>
            </>
          ) : (
            <button className="alya-primary-button" onClick={() => addToCart(p)}><ShoppingBag size={19} /> Sepete ekle</button>
          )}
          <button className="alya-wish-button" onClick={() => toggleWishlist(p)}>
            <Heart size={18} fill={wish ? 'currentColor' : 'none'} /> {wish ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          </button>

          <div className="alya-service-grid">
            <div><Truck size={19} /><span><b>Güvenli gönderim</b>Ürün stok durumuna göre sevkiyat</span></div>
            <div><ShieldCheck size={19} /><span><b>ALYA HOMES</b>Ürün ve sipariş desteği</span></div>
          </div>
        </div>
      </section>

      <section className="alya-spec-section">
        <div><span className="alya-eyebrow">ÜRÜN BİLGİLERİ</span><h2>Teknik özellikler</h2></div>
        <div className="alya-spec-grid">
          {specs.map(([key, value]) => <div className="alya-spec-card" key={key}><span>{key}</span><strong>{value}</strong></div>)}
        </div>
      </section>

      {related.length > 0 && <section className="alya-related">
        <div className="alya-section-heading"><div><span className="alya-eyebrow">AYNI SERİDEN</span><h2>Benzer ürünler</h2></div><Link href={`/collections/${encodeURIComponent(p.category.toLowerCase())}`}>Tümünü gör <ArrowRight size={16} /></Link></div>
        <div className="alya-related-grid">
          {related.map(x => <Link className="alya-related-card" href={`/products/${x.slug}`} key={x.slug}>
            <div className="alya-related-image"><img src={x.image} alt={x.name} /></div>
            <h3>{x.name}</h3><p>{money(x.price)}</p>
          </Link>)}
        </div>
      </section>}

      {notify && <div className="modal-backdrop" onClick={() => setNotify(false)}>
        <div className="notify-modal" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setNotify(false)}><X size={20} /></button>
          {sent ? <><h2>Talebiniz alındı</h2><p>Ürünle ilgili gelişme olduğunda verdiğiniz e-posta adresini kullanacağız.</p></> : <>
            <Mail size={25} /><h2>Haberdar olun</h2><p>{p.name} için stok bildirimi almak üzere e-posta adresinizi bırakın.</p>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta adresiniz" type="email" />
            <button className="modal-confirm" disabled={!email.includes('@')} onClick={() => setSent(true)}>Beni haberdar et</button>
          </>}
        </div>
      </div>}

      <style jsx>{`
        .alya-product-page{padding:34px 5% 100px;max-width:1440px;margin:auto}
        .alya-product-breadcrumbs{display:flex;gap:9px;align-items:center;color:#777;font-size:11px;margin-bottom:48px}.alya-product-breadcrumbs strong{color:#171717;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.alya-product-main{display:grid;grid-template-columns:minmax(0,1.16fr) minmax(360px,.84fr);gap:6%;align-items:start}.alya-product-media{min-width:0;max-width:780px}.alya-image-note{font-size:10px;color:#888;margin:10px 0}.alya-product-info{padding:4px 0 0}.alya-eyebrow{font-size:10px;letter-spacing:1.7px;font-weight:700;color:#777}.alya-product-info h1{font-size:clamp(36px,4vw,54px);line-height:1.02;font-weight:500;letter-spacing:-2.2px;margin:12px 0 9px;max-width:650px}.alya-product-code{font-size:11px;color:#888;margin:0}.alya-price{font-size:22px;font-weight:500;margin:25px 0}.alya-description{max-width:570px;color:#555;font-size:13px;line-height:1.8;margin:0 0 26px}.alya-feature-list{border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:7px 0;margin:0 0 25px;max-width:590px}.alya-feature-list div{display:flex;align-items:center;gap:9px;padding:9px 0;font-size:12px}.alya-feature-list svg{color:#f58a1f;flex:none}.alya-detail-note{font-size:11px;line-height:1.6;color:#666;background:#f6f4f0;padding:15px;margin-bottom:14px;max-width:590px}.alya-primary-button{width:100%;max-width:590px;background:#f58a1f;color:#fff;padding:17px 22px;display:flex;justify-content:center;align-items:center;gap:9px;font-size:12px}.alya-wish-button{width:100%;max-width:590px;margin-top:9px;border:1px solid #171717;padding:15px;font-size:12px;display:flex;justify-content:center;align-items:center;gap:8px}.alya-service-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:25px;max-width:590px}.alya-service-grid div{border-top:1px solid #ddd;padding-top:14px;display:flex;gap:9px;color:#777;font-size:10px;line-height:1.5}.alya-service-grid svg{flex:none;color:#171717}.alya-service-grid b{display:block;color:#171717;font-size:10px;margin-bottom:2px}.alya-spec-section{border-top:1px solid #ddd;margin-top:85px;padding-top:34px;display:grid;grid-template-columns:.7fr 1.3fr;gap:6%}.alya-spec-section h2,.alya-related h2{font-size:32px;font-weight:500;letter-spacing:-1px;margin:9px 0}.alya-spec-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:#ddd}.alya-spec-card{background:#fff;padding:18px 20px;display:flex;justify-content:space-between;gap:20px}.alya-spec-card span{text-transform:capitalize;color:#777;font-size:11px}.alya-spec-card strong{font-size:12px;font-weight:600;text-align:right}.alya-related{margin-top:95px}.alya-section-heading{display:flex;justify-content:space-between;align-items:end;margin-bottom:28px}.alya-section-heading>a{display:flex;gap:7px;align-items:center;border-bottom:1px solid #171717;padding-bottom:4px;font-size:11px}.alya-related-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:17px}.alya-related-image{aspect-ratio:1/1.12;background:#f2f0ec;overflow:hidden}.alya-related-image img{width:100%;height:100%;object-fit:contain;display:block}.alya-related-card h3{font-size:13px;font-weight:500;margin:13px 0 7px}.alya-related-card p{font-size:12px;margin:0}
        @media(max-width:900px){.alya-product-main{grid-template-columns:1fr;gap:30px}.alya-product-media{max-width:none}.alya-product-info{max-width:760px}.alya-spec-section{grid-template-columns:1fr;gap:20px}.alya-related-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:650px){.alya-product-page{padding:25px 18px 70px}.alya-product-breadcrumbs{flex-wrap:wrap;margin-bottom:28px}.alya-product-info h1{font-size:38px;letter-spacing:-1.5px}.alya-service-grid{grid-template-columns:1fr}.alya-spec-grid{grid-template-columns:1fr}.alya-related-grid{grid-template-columns:repeat(2,1fr)}.alya-spec-section{margin-top:55px}.alya-related{margin-top:65px}}
      `}</style>
    </main>
  );
}
