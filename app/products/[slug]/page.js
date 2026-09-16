"use client";
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight, Mail, X, Check, Truck, ShieldCheck, Minus, Plus, ChevronDown } from 'lucide-react';
import { use, useMemo, useState } from 'react';
import { useStore } from '../../store';
import ProductGallery from '../../components/ProductGallery';

const money = n => n == null ? 'Fiyat bilgisi için iletişime geçin' : `${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(n)} TL.`;
const makeFeatures = p => { const features=[]; const specs=p.specs||{}; if(p.category==='Kurutmalıklar'){features.push('Alüminyum ve paslanmaz gövde'); features.push(/BALCONY/i.test(p.name)?'Balkon kullanımına uygun ayarlanabilir yapı':'Katlanabilir ve kolay saklanabilir tasarım'); features.push(/RAW/i.test(p.name)?'RAW seri yüzey ve gövde tasarımı':'Geniş kurutma kapasitesi');} else if(p.category==='Ütü Masaları'){features.push(specs.malzeme?`${specs.malzeme} gövde yapısı`:'Dayanıklı gövde yapısı');features.push('Ayarlanabilir çalışma yüksekliği');if(/PROBOARD/i.test(p.name))features.push('Geniş ütüleme alanı ve güçlü taşıyıcı yapı');if(/EASYBOARD/i.test(p.name))features.push('Pratik kullanım ve kolay saklama');if(/STEEL/i.test(p.name))features.push('Çelik konstrüksiyon');if(/HYBRID/i.test(p.name))features.push('Alüminyum tabla ve çelik ayak kombinasyonu');} return [...new Set(features)].slice(0,5);};

