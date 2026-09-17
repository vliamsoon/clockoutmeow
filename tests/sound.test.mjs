import test from 'node:test';
import assert from 'node:assert/strict';
import {SoundEngine} from '../lib/sound.ts';
const made=[];let fail=false,pending=null;
class FakeAudio{constructor(src){this.src=src;this.paused=true;this.ended=false;made.push(this)}setAttribute(){}play(){this.paused=false;return fail?Promise.reject(Error('blocked')):pending||Promise.resolve()}pause(){this.paused=true}}
globalThis.Audio=FakeAudio;
test('file playback starts, correct source and volume, mute stops all voices',async()=>{const s=new SoundEngine();await s.play('light');assert.equal(made.at(-1).src,'/audio/light.mp3');assert.equal(s.mode,'light');await s.bowl();assert.equal(made.at(-1).src,'/audio/bowl.mp3');s.setVolume(.8);assert.equal(made.at(-1).volume,.8);await s.silence();assert.equal(s.mode,'off');assert.ok(made.every(a=>a.paused))});
test('rejected playback never reports playing',async()=>{fail=true;const s=new SoundEngine();await assert.rejects(s.play('rest'));assert.equal(s.mode,'off');fail=false});
test('muting while browser is starting cannot restart sound',async()=>{let release;pending=new Promise(r=>release=r);const s=new SoundEngine();const start=s.play('rest');await s.silence();release();await start;assert.equal(s.mode,'off');assert.equal(made.at(-1).paused,true);pending=null});
