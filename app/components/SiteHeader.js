"use client";
import {useState,useMemo} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {Menu,X,ChevronDown,Heart,UserRound,ShoppingBag,Search,ArrowRight} from 'lucide-react';
import {categories} from '../products';
import {useStore} from '../store';

export default function SiteHeader(){
  const pathname=usePathname();
  const [menuOpen,setMenuOpen]=useState(false),[searchOpen,setSearchOpen]=useState(false),[query,setQuery]=useState('');
  const {count,wishlistCount,getProducts}=useStore();
  const results=useMemo(()=>{const q=query.trim().toLocaleLowerCase('tr-TR');if(!q)return [];return getProducts().filter(p=>`${p.name} ${p.code} ${p.category}`.toLocaleLowerCase('tr-TR').includes(q)).slice(0,6)},[query,getProducts]);
  if(pathname==='/') return null;
  return <>
    <div className="announcement">1.000 TL ve üzeri siparişlerde ücretsiz kargo</div>
    <header>
      <div className="utility"><div className="utility-links"><span>3 yıl garanti</span><span>30 gün içinde kolay iade</span><span>Güvenli ödeme</span><span>Türkiye / TRY</span></div></div>
      <div className="main-header">
        <button className="mobile-menu" onClick={()=>setMenuOpen(true)} aria-label="Menüyü aç"><Menu/></button>
        <Link href="/" className="brand-logo" aria-label="ALYA HOMES ana sayfa"><img src="/alya-homes-logo.png" alt="ALYA HOMES"/></Link>
        <nav><Link href="/collections/all">Tüm Ürünler</Link><Link href="/collections/kurutmalıklar">Kurutmalıklar <ChevronDown size={13}/></Link><Link href="/collections/%C3%BCt%C3%BC%20masalar%C4%B1">Ütü Masaları <ChevronDown size={13}/></Link></nav>
        <div className="actions"><button type="button" aria-label="Ürün ara" className="icon-link search-trigger" onClick={()=>setSearchOpen(true)}><Search size={21}/></button><Link href="/account" aria-label="Hesabım" className="icon-link"><UserRound size={21}/></Link><Link href="/wishlist" aria-label="Favoriler" className="icon-link"><Heart size={21}/><b>{wishlistCount}</b></Link><Link href="/cart" aria-label="Sepet" className="icon-link cart"><ShoppingBag size={21}/><b>{count}</b></Link></div>
      </div>
    </header>
    {menuOpen&&<div className="mobile-panel"><div className="panel-top"><img src="/alya-homes-logo.png" alt="ALYA HOMES"/><button onClick={()=>setMenuOpen(false)} aria-label="Menüyü kapat"><X/></button></div><Link href="/" onClick={()=>setMenuOpen(false)}>Ana Sayfa <ArrowRight size={16}/></Link><Link href="/collections/all" onClick={()=>setMenuOpen(false)}>Tüm Ürünler <ArrowRight size={16}/></Link>{categories.map(c=><Link key={c} href={`/collections/${encodeURIComponent(c.toLowerCase())}`} onClick={()=>setMenuOpen(false)}>{c}<ArrowRight size={16}/></Link>)}<Link href="/account" onClick={()=>setMenuOpen(false)}>Hesabım <ArrowRight size={16}/></Link><Link href="/wishlist" onClick={()=>setMenuOpen(false)}>Favoriler <ArrowRight size={16}/></Link><Link href="/cart" onClick={()=>setMenuOpen(false)}>Sepet <ArrowRight size={16}/></Link></div>}
    {searchOpen&&<div className="site-search-backdrop" onClick={()=>setSearchOpen(false)}><div className="site-search" onClick={e=>e.stopPropagation()}><div className="site-search-top"><div><small>ALYA HOMES</small><h2>Ürün ara</h2></div><button onClick={()=>setSearchOpen(false)} aria-label="Aramayı kapat"><X size={21}/></button></div><div className="site-search-input"><Search size={18}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ürün adı, kodu veya kategori"/></div>{query.trim()&&<div className="site-search-results">{results.length?results.map(p=><Link key={p.slug} href={`/products/${p.slug}`} onClick={()=>setSearchOpen(false)}><img src={p.image} alt=""/><span><strong>{p.name}</strong><small>{p.code} · {p.category}</small></span></Link>):<p>Aramanızla eşleşen ürün bulunamadı.</p>}</div>} {!query.trim()&&<div className="site-search-hint">Ürün adı, ürün kodu veya kategori yazarak hızlıca arama yapabilirsiniz.</div>}</div></div>}
    <style jsx>{` .search-trigger{border:0;background:transparent;cursor:pointer}.site-search-backdrop{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.46);display:flex;justify-content:center;align-items:flex-start;padding:9vh 20px}.site-search{width:min(720px,100%);background:#fff;padding:28px;box-shadow:0 20px 70px rgba(0,0,0,.2)}.site-search-top{display:flex;justify-content:space-between;align-items:flex-start}.site-search-top small{font-size:9px;letter-spacing:2px;color:#777}.site-search-top h2{font-size:30px;font-weight:500;letter-spacing:-1px;margin:6px 0 20px}.site-search-top button{border:0;background:transparent;cursor:pointer}.site-search-input{display:flex;align-items:center;gap:10px;border-bottom:1px solid #171717;padding:12px 0}.site-search-input input{border:0;outline:0;width:100%;font:inherit;font-size:14px}.site-search-results{margin-top:12px;max-height:430px;overflow:auto}.site-search-results a{display:flex;align-items:center;gap:14px;padding:11px 0;border-bottom:1px solid #eee}.site-search-results img{width:58px;height:58px;object-fit:contain;background:#f4f2ee}.site-search-results span{display:flex;flex-direction:column;gap:4px}.site-search-results strong{font-size:12px;font-weight:600}.site-search-results small{font-size:10px;color:#777}.site-search-results p,.site-search-hint{font-size:12px;color:#777;line-height:1.6;padding:18px 0}.site-search-hint{margin:0}@media(max-width:700px){.site-search-backdrop{padding:0;align-items:stretch}.site-search{padding:22px 18px}.site-search-top h2{font-size:26px}.site-search-results{max-height:none}}`}</style>
  </>;
}
