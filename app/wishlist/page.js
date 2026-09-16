"use client";
import Link from 'next/link';
import { Heart, ArrowRight, ShoppingBag, X, Check } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store';

const money=n=>n==null?'Fiyat için iletişime geçin':new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(n);

export default function Wishlist(){
  const {wishlist,toggleWishlist,addToCart}=useStore();
  const [added,setAdded]=useState({});
  const add=(p)=>{if(addToCart(p))setAdded(x=>({...x,[p.slug]:true}));};
  return <main className="wishlist-page">
    <div className="collection-hero">
      <small>ALYA HOMES</small>
      <h1>Favoriler</h1>
      <p>{wishlist.length} ürün</p>
    </div>
    {!wishlist.length?
      <div className="empty-state">
        <Heart size={38}/>
        <h2>Henüz favoriniz yok.</h2>
        <p>Beğendiğiniz ürünleri kalp simgesine dokunarak kaydedin.</p>
        <Link className="button dark" href="/collections/all">Ürünleri keşfet <ArrowRight size={16}/></Link>
      </div>
      :<>
        <div className="wishlist-intro">
          <p>Seçtiğiniz ürünleri buradan tekrar inceleyebilir veya doğrudan sepetinize ekleyebilirsiniz.</p>
          <Link href="/collections/all">Alışverişe devam et <ArrowRight size={15}/></Link>
        </div>
        <div className="catalog-grid wishlist-grid">
          {wishlist.map(p=><article className="catalog-card wishlist-card" key={p.slug}>
            <Link href={`/products/${p.slug}`} className="wishlist-product-link">
              <div className="catalog-image"><img src={p.image} alt={p.name}/></div>
              <span className="code">{p.code}</span>
              <h2>{p.name}</h2>
              <p>{money(p.price)}</p>
            </Link>
            <div className="wishlist-actions">
              {p.price!=null&&<button className="button dark wishlist-add" onClick={()=>add(p)} disabled={added[p.slug]}>{added[p.slug]?<><Check size={15}/> Eklendi</>:<><ShoppingBag size={15}/> Sepete ekle</>}</button>}
              <button className="remove-wish" onClick={()=>toggleWishlist(p)} aria-label={`${p.name} ürününü favorilerden çıkar`}><X size={15}/> Favoriden çıkar</button>
            </div>
          </article>)}
        </div>
      </>
    }
    <style jsx>{`
      .wishlist-intro{display:flex;justify-content:space-between;gap:24px;align-items:center;margin:0 0 30px;padding:18px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd;font-size:12px;color:#666}.wishlist-intro p{margin:0}.wishlist-intro a{display:flex;align-items:center;gap:7px;color:#171717;border-bottom:1px solid #171717;padding-bottom:3px;white-space:nowrap}.wishlist-card{position:relative}.wishlist-product-link{display:block}.wishlist-actions{display:flex;gap:8px;margin-top:13px;align-items:stretch}.wishlist-add{flex:1;border:0;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;font-size:11px}.wishlist-add:disabled{opacity:.7;cursor:default}.remove-wish{border:1px solid #ddd;background:#fff;padding:10px 12px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:10px;color:#555;cursor:pointer}.remove-wish:hover{border-color:#171717;color:#171717}@media(max-width:700px){.wishlist-intro{align-items:flex-start;flex-direction:column}.wishlist-actions{flex-direction:column}.remove-wish{min-height:40px}}
    `}</style>
  </main>
}
