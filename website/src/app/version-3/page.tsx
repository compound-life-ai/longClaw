"use client";
import React, { useState, useEffect } from "react";

/* ─── Typewriter ─── */
function Typewriter({ text, speed = 80 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => { i++; setDisplayed(text.slice(0, i)); if (i >= text.length) { clearInterval(iv); setDone(true); } }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <>{displayed}<span className={`inline-block w-[2px] h-[0.85em] bg-claw-red align-middle ml-0.5 ${done ? "animate-blink" : ""}`} aria-hidden="true" /></>;
}

/* ─── Dot ─── */
function Dot({ color = "green" }: { color?: "green" | "red" | "amber" }) {
  const c = { green: "bg-claw-green shadow-[0_0_6px_rgba(52,211,153,0.6)]", red: "bg-claw-red shadow-[0_0_6px_rgba(232,77,61,0.6)]", amber: "bg-claw-amber shadow-[0_0_6px_rgba(245,158,11,0.6)]" };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${c[color]}`} />;
}

/* ─── Chat mock ─── */
function ChatMock({ messages }: { messages: { role: "user" | "assistant"; text: string }[] }) {
  return (
    <div className="bg-claw-bg rounded-lg p-2.5 border border-claw-border-subtle text-xs space-y-1.5 font-mono">
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`rounded-lg px-3 py-1.5 max-w-[90%] ${m.role === "user" ? "bg-claw-red/15 text-claw-coral border border-claw-red/20" : "bg-claw-border/40 text-claw-text border border-claw-border"}`} dangerouslySetInnerHTML={{ __html: m.text }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Copy button ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-claw-bg-card hover:bg-claw-border text-claw-text-muted hover:text-claw-text text-xs font-mono rounded border border-claw-border transition-all duration-200">
      {copied ? (<><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-claw-green"><polyline points="20 6 9 17 4 12"/></svg>copied</>) : (<><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>copy</>)}
    </button>
  );
}

/* ─── Metric card with sparkline ─── */
function MetricCard({ label, value, unit, change, spark }: { label: string; value: string; unit: string; change: string; spark: number[] }) {
  const max = Math.max(...spark); const min = Math.min(...spark); const range = max - min || 1;
  const points = spark.map((v, i) => `${(i / (spark.length - 1)) * 100},${100 - ((v - min) / range) * 80}`).join(" ");
  return (
    <div className="rounded-lg border border-claw-border bg-claw-bg-card p-4 hover:border-claw-red/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-claw-text-dim">{label}</span>
        <span className={`text-[10px] font-mono ${change.startsWith("+") || change.startsWith("↑") ? "text-claw-green" : change.includes("%") ? "text-claw-green" : "text-claw-red"}`}>{change}</span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-2xl font-bold font-mono text-claw-text">{value}</span>
        <span className="text-xs text-claw-text-dim font-mono">{unit}</span>
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-8 overflow-visible" preserveAspectRatio="none">
        <polyline fill="none" stroke="var(--color-claw-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} vectorEffect="non-scaling-stroke" />
        <polyline fill="url(#sg3)" stroke="none" points={`0,100 ${points} 100,100`} />
        <defs><linearGradient id="sg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-claw-red)" stopOpacity="0.15"/><stop offset="100%" stopColor="var(--color-claw-red)" stopOpacity="0"/></linearGradient></defs>
      </svg>
    </div>
  );
}

/* ─── Feature showcase card (image + content) ─── */
function ShowcaseCard({ title, description, tag, tagColor = "default", children }: {
  title: string; description: string; tag: string; tagColor?: "default" | "green" | "amber"; children: React.ReactNode;
}) {
  const tc = { default: "border-claw-border text-claw-text-muted", green: "border-claw-green/30 text-claw-green", amber: "border-claw-amber/30 text-claw-amber" };
  return (
    <div className="group relative rounded-xl border border-claw-border bg-claw-bg-card/60 backdrop-blur-sm p-5 transition-all duration-300 hover:border-claw-red/40 hover:shadow-[0_0_30px_rgba(232,77,61,0.08)]">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-claw-red/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base font-semibold font-mono text-claw-text">{title}</h3>
          <span className={`text-[10px] font-mono px-2 py-0.5 border rounded-full ${tc[tagColor]} flex items-center gap-1.5`}>
            {tagColor === "green" && <Dot color="green" />}
            {tagColor === "amber" && <Dot color="amber" />}
            {tag}
          </span>
        </div>
        <p className="text-sm text-claw-text-muted leading-relaxed mb-3">{description}</p>
        {children}
      </div>
    </div>
  );
}

/* ─── Nav ─── */
function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-claw-border bg-claw-bg/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-claw-red font-mono font-bold text-lg">&#x2666;</span>
          <span className="font-mono font-semibold text-sm text-claw-text">Longevity OS</span>
          <span className="text-[10px] font-mono text-claw-text-dim ml-1 px-1.5 py-0.5 border border-claw-border rounded">v1.0</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-claw-text-muted">
          <a href="#features" className="hover:text-claw-text transition-colors">features</a>
          <a href="#dashboard" className="hover:text-claw-text transition-colors">dashboard</a>
          <a href="#install" className="hover:text-claw-text transition-colors">install</a>
          <a href="https://github.com/compound-life-ai/longClaw" target="_blank" rel="noreferrer" className="hover:text-claw-text transition-colors">github</a>
        </div>
        <a href="#install" className="rounded-md bg-claw-red text-white px-4 py-1.5 text-xs font-mono font-medium hover:bg-claw-coral hover:shadow-[0_0_20px_rgba(232,77,61,0.3)] transition-all duration-200">
          $ install
        </a>
      </div>
    </nav>
  );
}

/* ─── Nutrient bar ─── */
function NutrientBar({ name, actual, rda, unit }: { name: string; actual: number; rda: number; unit: string }) {
  const pct = Math.round((actual / rda) * 100);
  const color = pct >= 90 ? "bg-claw-green" : pct >= 60 ? "bg-claw-amber" : "bg-claw-red";
  const statusIcon = pct >= 90 ? "✓" : pct >= 60 ? "~" : "✗";
  const statusColor = pct >= 90 ? "text-claw-green" : pct >= 60 ? "text-claw-amber" : "text-claw-red";
  return (
    <div className="grid grid-cols-[120px_1fr_60px_50px_40px] items-center gap-2 text-xs font-mono py-1.5 border-b border-claw-border-subtle last:border-0">
      <span className="text-claw-text">{name}</span>
      <div className="h-1.5 rounded-full bg-claw-bg-elevated overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-claw-text-muted text-right">{actual}{unit}</span>
      <span className="text-claw-text-dim text-right">/{rda}{unit}</span>
      <span className={`text-right font-bold ${statusColor}`}>{statusIcon} {pct}%</span>
    </div>
  );
}

/* ─── Biomarker row ─── */
function BiomarkerRow({ name, oct, dec, unit, trend, status }: { name: string; oct: string; dec: string; unit: string; trend: "up" | "down" | "stable"; status: "optimal" | "good" | "watch" }) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendColor = status === "optimal" ? "text-claw-green" : status === "good" ? "text-claw-amber" : "text-claw-red";
  const statusBg = status === "optimal" ? "bg-claw-green/15 text-claw-green border-claw-green/20" : status === "good" ? "bg-claw-amber/15 text-claw-amber border-claw-amber/20" : "bg-claw-red/15 text-claw-red border-claw-red/20";
  return (
    <div className="grid grid-cols-[1fr_70px_70px_30px_70px] items-center gap-2 text-xs font-mono py-2 border-b border-claw-border-subtle last:border-0">
      <span className="text-claw-text">{name}</span>
      <span className="text-claw-text-dim text-right">{oct} {unit}</span>
      <span className="text-claw-text text-right font-semibold">{dec} {unit}</span>
      <span className={`text-center ${trendColor}`}>{trendIcon}</span>
      <span className={`text-center text-[9px] px-1.5 py-0.5 rounded border ${statusBg}`}>{status}</span>
    </div>
  );
}

/* ─── Tabbed showcase ─── */
function ShowcaseTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { id: "nutrition", label: "Weekly Review", icon: "📊" },
    { id: "patterns", label: "Pattern Detection", icon: "🔍" },
    { id: "analysis", label: "Deep Analysis", icon: "🧬" },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-lg bg-claw-bg-card border border-claw-border mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(i)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-mono transition-all duration-200 ${
              i === activeTab
                ? "bg-claw-red/15 text-claw-coral border border-claw-red/30 shadow-[0_0_15px_rgba(232,77,61,0.1)]"
                : "text-claw-text-muted hover:text-claw-text hover:bg-claw-bg-elevated border border-transparent"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-claw-border bg-claw-bg-card/60 backdrop-blur-sm overflow-hidden">
        {/* ── TAB 1: Weekly Nutrition Review ── */}
        {activeTab === 0 && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Dot color="green" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-claw-green">agent-initiated &middot; weekly</span>
            </div>
            <div className="bg-claw-bg rounded-xl border border-claw-border p-5 mt-4 space-y-5">
              {/* Agent message header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-claw-red font-mono font-bold text-sm">&#x2666;</span>
                  <span className="text-xs font-mono text-claw-text-dim">longevity-os agent</span>
                  <span className="text-[10px] font-mono text-claw-text-dim ml-auto">Sun, Mar 19 &middot; 09:00</span>
                </div>
                <div className="text-sm font-mono text-claw-text font-semibold mb-1">Weekly Nutrition Review — Mar 13–19</div>
                <div className="text-xs font-mono text-claw-text-muted">Profile: 186 cm / 82 kg / male / muscle gain goal</div>
              </div>

              {/* Nutrition table */}
              <div className="bg-claw-bg-elevated rounded-lg border border-claw-border p-4">
                <div className="grid grid-cols-[120px_1fr_60px_50px_40px] items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-claw-text-dim pb-2 mb-1 border-b border-claw-border">
                  <span>Nutrient</span><span>Progress</span><span className="text-right">Actual</span><span className="text-right">RDA</span><span className="text-right">%</span>
                </div>
                <NutrientBar name="Protein" actual={128} rda={140} unit="g" />
                <NutrientBar name="Calories" actual={2080} rda={2800} unit="" />
                <NutrientBar name="Carbs" actual={210} rda={350} unit="g" />
                <NutrientBar name="Fat" actual={72} rda={93} unit="g" />
                <NutrientBar name="Fiber" actual={21} rda={38} unit="g" />
                <NutrientBar name="Calcium" actual={520} rda={1000} unit="mg" />
                <NutrientBar name="Zinc" actual={7.3} rda={11} unit="mg" />
                <NutrientBar name="Vitamin D" actual={24} rda={20} unit="mcg" />
                <NutrientBar name="Selenium" actual={85} rda={55} unit="mcg" />
                <NutrientBar name="Omega-3" actual={1.8} rda={1.6} unit="g" />
              </div>

              {/* Personalized coaching */}
              <div className="bg-claw-bg-elevated rounded-lg border border-claw-red/20 p-4 space-y-3">
                <div className="text-xs font-mono text-claw-coral font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  Personalized Recommendations
                </div>
                <div className="text-xs font-mono text-claw-text leading-relaxed space-y-2">
                  <p><span className="text-claw-green font-bold">Protein ✓</span> — 91% of target. Solid for a bulk phase. You're averaging 1.56 g/kg, close to the 1.7 g/kg sweet spot for muscle gain at your height.</p>
                  <p><span className="text-claw-red font-bold">Carbs ✗</span> — Only 60% of target. On heavy lifting days, you need the fuel. Post-workout, grab an extra <span className="text-claw-coral">steamed bun or two</span> — easy carbs, fast glycogen replenishment.</p>
                  <p><span className="text-claw-amber font-bold">Vitamin D ~</span> — You're hitting RDA, but your fat intake is low. Vitamin D is fat-soluble — without enough dietary fat at the same meal, absorption drops significantly. <span className="text-claw-coral">Add a drizzle of olive oil or some nuts to your breakfast</span> when you take your D3.</p>
                  <p><span className="text-claw-red font-bold">Calcium ✗</span> — 52% of RDA. Since you're lactose intolerant: try sardines (382 mg per can), fortified oat milk, or bok choy for plant-based calcium.</p>
                </div>
              </div>

              <div className="text-[10px] font-mono text-claw-text-dim">Based on 19 meals logged across 7 days &middot; next review: Mar 26</div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Pattern Detection ── */}
        {activeTab === 1 && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Dot color="amber" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-claw-amber">agent-initiated &middot; pattern alert</span>
            </div>
            <div className="bg-claw-bg rounded-xl border border-claw-border p-5 mt-4 space-y-5">
              {/* Agent message header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-claw-red font-mono font-bold text-sm">&#x2666;</span>
                  <span className="text-xs font-mono text-claw-text-dim">longevity-os agent</span>
                  <span className="text-[10px] font-mono text-claw-text-dim ml-auto">Tue, Mar 18 &middot; 08:15</span>
                </div>
                <div className="text-sm font-mono text-claw-text font-semibold mb-2">Hey — I noticed you've been pushing yourself pretty hard lately.</div>
              </div>

              {/* Pattern data */}
              <div className="bg-claw-bg-elevated rounded-lg border border-claw-border p-4 space-y-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-claw-text-dim mb-2">Detected patterns — last 7 days</div>

                {/* Pattern 1: Caffeine + Sleep */}
                <div className="rounded-lg border border-claw-amber/20 bg-claw-amber/5 p-3">
                  <div className="text-xs font-mono text-claw-amber font-semibold mb-2">Sleep + Caffeine Correlation</div>
                  <div className="space-y-1.5 text-xs font-mono text-claw-text-muted">
                    <div className="flex items-center gap-2">
                      <span className="text-claw-red">3 nights</span> with sleep &lt; 5 hours — all had caffeine after 4:00 PM
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                        const bad = [0, 2, 4].includes(i);
                        return (
                          <div key={d} className="text-center">
                            <div className="text-[9px] text-claw-text-dim mb-1">{d}</div>
                            <div className={`h-8 rounded text-[9px] flex items-end justify-center pb-0.5 ${bad ? "bg-claw-red/20 text-claw-red" : "bg-claw-green/10 text-claw-green"}`}>
                              {bad ? "4.2h" : i === 1 ? "7.1h" : i === 3 ? "6.8h" : i === 5 ? "7.5h" : "7.0h"}
                            </div>
                            {bad && <div className="text-[8px] text-claw-amber mt-0.5">☕ 5pm</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Pattern 2: Travel + HRV */}
                <div className="rounded-lg border border-claw-red/20 bg-claw-red/5 p-3">
                  <div className="text-xs font-mono text-claw-coral font-semibold mb-2">Travel Impact on Recovery</div>
                  <div className="space-y-1.5 text-xs font-mono text-claw-text-muted">
                    <div className="flex items-center gap-2">
                      <span className="text-claw-red">2 flights</span> this week — HRV dropped significantly, deep sleep &lt; 40 min on both nights
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-claw-bg rounded p-2 border border-claw-border">
                        <div className="text-[9px] text-claw-text-dim">Post-flight HRV</div>
                        <div className="text-lg font-bold text-claw-red">32 ms</div>
                        <div className="text-[9px] text-claw-text-dim">vs. 52 ms baseline (↓38%)</div>
                      </div>
                      <div className="bg-claw-bg rounded p-2 border border-claw-border">
                        <div className="text-[9px] text-claw-text-dim">Post-flight deep sleep</div>
                        <div className="text-lg font-bold text-claw-red">35 min</div>
                        <div className="text-[9px] text-claw-text-dim">vs. 1h 20m baseline (↓56%)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experiment proposal */}
              <div className="bg-claw-bg-elevated rounded-lg border border-claw-green/20 p-4">
                <div className="text-xs font-mono text-claw-green font-semibold flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  Proposed Experiment
                </div>
                <div className="text-xs font-mono text-claw-text leading-relaxed">
                  <p className="mb-2">Want to find your personal caffeine metabolism cutoff and build a post-flight recovery protocol? Here's what I suggest:</p>
                  <div className="space-y-1 text-claw-text-muted">
                    <div className="flex gap-2"><span className="text-claw-green shrink-0">1.</span> <span><b className="text-claw-text">Caffeine cutoff test</b> — 14 days, no caffeine after 2 PM. I'll track deep sleep and HRV delta vs. your current baseline.</span></div>
                    <div className="flex gap-2"><span className="text-claw-green shrink-0">2.</span> <span><b className="text-claw-text">Travel recovery kit</b> — On flight days: magnesium glycinate before bed, 30-min walk on landing, no screens 1 hr before sleep. I'll compare recovery speed.</span></div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded bg-claw-green/15 border border-claw-green/30 text-claw-green text-[10px] font-mono">Start both experiments</button>
                  <button className="px-3 py-1.5 rounded bg-claw-bg border border-claw-border text-claw-text-muted text-[10px] font-mono">Just caffeine cutoff</button>
                </div>
              </div>

              <div className="text-[10px] font-mono text-claw-text-dim">No manual logging required — all patterns detected from Apple Watch + meal log data</div>
            </div>
          </div>
        )}

        {/* ── TAB 3: Deep Analysis ── */}
        {activeTab === 2 && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Dot color="green" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-claw-green">agent-initiated &middot; new data integrated</span>
            </div>
            <div className="bg-claw-bg rounded-xl border border-claw-border p-5 mt-4 space-y-5">
              {/* Agent message header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-claw-red font-mono font-bold text-sm">&#x2666;</span>
                  <span className="text-xs font-mono text-claw-text-dim">longevity-os agent</span>
                  <span className="text-[10px] font-mono text-claw-text-dim ml-auto">Thu, Dec 24 &middot; 14:30</span>
                </div>
                <div className="text-sm font-mono text-claw-text font-semibold mb-2">New blood work detected — I've cross-analyzed with your last 2 months of training and nutrition data.</div>
                <div className="text-xs font-mono text-claw-text-muted">This fills in the metabolic markers I was missing (triglycerides, Lp(a)). Now I can give you a much deeper picture.</div>
              </div>

              {/* Biomarker comparison table */}
              <div className="bg-claw-bg-elevated rounded-lg border border-claw-border p-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-claw-text-dim mb-3">Biomarker Comparison — Oct vs Dec</div>
                <div className="grid grid-cols-[1fr_70px_70px_30px_70px] items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-claw-text-dim pb-2 mb-1 border-b border-claw-border">
                  <span>Marker</span><span className="text-right">Oct</span><span className="text-right">Dec</span><span className="text-center">Δ</span><span className="text-center">Status</span>
                </div>
                <BiomarkerRow name="LDL-C" oct="118" dec="95" unit="mg/dL" trend="down" status="good" />
                <BiomarkerRow name="ApoB" oct="92" dec="78" unit="mg/dL" trend="down" status="good" />
                <BiomarkerRow name="Triglycerides" oct="—" dec="68" unit="mg/dL" trend="stable" status="optimal" />
                <BiomarkerRow name="Lp(a)" oct="—" dec="12" unit="nmol/L" trend="stable" status="optimal" />
                <BiomarkerRow name="HbA1c" oct="5.2" dec="4.9" unit="%" trend="down" status="optimal" />
                <BiomarkerRow name="Fasting Glucose" oct="92" dec="85" unit="mg/dL" trend="down" status="optimal" />
                <BiomarkerRow name="hsCRP" oct="1.1" dec="0.4" unit="mg/L" trend="down" status="optimal" />
                <BiomarkerRow name="Vitamin D" oct="32" dec="48" unit="ng/mL" trend="up" status="optimal" />
              </div>

              {/* Analysis */}
              <div className="bg-claw-bg-elevated rounded-lg border border-claw-green/20 p-4 space-y-3">
                <div className="text-xs font-mono text-claw-green font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  Analysis
                </div>
                <div className="text-xs font-mono text-claw-text leading-relaxed space-y-2">
                  <p>The results are <span className="text-claw-green font-bold">extremely encouraging</span>. Your metabolic markers are excellent — confirming that your diet protocol and Zone 2 training over the last two months are working.</p>
                  <p><span className="text-claw-green font-bold">Triglycerides at 68</span> and <span className="text-claw-green font-bold">Lp(a) at 12</span> — both well within optimal range. These were the "missing indicators" for your metabolic profile. Now I have the full picture.</p>
                  <p><span className="text-claw-amber font-bold">hsCRP dropped from 1.1 → 0.4</span> — systemic inflammation is way down. Zone 2 cardio is likely the biggest driver here.</p>
                </div>
              </div>

              {/* Next-level recommendation */}
              <div className="bg-claw-bg-elevated rounded-lg border border-claw-coral/20 p-4">
                <div className="text-xs font-mono text-claw-coral font-semibold mb-2">For the perfectionist in you</div>
                <div className="text-xs font-mono text-claw-text leading-relaxed space-y-2">
                  <p>Your ApoB is at 78 mg/dL — already good, but if you want to chase the gold standard that longevity experts like Peter Attia advocate: get it below 60 mg/dL. That's what he calls <span className="text-claw-coral">"infant-grade arterial purity."</span></p>
                  <p>A small tweak to your fat profile could get you there: swap some of the saturated fat sources (cheese, red meat fat) for monounsaturated (olive oil, avocado, macadamia nuts). I'll track the impact over the next blood draw cycle.</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded bg-claw-red/15 border border-claw-red/30 text-claw-coral text-[10px] font-mono">Optimize fat profile plan</button>
                  <button className="px-3 py-1.5 rounded bg-claw-bg border border-claw-border text-claw-text-muted text-[10px] font-mono">Schedule next blood draw reminder</button>
                </div>
              </div>

              <div className="text-[10px] font-mono text-claw-text-dim">Cross-analyzed with 60 days of training, nutrition, and wearable data &middot; blood work from Quest Diagnostics</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*          VERSION 3 — WITH AI IMAGES         */
/* ═══════════════════════════════════════════ */

const installText = `1. Clone \`https://github.com/compound-life-ai/longClaw\` to a stable local path.
2. Change into the cloned repository.
3. Run \`python3 scripts/install_bundle.py\`.
4. Run \`python3 scripts/install_bundle.py --verify\`.
5. Confirm that \`~/.openclaw/openclaw.json\` includes the installed bundle \`skills/\` path inside \`skills.load.extraDirs\`.
6. Tell the user to start a new OpenClaw session.
7. Tell the user to verify that \`/snap\`, \`/health\`, \`/news\`, and \`/insights\` are available and usable.
8. Tell the user to verify that \`daily-coach\` is loaded with \`openclaw skills info daily-coach\`.
9. If needed, tell the user to configure the cron templates from the installed \`cron/\` directory with their Telegram DM chat id, including \`cron/daily-health-coach.example.json\` for proactive daily coaching.`;

export default function Version3() {
  return (
    <main className="flex flex-col min-h-screen bg-claw-bg text-claw-text relative overflow-hidden">
      <Nav />

      {/* ── HERO with AI-generated background ── */}
      <section className="relative px-6 pt-20 pb-20 md:pt-28 md:pb-28 overflow-hidden">
        {/* AI hero background */}
        <div className="absolute inset-0">
          <img src="/v3-hero.png" alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-claw-bg/60 via-claw-bg/40 to-claw-bg" />
          <div className="absolute inset-0 bg-gradient-to-r from-claw-bg/80 via-transparent to-claw-bg/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
          <div className="inline-flex items-center rounded-full border border-claw-red/30 bg-claw-red/10 backdrop-blur-sm px-4 py-1.5 text-xs font-mono text-claw-coral mb-8 gap-2">
            <Dot color="red" />
            <span>health operating system</span>
            <span className="text-claw-text-dim">|</span>
            <span className="text-claw-red">v1.0</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-6 font-mono text-claw-text">
            <Typewriter text="Longevity OS" speed={100} />
          </h1>

          <p className="text-lg md:text-xl text-claw-text-muted max-w-2xl mx-auto leading-relaxed mb-10">
            An AI-powered health agent that quantifies your nutrition, discovers patterns in your biometrics, and coaches you toward a longer, sharper life.
          </p>

          <div className="flex justify-center gap-4">
            <a href="#install" className="group rounded-lg bg-claw-red text-white px-8 py-3.5 text-sm font-mono font-medium transition-all duration-200 hover:bg-claw-coral hover:shadow-[0_0_40px_rgba(232,77,61,0.35)]">
              $ install longevity-os
            </a>
            <a href="https://github.com/compound-life-ai/longClaw" target="_blank" rel="noreferrer" className="rounded-lg bg-claw-bg-card/80 backdrop-blur-sm text-claw-text border border-claw-border px-8 py-3.5 text-sm font-mono font-medium transition-all duration-200 hover:border-claw-text-dim hover:text-white">
              view source &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* ── AI FEATURE ILLUSTRATION ── */}
      <section className="px-6 py-16 w-full border-t border-claw-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-claw-red mb-3">how it works</p>
              <h2 className="text-2xl md:text-3xl font-bold font-mono text-claw-text mb-4">
                One Agent.<br />All Your Health Data.
              </h2>
              <p className="text-claw-text-muted leading-relaxed mb-6">
                Longevity OS connects nutrition, sleep, activity, and wearable data into a single AI agent. It detects patterns across your data streams, runs experiments, and gives you actionable briefings — all through natural conversation.
              </p>
              <div className="space-y-3">
                {[
                  { icon: "🍎", text: "Nutrition tracking from photos and text" },
                  { icon: "🌙", text: "Sleep analysis from wearable data" },
                  { icon: "🫀", text: "HRV & heart rate pattern detection" },
                  { icon: "🏃", text: "Activity and recovery insights" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-claw-text-muted font-mono">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-claw-red/5 rounded-2xl blur-2xl" />
              <img src="/v3-feature.png" alt="AI health agent connecting nutrition, sleep, activity, and heart data" className="relative rounded-xl border border-claw-border shadow-[0_0_40px_rgba(232,77,61,0.1)]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD SHOWCASE with AI image ── */}
      <section id="dashboard" className="px-6 py-20 w-full border-t border-claw-border bg-claw-bg-elevated/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-mono uppercase tracking-widest text-claw-red mb-2">real-time health telemetry</p>
            <h2 className="text-2xl md:text-3xl font-bold font-mono text-claw-text mb-3">
              Mission Control for Your Body
            </h2>
            <p className="text-claw-text-muted max-w-xl mx-auto">
              Every metric at a glance. Tracked automatically, analyzed continuously.
            </p>
          </div>

          {/* AI dashboard image */}
          <div className="relative mb-8 rounded-xl overflow-hidden border border-claw-border shadow-[0_0_60px_rgba(232,77,61,0.08)]">
            <img src="/v3-dashboard.png" alt="Longevity OS health dashboard" className="w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-claw-bg via-transparent to-transparent opacity-60" />
          </div>

          {/* Live metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="HRV" value="52" unit="ms" change="↑ 8%" spark={[38, 42, 40, 45, 48, 44, 50, 52]} />
            <MetricCard label="Resting HR" value="56" unit="bpm" change="↓ 3%" spark={[62, 60, 59, 58, 57, 58, 56, 56]} />
            <MetricCard label="Sleep" value="7:15" unit="hrs" change="↑ 12%" spark={[6.2, 6.5, 7.0, 6.8, 7.1, 7.5, 7.0, 7.25]} />
            <MetricCard label="Protein" value="134" unit="g" change="96% RDA" spark={[98, 110, 125, 105, 130, 128, 140, 134]} />
          </div>
        </div>
      </section>

      {/* ── SHOWCASE: TABBED INTERACTIVE DEMOS ── */}
      <section id="features" className="px-6 py-20 w-full border-t border-claw-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-mono uppercase tracking-widest text-claw-red mb-2">see it in action</p>
            <h2 className="text-2xl md:text-3xl font-bold font-mono mb-3 text-claw-text">
              <span className="text-claw-red">&gt;</span> live_showcase
            </h2>
            <p className="text-claw-text-muted max-w-2xl mx-auto">
              Not just another health tracker. The agent thinks, analyzes, and acts — before you even ask.
            </p>
          </div>

          <ShowcaseTabs />
        </div>
      </section>

      {/* ── INSTALL ── */}
      <section id="install" className="px-6 py-20 w-full border-t border-claw-border bg-claw-bg-elevated/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-mono uppercase tracking-widest text-claw-red mb-2">get started</p>
            <h2 className="text-2xl md:text-3xl font-bold font-mono mb-3 text-claw-text">
              <span className="text-claw-red">&gt;</span> install
            </h2>
            <p className="text-claw-text-muted">Copy this prompt and give it to your OpenClaw agent.</p>
          </div>

          <div className="rounded-lg border border-claw-border bg-claw-bg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2 bg-claw-bg-card border-b border-claw-border">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-claw-red/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-claw-amber/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-claw-green/60" />
              </div>
              <span className="text-xs font-mono text-claw-text-dim">installation_prompt.md</span>
              <div className="ml-auto"><CopyButton text={installText} /></div>
            </div>
            <div className="p-5 font-mono text-sm">
              <pre className="text-claw-text-muted whitespace-pre-wrap leading-relaxed text-xs">{installText}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOCAL FIRST ── */}
      <section className="px-6 py-20 w-full border-t border-claw-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-claw-red mb-2">architecture</p>
          <h2 className="text-2xl md:text-3xl font-bold font-mono mb-4 text-claw-text">
            <span className="text-claw-red">&gt;</span> local_first
          </h2>
          <p className="text-claw-text-muted mb-8">All data stays on your machine. No cloud telemetry. No forced subscriptions.</p>
          <div className="rounded-lg border border-claw-border bg-claw-bg overflow-hidden text-left">
            <div className="flex items-center gap-3 px-4 py-2 bg-claw-bg-card border-b border-claw-border">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-claw-red/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-claw-amber/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-claw-green/60" />
              </div>
              <span className="text-xs font-mono text-claw-text-dim">$ tree longevityOS-data/</span>
            </div>
            <div className="p-5 font-mono text-sm">
              <pre className="text-claw-text-muted leading-relaxed text-xs">
{`longevityOS-data/
├── nutrition/
│   └── meals.csv        `}<span className="text-claw-text-dim"># deterministic macros</span>{`
├── health/
│   └── profile.json     `}<span className="text-claw-text-dim"># Apple Health aggregation</span>{`
├── insights/
│   ├── experiments.json `}<span className="text-claw-text-dim"># hypotheses & interventions</span>{`
│   └── checkins.json    `}<span className="text-claw-text-dim"># daily compliance logs</span>{`
└── news/
    └── cache.json       `}<span className="text-claw-text-dim"># off-grid reading cache</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-claw-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-xs font-mono text-claw-text-dim">
            <span className="text-claw-red">longevity-os</span>
            <span className="mx-2">/</span>
            {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-claw-text-dim">
            <a href="https://github.com/compound-life-ai/longClaw" target="_blank" rel="noreferrer" className="hover:text-claw-text transition-colors">github</a>
            <span className="text-claw-border">|</span>
            <span>built with next.js + tailwind</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
