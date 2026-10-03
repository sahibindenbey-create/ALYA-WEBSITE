import StyledJsxRegistry from "./StyledJsxRegistry";
import './globals.css';
import './alyahomes-reference.css';
import './home.css';
import './brand.css';
import './alya-experience.css';
import './home-polish.css';
import './header-polish.css';
import './collection-polish.css';
import './product-detail-polish.css';
import './product-gallery-final.css';
import './product-image-scale.css';
import './cart-polish.css';
import './wishlist-polish.css';
import './account-polish.css';
import './checkout-polish.css';
import './order-success-polish.css';
import './order-detail-polish.css';
import './legal-page.css';
import './footer-polish.css';
import './design-system-polish.css';
import './retail-redesign.css';
import './cookie-consent.css';
import './guides.css';
import './collection-guides.css';
import './a11y-perf.css';
import {headers} from 'next/headers';
import {StoreProvider} from './store';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import ScrollHeaderController from './components/ScrollHeaderController';
import {I18nProvider} from './i18n';
import {SiteModeProvider} from './site-mode';
import {COMPANY} from './company-info';
import {absoluteUrl, originForMode, serializeJsonLd, siteModeFromHost} from './seo';
import GoogleAnalytics from './components/GoogleAnalytics';
import CookieConsentBanner from './components/CookieConsentBanner';

async function getSiteMode(){
  const host=((await headers()).get('host')||'').split(':')[0].toLowerCase();
  return siteModeFromHost(host);
}

export async function generateMetadata(){
  const mode=await getSiteMode();
  const catalog=mode==='catalog';
  const origin=originForMode(mode);
  const title=catalog?'ALYA HOMES | Kurutmalık ve Ütü Masası':'ALYA HOMES Shop | Kurutmalık ve Ütü Masası';
  const description=catalog?'ALYA HOMES kurutmalık ve ütü masası koleksiyonu. İşlevsel, dayanıklı ve yer kazandıran ev yaşam ürünlerini keşfedin.':'ALYA HOMES kurutmalık ve ütü masası modellerini online inceleyin ve güvenle satın alın.';
  return {
    metadataBase:new URL(origin),
    title:{default:title,template:'%s'},
    description,
    applicationName:'ALYA HOMES',
    authors:[{name:'ALYA HOMES'}],
    creator:'ALYA HOMES',
    publisher:'ALYA HOMES',
    category:'Ev yaşam ürünleri',
    manifest:'/manifest.webmanifest',
    icons:{icon:[{url:'/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icon-512.png',sizes:'512x512',type:'image/png'}],apple:'/icon-192.png'},
    robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
    openGraph:{type:'website',locale:'tr_TR',siteName:'ALYA HOMES',title,description,images:[{url:absoluteUrl(origin,'/home-hero-v2.webp'),width:1600,height:900,alt:'ALYA HOMES ev yaşam ürünleri'}]},
    twitter:{card:'summary_large_image',title,description,images:[absoluteUrl(origin,'/home-hero-v2.webp')]},
    verification:{google:process.env.GOOGLE_SITE_VERIFICATION||undefined,other:{'msvalidate.01':process.env.BING_SITE_VERIFICATION||undefined}},
  };
}

export default async function RootLayout({children}){
  const mode=await getSiteMode();
  const origin=originForMode(mode);
  const measurementId=process.env.GA_MEASUREMENT_ID||process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID||'G-F686G8HV49';
  const organizationSchema={'@context':'https://schema.org','@type':'Organization','@id':`${origin}/#organization`,name:COMPANY.shortName,legalName:COMPANY.name,url:origin,logo:absoluteUrl(origin,'/alya-homes-logo.png'),email:COMPANY.email,telephone:COMPANY.phone,address:{'@type':'PostalAddress',streetAddress:'Cevizli Mah. Tugay Yolu Cad. Maltepe Park AVM No:67/B4-18/19',addressLocality:'Maltepe',addressRegion:'İstanbul',addressCountry:'TR'},...(mode==='shop'?{hasMerchantReturnPolicy:{'@type':'MerchantReturnPolicy',applicableCountry:'TR',returnPolicyCountry:'TR',returnPolicyCategory:'https://schema.org/MerchantReturnFiniteReturnWindow',merchantReturnDays:14,returnMethod:'https://schema.org/ReturnByMail',returnFees:'https://schema.org/ReturnShippingFees',merchantReturnLink:absoluteUrl(origin,'/iade-politikasi')}}:{})};
  const websiteSchema={'@context':'https://schema.org','@type':'WebSite','@id':`${origin}/#website`,url:origin,name:'ALYA HOMES',inLanguage:'tr-TR',publisher:{'@id':`${origin}/#organization`}};
  return <html lang="tr"><body><StyledJsxRegistry><StoreProvider><SiteModeProvider mode={mode}><I18nProvider><a className="skip-link" href="#main-content">İçeriğe geç</a><SiteHeader/><ScrollHeaderController/><div id="main-content" tabIndex={-1}>{children}</div><SiteFooter/><CookieConsentBanner enabled={Boolean(measurementId)}/></I18nProvider></SiteModeProvider></StoreProvider></StyledJsxRegistry><GoogleAnalytics measurementId={measurementId}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(organizationSchema)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(websiteSchema)}}/></body></html>;
}
