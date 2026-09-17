export const STORAGE_KEY='clock-out-v3';
export const LEGACY_KEY='clock-out-v1';
const MYT=8*3600000;
export type Night={id:string;night:string;at:number;declaredAt:number;target:string;reason:string;note:string;life:number;corrected:boolean;gratitude?:string;noteHandled?:boolean;morningReply?:string;snoozeUntil?:number};
export type Legacy={id:string;at:number;minutes:number;life:number;reason:string;note:string;demo?:boolean};
export type State={version:3;onboarded:boolean;name:string;city:string;target:string;theme:'auto'|'light'|'soft';nights:Night[];legacy:Legacy[];draft:{reason:string;note:string;gratitude?:string};migrated:boolean};
export const initial:State={version:3,onboarded:false,name:'',city:'Penang',target:'00:00',theme:'auto',nights:[],legacy:[],draft:{reason:'',note:''},migrated:false};
export const furnishings=[{id:'lamp',name:'一盏小灯',cost:100},{id:'plant',name:'不必浇水的植物',cost:300},{id:'rug',name:'躺平地毯',cost:600},{id:'speaker',name:'放空音箱',cost:1000},{id:'poster',name:'怪懒海报',cost:1600},{id:'coffee',name:'明早的咖啡机',cost:2400}];
export const validTime=(s:unknown):s is string=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export function nightKey(at:number){return new Date(at+MYT-12*3600000).toISOString().slice(0,10)}
export function mytHour(at:number){return new Date(at+MYT).getUTCHours()}
export function atNightTime(night:string,time:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(night)||!validTime(time))throw new Error('请输入有效时间');const [h,m]=time.split(':').map(Number);return Date.parse(night+'T00:00:00+08:00')+(h<12?24:0)*3600000+h*3600000+m*60000}
export const formatTime=(at:number)=>new Date(at).toLocaleTimeString('en-US',{timeZone:'Asia/Kuala_Lumpur',hour:'numeric',minute:'2-digit'});
export const inputTime=(at:number)=>new Date(at+MYT).toISOString().slice(11,16);
export const totalLife=(d:State)=>d.nights.reduce((a,n)=>a+n.life,0)+d.legacy.filter(e=>!e.demo).reduce((a,e)=>a+e.life,0);
export function clockOut(d:State,at:number,id:string):State{const night=nightKey(at);if(d.nights.some(n=>n.night===night))return d;return {...d,nights:[{id,night,at,declaredAt:at,target:d.target,reason:d.draft.reason,note:d.draft.note,life:100+(d.draft.note.trim()||d.draft.gratitude?.trim()?50:0),gratitude:d.draft.gratitude?.trim()||'',corrected:false},...d.nights],draft:{reason:'',note:''}}}
export function correctNight(d:State,id:string,time:string,now:number):State{const n=d.nights.find(n=>n.id===id);if(!n)throw new Error('找不到这张小票');const at=atNightTime(n.night,time);if(at>now)throw new Error('这个时间还没到，不能预先记录。');return {...d,nights:d.nights.map(x=>x.id===id?{...x,at,corrected:true}:x)}}
export function parseState(raw:string):State{const d=JSON.parse(raw);if(d.version!==3||!Array.isArray(d.nights)||!Array.isArray(d.legacy)||!validTime(d.target))throw new Error('记录格式不完整');for(const n of d.nights){if(!Number.isFinite(n.at)||!Number.isFinite(n.life)||typeof n.night!=='string'||!validTime(n.target))throw new Error('收工记录不完整')}return {...initial,...d,draft:{...initial.draft,...d.draft}}}
export function migrate(raw:string):State{const old=JSON.parse(raw);if(!Array.isArray(old.history))throw new Error('旧版记录无法读取');const legacy=old.history.filter((x:Legacy)=>Number.isFinite(x.at)&&Number.isFinite(x.life)&&Number.isFinite(x.minutes));return {...initial,onboarded:!!old.onboarded,name:typeof old.name==='string'&&old.name!=='William'?old.name:'',city:typeof old.city==='string'?old.city:'Penang',target:validTime(old.desired)?old.desired:'00:00',legacy,migrated:true,draft:{reason:old.session?.reason||'',note:old.session?.note||''}}}

export function dueNotes(d:State,now:number){return d.nights.filter(n=>n.note.trim()&&!n.noteHandled&&now>=atNightTime(n.night,'07:00')&&now>n.at&&now>=(n.snoozeUntil||0))}