export default function ProductPage({ params }) {
  const { slug }=use(params); const {addToCart,toggleWishlist,isWishlisted,getProduct,getProducts}=useStore(); const p=getProduct(slug); const products=getProducts();
  const [notify,setNotify]=useState(false),[email,setEmail]=useState(''),[sent,setSent]=useState(false),[quantity,setQuantity]=useState(1),[openPanel,setOpenPanel]=useState('details');
  const related=useMemo(()=>p?products.filter(x=>x.category===p.category&&x.slug!==p.slug).slice(0,4):[],[p,products]);
  if(!p)return <main className="not-found"><h1>Ürün bulunamadı</h1><Link href="/collections/all">Ürünlere dön</Link></main>;
  const wish=isWishlisted(p.slug),features=makeFeatures(p),specs=Object.entries(p.specs||{});
  const color=p.specs?.renk||p.specs?.renkler||'';
  const addSelectedToCart=()=>{for(let i=0;i<quantity;i++)addToCart(p);};
  const togglePanel=panel=>setOpenPanel(current=>current===panel?'':panel);
  return <main className="alya-product-page">
    <div className="alya-product-breadcrumbs"><Link href="/">Ana sayfa</Link><span>/</span><Link href={`/collections/${encodeURIComponent(p.category.toLowerCase())}`}>{p.category}</Link><span>/</span><strong>{p.name}</strong></div>
    <section className="alya-product-main">
      <div className="alya-product-media"><ProductGallery product={p}/><p className="alya-image-note">Ürün görseli temsilidir. Renk ve yüzey detayları ürün serisine göre değişebilir.</p></div>
      <div className="alya-product-info">
        <span className="alya-eyebrow">{p.category}</span>
        <h1>{p.name}</h1>
        <p className="alya-product-code">Ürün Kodu: {p.code}</p>
        <div className="alya-price">{money(p.price)}</div>
        {color&&<div className="alya-option"><span>Renk:</span><strong>{color}</strong></div>}
        <div className="alya-purchase-row">
          <div className="alya-quantity"><button type="button" onClick={()=>setQuantity(q=>Math.max(1,q-1))} aria-label="Adedi azalt"><Minus size={15}/></button><span>{quantity}</span><button type="button" onClick={()=>setQuantity(q=>q+1)} aria-label="Adedi artır"><Plus size={15}/></button></div>
          {p.price==null?<button className="alya-primary-button" onClick={()=>setNotify(true)}><Mail size={18}/> Fiyat ve stok bilgisi al</button>:<button className="alya-primary-button" onClick={addSelectedToCart}><ShoppingBag size={19}/> Sepete ekle</button>}
        </div>
        <button className="alya-wish-button" onClick={()=>toggleWishlist(p)}><Heart size={18} fill={wish?'currentColor':'none'}/>{wish?'Favorilerden çıkar':'Favorilere ekle'}</button>
        <div className="alya-delivery-note"><Truck size={19}/><div><b>Güvenli gönderim</b><span>Ürün stok durumuna göre sevkiyat</span></div></div>
        <div className="alya-points-note"><ShieldCheck size={19}/><div><b>ALYA HOMES</b><span>Ürün ve sipariş desteği</span></div></div>

        <div className="alya-accordion">
          <button type="button" className="alya-accordion-trigger" onClick={()=>togglePanel('details')} aria-expanded={openPanel==='details'}><span>Detaylar</span><ChevronDown size={18} className={openPanel==='details'?'is-open':''}/></button>
          {openPanel==='details'&&<div className="alya-accordion-content"><p>{p.description}</p><ul>{features.map(f=><li key={f}><Check size={15}/><span>{f}</span></li>)}</ul></div>}
        </div>

        <div className="alya-accordion">
          <button type="button" className="alya-accordion-trigger" onClick={()=>togglePanel('specs')} aria-expanded={openPanel==='specs'}><span>Teknik özellikler</span><ChevronDown size={18} className={openPanel==='specs'?'is-open':''}/></button>
          {openPanel==='specs'&&<div className="alya-accordion-content alya-spec-list">{specs.length?specs.map(([k,v])=><div className="alya-spec-row" key={k}><span>{k}</span><strong>{v}</strong></div>):<p>Teknik özellikler yakında eklenecektir.</p>}</div>}
        </div>

        <div className="alya-accordion">
          <button type="button" className="alya-accordion-trigger" onClick={()=>togglePanel('shipping')} aria-expanded={openPanel==='shipping'}><span>Kargo ve iade</span><ChevronDown size={18} className={openPanel==='shipping'?'is-open':''}/></button>
          {openPanel==='shipping'&&<div className="alya-accordion-content"><p>ALYA HOMES siparişleri ürünün stok ve sevkiyat durumuna göre anlaşmalı taşıyıcılarla gönderilir. Pazaryeri operasyonlarında kullanılan başlıca taşıyıcılar arasında Trendyol Express, Aras Kargo, DHL eCommerce, Sürat Kargo, Yurtiçi Kargo, PTT Kargo, Kolay Gelsin, Horoz ve CEVA bulunur.</p><div className="alya-carrier-list"><span>Trendyol Express</span><span>Aras Kargo</span><span>DHL eCommerce</span><span>Sürat Kargo</span><span>Yurtiçi Kargo</span><span>PTT Kargo</span><span>Kolay Gelsin</span><span>Horoz</span><span>CEVA</span><span>HepsiJet</span></div><p className="alya-shipping-note">Siparişinize atanacak kargo firması; ürün, adres, desi ve ilgili taşıyıcı anlaşmasına göre değişebilir. Teslimat ve iade koşulları sipariş aşamasında güncel bilgilerle gösterilir.</p></div>}
        </div>

        <div className="alya-accordion">
          <button type="button" className="alya-accordion-trigger" onClick={()=>togglePanel('reviews')} aria-expanded={openPanel==='reviews'}><span>Değerlendirmeler</span><ChevronDown size={18} className={openPanel==='reviews'?'is-open':''}/></button>
          {openPanel==='reviews'&&<div className="alya-accordion-content"><p>Bu ürün için henüz değerlendirme bulunmuyor.</p></div>}
        </div>
      </div>
    </section>

    {related.length>0&&<section className="alya-related"><div className="alya-section-heading"><div><span className="alya-eyebrow">AYNI SERİDEN</span><h2>Benzer ürünler</h2></div><Link href={`/collections/${encodeURIComponent(p.category.toLowerCase())}`}>Tümünü gör <ArrowRight size={16}/></Link></div><div className="alya-related-grid">{related.map(x=><Link className="alya-related-card" href={`/products/${x.slug}`} key={x.slug}><div className="alya-related-image"><img src={x.image} alt={x.name}/></div><h3>{x.name}</h3><p>{money(x.price)}</p></Link>)}</div></section>}
    {notify&&<div className="modal-backdrop" onClick={()=>setNotify(false)}><div className="notify-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setNotify(false)}><X size={20}/></button>{sent?<><h2>Talebiniz alındı</h2><p>Ürünle ilgili gelişme olduğunda verdiğiniz e-posta adresini kullanacağız.</p></>:<><Mail size={25}/><h2>Haberdar olun</h2><p>{p.name} için stok bildirimi almak üzere e-posta adresinizi bırakın.</p><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-posta adresiniz" type="email"/><button className="modal-confirm" disabled={!email.includes('@')} onClick={()=>setSent(true)}>Beni haberdar et</button></>}</div></div>}
    <style jsx>{`
      .alya-product-page{padding:34px 5% 100px;max-width:1440px;margin:auto}.alya-product-breadcrumbs{display:flex;gap:9px;align-items:center;color:#777;font-size:11px;margin-bottom:42px}.alya-product-breadcrumbs strong{color:#171717;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.alya-product-main{display:grid;grid-template-columns:minmax(0,1.18fr) minmax(390px,.82fr);gap:6%;align-items:start}.alya-product-media{min-width:0;max-width:820px}.alya-image-note{font-size:10px;color:#888;margin:10px 0}.alya-product-info{padding:2px 0 0;max-width:570px}.alya-eyebrow{font-size:10px;letter-spacing:1.7px;font-weight:700;color:#777}.alya-product-info h1{font-size:clamp(38px,3.7vw,52px);line-height:1.04;font-weight:500;letter-spacing:-2.1px;margin:12px 0 8px}.alya-product-code{font-size:11px;color:#888;margin:0}.alya-price{font-size:22px;font-weight:500;margin:24px 0 21px}.alya-option{border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:15px 0;display:flex;gap:7px;font-size:12px;margin-bottom:17px}.alya-option span{color:#777}.alya-option strong{font-weight:600}.alya-purchase-row{display:grid;grid-template-columns:116px 1fr;gap:10px}.alya-quantity{height:52px;border:1px solid #ccc;display:grid;grid-template-columns:34px 1fr 34px;align-items:center;text-align:center}.alya-quantity button{height:100%;border:0;background:transparent;display:grid;place-items:center;cursor:pointer}.alya-quantity span{font-size:12px}.alya-primary-button{min-height:52px;background:#f58a1f;color:#fff;border:0;padding:15px 18px;display:flex;justify-content:center;align-items:center;gap:9px;font-size:12px;cursor:pointer}.alya-wish-button{width:100%;margin-top:10px;border:1px solid #171717;background:#fff;padding:15px;font-size:12px;display:flex;justify-content:center;align-items:center;gap:8px;cursor:pointer}.alya-delivery-note,.alya-points-note{border-top:1px solid #ddd;padding:15px 0;display:flex;gap:10px;color:#777;font-size:10px;line-height:1.5}.alya-delivery-note{margin-top:24px}.alya-delivery-note svg,.alya-points-note svg{flex:none;color:#171717}.alya-delivery-note b,.alya-points-note b{display:block;color:#171717;font-size:10px;margin-bottom:2px}
      .alya-accordion{border-top:1px solid #ddd}.alya-accordion:last-child{border-bottom:1px solid #ddd}.alya-accordion-trigger{width:100%;border:0;background:transparent;padding:19px 0;display:flex;justify-content:space-between;align-items:center;text-align:left;font-size:13px;font-weight:600;cursor:pointer}.alya-accordion-trigger svg{transition:transform .2s ease}.alya-accordion-trigger svg.is-open{transform:rotate(180deg)}.alya-accordion-content{padding:0 0 22px;color:#555;font-size:12px;line-height:1.75}.alya-accordion-content p{margin:0 0 13px}.alya-accordion-content ul{list-style:none;padding:0;margin:0}.alya-accordion-content li{display:flex;gap:8px;padding:5px 0;font-size:11px;line-height:1.5}.alya-accordion-content li svg{color:#f58a1f;flex:none;margin-top:3px}.alya-spec-list{display:grid;gap:0}.alya-spec-row{display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-top:1px solid #eee}.alya-spec-row:first-child{border-top:0}.alya-spec-row span{color:#777;text-transform:capitalize}.alya-spec-row strong{text-align:right;color:#171717;font-weight:600}.alya-carrier-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0 18px}.alya-carrier-list span{border:1px solid #e4e4e4;padding:9px 10px;background:#fafafa;color:#333;font-size:10px}.alya-shipping-note{font-size:10px;color:#777}
      .alya-related{margin-top:95px;border-top:1px solid #ddd;padding-top:34px}.alya-section-heading{display:flex;justify-content:space-between;align-items:end;margin-bottom:28px}.alya-section-heading>a{display:flex;gap:7px;align-items:center;border-bottom:1px solid #171717;padding-bottom:4px;font-size:11px}.alya-related h2{font-size:32px;font-weight:500;letter-spacing:-1px;margin:9px 0}.alya-related-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:17px}.alya-related-image{aspect-ratio:1/1.12;background:#f2f0ec;overflow:hidden}.alya-related-image img{width:100%;height:100%;object-fit:contain;display:block}.alya-related-card h3{font-size:13px;font-weight:500;margin:13px 0 7px}.alya-related-card p{font-size:12px;margin:0}
      @media(max-width:900px){.alya-product-main{grid-template-columns:1fr;gap:30px}.alya-product-media{max-width:none}.alya-product-info{max-width:760px}.alya-related-grid{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:650px){.alya-product-page{padding:25px 18px 70px}.alya-product-breadcrumbs{flex-wrap:wrap;margin-bottom:28px}.alya-product-info h1{font-size:38px;letter-spacing:-1.5px}.alya-purchase-row{grid-template-columns:100px 1fr}.alya-carrier-list{grid-template-columns:1fr}.alya-related-grid{grid-template-columns:repeat(2,1fr)}.alya-related{margin-top:65px}}
    `}</style>
  </main>;
}
