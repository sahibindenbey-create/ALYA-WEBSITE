"use client";
import {useState} from 'react';
import Link from 'next/link';
import {Menu,X,ChevronDown,Heart,UserRound,ShoppingBag,Search,ArrowRight} from 'lucide-react';
import {categories} from '../products';
import {useStore} from '../store';

export default function SiteHeader(){
  const [menuOpen,setMenuOpen]=useState(false);
  const {count,wishlistCount}=useStore();
  return <>
    <div className="announcement">1.000 TL ve üzeri siparişlerde ücretsiz kargo</div>
    <header>
      <div className="utility">
        <div className="utility-links">
          <span>3 yıl garanti</span><span>30 gün içinde kolay iade</span><span>Güvenli ödeme</span>
          <span>Türkiye / TRY</span>
        </div>
      </div>
      <div className="main-header">
        <button className="mobile-menu" onClick={()=>setMenuOpen(true)} aria-label="Menüyü aç"><Menu/></button>
        <Link href="/" className="brand-logo" aria-label="ALYA HOMES ana sayfa"><img src="/alya-homes-logo.png" alt="ALYA HOMES"/></Link>
        <nav>
          <Link href="/collections/all">Tüm Ürünler</Link>
          <Link href="/collections/kurutmalıklar">Kurutmalıklar <ChevronDown size={13}/></Link>
          <Link href="/collections/ütü%20masaları">Ütü Masaları <ChevronDown size={13}/></Link>
        </nav>
        <div className="actions">
          <Link href="/collections/all" aria-label="Ürün ara" className="icon-link"><Search size={21}/></Link>
          <Link href="/account" aria-label="Hesabım" className="icon-link"><UserRound size={21}/></Link>
          <Link href="/wishlist" aria-label="Favoriler" className="icon-link"><Heart size={21}/><b>{wishlistCount}</b></Link>
          <Link href="/cart" aria-label="Sepet" className="icon-link cart"><ShoppingBag size={21}/><b>{count}</b></Link>
        </div>
      </div>
    </header>
    {menuOpen&&<div className="mobile-panel">
      <div className="panel-top"><img src="/alya-homes-logo.png" alt="ALYA HOMES"/><button onClick={()=>setMenuOpen(false)} aria-label="Menüyü kapat"><X/></button></div>
      <Link href="/" onClick={()=>setMenuOpen(false)}>Ana Sayfa <ArrowRight size={16}/></Link>
      <Link href="/collections/all" onClick={()=>setMenuOpen(false)}>Tüm Ürünler <ArrowRight size={16}/></Link>
      {categories.map(c=><Link key={c} href={`/collections/${encodeURIComponent(c.toLowerCase())}`} onClick={()=>setMenuOpen(false)}>{c}<ArrowRight size={16}/></Link>)}
      <Link href="/account" onClick={()=>setMenuOpen(false)}>Hesabım <ArrowRight size={16}/></Link>
      <Link href="/wishlist" onClick={()=>setMenuOpen(false)}>Favoriler <ArrowRight size={16}/></Link>
      <Link href="/cart" onClick={()=>setMenuOpen(false)}>Sepet <ArrowRight size={16}/></Link>
    </div>}
  </>;
}
