import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck, ShieldAlert, Sparkles, Trash2, MessageSquare, BarChart3, Mail, Brain, ScanSearch,
  CheckCircle2, Smartphone, Fish, Users, AlertTriangle, Link2, History, Lightbulb, Landmark,
  MessageCircle, Globe, Menu, X, Lock,
} from "lucide-react";
import { analyzeMessage, type Analysis, type RiskLevel } from "@/lib/spam-classifier";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Spam Message Detector — Scam & Phishing Checker" },
      { name: "description", content: "Check SMS, WhatsApp and email messages for spam, scams and phishing with an instant AI risk score." },
      { property: "og:title", content: "AI Spam Message Detector" },
      { property: "og:description", content: "Paste a message to get a SPAM verdict, safety score and risk level instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type MsgType = "SMS" | "WhatsApp" | "Email";
type HistoryItem = { id: number; message: string; isSpam: boolean; confidence: number; risk: RiskLevel; date: string };

const SAMPLES = [
  { label: "Prize Scam", text: "Congratulations! You have won ₹50,000. Click here to claim your prize now." },
  { label: "Bank Phishing", text: "Your bank account will be blocked today. Verify your account immediately using this link." },
  { label: "College Message", text: "Hi, are you coming to college tomorrow? Our practical starts at 10 AM." },
  { label: "Friend Message", text: "Hey, don't forget to bring the project file tomorrow." },
];
const HKEY = "spam-detector-history";
const MAX = 2000;

const NAV = [["home", "Home"], ["analyzer", "Analyzer"], ["history", "History"], ["tips", "Safety Tips"]];

function Index() {
  const [text, setText] = useState("");
  const [type, setType] = useState<MsgType>("SMS");
  const [result, setResult] = useState<Analysis | null>(null);
  const [analyzed, setAnalyzed] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    try { const h = localStorage.getItem(HKEY); if (h) setHistory(JSON.parse(h)); } catch {}
  }, []);

  const save = (h: HistoryItem[]) => { setHistory(h); localStorage.setItem(HKEY, JSON.stringify(h)); };

  const analyze = () => {
    if (!text.trim()) return;
    const r = analyzeMessage(text);
    setResult(r);
    setAnalyzed(text);
    save([{ id: Date.now(), message: text, isSpam: r.isSpam, confidence: r.confidence, risk: r.riskLevel, date: new Date().toLocaleString() }, ...history].slice(0, 100));
    setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const total = history.length;
  const spam = history.filter((h) => h.isSpam).length;
  const rate = total ? Math.round((spam / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <a href="#home" className="flex items-center gap-2 font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground"><ShieldCheck className="h-4 w-4" /></span>
            AI Spam Detector
          </a>
          <div className="hidden gap-1 sm:flex">
            {NAV.map(([id, l]) => <a key={id} href={`#${id}`} className="nav-link">{l}</a>)}
          </div>
          <button className="sm:hidden" aria-label="Menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
        </div>
        {menu && (
          <div className="flex flex-col border-t border-border px-4 py-2 sm:hidden">
            {NAV.map(([id, l]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)} className="nav-link">{l}</a>)}
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-5xl px-4">
        <header id="home" className="scroll-mt-20 py-12 text-center sm:py-16">
          <span className="chip-static mx-auto mb-4 w-fit"><Sparkles className="h-4 w-4 text-primary" /> NLP-powered security check</span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            AI Spam <span className="text-gradient-brand">Message Detector</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Detect spam, scams, phishing and unwanted promotions in SMS, WhatsApp and email messages.</p>
        </header>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total Analyzed" value={total} />
          <Stat label="Spam Detected" value={spam} tone="text-spam" />
          <Stat label="Safe Messages" value={total - spam} tone="text-safe" />
          <Stat label="Spam Rate" value={`${rate}%`} tone="text-primary" />
        </section>

        <section id="analyzer" className="card mt-8 scroll-mt-20">
          <h2 className="section-title"><ScanSearch className="h-5 w-5 text-primary" /> Message Analyzer</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {(["SMS", "WhatsApp", "Email"] as MsgType[]).map((t) => (
              <button key={t} onClick={() => setType(t)} className={type === t ? "tab tab-active" : "tab"}>
                {t === "SMS" ? <Smartphone className="h-4 w-4" /> : t === "WhatsApp" ? <MessageCircle className="h-4 w-4" /> : <Mail className="h-4 w-4" />} {t}
              </button>
            ))}
          </div>
          <textarea
            value={text} onChange={(e) => setText(e.target.value.slice(0, MAX))} rows={6}
            placeholder={`Paste a ${type} message here...`}
            className="w-full resize-y rounded-xl border border-input bg-background p-4 text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-1 text-right text-xs text-muted-foreground">{text.length} / {MAX} characters</div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button onClick={analyze} disabled={!text.trim()} className="btn-primary"><Sparkles className="h-4 w-4" /> Analyze Message</button>
            <button onClick={() => { setText(""); setResult(null); }} className="btn-secondary"><Trash2 className="h-4 w-4" /> Clear</button>
          </div>
          <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sample messages</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => <button key={s.label} onClick={() => { setText(s.text); setResult(null); }} className="chip">{s.label}</button>)}
          </div>
        </section>

        {result && <ResultCard key={total} r={result} message={analyzed} type={type} />}

        <section id="history" className="mt-12 scroll-mt-20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title mb-0"><History className="h-5 w-5 text-primary" /> Analysis History</h2>
            {history.length > 0 && <button onClick={() => save([])} className="btn-secondary py-1.5 text-xs"><Trash2 className="h-3.5 w-3.5" /> Clear History</button>}
          </div>
          {history.length === 0 ? (
            <div className="card text-center text-sm text-muted-foreground">No messages analyzed yet.</div>
          ) : (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr><th className="p-3">Message</th><th className="p-3">Result</th><th className="p-3">Confidence</th><th className="p-3">Risk</th><th className="p-3">Date/Time</th></tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-border last:border-0">
                      <td className="max-w-[220px] truncate p-3 text-foreground">"{h.message}"</td>
                      <td className={`p-3 font-semibold ${h.isSpam ? "text-spam" : "text-safe"}`}>{h.isSpam ? "SPAM" : "NOT SPAM"}</td>
                      <td className="p-3">{h.confidence}%</td>
                      <td className="p-3"><RiskBadge level={h.risk} /></td>
                      <td className="whitespace-nowrap p-3 text-xs text-muted-foreground">{h.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="tips" className="mt-12 scroll-mt-20">
          <h2 className="section-title"><Lightbulb className="h-5 w-5 text-primary" /> Stay Safe From Spam & Scams</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["Never share your OTP or password.", "Don't click unknown links.", "Verify unexpected prize or lottery messages.",
              "Don't send money because of an urgent message.", "Check the sender before responding.", "Use official websites or apps for verification."]
              .map((t) => <div key={t} className="card flex items-start gap-3 text-sm text-foreground"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{t}</div>)}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="section-title"><Brain className="h-5 w-5 text-primary" /> How It Works</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            {([[MessageSquare, "Enter Message"], [Brain, "AI Analyzes Text"], [ScanSearch, "Suspicious Patterns Are Detected"], [CheckCircle2, "Risk & Classification Are Generated"]] as const).map(([I, t], i) => (
              <div key={t} className="card text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground"><I className="h-5 w-5" /></div>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">Step {i + 1}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{t}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="section-title"><Globe className="h-5 w-5 text-primary" /> Real-World Applications</h2>
          <div className="flex flex-wrap gap-3">
            {([[Smartphone, "SMS spam filtering"], [Mail, "Email spam detection"], [Fish, "Phishing detection"], [AlertTriangle, "Scam prevention"], [Users, "Social media moderation"], [Landmark, "Banking security"]] as const)
              .map(([I, t]) => <span key={t} className="chip-static"><I className="h-4 w-4 text-primary" />{t}</span>)}
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-border py-8 text-center">
        <p className="text-sm font-semibold text-foreground">AI Spam Message Detector — College Mini Project</p>
        <p className="mx-auto mt-2 max-w-lg px-4 text-xs text-muted-foreground">This tool provides an automated risk assessment and should not be treated as a guaranteed security verdict.</p>
      </footer>
    </div>
  );
}

function Stat({ label, value, tone = "text-foreground" }: { label: string; value: number | string; tone?: string }) {
  return <div className="card"><p className={`text-3xl font-bold ${tone}`}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const cls = level === "HIGH" ? "badge-high" : level === "MEDIUM" ? "badge-medium" : "badge-low";
  return <span className={`badge ${cls}`}>{level}</span>;
}

function Preview({ type, message }: { type: MsgType; message: string }) {
  if (type === "Email") return (
    <div className="rounded-xl border border-border bg-background">
      <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground"><b className="text-foreground">From:</b> unknown@sender.com · <b className="text-foreground">Subject:</b> (no subject)</div>
      <p className="whitespace-pre-wrap p-4 text-sm text-foreground">{message}</p>
    </div>
  );
  return (
    <div className={`rounded-xl p-4 ${type === "WhatsApp" ? "bg-whatsapp" : "bg-muted"}`}>
      <div className={`max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-foreground shadow-sm ${type === "WhatsApp" ? "bg-card" : "bg-card"}`}>
        <p className="whitespace-pre-wrap">{message}</p>
        <p className="mt-1 text-right text-[10px] text-muted-foreground">{type} · now</p>
      </div>
    </div>
  );
}

function ResultCard({ r, message, type }: { r: Analysis; message: string; type: MsgType }) {
  const Icon = r.isSpam ? ShieldAlert : ShieldCheck;
  return (
    <section id="result" className={`result-card mt-6 scroll-mt-20 ${r.isSpam ? "result-spam" : "result-safe"}`}>
      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${r.isSpam ? "bg-spam text-spam-foreground" : "bg-safe text-safe-foreground"}`}><Icon className="h-8 w-8" /></div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Classification</p>
            <p className={`text-3xl font-bold ${r.isSpam ? "text-spam" : "text-safe"}`}>{r.isSpam ? "🚨 SPAM" : "✓ NOT SPAM"}</p>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">Confidence <b className="text-foreground">{r.confidence}%</b> · <RiskBadge level={r.riskLevel} /> RISK</div>
          </div>
        </div>
        <div className="rounded-2xl bg-muted px-6 py-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Safety Score</p>
          <p className="text-4xl font-bold text-foreground">{r.safetyScore}<span className="text-lg text-muted-foreground"> / 100</span></p>
          <p className={`text-xs font-bold ${r.riskLevel === "LOW" ? "text-safe" : r.riskLevel === "MEDIUM" ? "text-warn" : "text-spam"}`}>{r.riskLevel === "LOW" ? "SAFE" : `${r.riskLevel} RISK`}</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className={`bar h-full rounded-full ${r.safetyScore >= 70 ? "bg-safe" : r.safetyScore >= 40 ? "bg-warn" : "bg-spam"}`} style={{ width: `${r.safetyScore}%` }} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-5 text-sm">
          <div>
            <p className="font-semibold text-foreground">Reason</p>
            <p className="mt-1 text-muted-foreground">{r.reason}</p>
            {r.reasons.length > 0 && <ul className="mt-2 space-y-1">{r.reasons.map((x) => <li key={x} className="flex items-center gap-2 text-foreground"><AlertTriangle className="h-3.5 w-3.5 text-warn" />{x}</li>)}</ul>}
          </div>
          <div>
            <p className="font-semibold text-foreground">Detected Keywords</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {r.keywords.length ? r.keywords.map((k) => <span key={k} className="keyword">{k}</span>) : <span className="text-muted-foreground">None detected</span>}
            </div>
          </div>
          <div>
            <p className="font-semibold text-foreground">Links</p>
            {r.urls.length === 0 ? <p className="mt-1 text-muted-foreground">No URLs found</p> : (
              <div className="mt-2 space-y-2">
                {r.suspiciousUrl && <p className="font-semibold text-spam">⚠️ Suspicious link detected</p>}
                {r.urls.map((u) => <code key={u} className="flex items-center gap-2 break-all rounded-md bg-muted px-2 py-1 text-xs text-foreground"><Link2 className="h-3 w-3 shrink-0" />{u}</code>)}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">{type} Preview</p>
          <Preview type={type} message={message} />
          <div className={`rounded-xl p-4 text-sm ${r.isSpam || r.suspiciousUrl ? "bg-spam/10 text-spam" : "bg-safe/10 text-safe"}`}>
            <b>Safety recommendation:</b> {r.recommendation}
          </div>
        </div>
      </div>
    </section>
  );
}
