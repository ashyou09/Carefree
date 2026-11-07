"use client";
import PasswordInput from "./PasswordInput";
import { Logo, Leaves } from "./Art";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AM_STEPS, HABITS, PRODUCTS, RULES, PACKS, MEALS, DRINKS, LOW_BP, WEEK_NEWS,
  NIGHT_LABEL, NIGHT_NOTE, nightSteps, nightType, dayNumber, weekOf, addDays, weekdayIdx, Step,
} from "@/lib/plan";

type Me = { name: string; username: string; startDate: string; productStatus: Record<string, string> };
type Log = { date: string; checks?: Record<string, boolean>; rating?: number; note?: string; reaction?: boolean };
type Tab = "today" | "routine" | "products" | "food" | "progress";

const PLAN_DAYS = 30;
const todayIST = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const prettyDate = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function stepsFor(start: string, date: string): Step[] {
  return [...AM_STEPS, ...nightSteps(start, date), ...HABITS];
}
function completion(start: string, log?: Log) {
  if (!log) return 0;
  const steps = stepsFor(start, log.date);
  const done = steps.filter((s) => log.checks?.[s.id]).length;
  return done / steps.length;
}

const Tick = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 8.5l3 3 7-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export default function Dashboard() {
  const [me, setMe] = useState<Me | null>(null);
  const [logs, setLogs] = useState<Record<string, Log>>({});
  const [tab, setTab] = useState<Tab>("today");
  const [date, setDate] = useState<string>(todayIST());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const pending = useRef(0);

  const load = useCallback(async () => {
    try {
      const [m, l] = await Promise.all([fetch("/api/me"), fetch("/api/logs")]);
      if (m.status === 401) { window.location.href = "/login"; return; }
      if (!m.ok || !l.ok) throw new Error();
      const meData: Me = await m.json();
      const logData: { logs: Log[] } = await l.json();
      if (pending.current > 0) return; // don't overwrite a tick that is still saving
      setMe(meData);
      setLogs(Object.fromEntries(logData.logs.map((x) => [x.date, x])));
      setError("");
    } catch {
      setError("Can't reach the server. Your last changes may not be saved.");
    }
  }, []);

  // initial load + live refresh (other phone / laptop) every 15 s and when the app comes back to front
  useEffect(() => {
    load();
    const id = setInterval(() => document.visibilityState === "visible" && load(), 15000);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", onVis); };
  }, [load]);

  async function send(url: string, method: string, body: unknown) {
    pending.current++;
    setSaving(true);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (!res.ok) throw new Error();
      setError("");
    } catch {
      setError("Couldn't save. Check your internet and try again.");
    } finally {
      pending.current--;
      if (pending.current === 0) setSaving(false);
    }
  }

  function patchLog(d: string, patch: Partial<Log>, body: Record<string, unknown>) {
    setLogs((prev) => {
      const cur = prev[d] || { date: d, checks: {} };
      return { ...prev, [d]: { ...cur, ...patch, checks: { ...cur.checks, ...(patch.checks || {}) } } };
    });
    send("/api/logs", "PUT", { date: d, ...body });
  }
  const toggle = (id: string) => {
    const v = !logs[date]?.checks?.[id];
    patchLog(date, { checks: { [id]: v } }, { check: { id, value: v } });
  };

  // debounce diary text
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function setNote(text: string) {
    setLogs((prev) => ({ ...prev, [date]: { ...(prev[date] || { date, checks: {} }), note: text } }));
    if (noteTimer.current) clearTimeout(noteTimer.current);
    const d = date;
    noteTimer.current = setTimeout(() => send("/api/logs", "PUT", { date: d, note: text }), 700);
  }

  function setProduct(id: string, status: string) {
    if (!me) return;
    setMe({ ...me, productStatus: { ...me.productStatus, [id]: status } });
    send("/api/me", "PATCH", { product: { id, status } });
  }

  if (!me) {
    return (
      <main className="auth center">
        <p className="muted">{error || "Loading your plan…"}</p>
      </main>
    );
  }

  const today = todayIST();
  const day = dayNumber(me.startDate, date);
  const todayNum = dayNumber(me.startDate, today);
  const log = logs[date];

  const TABS: [Tab, string, React.ReactNode][] = [
    ["today", "Today", <path key="a" d="M4 7h16M7 3v4m10-4v4M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zm4 9l2 2 4-4" />],
    ["routine", "Routine", <path key="b" d="M12 3c3 3 5 6 5 9a5 5 0 01-10 0c0-3 2-6 5-9z" />],
    ["products", "Products", <path key="c" d="M9 3h6v4l2 3v10a1 1 0 01-1 1H8a1 1 0 01-1-1V10l2-3V3zM7 13h10" />],
    ["food", "Food", <path key="d" d="M5 11h14a7 7 0 01-14 0zM9 7c0-2 2-2 2-4m2 4c0-2 2-2 2-4" />],
    ["progress", "Progress", <path key="e" d="M4 20V10m6 10V4m6 16v-7m4 7H2" />],
  ];
  const go = (id: Tab) => { setTab(id); if (id === "today") setDate(today); window.scrollTo(0, 0); };
  const navIcon = (icon: React.ReactNode) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{icon}</svg>
  );
  const TITLES = { routine: ["The ritual", "Your routine"], products: ["Your shelf", "Products"], food: ["Inside out", "Food & drinks"], progress: ["30 days", "Your progress"] } as const;

  return (
    <div className="app">
      <div className={`saving ${saving ? "show" : ""}`}>Saving…</div>

      <aside className="side" aria-label="Main menu">
        <div className="brand-row"><Logo /><span className="brand">Carefree</span></div>
        <nav className="side-nav">
          {TABS.map(([id, label, icon]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => go(id)} aria-current={tab === id ? "page" : undefined}>
              {navIcon(icon)}{label}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <div className="who"><span className="avatar">{me.name.charAt(0).toUpperCase()}</span><div><b>{me.name}</b><small>@{me.username}</small></div></div>
          <div className="side-actions">
            <button className="ghost-btn" onClick={() => setShowSettings(true)}>Settings</button>
            <button className="ghost-btn danger" onClick={() => setShowReset(true)}>Reset</button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="brand-row"><Logo /><span className="brand">Carefree</span></div>
          <div className="top-actions">
            <button className="ghost-btn danger" onClick={() => setShowReset(true)}>Reset</button>
            <button className="ghost-btn" onClick={() => setShowSettings(true)} aria-label="Settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-2.7-1.1l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 003 15.4H3a2 2 0 110-4h.1A1.6 1.6 0 004.6 8.6l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V4a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" /></svg>
            </button>
          </div>
        </header>

        {error && <div className="offline" role="status">{error}</div>}

        <div className="wrap">
          {tab === "today" ? (
            <TodayHero name={me.name} date={date} setDate={setDate} day={day} today={today} start={me.startDate} log={log} />
          ) : (
            <header className="page-head">
              <div className="kicker">{TITLES[tab][0]}</div>
              <h1>{TITLES[tab][1]}</h1>
              <p className="muted">{todayNum >= 1 ? `Day ${Math.min(todayNum, 999)} of ${PLAN_DAYS} · Week ${weekOf(todayNum)}` : `Plan starts ${prettyDate(me.startDate)}`}</p>
            </header>
          )}

          {tab === "today" && (
            <TodayView start={me.startDate} date={date} day={day} log={log} toggle={toggle} setNote={setNote}
              setRating={(r) => patchLog(date, { rating: r }, { rating: r })}
              setReaction={(v) => patchLog(date, { reaction: v }, { reaction: v })} />
          )}
          {tab === "routine" && <RoutineView start={me.startDate} today={today} />}
          {tab === "products" && <ProductsView status={me.productStatus} setProduct={setProduct} />}
          {tab === "food" && <FoodView />}
          {tab === "progress" && (
            <ProgressView start={me.startDate} today={today} logs={logs} open={(d) => { setDate(d); setTab("today"); window.scrollTo(0, 0); }} />
          )}
          <p className="foot">General wellness guidance, not medical advice. Patch test every new product.</p>
        </div>
      </div>

      <nav className="tabbar" aria-label="Sections">
        {TABS.map(([id, label, icon]) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => go(id)} aria-current={tab === id ? "page" : undefined}>
            {navIcon(icon)}<span>{label}</span>
          </button>
        ))}
      </nav>

      {showReset && <ResetDialog onClose={() => setShowReset(false)} onDone={() => { setShowReset(false); setDate(todayIST()); setTab("today"); load(); }} />}
      {showSettings && <Settings me={me} onClose={() => setShowSettings(false)} onSaved={load} />}
    </div>
  );
}

