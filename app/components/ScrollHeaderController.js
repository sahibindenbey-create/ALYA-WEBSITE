"use client";
import {useEffect} from "react";

export default function ScrollHeaderController(){
 useEffect(()=>{
  let lastY=window.scrollY||0;
  const onScroll=()=>{
   const y=window.scrollY||0;
   const header=document.querySelector("body header");
   if(!header){lastY=y;return}
   if(y<=40||y<lastY){
    header.classList.remove("header-hidden");
   }else if(y>120){
    header.classList.add("header-hidden");
   }
   lastY=y;
  };
  window.addEventListener("scroll",onScroll,{passive:true});
  return()=>window.removeEventListener("scroll",onScroll);
 },[]);
 return null;
}
