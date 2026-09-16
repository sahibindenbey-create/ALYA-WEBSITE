"use client";
import Link from 'next/link';
import {ArrowRight, ChevronDown, SlidersHorizontal, X, Heart} from 'lucide-react';
import {useMemo, useState} from 'react';

import {useStore} from '../../store';

const money=n=>n==null?'Fiyat için iletişime geçin':new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(n);
const drying=p=>{const m=String(p.specs?.kurutma||'').match(/[0-9]+/); return m?Number(m[0]):0};

export default function CollectionPage({params}){
  const raw=decodeURIComponent(params.slug||'all');
  const title=raw==='all'?'Tüm Ürünler':raw.replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
  const [sort,setSort]=useState('featured');
  const [query,setQuery]=useState('');
  const [material,setMaterial]=useState('all');
  const [minDry,setMinDry]=useState('all');
  const [filtersOpen,setFiltersOpen]=useState(false);
  const {toggleWishlist,isWishlisted,getProducts}=useStore();
  const products=getProducts();
  const base=raw==='all'?products:products.filter(p=>p.category.toLowerCase()===raw.toLowerCase());

  const materials=useMemo(()=>[...new Set(base.map(p=>p.specs?.malzeme).filter(Boolean))],[base]);
  const items=useMemo(()=>{
    let list=base.filter(p=>`${p.name} ${p.code}`.toLowerCase().includes(query.toLowerCase()));
    if(material!=='all') list=list.filter(p=>p.specs?.malzeme===material);
    if(minDry!=='all') list=list.filter(p=>drying(p)>=Number(minDry));
    if(sort==='name') list=[...list].sort((a,b)=>a.name.localeCompare(b.name,'tr'));
    if(sort==='dry-desc') list=[...list].sort((a,b)=>drying(b)-drying(a));
    if(sort==='price') list=[...list].sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
    return list;
  },[base,query,material,minDry,sort]);

  return <main className="collection-page">
    <div className="collection-hero"><small>ALYA HOMES</small><h1>{title}</h1><p>Ev yaşam alanları için ALYA HOMES ürün koleksiyonu.</p></div>
    <div className="collection-toolbar">
      <span>{items.length} ürün</span>
      <div className="toolbar-actions">
        <button onClick={()=>setFiltersOpen(v=>!v)}><SlidersHorizontal size={15}/> Filtrele</button>
        <label>Sırala:
          <select value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="featured">Önerilen</option><option value="name">A–Z</option><option value="dry-desc">Kurutma kapasitesi</option><option value="price">Fiyat</option>
          </select><ChevronDown size={13}/>
        </label>
      </div>
    </div>
    {filtersOpen&&<div className="filter-panel">
      <div><span>Ürün ara</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ürün kodu veya adı"/></div>
      {materials.length>0&&<div><span>Malzeme</span><select value={material} onChange={e=>setMaterial(e.target.value)}><option value="all">Tümü</option>{materials.map(m=><option key={m} value={m}>{m}</option>)}</select></div>}
      <div><span>Minimum kurutma alanı</span><select value={minDry} onChange={e=>setMinDry(e.target.value)}><option value="all">Tümü</option><option value="12">12 m ve üzeri</option><option value="16">16 m ve üzeri</option><option value="18">18 m ve üzeri</option><option value="21">21 m</option></select></div>
      <button className="filter-clear" onClick={()=>{setQuery('');setMaterial('all');setMinDry('all');setSort('featured')}}>Temizle <X size={13}/></button>
    </div>}
    <div className="catalog-grid">{items.map(p=><div className="catalog-card-wrap" key={p.slug}>
      <div className="catalog-image"><Link href={`/products/${p.slug}`}><img src={p.image} alt={p.name}/></Link><button className={isWishlisted(p.slug)?'wish-active':''} onClick={()=>toggleWishlist(p)} aria-label="Favorilere ekle"><Heart size={18} fill={isWishlisted(p.slug)?'currentColor':'none'}/></button></div>
      <Link href={`/products/${p.slug}`} className="catalog-card"><span className="code">{p.code}</span><h2>{p.name}</h2><p>{money(p.price)}</p><span className="discover">Ürünü incele <ArrowRight size={15}/></span></Link>
    </div>)}</div>
    {items.length===0&&<div className="empty-state"><h2>Aradığınız ürün bulunamadı</h2><p>Filtreleri temizleyip tekrar deneyin.</p><button className="button dark" onClick={()=>{setQuery('');setMaterial('all');setMinDry('all')}}>Filtreleri temizle</button></div>}
  </main>
}