/* ---------------- TODAY ---------------- */
function Ring({ pct }: { pct: number }) {
  const r = 46, c = 2 * Math.PI * r;
  return (
    <div className="ring" aria-label={`${Math.round(pct * 100)}% of today done`}>
      <svg viewBox="0 0 110 110" aria-hidden>
        <circle cx="55" cy="55" r={r} className="ring-bg" />
        <circle cx="55" cy="55" r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="ring-txt"><b>{Math.round(pct * 100)}<i>%</i></b><span>today</span></div>
    </div>
  );
}

function TodayHero({ name, date, setDate, day, today, start, log }: { name: string; date: string; setDate: (d: string) => void; day: number; today: string; start: string; log?: Log }) {
  const isToday = date === today;
  const pct = completion(start, log);
  const done = (steps: Step[]) => steps.filter((s) => log?.checks?.[s.id]).length;
  const night = nightSteps(start, date);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <section className="hero">
      <Leaves />
      <div className="hero-main">
        <div className="hero-copy">
          <div className="kicker">{greet}, {name.split(" ")[0]}</div>
          <h1>{day < 1 ? "Starts soon" : day > PLAN_DAYS ? <>Day {day}</> : <>Day {day} <em>of {PLAN_DAYS}</em></>}</h1>
          <p className="hero-sub">{day >= 1 ? `Week ${weekOf(day)} · ` : ""}{NIGHT_LABEL[nightType(start, date)]} tonight</p>
        </div>
        <Ring pct={pct} />
      </div>
      <div className="hero-pills">
        <span className="hp"><i className="dot sun" />Morning <b>{done(AM_STEPS)}/{AM_STEPS.length}</b></span>
        <span className="hp"><i className="dot moon" />Night <b>{done(night)}/{night.length}</b></span>
        <span className="hp"><i className="dot leaf" />Habits <b>{done(HABITS)}/{HABITS.length}</b></span>
      </div>
      <div className="day-nav">
        <button aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}>‹</button>
        <span className="lbl">{isToday ? <>Today · {prettyDate(date)}</> : prettyDate(date)}</span>
        {!isToday && <button className="today-btn" onClick={() => setDate(today)}>Back to today</button>}
        <button aria-label="Next day" onClick={() => setDate(addDays(date, 1))} disabled={date >= today}>›</button>
      </div>
    </section>
  );
}

