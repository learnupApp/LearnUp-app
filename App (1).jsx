import { useState, useEffect } from "react";

// ── Settings ──
const FREE_LIMIT = 6;
const TRIAL_DAYS = 30;
const G = { bg: "#07090A", surface: "#0E1215", card: "#141A1E", border: "#1E282E", accent: "#00D4FF", accentDim: "#004D5C", green: "#3DDB8A", gold: "#F0B429", danger: "#FF4D4D", text: "#E8F0F2", muted: "#5A7580", mutedLight: "#8AA0A8" };
const mono = { fontFamily: "'IBM Plex Mono', monospace" };
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

// ── Sample content (replaced by live data when the backend is built) ──
const EDUCATORS = [
  { id: "e1", name: "Prof. Adeyemi Oluwaseun", subject: "Chemistry", avatar: "⚗️", verified: true, followers: 4821, bio: "PhD Chemistry, University of Lagos. 12 years teaching JAMB and university students." },
  { id: "e2", name: "Dr. Ngozi Okafor", subject: "Mathematics", avatar: "∫", verified: true, followers: 7203, bio: "Former JAMB examiner and author of 3 Mathematics textbooks." },
  { id: "e3", name: "Mrs. Fatima Bello", subject: "Economics", avatar: "📈", verified: false, followers: 2914, bio: "Economics tutor and WAEC and JAMB specialist." },
];
const LESSONS = [
  { id: "l1", ed: "e1", title: "Functional Groups & Nomenclature", duration: "14:32", tag: "JAMB", cover: "⚗️", plays: 2341, likes: 312 },
  { id: "l2", ed: "e1", title: "Alkanes, Alkenes & Alkynes", duration: "11:08", tag: "JAMB", cover: "🧪", plays: 1892, likes: 245 },
  { id: "l3", ed: "e1", title: "Reactions of Carbonyl Compounds", duration: "18:45", tag: "University", cover: "⚗️", plays: 987, likes: 178 },
  { id: "l4", ed: "e2", title: "Limits & Continuity Explained", duration: "20:15", tag: "JAMB", cover: "∫", plays: 3102, likes: 521 },
  { id: "l5", ed: "e2", title: "Differentiation from First Principles", duration: "16:40", tag: "WAEC", cover: "📐", plays: 2210, likes: 398 },
  { id: "l6", ed: "e3", title: "GDP vs GNP: The Real Difference", duration: "12:20", tag: "WAEC", cover: "📈", plays: 1543, likes: 203 },
  { id: "l7", ed: "e3", title: "Fiscal vs Monetary Policy", duration: "16:50", tag: "WAEC", cover: "💹", plays: 987, likes: 134 },
];
const edOf = (id) => EDUCATORS.find((e) => e.id === id);

// ── Saved on this device (browser storage) ──
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
const BLANK = { follows: [], likes: [], playedDate: "", played: [], premiumUntil: 0, trialUsed: false, downloads: [], scores: {} };

// ── Small pieces ──
const Badge = ({ children, color = G.accent }) => (
  <span style={{ ...mono, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color, background: color + "22", border: `1px solid ${color}55`, padding: "3px 8px", borderRadius: 100 }}>{children}</span>
);
const btn = (bg, fg = G.bg) => ({ width: "100%", padding: 13, borderRadius: 12, border: "none", background: bg, color: fg, ...mono, fontSize: 12, fontWeight: 500, cursor: "pointer" });
const chip = (on) => ({ ...mono, fontSize: 11, padding: "7px 14px", borderRadius: 100, cursor: "pointer", background: on ? G.accent : "none", color: on ? G.bg : G.muted, border: `1px solid ${on ? G.accent : G.border}` });
const field = { width: "100%", background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 13, color: G.text, fontSize: 14, outline: "none", marginBottom: 12 };

const Sheet = ({ onClose, children }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: G.bg + "EE", display: "flex", alignItems: "flex-end" }}>
    <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: G.surface, borderRadius: "20px 20px 0 0", padding: "20px 18px 32px", animation: "up .3s ease" }}>{children}</div>
  </div>
);

