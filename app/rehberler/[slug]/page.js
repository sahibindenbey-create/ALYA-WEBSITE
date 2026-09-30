import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {getGuide,guides} from '../../guides';
import {CATALOG_ORIGIN,serializeJsonLd} from '../../seo';

export function generateStaticParams(){
  return guides.map(guide=>({slug:guide.slug}));
}

export async function generateMetadata({params}){
  const {slug}=await params;
  const guide=getGuide(slug);
  if(!guide) return {};
  const url=`${CATALOG_ORIGIN}/rehberler/${guide.slug}`;
  return {title:`${guide.title} | ALYA HOMES`,description:guide.description,alternates:{canonical:url},openGraph:{type:'article',locale:'tr_TR',siteName:'ALYA HOMES',title:guide.title,description:guide.description,url}};
}

export default async function GuidePage({params}){
  const {slug}=await params;
  const guide=getGuide(slug);
  if(!guide) notFound();
  const url=`${CATALOG_ORIGIN}/rehberler/${guide.slug}`;
  const articleSchema={'@context':'https://schema.org','@type':'Article',headline:guide.title,description:guide.description,inLanguage:'tr-TR',mainEntityOfPage:url,author:{'@type':'Organization',name:'ALYA HOMES',url:CATALOG_ORIGIN},publisher:{'@type':'Organization',name:'ALYA HOMES',url:CATALOG_ORIGIN,logo:{'@type':'ImageObject',url:`${CATALOG_ORIGIN}/alya-homes-logo.png`}}};
  const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:guide.faq.map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))};
  const breadcrumbSchema={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Ana Sayfa',item:CATALOG_ORIGIN},{'@type':'ListItem',position:2,name:'Rehberler',item:`${CATALOG_ORIGIN}/rehberler`},{'@type':'ListItem',position:3,name:guide.title,item:url}]};
  return <main className="guide-page">
    <article>
      <nav className="guide-breadcrumb"><Link href="/rehberler"><ArrowLeft size={14}/> Rehberler</Link><span>{guide.category}</span></nav>
      <header><small>ALYA HOMES / {guide.category.toLocaleUpperCase('tr-TR')}</small><h1>{guide.title}</h1><p>{guide.intro}</p></header>
      <div className="guide-body">{guide.sections.map(section=><section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</section>)}</div>
      <section className="guide-faq"><small>SIK SORULAN SORULAR</small><h2>Merak edilenler</h2>{guide.faq.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
      <aside className="guide-cta"><div><small>ÜRÜNLERİ İNCELEYİN</small><h2>Bilgiyi doğru ürünle eşleştirin.</h2></div><Link href={guide.collection}>Koleksiyona git <ArrowRight size={16}/></Link></aside>
    </article>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(articleSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(faqSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(breadcrumbSchema)}}/>
  </main>;
}