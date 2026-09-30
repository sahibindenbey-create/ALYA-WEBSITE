"use client";

import {createContext, useContext} from "react";

const SiteModeContext=createContext("shop");

export function SiteModeProvider({mode,children}){
  return <SiteModeContext.Provider value={mode==="catalog"?"catalog":"shop"}>{children}</SiteModeContext.Provider>;
}

export function useSiteMode(){
  const siteMode=useContext(SiteModeContext);
  return {siteMode,isCatalogMode:siteMode==="catalog",isShopMode:siteMode==="shop"};
}
