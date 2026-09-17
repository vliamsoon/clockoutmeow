export type SoundMode='off'|'light'|'rest';
// File-backed HTML media playback stays on the browser's media playback path.
// Call play() synchronously in the tap handler, before awaiting its promise.
export class SoundEngine {
 private ambient:HTMLAudioElement|null=null;
 private strikes:HTMLAudioElement[]=[];
 private revision=0;
 mode:SoundMode='off';
 volume=.6;
 private make(name:string){const a=new Audio(`/audio/${name}.mp3`);a.preload='auto';a.volume=this.volume;a.muted=false;a.setAttribute('playsinline','');return a}
 setVolume(v:number){this.volume=Math.max(0,Math.min(1,v));if(this.ambient)this.ambient.volume=this.volume;this.strikes.forEach(a=>a.volume=this.volume)}
 async bowl(){this.strikes=this.strikes.filter(a=>!a.ended);if(this.strikes.length>=4){const oldest=this.strikes.shift()!;oldest.pause()}const a=this.make('bowl');this.strikes.push(a);try{await a.play()}catch(e){this.strikes=this.strikes.filter(x=>x!==a);throw e}}
 async play(mode:SoundMode){this.stop();if(mode==='off')return;const request=this.revision;const a=this.make(mode);a.loop=true;this.ambient=a;try{await a.play();if(request!==this.revision){a.pause();return}this.mode=mode}catch(e){a.pause();if(request!==this.revision)return;this.ambient=null;this.mode='off';throw e}}
 stop(){this.revision++;this.mode='off';if(this.ambient){this.ambient.pause();this.ambient.currentTime=0;this.ambient=null}}
 async silence(){this.stop();this.strikes.forEach(a=>{a.pause();a.currentTime=0});this.strikes=[]}
}
export const sound=new SoundEngine();
