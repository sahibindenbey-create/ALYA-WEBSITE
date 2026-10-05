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

const guideImage=g=>/Ütü/i.test(g.category)||/utu/.test(g.collection)?'/category-ironing-v2.webp':'/category-drying-v2.webp';
const guideImageAlt=g=>/Ütü/i.test(g.category)||/utu/.test(g.collection)?'ALYA HOMES ütü masası':'ALYA HOMES katlanabilir kurutmalık';
export default async function GuidePage({params}){
  const {slug}=await params;
  const guide=getGuide(slug);
  if(!guide) notFound();
  const url=`${CATALOG_ORIGIN}/rehberler/${guide.slug}`;
  const articleSchema={'@context':'https://schema.org','@type':'Article',headline:guide.title,description:guide.description,inLanguage:'tr-TR',mainEntityOfPage:url,datePublished:guide.published,dateModified:guide.modified||guide.published,image:[`${CATALOG_ORIGIN}${guideImage(guide)}`],author:{'@type':'Organization',name:'ALYA HOMES',url:CATALOG_ORIGIN},publisher:{'@type':'Organization',name:'ALYA HOMES',url:CATALOG_ORIGIN,logo:{'@type':'ImageObject',url:`${CATALOG_ORIGIN}/alya-homes-logo.png`}}};
  const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:guide.faq.map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))};
  const breadcrumbSchema={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Ana Sayfa',item:CATALOG_ORIGIN},{'@type':'ListItem',position:2,name:'Rehberler',item:`${CATALOG_ORIGIN}/rehberler`},{'@type':'ListItem',position:3,name:guide.title,item:url}]};
  return <main className="guide-page">
    <article>
      <nav className="guide-breadcrumb"><Link href="/rehberler"><ArrowLeft size={14}/> Rehberler</Link><span>{guide.category}</span></nav>
      <header><small>ALYA HOMES / {guide.category.toLocaleUpperCase('tr-TR')}</small><h1>{guide.title}</h1><p>{guide.intro}</p><p className="guide-date">Yayın tarihi: <time dateTime={guide.published}>{new Date(guide.published).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})}</time>{guide.modified&&guide.modified!==guide.published&&<> · Güncelleme: <time dateTime={guide.modified}>{new Date(guide.modified).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})}</time></>}</p></header>
      <figure className="guide-figure"><img src={guideImage(guide)} alt={guideImageAlt(guide)} width="1200" height="675" decoding="async"/></figure>
      <div className="guide-body">{guide.sections.map(section=><section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</section>)}{guide.table&&<div className="guide-table-wrap"><table className="guide-table"><caption>{guide.table.caption}</caption><thead><tr>{guide.table.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{guide.table.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} data-label={guide.table.headers[j]}>{cell&&cell.href?<Link href={cell.href}>{cell.text}</Link>:cell}</td>)}</tr>)}</tbody></table></div>}</div>
      <section className="guide-faq"><small>SIK SORULAN SORULAR</small><h2>Merak edilenler</h2>{guide.faq.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
      <aside className="guide-cta"><div><small>ÜRÜNLERİ İNCELEYİN</small><h2>Bilgiyi doğru ürünle eşleştirin.</h2></div><Link href={guide.collection}>Koleksiyona git <ArrowRight size={16}/></Link></aside>
    </article>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(articleSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(faqSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(breadcrumbSchema)}}/>
  </main>;
}