const LessonCard = ({ lesson, liked, saved, progress, onPlay, onLike, onDownload }) => (
  <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, marginBottom: 12, overflow: "hidden" }}>
    <div style={{ height: 70, background: `linear-gradient(135deg, ${G.accentDim}66, ${G.bg})`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px" }}>
      <span style={{ fontSize: 34 }}>{lesson.cover}</span>
      <div style={{ textAlign: "right" }}><Badge>{lesson.tag}</Badge><div style={{ ...mono, fontSize: 10, color: G.muted, marginTop: 6 }}>{lesson.duration}</div></div>
    </div>
    <div style={{ padding: "12px 16px 14px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{lesson.title}</div>
      <div style={{ ...mono, fontSize: 10, color: G.muted, marginBottom: 12 }}>{edOf(lesson.ed).name} · {lesson.plays.toLocaleString()} plays</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ ...btn(G.accent), flex: 1, width: "auto" }} onClick={() => onPlay(lesson)}>▶ Play</button>
        <button onClick={() => onLike(lesson.id)} style={{ ...mono, fontSize: 11, padding: "0 12px", borderRadius: 12, cursor: "pointer", background: liked ? G.danger + "18" : "none", color: liked ? G.danger : G.muted, border: `1px solid ${liked ? G.danger + "66" : G.border}` }}>♥ {lesson.likes + (liked ? 1 : 0)}</button>
        <button onClick={() => onDownload(lesson)} aria-label="Download for offline" style={{ ...mono, fontSize: 11, minWidth: 46, borderRadius: 12, cursor: "pointer", background: saved ? G.green + "18" : "none", color: saved ? G.green : G.muted, border: `1px solid ${saved ? G.green + "55" : G.border}` }}>{saved ? "✓" : progress != null ? `${progress}%` : "⇩"}</button>
      </div>
    </div>
  </div>
);

const EducatorCard = ({ ed, following, onFollow }) => (
  <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 14, marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
    <span style={{ fontSize: 28 }}>{ed.avatar}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{ed.name} {ed.verified && <span style={{ color: G.accent }}>✓</span>}</div>
      <div style={{ ...mono, fontSize: 10, color: G.muted }}>{ed.subject} · {(ed.followers + (following ? 1 : 0)).toLocaleString()} followers</div>
    </div>
    <button onClick={() => onFollow(ed.id)} style={{ ...mono, fontSize: 10, padding: "8px 12px", borderRadius: 10, cursor: "pointer", background: following ? "none" : G.accent, color: following ? G.muted : G.bg, border: `1px solid ${following ? G.border : G.accent}` }}>{following ? "Following" : "+ Follow"}</button>
  </div>
);

// ── Player (demo progress until real audio files are connected) ──
const Player = ({ lesson, onClose }) => {
  const [playing, setPlaying] = useState(false), [pct, setPct] = useState(0), [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setPct((p) => Math.min(100, p + 0.12 * speed)), 200);
    return () => clearInterval(t);
  }, [playing, speed]);
  return (
    <div style={{ position: "fixed", bottom: 62, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, zIndex: 200, background: G.card, borderTop: `1px solid ${G.accent}33`, padding: "12px 18px 14px", animation: "up .3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{lesson.cover} {lesson.title}</div>
        <button onClick={onClose} aria-label="Close player" style={{ background: "none", border: "none", color: G.muted, fontSize: 20, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ height: 3, background: G.border, borderRadius: 4, marginBottom: 12 }}><div style={{ width: `${pct}%`, height: "100%", background: G.accent, borderRadius: 4 }} /></div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[0.75, 1, 1.25, 1.5, 2].map((x) => (
            <button key={x} onClick={() => setSpeed(x)} style={{ ...mono, fontSize: 9, padding: "3px 6px", borderRadius: 6, cursor: "pointer", background: speed === x ? G.accent + "22" : "none", border: `1px solid ${speed === x ? G.accent : G.border}`, color: speed === x ? G.accent : G.muted }}>{x}×</button>
          ))}
        </div>
        <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} style={{ width: 46, height: 46, borderRadius: "50%", border: "none", background: G.accent, color: G.bg, fontSize: 18, cursor: "pointer" }}>{playing ? "⏸" : "▶"}</button>
      </div>
    </div>
  );
};

