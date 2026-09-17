"use client";
import { useEffect, useRef, useState } from 'react';
import { LanguageProvider, useI18n } from '@/lib/i18n';
import { Power, House, Armchair, Sparkles, Settings2, ArrowUpRight, Check, Heart, LockKeyhole, ChevronRight, Leaf, Wind, Volume2, VolumeX } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { STORAGE_KEY, LEGACY_KEY, initial, furnishings, nightKey, mytHour, formatTime, inputTime, totalLife, clockOut, correctNight, parseState, dueNotes, atNightTime, validTime, type State, type Night } from '@/lib/clock-out';
const reasons = ['工作有点烦', '学业有点烦', '钱的事', '家里的事', '感情的事', '人类太吵', '今天很开心', '平静，没什么烦恼'];
import { SlowSpace, SoundBar } from '@/components/slow-space';
import { sound, type SoundMode } from '@/lib/sound';
const roomStages = [{ name: '留一点空白', cost: 0, src: '/room-starter.webp', copy: '亚麻、木色和一块阳光。少一点，刚刚好。' }, { name: '住进日常', cost: 600, src: '/room-cozy.webp', copy: '灯有了自己的位置，绿意与地毯也安顿下来。' }, { name: '慢慢有了家', cost: 2400, src: '/room-full.webp', copy: '咖啡机在边柜等明早，音箱和画都在各自的位置。' }];
function Pet({ asleep = false, interactive = true, onPet }: {
    asleep?: boolean;
    interactive?: boolean;
    onPet?: () => void;
}) {
    const { t, lang, setLang } = useI18n();
    const [happy, setHappy] = useState(false), [pets, setPets] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (timer.current)
        clearTimeout(timer.current); }, []);
    function touch() { if (!interactive)
        return; setPets(n => n + 1); setHappy(true); onPet?.(); if (timer.current)
        clearTimeout(timer.current); timer.current = setTimeout(() => setHappy(false), 2200); }
    return <div className={`pet ${asleep ? 'pet-asleep' : ''} ${happy ? 'pet-happy' : ''}`}><button className="pet-touch" disabled={!interactive} onClick={touch} aria-label={asleep ? t("轻轻摸摸睡着的阿懒") : t("摸摸阿懒")}><img src={asleep ? '/sleep.webp' : happy ? '/happy.webp' : '/cat.webp'} alt={asleep ? t("阿懒安心地睡了") : happy ? t("阿懒眯起眼睛，歪头蹭蹭") : t("阿懒，一只有点 blur 的猫")}/>{happy && <span className="pet-hearts" aria-hidden="true">♡　♡</span>}</button>{happy && <span className="pet-bubble" role="status">{asleep ? t("呼噜……明天再摸。") : pets > 2 ? t("够了啦，明天再摸。") : t("嗯……这边也要。")}</span>}</div>;
}
function Room({ stage, asleep }: {
    stage: number;
    asleep: boolean;
}) { const { t, lang, setLang } = useI18n(); const [touched, setTouched] = useState(false); const timer = useRef<ReturnType<typeof setTimeout> | null>(null); useEffect(() => () => { if (timer.current)
    clearTimeout(timer.current); }, []); return <div className={`premium-room ${asleep ? 'room-night' : ''} ${touched ? 'room-touched' : ''}`}><img key={stage} src={roomStages[stage].src} alt={t(roomStages[stage].copy)}/><div className="room-light"/><button className="room-cat-touch" aria-label={t("和房间里的阿懒打招呼")} onClick={() => { setTouched(true); if (timer.current)
    clearTimeout(timer.current); timer.current = setTimeout(() => setTouched(false), 2200); }}>{touched ? t("♡ 阿懒听见你了。") : t("摸摸阿懒 ♡")}</button><span className="room-edition">0{stage + 1} / {t(roomStages[stage].name)}</span></div>; }
