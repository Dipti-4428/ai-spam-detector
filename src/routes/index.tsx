import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck, ShieldAlert, Sparkles, Trash2, MessageSquare, BarChart3,
  Mail, Search, Brain, ScanSearch, CheckCircle2, Smartphone, Fish, Users, AlertTriangle,
} from "lucide-react";
import { analyzeMessage, type Analysis } from "@/lib/spam-classifier";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Spam Message Detector" },
      { name: "description", content: "Detect suspicious and unwanted messages using AI-style NLP analysis." },
      { property: "og:title", content: "AI Spam Message Detector" },
      { property: "og:description", content: "Paste a message and instantly see if it's SPAM or NOT SPAM." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const SAMPLES = [
  { label: "OTP message", text: "Your OTP for login is 482913. It is valid for 10 minutes. Do not share it with anyone." },
  { label: "Prize scam", text: "Congratulations! You won ₹50,000. Click this link now to claim your prize: http://bit.ly/claim-now" },
  { label: "Personal", text: "Hi, are you coming to college tomorrow?" },
  { label: "Promotion", text: "MEGA SALE! Flat 70% off on all items. Limited time offer, buy now at www.shopdeals.xyz!!!" },
];

type Stats = { total: number; spam: number };
const KEY = "spam-detector-stats";

function Index() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, spam: 0 });

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setStats(JSON.parse(s)); } catch {}
  }, []);

  const analyze = () => {
    if (!text.trim()) return;
    const r = analyzeMessage(text);
    setResult(r);
    const next = { total: stats.total + 1, spam: stats.spam + (r.isSpam ? 1 : 0) };
    setStats(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const pct = stats.total ? Math.round((stats.spam / stats.total) * 100) : 0;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
        <header className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">AI Spam Message Detector</h1>
          <p className="mt-3 text-muted-foreground">Detect suspicious and unwanted messages using AI</p>
        </header>

        <section className="card mt-10">
          <label htmlFor="msg" className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquare className="h-4 w-4" /> Enter or paste a message
          </label>
          <textarea
            id="msg" value={text} onChange={(e) => setText(e.target.value)} rows={6}
            placeholder="e.g. Congratulations! You won a free iPhone..."
            className="w-full resize-y rounded-xl border border-input bg-background p-4 text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={analyze} disabled={!text.trim()} className="btn-primary">
              <Sparkles className="h-4 w-4" /> Analyze Message
            </button>
            <button onClick={() => { setText(""); setResult(null); }} className="btn-secondary">
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          </div>
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Try a sample</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button key={s.label} onClick={() => { setText(s.text); setResult(null); }} className="chip">{s.label}</button>
              ))}
            </div>
          </div>
        </section>

        {result && <ResultCard key={stats.total} r={result} />}

        <section className="mt-10">
          <h2 className="section-title"><BarChart3 className="h-5 w-5" /> Statistics</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Messages analyzed" value={stats.total} />
            <Stat label="Spam detected" value={stats.spam} tone="text-spam" />
            <Stat label="Safe messages" value={stats.total - stats.spam} tone="text-safe" />
            <Stat label="Spam rate" value={`${pct}%`} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="section-title"><Brain className="h-5 w-5" /> How It Works</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              [MessageSquare, "User enters a message"],
              [Brain, "AI analyzes the text"],
              [ScanSearch, "Spam patterns are detected"],
              [CheckCircle2, "Predicts SPAM or NOT SPAM"],
            ].map(([Icon, t], i) => {
              const I = Icon as typeof Brain;
              return (
                <div key={i} className="card text-center">
                  <I className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">Step {i + 1}</p>
                  <p className="mt-1 text-sm text-foreground">{t as string}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="section-title"><Search className="h-5 w-5" /> Real-World Applications</h2>
          <div className="flex flex-wrap gap-3">
            {[
              [Smartphone, "SMS spam detection"], [Mail, "Email filtering"], [AlertTriangle, "Scam detection"],
              [Fish, "Phishing prevention"], [Users, "Social media moderation"],
            ].map(([Icon, t]) => {
              const I = Icon as typeof Mail;
              return <span key={t as string} className="chip-static"><I className="h-4 w-4 text-primary" />{t as string}</span>;
            })}
          </div>
        </section>

        <footer className="mt-14 text-center text-xs text-muted-foreground">AI Spam Message Detector · Mini Project</footer>
      </div>
    </main>
  );
}

function Stat({ label, value, tone = "text-foreground" }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="card">
      <p className={`text-3xl font-bold ${tone}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ResultCard({ r }: { r: Analysis }) {
  const Icon = r.isSpam ? ShieldAlert : ShieldCheck;
  return (
    <section className={`result-card mt-6 ${r.isSpam ? "result-spam" : "result-safe"}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${r.isSpam ? "bg-spam text-spam-foreground" : "bg-safe text-safe-foreground"}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Classification</p>
          <p className={`text-2xl font-bold ${r.isSpam ? "text-spam" : "text-safe"}`}>{r.isSpam ? "SPAM" : "NOT SPAM"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Confidence</p>
          <p className="text-2xl font-bold text-foreground">{r.confidence}%</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className={`bar h-full rounded-full ${r.isSpam ? "bg-spam" : "bg-safe"}`} style={{ width: `${r.confidence}%` }} />
      </div>
      <dl className="mt-5 space-y-4 text-sm">
        <div><dt className="font-semibold text-foreground">Reason</dt><dd className="mt-1 text-muted-foreground">{r.reason}</dd></div>
        <div>
          <dt className="font-semibold text-foreground">Suspicious keywords</dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {r.keywords.length ? r.keywords.map((k) => <span key={k} className="keyword">{k}</span>)
              : <span className="text-muted-foreground">None detected</span>}
          </dd>
        </div>
        <div><dt className="font-semibold text-foreground">Recommendation</dt><dd className="mt-1 text-muted-foreground">{r.recommendation}</dd></div>
      </dl>
    </section>
  );
}