// ── Premium upsell, ad space, practice questions ──
const PERKS = ["Unlimited lessons every day", "No ads, ever", "Download lessons for offline listening", "Practice questions with full answers", "★ Premium badge on your profile"];
const PremiumSheet = ({ message, trialUsed, onTrial, onClose }) => (
  <Sheet onClose={onClose}>
    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>★ Go Premium</div>
    <div style={{ ...mono, fontSize: 11, color: G.gold, lineHeight: 1.7, marginBottom: 14 }}>{message}</div>
    {PERKS.map((p) => <div key={p} style={{ fontSize: 13, padding: "6px 0", display: "flex", gap: 10 }}><span style={{ color: G.green }}>✓</span>{p}</div>)}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "16px 0" }}>
      {[["₦300", "per week"], ["₦1,000", "per month"]].map(([price, per]) => (
        <div key={per} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 14, textAlign: "center" }}>
          <div style={{ ...mono, fontSize: 18, color: G.accent }}>{price}</div><div style={{ ...mono, fontSize: 9, color: G.muted, marginTop: 4 }}>{per}</div>
        </div>
      ))}
    </div>
    {!trialUsed && <button style={{ ...btn(G.green), marginBottom: 10 }} onClick={onTrial}>Start {TRIAL_DAYS}-day free trial</button>}
    <button style={{ ...btn(G.card, G.muted), border: `1px solid ${G.border}` }} onClick={onClose}>Not now</button>
  </Sheet>
);

