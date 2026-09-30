"use client";

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_KEY,
  COOKIE_SETTINGS_EVENT,
} from './GoogleAnalytics';

function clearAnalyticsCookies(){
  const names=document.cookie.split(';').map(item=>item.split('=')[0].trim()).filter(name=>name==='_ga'||name.startsWith('_ga_'));
  const domains=[location.hostname,`.${location.hostname.split('.').slice(-2).join('.')}`];
  for(const name of names){
    for(const domain of domains){
      document.cookie=`${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
    }
    document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax`;
  }
}

export default function CookieConsentBanner({enabled}){
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    if(!enabled) return;
    setOpen(!window.localStorage.getItem(COOKIE_CONSENT_KEY));
    const showSettings=()=>setOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT,showSettings);
    return ()=>window.removeEventListener(COOKIE_SETTINGS_EVENT,showSettings);
  },[enabled]);

  if(!enabled||!open) return null;

  const save=(analytics)=>{
    const detail={necessary:true,analytics,updatedAt:new Date().toISOString()};
    window.localStorage.setItem(COOKIE_CONSENT_KEY,JSON.stringify(detail));
    if(!analytics) clearAnalyticsCookies();
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT,{detail}));
    setOpen(false);
  };

  return <section className="cookie-consent" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title">
    <div>
      <strong id="cookie-consent-title">Çerez tercihleri</strong>
      <p>Site işlevleri için zorunlu çerezleri kullanıyoruz. İzin verirseniz site kullanımını anlamak ve deneyimi geliştirmek için anonimleştirilmiş ölçüm çerezleri de kullanacağız. Ayrıntılar için <Link href="/cerez_politikasi">Çerez Politikası</Link>.</p>
    </div>
    <div className="cookie-consent-actions">
      <button type="button" className="cookie-reject" onClick={()=>save(false)}>Yalnızca zorunlu</button>
      <button type="button" className="cookie-accept" onClick={()=>save(true)}>Analize izin ver</button>
    </div>
  </section>;
}