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
import {headers} from 'next/headers';
import {StoreProvider} from './store';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import ScrollHeaderController from './components/ScrollHeaderController';
import {I18nProvider} from './i18n';
import {SiteModeProvider} from './site-mode';

async function getSiteMode(){
  const host=((await headers()).get('host')||'').split(':')[0].toLowerCase();
  if(host==='alyahomes.com'||host==='www.alyahomes.com')return 'catalog';
  if(host==='shop.alyahomes.com'||host==='www.shop.alyahomes.com')return 'shop';
  return process.env.SITE_MODE==='catalog'?'catalog':'shop';
}

export async function generateMetadata(){
  const catalog=(await getSiteMode())==='catalog';
  return {title:catalog?'ALYA HOMES | Ev Yaşam Ürünleri':'ALYA HOMES Shop | Online Mağaza',description:catalog?'ALYA HOMES ürün koleksiyonu':'ALYA HOMES online mağazası'};
}

export default async function RootLayout({children}){
  const mode=await getSiteMode();
  return <html lang="tr"><body><StoreProvider><SiteModeProvider mode={mode}><I18nProvider><SiteHeader/><ScrollHeaderController/>{children}<SiteFooter/></I18nProvider></SiteModeProvider></StoreProvider></body></html>;
}
