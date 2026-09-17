'use client';
import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { Play, Pause, Volume2, Wind, Music2, RotateCcw } from 'lucide-react';
import { sound, type SoundMode } from '@/lib/sound';
export function SoundBar({ mode, onMode }: {
    mode: SoundMode;
    onMode: (m: SoundMode) => void;
}) { const { t, lang, setLang } = useI18n(); const [volume, setVolume] = useState(sound.volume), [audioStatus, setAudioStatus] = useState(''); return <div className="sound-bar"><span><Volume2 size={16}/>{t("房间的声音")}</span><div className="sound-options">{[['off', t("静音")], ['light', t("轻快")], ['rest', t("入夜")]].map(([v, l]) => <button key={v} className={mode === v ? 'active' : ''} aria-pressed={mode === v} onClick={() => onMode(v as SoundMode)}>{l}</button>)}</div><label>{t("音量")}<input aria-label={t("声音音量")} type="range" min="0" max="1" step=".01" value={volume} onChange={e => { const v = Number(e.target.value); setVolume(v); sound.setVolume(v); }}/></label><button className="text-button" onClick={async () => { try {
    await sound.bowl();
    setAudioStatus(t("试听已启动。若仍听不到，请调高手机媒体音量，或在 Safari / Chrome 打开。"));
}
catch {
    setAudioStatus(t("浏览器未能播放声音。请在 Safari / Chrome 打开再试。"));
} }}>{t("播放试听音")}</button>{audioStatus && <p className="tiny" role="status">{t(audioStatus)}</p>}<p className="tiny">{t("手机上请用侧边按键调整媒体音量。")}</p></div>; }
export function SlowSpace({ mode, onMode }: {
    mode: SoundMode;
    onMode: (m: SoundMode) => void;
}) {
    const { t, lang, setLang } = useI18n();
    const [tool, setTool] = useState<'bowl' | 'breath'>('bowl'), [hits, setHits] = useState(0), [preset, setPreset] = useState('gentle'), [running, setRunning] = useState(false), [elapsed, setElapsed] = useState(0), [finished, setFinished] = useState(false), [message, setMessage] = useState('');
    const start = useRef(0);
    const lengths = preset === 'gentle' ? [4, 4] : [4, 7, 8], cycle = lengths.reduce((a, b) => a + b, 0), duration = preset === 'gentle' ? 120 : 76;
    const pos = elapsed % cycle;
    let phase = 0, offset = pos;
    while (phase < lengths.length - 1 && offset >= lengths[phase]) {
        offset -= lengths[phase];
        phase++;
    }
    const label = preset === 'gentle' ? (phase === 0 ? t("轻轻吸气") : t("慢慢呼气")) : [t("轻轻吸气"), t("舒服地停一下"), t("慢慢呼气")][phase];
    const inhale = phase === 0, hold = preset === '478' && phase === 1;
    const scale = inhale ? .7 + .3 * offset / lengths[phase] : hold ? 1 : 1 - .3 * offset / lengths[phase];
    useEffect(() => { if (!running)
        return; start.current = performance.now() - elapsed * 1000; const t = setInterval(() => { const seconds = (performance.now() - start.current) / 1000; if (seconds >= duration) {
        setRunning(false);
        setFinished(true);
        setElapsed(0);
    }
    else
        setElapsed(seconds); }, 80); return () => clearInterval(t); }, [running, preset]);
    useEffect(() => { const hidden = () => { if (document.hidden) {
        setRunning(false);
        setMessage(t("已暂停。回来时，从舒服的地方继续。"));
    } }; document.addEventListener('visibilitychange', hidden); return () => document.removeEventListener('visibilitychange', hidden); }, []);
    function reset() { setRunning(false); setElapsed(0); setFinished(false); setMessage(''); }
    return <div className="view slow-space"><div className="section-kicker">{t("慢一点，也可以。")}</div><h1>{t("把声音放轻。")}<br />{t("把自己放松。")}</h1><p className="muted">{t("不用完成什么，也不用拿分。")}</p><div className="period-switch"><button className={tool === 'bowl' ? 'active' : ''} onClick={() => { reset(); setTool('bowl'); }}><Music2 size={16}/>{t("敲一下颂钵")}</button><button className={tool === 'breath' ? 'active' : ''} onClick={() => { reset(); setTool('breath'); }}><Wind size={16}/>{t("跟着呼吸")}</button></div>{tool === 'bowl' ? <><div className="bowl-space"><button className="bowl-button" aria-label={t("敲一次颂钵")} onClick={async () => { try {
        await sound.bowl();
        setHits(h => h + 1);
    }
    catch {
        setMessage(t("声音未开启，请再按一次。"));
    } }}><span className="bowl-word">{t("叩")}</span><small>{t("轻点一下")}</small>{hits > 0 && <span key={hits} className="bowl-ripple"/>}</button></div><h2 className="center">{t("一下就好。听它慢慢散开。")}</h2><p className="tiny center">{t("合成颂钵音色 · 每次点按独立敲响，约 10 秒渐弱。")}</p></> : <><div className="breath-presets"><button className={preset === 'gentle' ? 'active' : ''} onClick={() => { reset(); setPreset('gentle'); }}>{t("轻柔 4:4")}<small>{t("吸气 · 呼气，不憋气")}</small></button><button className={preset === '478' ? 'active' : ''} onClick={() => { reset(); setPreset('478'); }}>{t("4:7:8")}<small>{t("吸气 · 停留 · 呼气")}</small></button></div><div className="breath-stage"><svg className="breath-orbit" viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="108" fill="none" stroke="currentColor" strokeWidth="1" opacity=".25"/><circle cx="120" cy="12" r="5" fill="currentColor" transform={`rotate(${pos / cycle * 360} 120 120)`}/></svg><div className="breath-disc" style={{ transform: `scale(${running ? scale : .8})` }}/><div className="breath-label"><strong>{finished ? t("就到这里。") : running ? label : elapsed > 0 ? t("歇一下") : t("准备好了？")}</strong><span>{running ? Math.ceil(lengths[phase] - offset) : finished ? t("慢慢回到自然呼吸。") : preset === 'gentle' ? t("2 分钟 · 随时可以停") : t("4 轮 · 不要勉强憋气")}</span></div></div><div className="breath-controls"><button className="primary" onClick={() => { if (finished) {
        setElapsed(0);
        setFinished(false);
    } setRunning(!running); setMessage(''); }}>{running ? <Pause /> : <Play />}{running ? t("暂停一下") : elapsed > 0 ? t("继续") : t("开始呼吸")}</button><button className="icon-button" aria-label={t("重新开始呼吸")} onClick={reset}><RotateCcw size={20}/></button></div><p className="tiny">{t("数字只是引导。轻柔呼吸，不用吸满；若头晕或不舒服，停下并自然呼吸。憋气不舒服就选 4:4。")}</p><details className="breath-source"><summary>{t("为什么用这个节奏？")}</summary><p>{t("4:4 参考 NHS 的慢呼吸练习；4:7:8 是常见的放松呼吸法。这里按一拍约一秒引导，不是必须达到的目标，也不保证入睡。")}</p><a href="https://www.torbayandsouthdevon.nhs.uk/services/pain-service/reconnect2life/creating-skills-for-the-future/learning-relaxation-skills/deep-breathing-exercise/" target="_blank" rel="noreferrer">{t("NHS：慢呼吸")}</a> · <a href="https://health.clevelandclinic.org/4-7-8-breathing" target="_blank" rel="noreferrer">{t("Cleveland Clinic：4:7:8")}</a></details></>}{message && <p role="status" className="tiny">{t(message)}</p>}<SoundBar mode={mode} onMode={onMode}/></div>;
}