function Checklist({ steps, log, toggle }: { steps: Step[]; log?: Log; toggle: (id: string) => void }) {
  return (
    <div className="steps">
      {steps.map((s, i) => {
        const on = !!log?.checks?.[s.id];
        return (
          <button key={s.id} className={`step ${on ? "on" : ""}`} onClick={() => toggle(s.id)} aria-pressed={on}>
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            <span className="body">
              <span className="t">{s.title}{s.tag && <span className="tag">{s.tag}</span>}</span>
              <span className="d">{s.detail}</span>
            </span>
            <span className="tickc"><Tick /></span>
          </button>
        );
      })}
    </div>
  );
}

function SecHead({ kind, kicker, title, steps, log }: { kind: "sun" | "moon" | "leaf" | "note"; kicker: string; title: string; steps?: Step[]; log?: Log }) {
  const icons = {
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />,
    leaf: <><path d="M5 19c1-8 6-13 15-14-1 9-6 14-15 14z" /><path d="M5 19c4-4 7-7 10-9" /></>,
    note: <><path d="M5 4h14v16H5z" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
  };
  const done = steps ? steps.filter((s) => log?.checks?.[s.id]).length : 0;
  return (
    <div className="sec-head">
      <span className={`badge ${kind}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{icons[kind]}</svg></span>
      <div className="grow"><div className="kicker">{kicker}</div><h2>{title}</h2></div>
      {steps && <span className={`count-pill ${done === steps.length ? "full" : ""}`}>{done}/{steps.length}</span>}
    </div>
  );
}

function TodayView({ start, date, day, log, toggle, setNote, setRating, setReaction }: {
  start: string; date: string; day: number; log?: Log; toggle: (id: string) => void;
  setNote: (t: string) => void; setRating: (r: number) => void; setReaction: (v: boolean) => void;
}) {
  const nt = nightType(start, date);
  const night = nightSteps(start, date);

  return (
    <>
      {day >= 1 && [1, 8, 15, 22].includes(day) && (
        <div className="note-box teal news"><b>New this week ·</b> {WEEK_NEWS[weekOf(day) - 1]}</div>
      )}

      <div className="today-grid">
      <section className="card">
        <SecHead kind="sun" kicker="Morning · after waking" title="Face routine" steps={AM_STEPS} log={log} />
        <Checklist steps={AM_STEPS} log={log} toggle={toggle} />
      </section>

      <section className="card">
        <SecHead kind="moon" kicker="Tonight · before bed" title={NIGHT_LABEL[nt]} steps={night} log={log} />
        <p className="sec-note">{NIGHT_NOTE[nt]}</p>
        <Checklist steps={night} log={log} toggle={toggle} />
      </section>

      <section className="card">
        <SecHead kind="leaf" kicker="Inside out" title="Food, water & habits" steps={HABITS} log={log} />
        <Checklist steps={HABITS} log={log} toggle={toggle} />
      </section>

      <section className="card">
        <SecHead kind="note" kicker="Diary" title="How did the skin feel?" />
        <div className="rating" role="group" aria-label="Skin rating">
          {["Bad", "Meh", "OK", "Good", "Great"].map((l, i) => (
            <button key={l} className={log?.rating === i + 1 ? "on" : ""} onClick={() => setRating(i + 1)}>{l}</button>
          ))}
        </div>
        <textarea
          placeholder="e.g. slight tingling after retinol, skin felt soft, bloated after lunch…"
          value={log?.note || ""}
          onChange={(e) => setNote(e.target.value)}
          aria-label="Diary note"
        />
        <button className={`toggle ${log?.reaction ? "on" : ""}`} onClick={() => setReaction(!log?.reaction)} aria-pressed={!!log?.reaction}>
          <span className="sw" /> Redness, burning or rash today
        </button>
        {log?.reaction && (
          <div className="note-box rose">Skip retinol and arbutin tonight. Use only cleanser + moisturizer until skin calms. If it lasts more than 2–3 days, stop the last new product and see a doctor.</div>
        )}
      </section>
      </div>
    </>
  );
}

/* ---------------- ROUTINE ---------------- */
function RoutineView({ start, today }: { start: string; today: string }) {
  const [seg, setSeg] = useState<"schedule" | "packs" | "rules">("schedule");
  const todayNum = dayNumber(start, today);
  const curWeek = todayNum >= 1 ? weekOf(todayNum) : 0;
  const wd = weekdayIdx(today);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // derive grid from the schedule using a reference Monday
  const grid = [1, 2, 3, 4].map((w) => days.map((_, i) => {
    // find a date in week w with weekday i
    const startWd = weekdayIdx(start);
    const offset = (w - 1) * 7 + ((i - startWd + 7) % 7);
    return nightType(start, addDays(start, offset));
  }));
  const short = { basic: "Basic", normal: "Normal", retinol: "Retinol", pack: "Pack" } as const;

  return (
    <>
      <div className="seg">
        <button className={seg === "schedule" ? "on" : ""} onClick={() => setSeg("schedule")}>Schedule</button>
        <button className={seg === "packs" ? "on" : ""} onClick={() => setSeg("packs")}>Face packs</button>
        <button className={seg === "rules" ? "on" : ""} onClick={() => setSeg("rules")}>Rules</button>
      </div>

      {seg === "schedule" && (
        <>
          <section className="card">
            <h2>Night schedule</h2>
            <p className="muted" style={{ margin: "4px 0 0" }}>Products start slowly. If skin gets irritated, go back to the previous week&apos;s level.</p>
            <div className="week-grid">
              <div />{days.map((d) => <div key={d} className="h">{d}</div>)}
              {grid.map((row, wi) => (
                <FragmentRow key={wi} label={`Wk ${wi + 1}`}>
                  {row.map((t, di) => (
                    <div key={di} className={`cell ${t} ${curWeek === wi + 1 && wd === di ? "now" : ""}`}>{short[t]}</div>
                  ))}
                </FragmentRow>
              ))}
            </div>
            <div className="legend">
              <span><i style={{ background: "var(--teal-soft)" }} />Basic / Normal</span>
              <span><i style={{ background: "var(--rose-soft)" }} />Retinol</span>
              <span><i style={{ background: "var(--gold-soft)" }} />Face pack</span>
            </div>
          </section>
          <section className="card">
            <h2>What each week adds</h2>
            {WEEK_NEWS.map((w, i) => (
              <div className="row" key={i}><div className="time">Week {i + 1}</div><div className="grow d" style={{ fontSize: 14, color: "var(--ink)" }}>{w}</div></div>
            ))}
          </section>
          <section className="card">
            <h2>Morning, every day</h2>
            {AM_STEPS.map((s, i) => (
              <div className="row" key={s.id}><div className="time">Step {i + 1}</div><div className="grow"><div className="t">{s.title}</div><div className="d">{s.detail}</div></div></div>
            ))}
          </section>
        </>
      )}

      {seg === "packs" && (
        <section className="card">
          <h2>Home face packs</h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>On face-pack nights only, never on retinol nights. Besan pack once a week; aloe or rose–dahi on the other.</p>
          {PACKS.map((p) => (
            <div className="row" key={p.name}>
              <div className="grow">
                <div className="t">{p.name}</div>
                <div className="d"><b>Make:</b> {p.recipe}</div>
                <div className="d"><b>Use:</b> {p.use}</div>
                <div className="d"><b>Helps:</b> {p.benefit}</div>
              </div>
            </div>
          ))}
          <div className="note-box rose">Never put lemon, baking soda or toothpaste on the face — they make dark patches worse.</div>
        </section>
      )}

      {seg === "rules" && (
        <section className="card">
          <h2>Golden rules</h2>
          {RULES.map(([t, d]) => (
            <div className="row" key={t}><div className="grow"><div className="t">{t}</div><div className="d">{d}</div></div></div>
          ))}
          <div className="note-box gold"><b>See a dermatologist</b> if patches spread, look like a butterfly on both cheeks, or don&apos;t improve in 2–3 months. Ask a doctor about blood tests: CBC, Vitamin D, B12, Ferritin, Thyroid.</div>
        </section>
      )}
    </>
  );
}
function FragmentRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (<><div className="w">{label}</div>{children}</>);
}

/* ---------------- PRODUCTS ---------------- */
function ProductsView({ status, setProduct }: { status: Record<string, string>; setProduct: (id: string, s: string) => void }) {
  const owned = PRODUCTS.filter((p) => status[p.id] && status[p.id] !== "none").length;
  const low = PRODUCTS.filter((p) => status[p.id] === "low" || status[p.id] === "finished");
  const opts: [string, string][] = [["none", "Not bought"], ["bought", "Bought"], ["using", "Using"], ["low", "Running low"], ["finished", "Finished"]];
  return (
    <>
      <div className="stats">
        <div className="stat"><b>{owned}/{PRODUCTS.length}</b><span>bought</span></div>
        <div className="stat"><b>{low.length}</b><span>to re-order</span></div>
        <div className="stat"><b>₹4,023</b><span>full set</span></div>
      </div>
      {low.length > 0 && (
        <div className="note-box gold" style={{ marginTop: 12 }}><b>Re-order soon:</b> {low.map((p) => p.name).join(", ")}</div>
      )}
      <div className="prod-grid">
        {PRODUCTS.map((p, i) => {
          const s = status[p.id] || "none";
          const tones = ["#F3DCD0", "#F6E7C9", "#DDE7D8", "#EADFF0", "#F7D9D2", "#E4ECEF"];
          return (
            <article className="prod" key={p.id}>
              <div className="prod-art" style={{ background: tones[i % tones.length] }}>
                <span className={`bottle b${i % 3}`}><span className="cap" /><span className="label">{p.name.split(" ")[0]}</span></span>
                {s !== "none" && <span className={`status-tag ${s}`}>{opts.find(([k]) => k === s)?.[1]}</span>}
              </div>
              <div className="prod-body">
                <div className="kicker">{p.when}</div>
                <h3>{p.name}</h3>
                <p className="d">{p.does}</p>
                <div className="prod-buy">
                  <span><b className="price">{p.price}</b> <small className="muted">· {p.size}</small></span>
                  <a className="buy-btn" href={p.url} target="_blank" rel="noopener noreferrer">Buy on Amazon</a>
                </div>
                <div className="chips">
                  {opts.map(([k, l]) => (
                    <button key={k} className={`chip ${s === k ? `on ${k}` : ""}`} onClick={() => setProduct(p.id, k)}>{l}</button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="muted small" style={{ marginTop: 10 }}>Prices checked on Amazon.in on 7 Nov 2026 and may change. Patch test each new product for 24 hours.</p>
    </>
  );
}

/* ---------------- FOOD ---------------- */
function FoodView() {
  const [seg, setSeg] = useState<"meals" | "drinks" | "bp">("meals");
  const [egg, setEgg] = useState(false);
  return (
    <>
      <div className="seg">
        <button className={seg === "meals" ? "on" : ""} onClick={() => setSeg("meals")}>Meals</button>
        <button className={seg === "drinks" ? "on" : ""} onClick={() => setSeg("drinks")}>Drinks</button>
        <button className={seg === "bp" ? "on" : ""} onClick={() => setSeg("bp")}>Low BP</button>
      </div>
      {seg === "meals" && (
        <section className="card">
          <div className="card-head"><h2>Daily meal plan</h2></div>
          <div className="chips" style={{ marginTop: 4 }}>
            <button className={`chip ${!egg ? "on" : ""}`} onClick={() => setEgg(false)}>Vegetarian</button>
            <button className={`chip ${egg ? "on" : ""}`} onClick={() => setEgg(true)}>With eggs</button>
          </div>
          {MEALS.map((m) => (
            <div className="row" key={m.time}>
              <div className="time">{m.time}</div>
              <div className="grow">
                <div className="t">{m.title}</div>
                <div className="d" style={{ color: "var(--ink)" }}>{egg && m.egg !== "Same" ? m.egg : m.veg}</div>
                <div className="d">{m.note}</div>
              </div>
            </div>
          ))}
          <div className="note-box teal"><b>Add daily:</b> 1 tbsp roasted ground flaxseed on dahi or in roti dough. <b>Limit:</b> sugar, maida, fried snacks, more than 2 cups tea/coffee.</div>
        </section>
      )}
      {seg === "drinks" && (
        <section className="card">
          <h2>Drinks (2.5 L a day)</h2>
          {DRINKS.map((d) => (
            <div className="row" key={d.name}><div className="grow"><div className="t">{d.name}</div><div className="d" style={{ color: "var(--ink)" }}>{d.recipe}</div><div className="d">{d.when}</div></div></div>
          ))}
        </section>
      )}
      {seg === "bp" && (
        <section className="card">
          <h2>Low blood pressure care</h2>
          <ul className="clean">{LOW_BP.map((t) => <li key={t}>{t}</li>)}</ul>
          <div className="note-box rose"><b>Vitamin E (Evion) only on the skin.</b> Pharmacy info lists low BP as a reason not to take it by mouth without a doctor&apos;s advice.</div>
        </section>
      )}
    </>
  );
}

/* ---------------- PROGRESS ---------------- */
function ProgressView({ start, today, logs, open }: { start: string; today: string; logs: Record<string, Log>; open: (d: string) => void }) {
  const todayNum = dayNumber(start, today);
  const days = Array.from({ length: PLAN_DAYS }, (_, i) => addDays(start, i));
  const stats = useMemo(() => {
    const past = days.filter((d) => d <= today);
    const fr = past.map((d) => completion(start, logs[d]));
    const good = fr.filter((f) => f >= 0.7).length;
    let streak = 0;
    for (let i = past.length - 1; i >= 0; i--) {
      if (fr[i] >= 0.7) streak++;
      else if (past[i] === today) continue; // today still in progress
      else break;
    }
    const ratings = past.map((d) => logs[d]?.rating).filter((r): r is number => !!r);
    const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "–";
    return { good, streak, avg };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, start, today]);
  const notes = days.filter((d) => logs[d]?.note || logs[d]?.reaction).reverse();

  return (
    <>
      <div className="stats">
        <div className="stat"><b>{stats.good}</b><span>days done (70%+)</span></div>
        <div className="stat"><b>{stats.streak}</b><span>day streak</span></div>
        <div className="stat"><b>{stats.avg}</b><span>avg skin feel /5</span></div>
      </div>
      <section className="card">
        <h2>30-day tracker</h2>
        <p className="muted" style={{ margin: "4px 0 0" }}>Tap a day to open or fill it.</p>
        <div className="tracker">
          {days.map((d, i) => {
            const f = completion(start, logs[d]);
            const lvl = f >= 0.9 ? "l3" : f >= 0.6 ? "l2" : f > 0 ? "l1" : "";
            return (
              <button key={d} className={`tday ${lvl} ${d === today ? "today" : ""} ${d > today ? "future" : ""}`} onClick={() => d <= today && open(d)} disabled={d > today} aria-label={`Day ${i + 1}, ${Math.round(f * 100)}% done`}>
                {logs[d]?.reaction && <span className="dot" />}
                {i + 1}
                <small>{f ? `${Math.round(f * 100)}%` : ""}</small>
              </button>
            );
          })}
        </div>
        <div className="legend">
          <span><i style={{ background: "var(--teal-soft)" }} />Started</span>
          <span><i style={{ background: "var(--mid)" }} />60%+</span>
          <span><i style={{ background: "var(--teal)" }} />90%+</span>
          <span><i style={{ background: "var(--rose)", borderRadius: 99 }} />Reaction</span>
        </div>
        {todayNum > PLAN_DAYS && <div className="note-box teal">30 days complete! Keep the routine going — spots keep fading for 8–12 weeks.</div>}
      </section>
      <section className="card">
        <h2>Diary notes</h2>
        {notes.length === 0 && <p className="muted">No notes yet. Write how the skin feels on the Today tab.</p>}
        {notes.map((d) => (
          <button key={d} className="row" style={{ width: "100%", background: "transparent", border: 0, borderTop: "1px solid var(--line)", textAlign: "left", color: "inherit" }} onClick={() => open(d)}>
            <div className="time">Day {dayNumber(start, d)}</div>
            <div className="grow">
              <div className="d">{prettyDate(d)}{logs[d]?.reaction ? " · reaction" : ""}{logs[d]?.rating ? ` · ${["Bad", "Meh", "OK", "Good", "Great"][logs[d]!.rating! - 1]}` : ""}</div>
              <div style={{ fontSize: 14 }}>{logs[d]?.note}</div>
            </div>
          </button>
        ))}
      </section>
    </>
  );
}

/* ---------------- RESET ---------------- */
function ResetDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function go() {
    setBusy(true); setErr("");
    const r = await fetch("/api/me/reset", { method: "POST" });
    if (r.ok) onDone(); else { setErr("Couldn't reset. Try again."); setBusy(false); }
  }
  return (
    <div role="dialog" aria-modal="true" aria-label="Reset" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 420, margin: 0 }} onClick={(e) => e.stopPropagation()}>
        <h2>Start over?</h2>
        <p className="muted">This permanently deletes everything saved for this account: all ticks, ratings, diary notes, reaction flags and product statuses. Day 1 becomes today. Your login stays. This cannot be undone.</p>
        {err && <div className="err">{err}</div>}
        <button className="btn" style={{ background: "var(--rose)" }} onClick={go} disabled={busy}>{busy ? "Deleting…" : "Yes, delete everything"}</button>
        <button className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
      </div>
    </div>
  );
}

/* ---------------- SETTINGS ---------------- */
function Settings({ me, onClose, onSaved }: { me: Me; onClose: () => void; onSaved: () => void }) {
  const [start, setStart] = useState(me.startDate);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function saveStart() {
    const r = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startDate: start }) });
    setMsg(r.ok ? { ok: true, text: "Start date saved." } : { ok: false, text: "Couldn't save start date." });
    if (r.ok) onSaved();
  }
  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/auth/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: cur, next }) });
    const d = await r.json().catch(() => ({}));
    setMsg(r.ok ? { ok: true, text: "Password changed." } : { ok: false, text: d.error || "Couldn't change password." });
    if (r.ok) { setCur(""); setNext(""); }
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Settings" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 30, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 520, margin: 0, borderRadius: "22px 22px 0 0", maxHeight: "88vh", overflow: "auto", paddingBottom: 28 }} onClick={(e) => e.stopPropagation()}>
        <div className="card-head"><h2>Settings</h2><button className="chip" onClick={onClose}>Close</button></div>
        <p className="muted" style={{ margin: 0 }}>Logged in as <b>{me.username}</b></p>

        <label htmlFor="start">Plan start date (Day 1)</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input id="start" type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
          <button className="btn" style={{ width: "auto", marginTop: 0, padding: "0 16px" }} onClick={saveStart}>Save</button>
        </div>

        <form onSubmit={changePw}>
          <label htmlFor="cur">Change password</label>
          <PasswordInput id="cur" placeholder="Current password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" required />
          <PasswordInput style={{ marginTop: 8 }} placeholder="New password (8+ characters)" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={8} required />
          <button className="btn ghost">Update password</button>
        </form>

        {msg && <div className={msg.ok ? "okmsg" : "err"}>{msg.text}</div>}
        <button className="btn" style={{ background: "var(--rose)" }} onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