const AdCard = ({ onUpgrade }) => (
  <div style={{ border: `1px dashed ${G.border}`, borderRadius: 16, padding: "18px 16px", marginBottom: 12, textAlign: "center", background: G.surface }}>
    <div style={{ ...mono, fontSize: 9, color: G.muted, letterSpacing: 2, marginBottom: 8 }}>SPONSORED</div>
    <div style={{ fontSize: 13, color: G.mutedLight, marginBottom: 10 }}>Your ad could appear here</div>
    <button onClick={onUpgrade} style={{ ...mono, fontSize: 10, color: G.gold, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Remove ads with Premium</button>
  </div>
);

const QUIZ = {
  chem: { name: "Chemistry", icon: "⚗️", qs: [
    { q: "What is the functional group of an alcohol?", o: ["-OH", "-COOH", "-CHO", "-NH₂"], a: 0, why: "Alcohols contain a hydroxyl (-OH) group on a saturated carbon." },
    { q: "Which hydrocarbon family has a carbon-carbon double bond?", o: ["Alkanes", "Alkenes", "Alkynes", "Arenes"], a: 1, why: "Alkenes have C=C. Alkanes are single-bonded and alkynes are triple-bonded." },
    { q: "The IUPAC name of CH₃CH₂CH₃ is", o: ["Ethane", "Propane", "Butane", "Methane"], a: 1, why: "Three carbons joined by single bonds make propane." },
  ] },
  math: { name: "Mathematics", icon: "∫", qs: [
    { q: "Find the limit as x→2 of (x² − 4)/(x − 2)", o: ["0", "2", "4", "Does not exist"], a: 2, why: "Factor to (x−2)(x+2)/(x−2) = x+2, which tends to 4." },
    { q: "Differentiate y = 3x²", o: ["3x", "6x", "6x²", "9x"], a: 1, why: "Power rule: d/dx(3x²) = 6x." },
    { q: "If f(x) = 5, then f′(x) equals", o: ["5", "1", "0", "x"], a: 2, why: "The derivative of a constant is zero." },
  ] },
  econ: { name: "Economics", icon: "📈", qs: [
    { q: "GDP measures output produced", o: ["Inside a country's borders", "By citizens anywhere", "By government only", "Only in exports"], a: 0, why: "GDP counts output within borders. GNP counts output by citizens anywhere." },
    { q: "Which is a monetary policy tool?", o: ["Taxation", "Government spending", "Interest rate", "Subsidy"], a: 2, why: "Central banks such as the CBN use interest rates. Taxes and spending are fiscal tools." },
    { q: "Opportunity cost is", o: ["Money spent", "The next best alternative given up", "Total cost", "Market price"], a: 1, why: "It is the value of the best alternative you give up." },
  ] },
};

const Practice = ({ premium, scores, onScore, onUpsell }) => {
  const [run, setRun] = useState(null);
  if (!run) return (
    <>
      <div style={{ ...mono, fontSize: 11, color: G.muted, lineHeight: 1.7, marginBottom: 16 }}>Test yourself with exam-style questions and see why each answer is right.</div>
      {Object.entries(QUIZ).map(([k, sub]) => (
        <button key={k} onClick={() => premium ? setRun({ k, i: 0, pick: null, score: 0, done: false }) : onUpsell()} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", color: G.text, background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 16, marginBottom: 12, cursor: "pointer" }}>
          <span style={{ fontSize: 30 }}>{sub.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{sub.name}</div>
            <div style={{ ...mono, fontSize: 10, color: G.muted, marginTop: 3 }}>{sub.qs.length} questions{scores[k] != null ? ` · best ${scores[k]}/${sub.qs.length}` : ""}</div>
          </div>
          {premium ? <span style={{ color: G.accent, fontSize: 20 }}>›</span> : <Badge color={G.gold}>🔒 Premium</Badge>}
        </button>
      ))}
    </>
  );
  const sub = QUIZ[run.k], q = sub.qs[run.i], total = sub.qs.length;
  if (run.done) return (
    <div style={{ textAlign: "center", padding: "30px 10px" }}>
      <div style={{ fontSize: 52 }}>{run.score === total ? "🏆" : run.score >= total / 2 ? "👏" : "💪"}</div>
      <div style={{ ...mono, fontSize: 38, color: G.accent, margin: "10px 0" }}>{run.score}/{total}</div>
      <div style={{ ...mono, fontSize: 11, color: G.muted, marginBottom: 24 }}>{sub.name} practice complete</div>
      <button style={{ ...btn(G.accent), marginBottom: 10 }} onClick={() => setRun({ k: run.k, i: 0, pick: null, score: 0, done: false })}>Try again</button>
      <button style={{ ...btn(G.card, G.muted), border: `1px solid ${G.border}` }} onClick={() => setRun(null)}>All subjects</button>
    </div>
  );
  const pick = (n) => run.pick == null && setRun({ ...run, pick: n, score: run.score + (n === q.a ? 1 : 0) });
  const next = () => run.i + 1 >= total ? (onScore(run.k, run.score), setRun({ ...run, done: true })) : setRun({ ...run, i: run.i + 1, pick: null });
  const tone = (n) => run.pick == null ? [G.border, G.text] : n === q.a ? [G.green, G.green] : n === run.pick ? [G.danger, G.danger] : [G.border, G.muted];
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button onClick={() => setRun(null)} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", ...mono, fontSize: 11 }}>← Exit</button>
        <span style={{ ...mono, fontSize: 11, color: G.muted }}>{sub.name} · {run.i + 1} of {total}</span>
      </div>
      <div style={{ height: 3, background: G.border, borderRadius: 4, marginBottom: 20 }}><div style={{ width: `${((run.i + (run.pick != null ? 1 : 0)) / total) * 100}%`, height: "100%", background: G.accent, borderRadius: 4, transition: "width .3s" }} /></div>
      <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5, marginBottom: 18 }}>{q.q}</div>
      {q.o.map((o, n) => { const [bc, fc] = tone(n); return (
        <button key={n} onClick={() => pick(n)} style={{ display: "flex", gap: 12, width: "100%", textAlign: "left", padding: 14, marginBottom: 10, borderRadius: 14, cursor: "pointer", background: bc === G.border ? G.card : bc + "18", border: `1px solid ${bc}`, color: fc, fontSize: 14 }}>
          <span style={{ ...mono, fontSize: 12, opacity: 0.7 }}>{"ABCD"[n]}</span>{o}
        </button>); })}
      {run.pick != null && (
        <>
          <div style={{ background: G.accent + "0D", border: `1px solid ${G.accent}33`, borderRadius: 14, padding: 14, margin: "6px 0 16px" }}>
            <div style={{ ...mono, fontSize: 10, color: run.pick === q.a ? G.green : G.danger, marginBottom: 6 }}>{run.pick === q.a ? "✓ CORRECT" : `✗ ANSWER: ${"ABCD"[q.a]}`}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>{q.why}</div>
          </div>
          <button style={btn(G.accent)} onClick={next}>{run.i + 1 >= total ? "See my score" : "Next question →"}</button>
        </>
      )}
    </>
  );
};

