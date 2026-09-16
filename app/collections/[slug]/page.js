"use client";
import Link from 'next/link';
import {ArrowRight, ChevronDown, SlidersHorizontal, X, Heart, ShoppingBag, Check} from 'lucide-react';
import {use, useMemo, useState} from 'react';
import {useStore} from '../../store';

const money=n=>n==null?'Fiyat için iletişime geçin':new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(n);
const drying=p=>{const m=String(p.specs?.kurutma||'').match(/[0-9]+/); return m?Number(m[0]):0;};
const categoryTitles={'kurutmalıklar':'Kurutmalıklar','ütü masaları':'Ütü Masaları','tüm ürünler':'Tüm Ürünler'};
const categoryCopy={
  'Kurutmalıklar':'İç ve dış mekân kullanımı için alüminyum ve paslanmaz gövdeli, kolay saklanan kurutmalık çözümleri.',
  'Ütü Masaları':'Alüminyum ve çelik gövdeli, farklı kullanım ihtiyaçlarına göre tasarlanmış ütü masalarını keşfedin.',
  'Tüm Ürünler':'Ev yaşam alanları için dayanıklı malzeme, sade tasarım ve günlük kullanıma odaklanan ALYA HOMES koleksiyonu.'
};
const categoryTitle=raw=>categoryTitles[raw.toLocaleLowerCase('tr-TR')]||raw.replace(/-/g,' ').replace(/(^|\s)([a-zçğıöşü])/giu,(_,space,letter)=>`${space}${letter.toLocaleUpperCase('tr-TR')}`);

export default function CollectionPage({params}){
  const {slug}=use(params);
  const raw=decodeURIComponent(slug||'all');
  const title=raw==='all'?'Tüm Ürünler':categoryTitle(raw);
  const [sort,setSort]=useState('featured');
  const [query,setQuery]=useState('');
  const [material,setMaterial]=useState('all');
  const [minDry,setMinDry]=useState('all');
  const [filtersOpen,setFiltersOpen]=useState(false);
  const {toggleWishlist,isWishlisted,getProducts,addToCart}=useStore();
  const [added,setAdded]=useState('');
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
  const clearFilters=()=>{setQuery('');setMaterial('all');setMinDry('all');setSort('featured');};
  const addProduct=p=>{if(addToCart(p)){setAdded(p.slug);window.setTimeout(()=>setAdded(''),1600);}};

  return <main className="collection-page">
    <section className="collection-hero">
      <small>ALYA HOMES / KOLEKSİYON</small>
      <h1>{title}</h1>
      <p>{categoryCopy[title]||'ALYA HOMES ürün koleksiyonunu keşfedin.'}</p>
    </section>

    <section className="collection-content">
      <div className="collection-toolbar">
        <span>{items.length} ürün</span>
        <div className="toolbar-actions">
          <button onClick={()=>setFiltersOpen(v=>!v)} aria-expanded={filtersOpen}><SlidersHorizontal size={15}/> Filtrele</button>
          <label>Sırala:
            <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Ürünleri sırala">
              <option value="featured">Önerilen</option><option value="name">A–Z</option><option value="dry-desc">Kurutma kapasitesi</option><option value="price">Fiyat</option>
            </select><ChevronDown size={13}/>
          </label>
        </div>
      </div>

      {filtersOpen&&<div className="filter-panel">
        <div><span>Ürün ara</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ürün adı veya ürün kodu"/></div>
        {materials.length>0&&<div><span>Malzeme</span><select value={material} onChange={e=>setMaterial(e.target.value)}><option value="all">Tümü</option>{materials.map(m=><option key={m} value={m}>{m}</option>)}</select></div>}
        <div><span>Minimum kurutma alanı</span><select value={minDry} onChange={e=>setMinDry(e.target.value)}><option value="all">Tümü</option><option value="12">12 m ve üzeri</option><option value="16">16 m ve üzeri</option><option value="18">18 m ve üzeri</option><option value="21">21 m ve üzeri</option></select></div>
        <button className="filter-clear" onClick={clearFilters}>Temizle <X size={13}/></button>
      </div>}

      {(query||material!=='all'||minDry!=='all')&&<div className="active-filters"><span>Aktif filtreler:</span>{query&&<button onClick={()=>setQuery('')}>“{query}” <X size={12}/></button>}{material!=='all'&&<button onClick={()=>setMaterial('all')}>{material} <X size={12}/></button>}{minDry!=='all'&&<button onClick={()=>setMinDry('all')}>{minDry} m+ <X size={12}/></button>}<button className="clear-inline" onClick={clearFilters}>Tümünü temizle</button></div>}

      <div className="catalog-grid">
        {items.map(p=><article className="catalog-card-wrap" key={p.slug}>
          <div className="catalog-image">
            <Link href={`/products/${p.slug}`} aria-label={`${p.name} ürün detayını aç`}><img src={p.image} alt={p.name}/></Link>
            <button className={isWishlisted(p.slug)?'wish-active':''} onClick={()=>toggleWishlist(p)} aria-label={isWishlisted(p.slug)?'Favorilerden çıkar':'Favorilere ekle'}><Heart size={18} fill={isWishlisted(p.slug)?'currentColor':'none'}/></button>
          </div>
          <div className="catalog-card">
            <span className="code">{p.code}</span>
            <Link href={`/products/${p.slug}`}><h2>{p.name}</h2></Link>
            <p>{money(p.price)}</p>
            <div className="catalog-actions">
              <Link href={`/products/${p.slug}`} className="discover">Ürünü incele <ArrowRight size={15}/></Link>
              {p.price!=null&&<button className="quick-add" onClick={()=>addProduct(p)}>{added===p.slug?<><Check size={14}/> Eklendi</>:<><ShoppingBag size={14}/> Sepete ekle</>}</button>}
            </div>
          </div>
        </article>)}
      </div>
      {items.length===0&&<div className="empty-state"><h2>Aradığınız ürün bulunamadı</h2><p>Filtreleri temizleyip tekrar deneyin.</p><button className="button dark" onClick={clearFilters}>Filtreleri temizle</button></div>}
    </section>
  </main>;
}
