"use client";

import {useEffect, useRef} from 'react';
import {usePathname} from 'next/navigation';

export const COOKIE_CONSENT_KEY='alya_cookie_consent_v1';
export const COOKIE_CONSENT_EVENT='alya-cookie-consent';
export const COOKIE_SETTINGS_EVENT='alya-cookie-settings';

function readConsent(){
  try{
    return JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_KEY)||'null');
  }catch{
    return null;
  }
}

function ensureGtag(){
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
}

export default function GoogleAnalytics({measurementId}){
  const pathname=usePathname();
  const lastPath=useRef('');
  const initialized=useRef(false);

  useEffect(()=>{
    if(!measurementId) return;

    const sendPageView=(path)=>{
      if(!window.gtag||!path||lastPath.current===path) return;
      lastPath.current=path;
      window.gtag('event','page_view',{
        page_path:path,
        page_location:window.location.href,
        page_title:document.title,
      });
    };

    const enableAnalytics=()=>{
      ensureGtag();
      window.gtag('consent','default',{
        analytics_storage:'denied',
        ad_storage:'denied',
        ad_user_data:'denied',
        ad_personalization:'denied',
      });
      window.gtag('consent','update',{analytics_storage:'granted'});

      if(!document.getElementById('alya-google-analytics')){
        const script=document.createElement('script');
        script.id='alya-google-analytics';
        script.async=true;
        script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        document.head.appendChild(script);
      }

      if(!initialized.current){
        window.gtag('js',new Date());
        window.gtag('config',measurementId,{
          send_page_view:false,
          allow_google_signals:false,
          allow_ad_personalization_signals:false,
        });
        initialized.current=true;
      }
      sendPageView(window.location.pathname+window.location.search);
    };

    const disableAnalytics=()=>{
      if(window.gtag) window.gtag('consent','update',{analytics_storage:'denied'});
    };

    const handleConsent=(event)=>{
      if(event.detail?.analytics) enableAnalytics();
      else disableAnalytics();
    };

    if(readConsent()?.analytics===true) enableAnalytics();
    window.addEventListener(COOKIE_CONSENT_EVENT,handleConsent);
    return ()=>window.removeEventListener(COOKIE_CONSENT_EVENT,handleConsent);
  },[measurementId]);

  useEffect(()=>{
    if(!measurementId||readConsent()?.analytics!==true||!window.gtag) return;
    const path=pathname+window.location.search;
    if(lastPath.current===path) return;
    lastPath.current=path;
    window.gtag('event','page_view',{
      page_path:path,
      page_location:window.location.href,
      page_title:document.title,
    });
  },[measurementId,pathname]);

  return null;
}