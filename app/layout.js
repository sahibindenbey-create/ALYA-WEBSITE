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
import { StoreProvider } from './store';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import ScrollHeaderController from './components/ScrollHeaderController';
import JsonLd from './components/JsonLd';
import { SITE_URL, abs, orgJsonLd } from '../lib/site';
export const metadata={
  metadataBase:new URL(SITE_URL),
  title:{default:'ALYA HOMES | Kurutmalık ve Ütü Masası',template:'%s | ALYA HOMES'},
  description:'ALYA HOMES: işlevsel, dayanıklı ve sade tasarımlı katlanabilir kurutmalık ve ütü masası modelleri. 3 yıl garanti, 30 gün kolay iade, 1.000 TL üzeri siparişlerde ücretsiz kargo.',
  applicationName:'ALYA HOMES',
  alternates:{canonical:'/'},
  openGraph:{type:'website',locale:'tr_TR',siteName:'ALYA HOMES',title:'ALYA HOMES | Kurutmalık ve Ütü Masası',description:'İşlevsel, dayanıklı ve zamansız ev yaşam ürünleri: kurutmalık ve ütü masası koleksiyonu.',url:'/',images:[{url:'/alya-homes-logo.png',alt:'ALYA HOMES'}]},
  twitter:{card:'summary_large_image',title:'ALYA HOMES | Kurutmalık ve Ütü Masası',description:'İşlevsel, dayanıklı ve zamansız ev yaşam ürünleri.',images:['/alya-homes-logo.png']},
  robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
  icons:{icon:'/alya-homes-logo.png',apple:'/alya-homes-logo.png'},
  formatDetection:{telephone:false,email:false,address:false},
  // verification:{google:'SEARCH_CONSOLE_KODU'}, // Google Search Console doğrulama kodunuzu buraya ekleyin
};
export const viewport={width:'device-width',initialScale:1,themeColor:'#ffffff'};
const siteJsonLd={'@context':'https://schema.org','@type':'WebSite','@id':abs('/#website'),url:abs('/'),name:'ALYA HOMES',inLanguage:'tr-TR',publisher:{'@id':abs('/#organization')}};
export default function RootLayout({children}){return <html lang="tr"><body><JsonLd data={orgJsonLd()}/><JsonLd data={siteJsonLd}/><StoreProvider><SiteHeader/><ScrollHeaderController/>{children}<SiteFooter/></StoreProvider></body></html>}
