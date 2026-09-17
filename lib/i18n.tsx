'use client';
import {createContext,useContext,useEffect,useState,useCallback} from 'react';
import copy from './copy.json';
export type Language='zh'|'en';
type Params=Record<string,string|number>;
const catalog=copy as Record<string,{zh:string;en:string}>;
export function translate(language:Language,key:string,params:Params={}){const entry=catalog[key]||Object.values(catalog).find(e=>e.en===key||e.zh===key);const text=entry?.[language]||key;return text.replace(/\{(\d+)\}/g,(match,k)=>String(params[k]??match))}
const Context=createContext({lang:'zh' as Language,setLang:(_lang:Language)=>{},t:(key:string,params?:Params)=>translate('zh',key,params)});
export function LanguageProvider({children}:{children:React.ReactNode}){const [lang,setLanguage]=useState<Language>('zh');useEffect(()=>{try{const saved=localStorage.getItem('clock-out-language');if(saved==='en'||saved==='zh')setLanguage(saved)}catch{}const sync=(e:StorageEvent)=>{if(e.key==='clock-out-language'&&(e.newValue==='zh'||e.newValue==='en'))setLanguage(e.newValue)};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':'en-MY';document.documentElement.dataset.language=lang;document.title=lang==='zh'?'今晚收工 · CLOCK OUT':'CLOCK OUT · Take your night back'},[lang]);const setLang=useCallback((value:Language)=>{setLanguage(value);try{localStorage.setItem('clock-out-language',value)}catch{}},[]);const t=useCallback((key:string,params?:Params)=>translate(lang,key,params),[lang]);return <Context.Provider value={{lang,setLang,t}}>{children}</Context.Provider>}
export const useI18n=()=>useContext(Context);