export default function App() { return <LanguageProvider><AppContent /></LanguageProvider>; }
function AppContent() {
    const { t, lang, setLang } = useI18n();
    const [d, setD] = useState<State>(initial), [ready, setReady] = useState(false), [now, setNow] = useState(Date.now()), [tab, setTab] = useState('home'), [done, setDone] = useState<Night | null>(null), [settings, setSettings] = useState(false), [journal, setJournal] = useState(false), [help, setHelp] = useState(false), [reset, setReset] = useState(''), [toast, setToast] = useState(''), [error, setError] = useState(''), [period, setPeriod] = useState('month'), [preview, setPreview] = useState(false), [previewLevel, setPreviewLevel] = useState(2), [edit, setEdit] = useState<Night | null>(null), [editTime, setEditTime] = useState(''), [editError, setEditError] = useState(''), [setup, setSetup] = useState({ target: '00:00', name: '' }), [prefs, setPrefs] = useState({ name: '', city: 'Penang', target: '00:00', theme: 'auto' as State['theme'] }), [draft, setDraft] = useState({ reason: '', note: '', gratitude: '' }), [journalStep, setJournalStep] = useState(1), [soundMode, setSoundMode] = useState<SoundMode>('off'), [morning, setMorning] = useState(false), [morningReply, setMorningReply] = useState('');
    const stateRef = useRef(d);
    stateRef.current = d;
    useEffect(() => { try {
        let next = initial;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved)
            next = parseState(saved);
        setD(next);
    }
    catch {
        setError(t("记录暂时无法读取。为保护原记录，已暂停写入。请检查浏览器储存设置后刷新。"));
    } setReady(true); const tick = setInterval(() => setNow(Date.now()), 15000); const visible = () => { setNow(Date.now()); try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw)
            setD(parseState(raw));
    }
    catch {
        setError(t("暂时无法读取记录，请刷新后再试。"));
    } }; window.addEventListener('storage', visible); document.addEventListener('visibilitychange', visible); return () => { clearInterval(tick); window.removeEventListener('storage', visible); document.removeEventListener('visibilitychange', visible); }; }, []);
    useEffect(() => { if (!toast)
        return; const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); }, [toast]);
    const due = dueNotes(d, now), firstDue = due[0];
    useEffect(() => { if (ready && firstDue) {
        setMorning(true);
        setMorningReply(firstDue.morningReply || '');
    } }, [ready, firstDue?.id]);
    useEffect(() => { const hidden = () => { if (document.hidden) {
        void sound.silence();
        setSoundMode('off');
    } }; document.addEventListener('visibilitychange', hidden); return () => { document.removeEventListener('visibilitychange', hidden); void sound.silence(); }; }, []);
    async function changeSound(mode: SoundMode) { try {
        if (mode === 'off')
            await sound.silence();
        else
            await sound.play(mode);
        setSoundMode(sound.mode);
    }
    catch {
        setToast(t("浏览器未能播放声音。请点「播放试听音」，或在 Safari / Chrome 打开。"));
        setSoundMode('off');
    } }
    function beginJournal() { setDraft({ reason: d.draft.reason, note: d.draft.note, gratitude: d.draft.gratitude || '' }); setJournalStep(1); setJournal(true); }
    function laterNote() { if (firstDue)
        save(s => ({ ...s, nights: s.nights.map(n => n.id === firstDue.id ? { ...n, snoozeUntil: Date.now() + 3600000 } : n) })); setMorning(false); }
    function save(fn: (s: State) => State): State | null { if (error)
        return null; try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const next = fn(raw ? parseState(raw) : stateRef.current);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        stateRef.current = next;
        setD(next);
        return next;
    }
    catch {
        setError(t("没有保存成功。请允许浏览器储存后刷新；本次不会显示已完成。"));
        return null;
    } }
    const today = d.nights.find(n => n.night === nightKey(now));
    const life = totalLife(d), level = life >= 2400 ? 2 : life >= 600 ? 1 : 0;
    const soft = d.theme === 'soft' || (d.theme === 'auto' && (mytHour(now) >= 21 || mytHour(now) < 7));
    useEffect(() => { document.documentElement.dataset.tone = soft ? 'soft' : 'light'; return () => { delete document.documentElement.dataset.tone; }; }, [soft]);
    useEffect(() => { const ctx = (document as any).modelContext; if (!ctx?.registerTool)
        return; const lifeCycle = new AbortController(); Promise.resolve(ctx.registerTool({ name: 'get_clock_out_summary', description: 'Read self-reported clock-out nights and LIFE. Does not measure sleep or app usage.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: (v: unknown) => { if (!v || typeof v !== 'object' || Object.keys(v).length)
            throw Error('Expected empty object'); return { recordedNights: d.nights.length, life: totalLife(d), tonightRecorded: !!today, source: 'self-reported' }; } }, { signal: lifeCycle.signal })).catch(() => { }); return () => lifeCycle.abort(); }, [d, today]);
    function finish() { void sound.silence(); setSoundMode('off'); const at = Date.now(); const next = save(s => clockOut(s, at, crypto.randomUUID())); if (next) {
        setNow(at);
        setDone(next.nights.find(n => n.night === nightKey(at))!);
        setPreview(false);
    } }
    function openSettings() { setPrefs({ name: d.name, city: d.city, target: d.target, theme: d.theme }); setSettings(true); }
    const recentStart = nightKey(now - 6 * 86400000);
    const filtered = d.nights.filter(n => period === 'week' ? n.night >= recentStart : n.night.slice(0, 7) === nightKey(now).slice(0, 7));
    const met = filtered.filter(n => n.at <= atNightTime(n.night, n.target)).length;
    function openEdit(n: Night) { setEdit(n); setEditTime(inputTime(n.at)); setEditError(''); }
    if (!ready)
        return <main className="loading"><Power /><p>{t("猫在伸懒腰……")}</p></main>;
    return <div className="app-shell"><header className="brandbar"><button className="brand" onClick={() => { setDone(null); setTab('home'); setPreview(false); }} aria-label={t("返回首页")}><span className="brand-icon"><Power size={21}/></span><span>{t("今晚收工")}<small>{lang === 'zh' ? 'CLOCK OUT' : 'TAKE YOUR NIGHT BACK'}</small></span></button><button className="language-toggle" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}><span className={lang === 'zh' ? 'active' : ''}>CH</span><span className={lang === 'en' ? 'active' : ''}>EN</span></button><button className="icon-button sound-toggle" aria-label={soundMode === 'off' ? t("开启轻音乐") : t("关闭声音")} onClick={() => changeSound(soundMode === 'off' ? 'light' : 'off')}>{soundMode === 'off' ? <VolumeX size={19}/> : <Volume2 size={19}/>}</button><button className="icon-button" onClick={openSettings} aria-label={t("个人设置")}><Settings2 size={21}/></button></header>{error && <p role="alert" className="notice">{t(error)}</p>}
 {!d.onboarded ? <main className="view onboarding-v2"><span className="eyebrow">{t("把今晚还给自己。")}</span><h1>{t("先把今天，")}<br />{t("轻轻放下来。")}</h1><p className="muted">{t("记一下心情，把脑中的事先放好。")}<br />{t("明天再处理，今晚先收工。")}</p><Pet interactive={false}/><label className="setup-label">{t("通常想几点结束刷手机？")}<input type="time" value={setup.target} onChange={e => setSetup({ ...setup, target: e.target.value })}/></label><p className="tiny">{t("只是你自己的参考时间。晚一点也不会扣分。")}</p><button className="primary" disabled={!validTime(setup.target) || !!error} onClick={() => { if (save(s => ({ ...s, onboarded: true, target: setup.target })))
            void changeSound('light'); }}>{t("开始 · 开启轻音乐")}<ArrowUpRight /></button><button className="text-button" disabled={!validTime(setup.target) || !!error} onClick={() => save(s => ({ ...s, onboarded: true, target: setup.target }))}>{t("安静开始")}</button><p className="tiny center">{t("全新体验，零记录。旧版测试数据不导入。")}</p></main> : done ? <main className="view goodbye"><span className="completion-stamp"><Check size={16}/>{t("今晚已收工 ·")}{formatTime(done.at)}</span><h1>{t("Okay lah。")}<br />{t("今天就到这里。")}</h1><p className="muted">{t("现在可以关掉这里了。")}<br />{t("猫不用喂，奖励也不用回来领。")}</p><div className="lights-out"><Pet asleep interactive={false}/></div><div className="quiet-reward"><Sparkles size={18}/><b>+{done.life}{t("LIFE 已记好")}</b><span>{done.life === 150 ? t("收工 100 + 写下来 50。") : t("每晚一份，不用抢。")}</span></div><p className="goodbye-line">{t("「我先躺了。明天见。」")}</p><button className="text-button" onClick={() => { setDone(null); setTab('home'); }}>{t("返回首页")}</button><p className="tiny center">{t("记录的是你决定收工的时间，不是检测到的入睡时间。")}</p></main> : <Tabs value={tab} onValueChange={v => { setTab(v); setPreview(false); }} className="main-tabs"><TabsContent value="home" className="view home-v2"><div className="date-row"><span>{new Date(now).toLocaleDateString(lang === 'en' ? 'en-MY' : 'zh-CN', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'long' })} · {t(d.city)}</span><span className="small-clock">{formatTime(now)}</span></div>{d.migrated && <div className="migration-note"><span>{t("新版不用倒数了。旧记录和真实 LIFE 已保留。")}</span><button aria-label={t("关闭更新提示")} onClick={() => save(s => ({ ...s, migrated: false }))}>{t("知道了")}</button></div>}<div className="home-copy"><span className="eyebrow">{today ? t("今天已经够了。") : t("{0}，这会儿是你的时间。", { "0": d.name.trim() || t("老板") })}</span><h1>{today ? <>{t("收工了，")}<br />{t("不用再营业。")}</> : <>{t("把今晚，")}<br />{t("还给自己。")}</>}</h1><p className="muted">{today ? t("没有下一关。也没有漏领的奖励。") : mytHour(now) >= 7 && mytHour(now) < 18 ? t("不急。等你准备结束今天，再来按一下。") : t("不用把所有东西刷完，今天也可以结束。")}</p></div><div className="home-pet"><Pet asleep={!!today}/><span className="pet-name">{t("阿懒")}<span>· {today ? t("已下班") : t("陪你收尾")}</span></span></div><button className={`primary main-cta ${today ? 'finished-cta' : ''}`} disabled={!!error} onClick={() => today ? setDone(today) : beginJournal()}><Power size={24}/><span>{today ? t("今晚已收工") : t("今天够了，我收工了。")}<small>{today ? t("{0} · +{1} LIFE 已记好", { "0": formatTime(today.at), "1": today.life }) : t("先选心情，写下来，再安心离开。")}</small>{today ? <Check /> : <ArrowUpRight />}</span></button>{today ? <button className="text-button" onClick={() => openEdit(today)}>{t("后来又刷了一下？修正时间就好。")}</button> : <button className="text-button" onClick={beginJournal}>{d.draft.note || d.draft.reason ? t("有些东西已放下 · 查看") : t("脑袋还很吵？放点东西下来。")} <span className="optional">{t("可跳过")}</span></button>}<div className="home-summary"><div><span>{t("自己的参考时间")}</span><b>{d.target}</b></div><div><span>{t("最近 7 晚记录")}</span><b>{d.nights.filter(n => n.night >= recentStart).length}<small>{t("晚收工")}</small></b></div></div><button className="how-link" onClick={() => setHelp(true)}>{t("怎么算收工与 LIFE？")}</button></TabsContent>
 <TabsContent value="room" className="view room-v3"><div className="section-kicker">{t("阿懒的慢生活")}<span>{preview ? t("空间预览") : t("居所 0{0}", { "0": level + 1 })}</span></div><h1>{t("一间房，")}<br />{t("慢慢住成家。")}</h1><p className="muted">{t("光落下来。猫躺好了。你也可以慢一点。")}</p><Room stage={preview ? previewLevel : level} asleep={!!today}/><div className="room-description"><span>{preview ? t("正在预览") : t("你的居所")}</span><h2>{t(roomStages[preview ? previewLevel : level].name)}</h2><p>{t(roomStages[preview ? previewLevel : level].copy)}</p></div><SoundBar mode={soundMode} onMode={changeSound}/><div className="upgrade-panel"><div><span>{t("你的 LIFE")}</span><b>{life.toLocaleString()}</b></div><div className="progress-track"><i style={{ width: `${level === 2 ? 100 : Math.min(100, life / roomStages[level + 1].cost * 100)}%` }}/></div><p>{level === 2 ? t("咖啡机已在边柜。明早再开机，今晚先休息。") : t("再 {0} LIFE，整个房间一起焕新。", { "0": roomStages[level + 1].cost - life })}</p></div><div className="room-chapters">{roomStages.map((r, i) => <button key={r.src} className={(preview ? previewLevel : level) === i ? 'active' : ''} onClick={() => { setPreview(i !== level); setPreviewLevel(i); }}><span>0{i + 1}</span><div><b>{t(r.name)}</b><small>{life >= r.cost ? t("已入住") : t("{0} LIFE · 可预览", { "0": r.cost })}</small></div><ChevronRight size={16}/></button>)}</div>{preview && <button className="text-button" onClick={() => setPreview(false)}>{t("预览不加分 · 回自己的房间")}</button>}<p className="tiny center">{t("每次收工，让日常多一点质感。")}</p></TabsContent>
 <TabsContent value="slow"><SlowSpace mode={soundMode} onMode={changeSound}/></TabsContent>
 <TabsContent value="life" className="view life-v2"><div className="section-kicker">{t("属于你的收工记录")}<Leaf size={18}/></div><h1>{t("记下结束，")}<br />{t("不用交成绩。")}</h1><div className="period-switch" role="group" aria-label={t("统计范围")}>{[['week', t("最近 7 晚")], ['month', t("这个月")]].map(([v, l]) => <button key={v} aria-pressed={period === v} className={period === v ? 'active' : ''} onClick={() => setPeriod(v)}>{l}</button>)}</div><div className="life-hero"><span>{period === 'week' ? t("最近 7 晚") : t("这个月")}{t("，你记下了")}</span><strong>{filtered.length}<small>{lang === 'en' && filtered.length === 1 ? ' night off' : t("晚收工")}</small></strong><p>{t("都是你说「今天够了」的时刻。")}</p><div><span>{met}{lang === 'en' && met === 1 ? ' night at or before your chosen time' : t("晚达到当晚自己设的参考时间")}</span><Check size={19}/></div></div><p className="source-note">{t("来自你自己的记录。没有监测睡眠或其他 app。")}</p><div className="life-total"><Sparkles /><span>{t("你的 LIFE")}</span><b>{life.toLocaleString()}</b></div><div className="calendar-card"><div className="section-kicker">{t("最近 28 晚")}</div><div className="activity-grid">{Array.from({ length: 28 }, (_, i) => { const key = nightKey(now - (27 - i) * 86400000), n = d.nights.find(n => n.night === key); return <span key={key} title={`${key} · ${n ? formatTime(n.at) : t("没有记录")}`} aria-label={`${key} ${n ? t("已收工") : t("没有记录")}`} className={n ? 'filled' : ''}>{n ? <Power size={17}/> : Number(key.slice(-2))}</span>; })}</div><p>{t("空白只是没有记录。不是失败。")}</p></div><div className="section-kicker history-title">{t("收工小票")}<span>{d.nights.length}{t("晚")}</span></div>{!d.nights.length && <div className="empty-state"><Power size={28}/><h3>{t("第一晚，慢慢来。")}</h3><p>{t("准备结束今天时，回首页按一下就好。")}</p><button className="text-button" onClick={() => setTab('home')}>{t("回首页")}<ChevronRight size={16}/></button></div>}{d.nights.map(n => <details className="history-item" key={n.id}><summary><div className="history-icon"><Power size={18}/></div><div><b>{n.night}{t("的晚上")}</b><span>{formatTime(n.at)} · {n.corrected ? t("已修正 · ") : ''}{t("自行记录")}</span></div><div><b>+{n.life} LIFE</b></div></summary><p>{t(n.reason) || t("今天就到这里。")}{n.note ? `\n${n.note}` : ''}{n.gratitude ? t("\n今天想谢谢：{0}", { "0": n.gratitude }) : ''}{n.morningReply ? t("\n次日回复：{0}", { "0": n.morningReply }) : ''}</p><button className="text-button" onClick={() => openEdit(n)}>{t("修正这晚的收工时间")}</button></details>)}{d.legacy.length > 0 && <details className="legacy-records"><summary>{t("旧版计时记录 ·")}{d.legacy.length}{t("条")}</summary><p className="tiny">{t("保留原记录。不会计入新版收工晚数。真实 LIFE 保留；示范积分不计入房间。")}</p>{d.legacy.map((e, i) => <div className="legacy-row" key={`${e.id}-${i}`}><span>{new Date(e.at).toLocaleDateString(lang === 'en' ? 'en-MY' : 'zh-CN', { timeZone: 'Asia/Kuala_Lumpur' })} · {e.minutes} min {e.demo ? t("· 示例") : ''}</span><b>{e.life} LIFE</b>{e.note && <p>{e.note}</p>}</div>)}{d.legacy.some(e => e.demo) && <button className="text-button" onClick={() => setReset('demo')}>{t("清除旧版示范记录")}</button>}</details>}<button className="how-link" onClick={() => setHelp(true)}>{t("了解记录方式")}</button></TabsContent>
 <TabsList className="bottom-nav"><TabsTrigger value="home"><House /><span>{t("Home")}</span></TabsTrigger><TabsTrigger value="room"><Armchair /><span>{t("Room")}</span></TabsTrigger><TabsTrigger value="slow"><Wind /><span>{t("慢一点")}</span></TabsTrigger><TabsTrigger value="life"><Sparkles /><span>{t("My LIFE")}</span></TabsTrigger></TabsList></Tabs>}
 <Dialog open={journal} onOpenChange={setJournal}><DialogContent className="custom-dialog journal-dialog"><span className="eyebrow">{t("今晚的小收尾 ·")}{journalStep} / 2</span><DialogTitle>{journalStep === 1 ? t("今天，心里是什么天气？") : t("脑中的事，先写下来。")}</DialogTitle><DialogDescription>{journalStep === 1 ? t("有点烦也可以，很开心也可以。") : t("写下来，明天再烦。有写便条或感恩，每晚额外 +50 LIFE。")}</DialogDescription>{journalStep === 1 ? <><div className="mood-grid">{reasons.map(r => <button aria-pressed={draft.reason === r} className={draft.reason === r ? 'selected' : ''} key={r} onClick={() => setDraft({ ...draft, reason: r })}>{t(r)}</button>)}</div><button className="primary" onClick={() => setJournalStep(2)}>{t("下一步")}<ChevronRight /></button><button className="text-button" onClick={() => { setDraft({ ...draft, reason: '' }); setJournalStep(2); }}>{t("不想选，继续")}</button></> : <><div className="note-examples"><span>{t("例如，明天要……")}</span>{[t("赶完 proposal"), t("send 出那封 email"), t("提醒某个人一件事")].map(x => <button key={x} onClick={() => setDraft({ ...draft, note: draft.note ? draft.note + '\n' + x : x })}>{x} ＋</button>)}</div><textarea aria-label={t("明天再处理的便条")} placeholder={t("写你自己的事。不用写得好，记得住就好。")} maxLength={1000} value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })}/><label>{t("今天有一件想谢谢的事吗？（选填）")}<input aria-label={t("感恩日记")} placeholder={t("一杯好喝的咖啡，或一个有听我说话的人。")} maxLength={300} value={draft.gratitude} onChange={e => setDraft({ ...draft, gratitude: e.target.value })}/></label><p className="tiny">{t("便条会在次日早上 7 点后重新打开 app 时出现。感恩留在小票里，不用变成待办。")}</p><button className="primary" onClick={() => { if (save(s => ({ ...s, draft }))) {
        setJournal(false);
        finish();
    } }}>{t("今天就到这里。")}<span>+{draft.note.trim() || draft.gratitude.trim() ? 150 : 100} LIFE</span></button><button className="text-button" onClick={() => setJournalStep(1)}>{t("回去改心情")}</button></>}</DialogContent></Dialog>
 <Dialog open={morning && !!firstDue} onOpenChange={v => !v && laterNote()}><DialogContent className="custom-dialog morning-note"><span className="eyebrow">{t("昨天的你，留了一张便条。")}</span><DialogTitle>{t("早。这个交回给你。")}</DialogTitle><DialogDescription>{t("不催你，只是不用再靠脑袋记着。")}{due.length > 1 ? t("还有 {0} 张便条。", { "0": due.length - 1 }) : ''}</DialogDescription><p className="morning-paper">{firstDue?.note}</p><label>{t("回一句，或补充一下（选填）")}<textarea value={morningReply} maxLength={1000} onChange={e => setMorningReply(e.target.value)} placeholder={t("已经处理好了，或今天先做第一步……")}/></label><button className="primary" onClick={() => { if (firstDue && save(s => ({ ...s, nights: s.nights.map(n => n.id === firstDue.id ? { ...n, noteHandled: true, morningReply } : n) }))) {
        setMorning(false);
        setToast(t("收好了。便条和回复都留在小票里。"));
    } }}>{t("收到，先收起来")}<Check /></button><button className="text-button" onClick={laterNote}>{t("一小时后再提醒我")}</button><p className="tiny">{t("只在打开 app 时提醒，不会发送系统通知。")}</p></DialogContent></Dialog>
 <Dialog open={settings} onOpenChange={setSettings}><DialogContent className="custom-dialog"><DialogTitle>{t("随你舒服。")}</DialogTitle><div className="language-setting"><span>{lang === 'zh' ? '语言' : 'Language'}</span><button aria-pressed={lang === 'zh'} onClick={() => setLang('zh')}>中文</button><button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button></div><DialogDescription>{t("不用把生活设定得很完美。")}</DialogDescription><label>{t("怎么称呼你？（可不填）")}<input placeholder={t("老板")} maxLength={18} value={prefs.name} onChange={e => setPrefs({ ...prefs, name: e.target.value })}/></label><label>{t("城市")}<select value={prefs.city} onChange={e => setPrefs({ ...prefs, city: e.target.value })}>{['Penang', 'Kuala Lumpur', 'Johor Bahru', 'Ipoh', 'Kuching', '其他城市'].map(c => <option key={c} value={c}>{t(c)}</option>)}</select></label><label>{t("自己的收工参考时间")}<input type="time" value={prefs.target} onChange={e => setPrefs({ ...prefs, target: e.target.value })}/></label><p className="tiny">{t("改变只影响之后的记录。不影响 LIFE，也不会发送提醒。")}</p><label>{t("屏幕感觉")}<select value={prefs.theme} onChange={e => setPrefs({ ...prefs, theme: e.target.value as State['theme'] })}><option value="auto">{t("跟随马来西亚时间 · 晚上柔和")}</option><option value="light">{t("明亮奶油白")}</option><option value="soft">{t("柔和暖灰")}</option></select></label><button className="primary" disabled={!validTime(prefs.target)} onClick={() => { if (save(s => ({ ...s, ...prefs, name: prefs.name.trim() })))
        setSettings(false); }}>{t("Okay，搞定")}<Check /></button><p className="tiny">{t("资料只保存在这个浏览器，不会跨设备同步。")}</p><button className="text-button" onClick={() => { setSettings(false); setReset('all'); }}>{t("重置全部资料")}</button></DialogContent></Dialog>
 <Dialog open={!!edit} onOpenChange={v => !v && setEdit(null)}><DialogContent className="custom-dialog"><DialogTitle>{t("后来几点才收工？")}</DialogTitle><DialogDescription>{edit?.night}{t("的晚上。改一下就好，不扣 LIFE，也不重复加分。")}</DialogDescription><label>{t("收工时间")}<input type="time" value={editTime} onChange={e => { setEditTime(e.target.value); setEditError(''); }}/></label><p className="tiny">{t("中午 12 点到次日中午前，算同一晚。")}</p>{editError && <p role="alert">{t(editError)}</p>}<button className="primary" disabled={!validTime(editTime)} onClick={() => { if (!edit)
        return; try {
        correctNight(d, edit.id, editTime, Date.now());
        if (save(s => correctNight(s, edit.id, editTime, Date.now()))) {
            setEdit(null);
            setToast(t("时间改好了。没有扣分。"));
        }
    }
    catch (e) {
        setEditError((e as Error).message);
    } }}>{t("记下这个时间")}<Check /></button></DialogContent></Dialog>
 <Dialog open={help} onOpenChange={setHelp}><DialogContent className="custom-dialog"><DialogTitle>{t("一个小约定。")}</DialogTitle><DialogDescription>{t("我们记下你决定结束的时刻，不检查你有没有睡着。")}</DialogDescription><div className="help-copy"><p><b>{t("收工 100，写下来再加 50")}</b><br />{t("完成收尾就保存。写便条或感恩可加 50 LIFE，每晚最多 150。早晚不影响分数，重复点击不重复加分。")}</p><p><b>{t("同一晚，只记一次")}</b><br />{t("按马来西亚时间，中午 12 点到次日中午前算一晚。凌晨回来不会重复加分。")}</p><p><b>{t("锁屏、换 app 都不监控")}</b><br />{t("新版没有后台计时，也不会因为离开页面就误判你。后来又刷了，可以自己修正时间。")}</p><p><b>{t("记录不是睡眠证明")}</b><br />{t("这里没有“验证离线分钟”。房间随真实记录的 LIFE 解锁；没有排行榜，也不用证明给谁看。")}</p></div><button className="primary" onClick={() => setHelp(false)}>{t("懂了")}<Check /></button></DialogContent></Dialog>
 <AlertDialog open={!!reset} onOpenChange={v => !v && setReset('')}><AlertDialogContent className="custom-dialog"><AlertDialogTitle>{reset === 'demo' ? t("清除旧示范记录？") : t("重新开始？")}</AlertDialogTitle><AlertDialogDescription>{reset === 'demo' ? t("真实旧记录、新收工记录与 LIFE 都会保留。") : t("这个浏览器的所有记录、笔记与家具进度都会删除，无法恢复。")}</AlertDialogDescription><AlertDialogCancel>{t("先不要")}</AlertDialogCancel><AlertDialogAction onClick={() => { if (reset === 'demo')
        save(s => ({ ...s, legacy: s.legacy.filter(e => !e.demo) }));
    else {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
            localStorage.removeItem(LEGACY_KEY);
            setD(initial);
            stateRef.current = initial;
            setDone(null);
            setTab('home');
            setError('');
        }
        catch {
            setError(t("重置未完成，请检查浏览器储存设置。"));
        }
    } setReset(''); }}>{t("确认清除")}</AlertDialogAction></AlertDialogContent></AlertDialog>
 {toast && <div className="toast" role="status"><Check size={17}/>{t(toast)}</div>}
 </div>;
}
