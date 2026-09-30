import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {guides} from '../guides';
import {CATALOG_ORIGIN,serializeJsonLd} from '../seo';

export const metadata={
  title:'Ev Yaşam Rehberleri | ALYA HOMES',
  description:'Kurutmalık ve ütü masası seçimi, ölçü, malzeme ve kullanım önerileri için ALYA HOMES rehberlerini inceleyin.',
  alternates:{canonical:`${CATALOG_ORIGIN}/rehberler`},
  openGraph:{title:'Ev Yaşam Rehberleri | ALYA HOMES',description:'Kurutmalık ve ütü masası seçimine yardımcı pratik rehberler.',url:`${CATALOG_ORIGIN}/rehberler`,type:'website'},
};

export default function GuidesPage(){
  const schema={'@context':'https://schema.org','@type':'ItemList',name:'ALYA HOMES Ev Yaşam Rehberleri',numberOfItems:guides.length,itemListElement:guides.map((guide,index)=>({'@type':'ListItem',position:index+1,name:guide.title,url:`${CATALOG_ORIGIN}/rehberler/${guide.slug}`}))};
  return <main className="guides-page">
    <header className="guides-hero"><small>ALYA HOMES / BİLGİ MERKEZİ</small><h1>Ev yaşam rehberleri</h1><p>Doğru ürünü seçmek, ölçüleri anlamak ve yaşam alanını daha verimli kullanmak için hazırlanan pratik bilgiler.</p></header>
    <section className="guides-grid">{guides.map((guide,index)=><article className="guide-card" key={guide.slug}><span>{String(index+1).padStart(2,'0')} · {guide.category}</span><h2>{guide.title}</h2><p>{guide.description}</p><Link href={`/rehberler/${guide.slug}`}>Rehberi oku <ArrowRight size={15}/></Link></article>)}</section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(schema)}}/>
  </main>;
}