// ── Screens ──
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState(""), [err, setErr] = useState("");
  const go = () => /^\S+@\S+\.\S+$/.test(email.trim()) ? onLogin(email.trim().toLowerCase()) : setErr("Enter a valid email address.");
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 44 }}>🎧</div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>LearnUp</div>
        <div style={{ ...mono, fontSize: 10, color: G.muted, letterSpacing: 2, marginTop: 4 }}>AUDIO LESSONS FOR WAEC & JAMB</div>
      </div>
      <input style={field} type="email" placeholder="Your email address" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && go()} />
      {err && <div style={{ ...mono, fontSize: 11, color: G.danger, marginBottom: 12 }}>{err}</div>}
      <button style={btn(G.accent)} onClick={go}>Continue</button>
      <div style={{ ...mono, fontSize: 10, color: G.muted, textAlign: "center", marginTop: 16, lineHeight: 1.8 }}>Preview version: your progress is saved on this device only.</div>
    </div>
  );
};

const Profile = ({ email, data, premium, left, onTrial, onLogout }) => (
  <div>
    <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 22, textAlign: "center", marginBottom: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>LearnUp Student</div>
      <div style={{ ...mono, fontSize: 10, color: G.muted, marginBottom: 12 }}>{email}</div>
      {premium ? <Badge color={G.gold}>★ Premium</Badge> : <Badge>Free account</Badge>}
      {!premium && <div style={{ ...mono, fontSize: 10, color: G.muted, marginTop: 8 }}>{left} of {FREE_LIMIT} lessons left today</div>}
    </div>
    <div style={{ background: G.card, border: `1px solid ${G.accent}33`, borderRadius: 18, padding: 20, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Premium</div>
      <div style={{ ...mono, fontSize: 10, color: G.muted, lineHeight: 1.8, marginBottom: 14 }}>Unlimited lessons, no ads, offline downloads and practice questions.</div>
      {premium ? (
        <div style={{ ...mono, fontSize: 12, color: G.green }}>✓ Active until {new Date(data.premiumUntil).toLocaleDateString()}</div>
      ) : (
        <>
          <div style={{ ...mono, fontSize: 10, color: G.muted, textAlign: "center", marginBottom: 12 }}>Free: {FREE_LIMIT} lessons a day · ₦300/week or ₦1,000/month</div>
          {!data.trialUsed && <button style={{ ...btn(G.green + "18", G.green), border: `1px solid ${G.green}`, marginBottom: 10 }} onClick={onTrial}>Start {TRIAL_DAYS}-day free trial</button>}
          <button style={{ ...btn(G.card, G.muted), border: `1px solid ${G.border}` }} disabled>Paid plans open soon</button>
        </>
      )}
    </div>
    <button onClick={onLogout} style={{ ...btn(G.danger + "11", G.danger), border: `1px solid ${G.danger}44` }}>Log out</button>
  </div>
);

// ── App ──
export default function App() {
  const [email, setEmail] = useState(() => read("lu:session", null));
  const [data, setData] = useState(() => ({ ...BLANK, ...read(`lu:${read("lu:session", "")}`, {}) }));
  const [screen, setScreen] = useState("home");
  const [search, setSearch] = useState(""), [tag, setTag] = useState("All");
  const [playing, setPlaying] = useState(null), [limitHit, setLimitHit] = useState(false);
  const [upsell, setUpsell] = useState(null), [progress, setProgress] = useState({}), [lib, setLib] = useState("downloads");

  const save = (next) => { setData(next); write(`lu:${email}`, next); };
  const login = (e) => { write("lu:session", e); setEmail(e); setData({ ...BLANK, ...read(`lu:${e}`, {}) }); };
  const logout = () => { write("lu:session", null); setEmail(null); setPlaying(null); setScreen("home"); };

  if (!email) return <div style={{ maxWidth: 430, margin: "0 auto" }}><Login onLogin={login} /></div>;

  const premium = data.premiumUntil > Date.now();
  const todayIds = data.playedDate === today() ? data.played : [];
  const left = Math.max(0, FREE_LIMIT - todayIds.length);
  const toggle = (key, id) => save({ ...data, [key]: data[key].includes(id) ? data[key].filter((x) => x !== id) : [...data[key], id] });

  const play = (lesson) => {
    if (!premium && !todayIds.includes(lesson.id)) {
      if (todayIds.length >= FREE_LIMIT) return setLimitHit(true);
      save({ ...data, playedDate: today(), played: [...todayIds, lesson.id] });
    }
    setPlaying(lesson);
  };
  const startTrial = () => { save({ ...data, trialUsed: true, premiumUntil: Date.now() + TRIAL_DAYS * 864e5 }); setLimitHit(false); setUpsell(null); };
  const patch = (fn) => setData((prev) => { const next = fn(prev); write(`lu:${email}`, next); return next; });
  const download = (lesson) => {
    if (!premium) return setUpsell("Offline downloads are a Premium feature. Save lessons and study without using data.");
    if (data.downloads.includes(lesson.id) || progress[lesson.id] != null) return;
    setProgress((p) => ({ ...p, [lesson.id]: 0 }));
    let v = 0;
    const t = setInterval(() => {
      v += 17;
      if (v >= 100) { clearInterval(t); setProgress(({ [lesson.id]: _x, ...rest }) => rest); patch((d) => ({ ...d, downloads: [...d.downloads, lesson.id] })); }
      else setProgress((p) => ({ ...p, [lesson.id]: v }));
    }, 250);
  };
  const removeDownload = (id) => patch((d) => ({ ...d, downloads: d.downloads.filter((x) => x !== id) }));

  const cards = (arr) => arr.length === 0
    ? <div style={{ ...mono, fontSize: 11, color: G.muted, textAlign: "center", padding: 24 }}>No lessons found.</div>
    : arr.map((l) => <LessonCard key={l.id} lesson={l} liked={data.likes.includes(l.id)} saved={data.downloads.includes(l.id)} progress={progress[l.id]} onPlay={play} onLike={(id) => toggle("likes", id)} onDownload={download} />);
  const educators = EDUCATORS.map((e) => <EducatorCard key={e.id} ed={e} following={data.follows.includes(e.id)} onFollow={(id) => toggle("follows", id)} />);
  const heading = (t) => <div style={{ fontWeight: 700, margin: "20px 0 12px" }}>{t}</div>;
  const q = search.toLowerCase();

  let body;
  if (screen === "home") { const top = [...LESSONS].sort((a, b) => b.plays - a.plays).slice(0, 4); body = <>{cards(top.slice(0, 2))}{!premium && <AdCard onUpgrade={() => setUpsell("Go Premium to remove ads and unlock everything.")} />}{cards(top.slice(2))}{heading("Educators to follow")}{educators}</>; }
  else if (screen === "explore") body = <>
    <input style={field} placeholder="Search lessons or educators..." value={search} onChange={(e) => setSearch(e.target.value)} />
    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>{["All", "JAMB", "WAEC", "University"].map((t) => <button key={t} onClick={() => setTag(t)} style={chip(tag === t)}>{t}</button>)}</div>
    {!search && <>{educators}{heading("All lessons")}</>}
    {cards(LESSONS.filter((l) => (tag === "All" || l.tag === tag) && (!q || (l.title + edOf(l.ed).name).toLowerCase().includes(q))))}
  </>;
  else if (screen === "practice") body = <Practice premium={premium} scores={data.scores} onScore={(k, n) => save({ ...data, scores: { ...data.scores, [k]: Math.max(data.scores[k] || 0, n) } })} onUpsell={() => setUpsell("Practice questions with full explanations are a Premium feature.")} />;
  else if (screen === "library") {
    const saved = LESSONS.filter((l) => data.downloads.includes(l.id));
    const note = (t) => <div style={{ ...mono, fontSize: 11, color: G.muted, textAlign: "center", padding: 30, lineHeight: 1.8 }}>{t}</div>;
    body = <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{[["downloads", "⇩ Downloads"], ["following", "◈ Following"]].map(([id, l]) => <button key={id} onClick={() => setLib(id)} style={chip(lib === id)}>{l}</button>)}</div>
      {lib === "following" ? (data.follows.length === 0 ? note("Follow educators in Explore to see their lessons here.") : cards(LESSONS.filter((l) => data.follows.includes(l.ed))))
        : !premium ? (
          <div style={{ background: G.card, border: `1px solid ${G.gold}33`, borderRadius: 18, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 34 }}>🔒</div>
            <div style={{ fontWeight: 700, margin: "8px 0" }}>Offline listening is Premium</div>
            <div style={{ ...mono, fontSize: 11, color: G.muted, lineHeight: 1.7, marginBottom: 16 }}>{data.downloads.length ? "Your saved lessons are waiting. They unlock again when you're Premium." : "Save lessons to listen without data or network."}</div>
            <button style={btn(G.gold)} onClick={() => setUpsell("Download lessons and study anywhere, even without network.")}>See Premium</button>
          </div>
        ) : saved.length === 0 ? note("No downloads yet. Tap ⇩ on any lesson to save it for offline listening.")
        : saved.map((l) => (
          <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 26 }}>{l.cover}</span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{l.title}</div><div style={{ ...mono, fontSize: 9, color: G.green }}>✓ Available offline · {l.duration}</div></div>
            <button onClick={() => play(l)} style={{ ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 10, border: "none", background: G.accent, color: G.bg, cursor: "pointer" }}>▶</button>
            <button onClick={() => removeDownload(l.id)} style={{ ...mono, fontSize: 10, padding: "8px 10px", borderRadius: 10, background: "none", border: `1px solid ${G.border}`, color: G.muted, cursor: "pointer" }}>Remove</button>
          </div>))}
    </>;
  }
  else body = <Profile email={email} data={data} premium={premium} left={left} onTrial={startTrial} onLogout={logout} />;

  const titles = { home: "LearnUp 🎧", explore: "Explore", practice: "Practice", library: "Library", profile: "Profile" };
  const tabs = [["home", "⌂", "Home"], ["explore", "◎", "Explore"], ["practice", "✎", "Practice"], ["library", "⇩", "Library"], ["profile", "▣", "Profile"]];

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh" }}>
      <main style={{ padding: "50px 20px 170px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}><h1 style={{ fontSize: 26, fontWeight: 700 }}>{titles[screen]}</h1>{premium && <Badge color={G.gold}>★ Premium</Badge>}</div>
        {body}
      </main>
      {playing && <Player key={playing.id} lesson={playing} onClose={() => setPlaying(null)} />}
      {limitHit && (
        <Sheet onClose={() => setLimitHit(false)}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Daily limit reached</div>
          <div style={{ ...mono, fontSize: 11, color: G.gold, lineHeight: 1.7, marginBottom: 16 }}>You've opened {FREE_LIMIT} different lessons today. Come back tomorrow, or go Premium for unlimited lessons.</div>
          {!data.trialUsed && <button style={{ ...btn(G.green), marginBottom: 10 }} onClick={startTrial}>Start {TRIAL_DAYS}-day free trial</button>}
          <button style={{ ...btn(G.card, G.muted), border: `1px solid ${G.border}` }} onClick={() => setLimitHit(false)}>Close</button>
        </Sheet>
      )}
      {upsell && <PremiumSheet message={upsell} trialUsed={data.trialUsed} onTrial={startTrial} onClose={() => setUpsell(null)} />}
      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, zIndex: 190, background: G.surface, borderTop: `1px solid ${G.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0 18px" }}>
        {tabs.map(([id, icon, label]) => (
          <button key={id} onClick={() => setScreen(id)} style={{ background: "none", border: "none", cursor: "pointer", color: screen === id ? G.accent : G.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 19 }}>{icon}</span><span style={{ ...mono, fontSize: 9 }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
