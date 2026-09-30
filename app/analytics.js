import {COOKIE_CONSENT_KEY} from './components/GoogleAnalytics';

export function analyticsAllowed(){
  if(typeof window==='undefined') return false;
  try{
    return JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_KEY)||'null')?.analytics===true;
  }catch{
    return false;
  }
}

export function gaItem(product,quantity){
  if(!product) return null;
  const price=Number(product.UnitPrice??product.price);
  const qty=Number(quantity??product.Quantity??product.qty??1);
  return {
    item_id:String(product.ProductCode??product.code??product.ProductSlug??product.slug??product.id??'').trim(),
    item_name:String(product.ProductName??product.name??'Ürün').trim(),
    item_category:String(product.Category??product.category??'').trim()||undefined,
    price:Number.isFinite(price)?price:0,
    quantity:Number.isFinite(qty)&&qty>0?qty:1,
  };
}

export function gaItems(products=[]){
  return products.map(product=>gaItem(product)).filter(Boolean);
}

export function trackEcommerce(event,params={}){
  if(!analyticsAllowed()||typeof window.gtag!=='function') return false;
  window.gtag('event',event,{currency:'TRY',...params});
  return true;
}