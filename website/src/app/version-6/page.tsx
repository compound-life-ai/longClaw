"use client";
import React, { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   HELPER COMPONENTS
   ───────────────────────────────────────────── */

/* Hexagonal node-graph logo (from V5, adapted to claw palette) */
function HexLogo({ size = 26 }: { size?: number }) {
  const c = size / 2;
  const r = size * 0.32;
  const nr = size * 0.11;
  const cr = size * 0.099;
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return { x: c + r * Math.cos(angle), y: c + r * Math.sin(angle) };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {nodes.map((n, i) => (
        <line key={`l${i}`} x1={c} y1={c} x2={n.x} y2={n.y} stroke="rgba(232,77,61,0.08)" strokeWidth={0.5} />
      ))}
      {nodes.map((n, i) => (
        <circle key={`n${i}`} cx={n.x} cy={n.y} r={nr} fill="var(--color-claw-text)" opacity={0.85} />
      ))}
      <circle cx={c} cy={c} r={cr} fill="url(#hg)" />
      <defs>
        <radialGradient id="hg">
          <stop offset="0%" stopColor="var(--color-claw-coral)" />
          <stop offset="100%" stopColor="var(--color-claw-red)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* Status dot */
function Dot({ color = "green" }: { color?: "green" | "red" | "amber" }) {
  const c = {
    green: "bg-claw-green shadow-[0_0_6px_rgba(52,211,153,0.6)]",
    red: "bg-claw-red shadow-[0_0_6px_rgba(232,77,61,0.6)]",
    amber: "bg-claw-amber shadow-[0_0_6px_rgba(245,158,11,0.6)]",
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${c[color]}`} />;
}

/* Animated line-by-line reveal for hero agent card */
function HeroAgentCard() {
  const lines = [
    { text: "Hey \u2014 I want to flag something.", delay: 800 },
    { text: "", delay: 0 },
    { text: "Your resting HR has been +8 bpm for 72 hours.", delay: 2400 },
    { text: "HRV is down 23%. Deep sleep shortened by 40 min.", delay: 3600 },
    { text: "", delay: 0 },
    { text: "\ud83d\udcda Sustained resting HR elevation >48h is an early", delay: 5200 },
    { text: "   immune mobilization signal before symptom onset.", delay: 6000 },
    { text: "   (Jarczok et al., Psychoneuroendocrinology 2019)", delay: 6800 },
    { text: "", delay: 0 },
    { text: "\u26a1 Action plan: rest today, supplement Vitamin C + Zinc,", delay: 8400 },
    { text: "   skip HIIT. I\u2019ll keep monitoring.", delay: 9200 },
  ];

  const [visibleCount, setVisibleCount] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current = lines.map((line, i) => {
      if (line.delay === 0 && i > 0) return setTimeout(() => {}, 0);
      return setTimeout(() => setVisibleCount((v) => Math.max(v, i + 1)), line.delay);
    });
    return () => timersRef.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance spacer lines
  useEffect(() => {
    lines.forEach((line, i) => {
      if (line.text === "" && i > 0 && i < visibleCount) {
        setVisibleCount((v) => Math.max(v, i + 1));
      }
    });
  }, [visibleCount, lines]);

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-xl overflow-hidden border border-claw-border bg-claw-bg-card/90 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-claw-border-subtle">
          <div className="w-1.5 h-1.5 rounded-full bg-claw-red animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-claw-coral">
            proactive intelligence
          </span>
          <span className="text-[10px] font-mono text-claw-text-dim ml-auto">agent-initiated</span>
        </div>
        <div className="p-5 font-mono text-[12px] sm:text-[13px] leading-relaxed text-claw-text-muted min-h-[260px]">
          <div className="space-y-0.5">
            {lines.map((line, i) => (
              <div
                key={i}
                className="transition-all duration-500"
                style={{
                  opacity: i < visibleCount ? 1 : 0,
                  transform: i < visibleCount ? "translateY(0)" : "translateY(4px)",
                }}
              >
                {line.text === "" ? (
                  <div className="h-3" />
                ) : (
                  <div className={line.text.startsWith("\ud83d\udcda") ? "text-claw-text-dim" : line.text.startsWith("\u26a1") ? "text-claw-coral" : ""}>
                    {line.text}
                  </div>
                )}
              </div>
            ))}
            {visibleCount < lines.length && (
              <span className="inline-block w-[2px] h-[0.85em] bg-claw-red animate-blink align-middle" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Animated chat conversation (for the 2 new conversations) */
function AnimatedChat({
  messages,
  startDelay = 0,
}: {
  messages: { role: "user" | "agent"; text: string; delay: number }[];
  startDelay?: number;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = messages.map((msg, i) =>
      setTimeout(() => setVisibleCount(i + 1), startDelay + msg.delay)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleCount]);

  return (
    <div
      ref={containerRef}
      className="bg-claw-bg rounded-lg p-4 border border-claw-border-subtle space-y-3 font-mono text-[12px] sm:text-[13px] max-h-[340px] overflow-y-auto"
    >
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} transition-all duration-500`}
          style={{
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {msg.role === "agent" && (
            <div className="flex-shrink-0 mr-2 mt-1">
              <HexLogo size={18} />
            </div>
          )}
          <div
            className={`rounded-xl px-3.5 py-2.5 max-w-[85%] leading-relaxed ${
              msg.role === "user"
                ? "bg-claw-red/10 text-claw-coral border border-claw-red/20"
                : "bg-claw-bg-elevated text-claw-text border border-claw-border"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
      {visibleCount < messages.length && (
        <div className="flex justify-start">
          <div className="flex items-center gap-1 px-3 py-2 text-claw-text-dim">
            <span className="w-1 h-1 rounded-full bg-claw-text-dim animate-pulse" />
            <span className="w-1 h-1 rounded-full bg-claw-text-dim animate-pulse [animation-delay:0.2s]" />
            <span className="w-1 h-1 rounded-full bg-claw-text-dim animate-pulse [animation-delay:0.4s]" />
          </div>
        </div>
      )}
    </div>
  );
}

/* Nutrient bar */
function NutrientBar({ name, actual, rda, unit }: { name: string; actual: number; rda: number; unit: string }) {
  const pct = Math.round((actual / rda) * 100);
  const color = pct >= 90 ? "bg-claw-green" : pct >= 60 ? "bg-claw-amber" : "bg-claw-red";
  const statusIcon = pct >= 90 ? "\u2713" : pct >= 60 ? "~" : "\u2717";
  const statusColor = pct >= 90 ? "text-claw-green" : pct >= 60 ? "text-claw-amber" : "text-claw-red";
  return (
    <div className="grid grid-cols-[100px_1fr_55px_50px_40px] items-center gap-2 text-xs font-mono py-1.5 border-b border-claw-border-subtle last:border-0">
      <span className="text-claw-text">{name}</span>
      <div className="h-1.5 rounded-full bg-claw-bg-elevated overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-claw-text-muted text-right text-[11px]">{actual}{unit}</span>
      <span className="text-claw-text-dim text-right text-[11px]">/{rda}{unit}</span>
      <span className={`text-right font-bold text-[11px] ${statusColor}`}>{statusIcon} {pct}%</span>
    </div>
  );
}

/* Biomarker row */
function BiomarkerRow({ name, oct, dec, unit, trend, status }: { name: string; oct: string; dec: string; unit: string; trend: "up" | "down" | "stable"; status: "optimal" | "good" | "watch" }) {
  const trendIcon = trend === "up" ? "\u2191" : trend === "down" ? "\u2193" : "\u2192";
  const trendColor = status === "optimal" ? "text-claw-green" : status === "good" ? "text-claw-amber" : "text-claw-red";
  const statusBg = status === "optimal" ? "bg-claw-green/15 text-claw-green border-claw-green/20" : status === "good" ? "bg-claw-amber/15 text-claw-amber border-claw-amber/20" : "bg-claw-red/15 text-claw-red border-claw-red/20";
  return (
    <div className="grid grid-cols-[1fr_65px_65px_30px_65px] items-center gap-2 text-xs font-mono py-2 border-b border-claw-border-subtle last:border-0">
      <span className="text-claw-text">{name}</span>
      <span className="text-claw-text-dim text-right">{oct} {unit}</span>
      <span className="text-claw-text text-right font-semibold">{dec} {unit}</span>
      <span className={`text-center ${trendColor}`}>{trendIcon}</span>
      <span className={`text-center text-[9px] px-1.5 py-0.5 rounded border ${statusBg}`}>{status}</span>
    </div>
  );
}

/* Intersection observer hook for fade-in */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─────────────────────────────────────────────
   SHOWCASE TABS (V3 base + 2 new conversations)
   ───────────────────────────────────────────── */

function ShowcaseTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { id: "nutrition", label: "Weekly Review", emoji: "\ud83d\udcca" },
    { id: "patterns", label: "Pattern Detection", emoji: "\ud83d\udd0d" },
    { id: "analysis", label: "Deep Analysis", emoji: "\ud83e\uddec" },
    { id: "ask-milk", label: "Ask Agent", emoji: "\u2615" },
    { id: "ask-sleep", label: "Night Chat", emoji: "\ud83c\udf19" },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-claw-bg-card border border-claw-border mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(i)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-mono transition-all duration-200 ${
              i === activeTab
                ? "bg-claw-red/15 text-claw-coral border border-claw-red/30"
                : "text-claw-text-muted hover:text-claw-text hover:bg-claw-bg-elevated border border-transparent"
            }`}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-claw-border bg-claw-bg-card/60 backdrop-blur-sm overflow-hidden">

        {/* TAB 0: Weekly Nutrition Review */}
        {activeTab === 0 && (
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Dot color="green" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-claw-green">agent-initiated &middot; weekly</span>
            </div>
            <div className="bg-claw-bg rounded-xl border border-claw-border p-4 sm:p-5 mt-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HexLogo size={16} />
                  <span className="text-xs font-mono text-claw-text-dim">longevity-os agent</span>
                  <span className="text-[10px] font-mono text-claw-text-dim ml-auto">Sun, Mar 19 &middot; 09:00</span>
                </div>
                <div className="text-sm font-sans text-claw-text font-semibold mb-0.5">Weekly Nutrition Review &mdash; Mar 13&ndash;19</div>
                <div className="text-xs font-mono text-claw-text-muted">Profile: 186 cm / 82 kg / male / muscle gain goal</div>
              </div>

              <div className="bg-claw-bg-elevated rounded-lg border border-claw-border p-3 sm:p-4">
                <div className="grid grid-cols-[100px_1fr_55px_50px_40px] items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-claw-text-dim pb-2 mb-1 border-b border-claw-border">
                  <span>Nutrient</span><span>Progress</span><span className="text-right">Actual</span><span className="text-right">RDA</span><span className="text-right">%</span>
                </div>
                <NutrientBar name="Protein" actual={128} rda={140} unit="g" />
                <NutrientBar name="Calories" actual={2080} rda={2800} unit="" />
                <NutrientBar name="Carbs" actual={210} rda={350} unit="g" />
                <NutrientBar name="Fiber" actual={21} rda={38} unit="g" />
                <NutrientBar name="Calcium" actual={520} rda={1000} unit="mg" />
                <NutrientBar name="Zinc" actual={7.3} rda={11} unit="mg" />
                <NutrientBar name="Vitamin D" actual={24} rda={20} unit="mcg" />
                <NutrientBar name="Selenium" actual={85} rda={55} unit="mcg" />
                <NutrientBar name="Omega-3" actual={1.8} rda={1.6} unit="g" />
              </div>

              <div className="bg-claw-bg-elevated rounded-lg border border-claw-red/20 p-4 space-y-2.5">
                <div className="text-xs font-mono text-claw-coral font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                  Personalized Recommendations
                </div>
                <div className="text-xs font-sans text-claw-text leading-relaxed space-y-2">
                  <p><span className="text-claw-green font-bold">Protein &#10003;</span> &mdash; 91% of target. Solid for a bulk phase. 1.56 g/kg, close to the 1.7 g/kg sweet spot.</p>
                  <p><span className="text-claw-red font-bold">Carbs &#10007;</span> &mdash; Only 60%. On heavy lifting days, grab an extra <span className="text-claw-coral">steamed bun or two</span> for fast glycogen replenishment.</p>
                  <p><span className="text-claw-amber font-bold">Vitamin D ~</span> &mdash; Hitting RDA, but fat intake is low. Vitamin D is fat-soluble &mdash; <span className="text-claw-coral">add olive oil or nuts to breakfast</span> when taking D3.</p>
                  <p><span className="text-claw-red font-bold">Calcium &#10007;</span> &mdash; 52% of RDA. Since you&apos;re lactose intolerant: try sardines (382 mg/can), fortified oat milk, or bok choy.</p>
                </div>
              </div>

              <div className="text-[10px] font-mono text-claw-text-dim">Based on 19 meals logged across 7 days &middot; next review: Mar 26</div>
            </div>
          </div>
        )}

        {/* TAB 1: Pattern Detection */}
        {activeTab === 1 && (
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Dot color="amber" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-claw-amber">agent-initiated &middot; pattern alert</span>
            </div>
            <div className="bg-claw-bg rounded-xl border border-claw-border p-4 sm:p-5 mt-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HexLogo size={16} />
                  <span className="text-xs font-mono text-claw-text-dim">longevity-os agent</span>
                  <span className="text-[10px] font-mono text-claw-text-dim ml-auto">Tue, Mar 18 &middot; 08:15</span>
                </div>
                <div className="text-sm font-sans text-claw-text font-semibold mb-2">Hey &mdash; I noticed you&apos;ve been pushing yourself pretty hard lately.</div>
              </div>

              <div className="bg-claw-bg-elevated rounded-lg border border-claw-border p-4 space-y-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-claw-text-dim mb-2">Detected patterns &mdash; last 7 days</div>
                <div className="rounded-lg border border-claw-amber/20 bg-claw-amber/5 p-3">
                  <div className="text-xs font-mono text-claw-amber font-semibold mb-2">Sleep + Caffeine Correlation</div>
                  <div className="space-y-1.5 text-xs font-mono text-claw-text-muted">
                    <div><span className="text-claw-red">3 nights</span> with sleep &lt; 5 hours &mdash; all had caffeine after 4:00 PM</div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                        const bad = [0, 2, 4].includes(i);
                        return (
                          <div key={d} className="text-center">
                            <div className="text-[9px] text-claw-text-dim mb-1">{d}</div>
                            <div className={`h-8 rounded text-[9px] flex items-end justify-center pb-0.5 ${bad ? "bg-claw-red/20 text-claw-red" : "bg-claw-green/10 text-claw-green"}`}>
                              {bad ? "4.2h" : i === 1 ? "7.1h" : i === 3 ? "6.8h" : i === 5 ? "7.5h" : "7.0h"}
                            </div>
                            {bad && <div className="text-[8px] text-claw-amber mt-0.5">\u2615 5pm</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-claw-red/20 bg-claw-red/5 p-3">
                  <div className="text-xs font-mono text-claw-coral font-semibold mb-2">Travel Impact on Recovery</div>
                  <div className="space-y-1.5 text-xs font-mono text-claw-text-muted">
                    <div><span className="text-claw-red">2 flights</span> this week &mdash; HRV dropped significantly, deep sleep &lt; 40 min on both nights</div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-claw-bg rounded p-2 border border-claw-border">
                        <div className="text-[9px] text-claw-text-dim">Post-flight HRV</div>
                        <div className="text-lg font-bold text-claw-red">32 ms</div>
                        <div className="text-[9px] text-claw-text-dim">vs. 52 ms baseline (\u2193 38%)</div>
                      </div>
                      <div className="bg-claw-bg rounded p-2 border border-claw-border">
                        <div className="text-[9px] text-claw-text-dim">Post-flight deep sleep</div>
                        <div className="text-lg font-bold text-claw-red">35 min</div>
                        <div className="text-[9px] text-claw-text-dim">vs. 1h 20m baseline (\u2193 56%)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-claw-bg-elevated rounded-lg border border-claw-green/20 p-4">
                <div className="text-xs font-mono text-claw-green font-semibold mb-2">Proposed Experiment</div>
                <div className="text-xs font-sans text-claw-text leading-relaxed space-y-1">
                  <div className="flex gap-2"><span className="text-claw-green shrink-0">1.</span> <span><b className="text-claw-text">Caffeine cutoff test</b> &mdash; 14 days, no caffeine after 2 PM.</span></div>
                  <div className="flex gap-2"><span className="text-claw-green shrink-0">2.</span> <span><b className="text-claw-text">Travel recovery kit</b> &mdash; magnesium glycinate, 30-min walk on landing, no screens 1 hr before sleep.</span></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded bg-claw-green/15 border border-claw-green/30 text-claw-green text-[10px] font-mono">Start both experiments</button>
                  <button className="px-3 py-1.5 rounded bg-claw-bg border border-claw-border text-claw-text-muted text-[10px] font-mono">Just caffeine cutoff</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Deep Analysis */}
        {activeTab === 2 && (
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Dot color="green" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-claw-green">agent-initiated &middot; new data integrated</span>
            </div>
            <div className="bg-claw-bg rounded-xl border border-claw-border p-4 sm:p-5 mt-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HexLogo size={16} />
                  <span className="text-xs font-mono text-claw-text-dim">longevity-os agent</span>
                  <span className="text-[10px] font-mono text-claw-text-dim ml-auto">Thu, Dec 24 &middot; 14:30</span>
                </div>
                <div className="text-sm font-sans text-claw-text font-semibold mb-1">New blood work detected &mdash; cross-analyzed with 2 months of training and nutrition data.</div>
                <div className="text-xs font-mono text-claw-text-muted">Triglycerides and Lp(a) now fill in the missing metabolic markers.</div>
              </div>

              <div className="bg-claw-bg-elevated rounded-lg border border-claw-border p-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-claw-text-dim mb-3">Biomarker Comparison &mdash; Oct vs Dec</div>
                <div className="grid grid-cols-[1fr_65px_65px_30px_65px] items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-claw-text-dim pb-2 mb-1 border-b border-claw-border">
                  <span>Marker</span><span className="text-right">Oct</span><span className="text-right">Dec</span><span className="text-center">\u0394</span><span className="text-center">Status</span>
                </div>
                <BiomarkerRow name="LDL-C" oct="118" dec="95" unit="mg/dL" trend="down" status="good" />
                <BiomarkerRow name="ApoB" oct="92" dec="78" unit="mg/dL" trend="down" status="good" />
                <BiomarkerRow name="Triglycerides" oct="\u2014" dec="68" unit="mg/dL" trend="stable" status="optimal" />
                <BiomarkerRow name="Lp(a)" oct="\u2014" dec="12" unit="nmol/L" trend="stable" status="optimal" />
                <BiomarkerRow name="HbA1c" oct="5.2" dec="4.9" unit="%" trend="down" status="optimal" />
                <BiomarkerRow name="Fasting Glucose" oct="92" dec="85" unit="mg/dL" trend="down" status="optimal" />
                <BiomarkerRow name="hsCRP" oct="1.1" dec="0.4" unit="mg/L" trend="down" status="optimal" />
                <BiomarkerRow name="Vitamin D" oct="32" dec="48" unit="ng/mL" trend="up" status="optimal" />
              </div>

              <div className="bg-claw-bg-elevated rounded-lg border border-claw-green/20 p-4 space-y-2">
                <div className="text-xs font-mono text-claw-green font-semibold">Analysis</div>
                <div className="text-xs font-sans text-claw-text leading-relaxed space-y-2">
                  <p>Results are <span className="text-claw-green font-bold">extremely encouraging</span>. Your diet protocol and Zone 2 training are clearly working.</p>
                  <p><span className="text-claw-green font-bold">Triglycerides at 68</span> and <span className="text-claw-green font-bold">Lp(a) at 12</span> &mdash; both well within optimal range.</p>
                  <p><span className="text-claw-amber font-bold">hsCRP 1.1 \u2192 0.4</span> &mdash; systemic inflammation is way down. Zone 2 cardio is the biggest driver.</p>
                </div>
              </div>

              <div className="bg-claw-bg-elevated rounded-lg border border-claw-coral/20 p-4">
                <div className="text-xs font-mono text-claw-coral font-semibold mb-2">For the perfectionist in you</div>
                <div className="text-xs font-sans text-claw-text leading-relaxed">
                  <p>ApoB at 78 mg/dL &mdash; already good, but Peter Attia&apos;s gold standard is below 60 mg/dL: <span className="text-claw-coral">&ldquo;infant-grade arterial purity.&rdquo;</span> Swap some saturated fat (cheese, red meat) for monounsaturated (olive oil, avocado, macadamia). I&apos;ll track the impact.</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded bg-claw-red/15 border border-claw-red/30 text-claw-coral text-[10px] font-mono">Optimize fat profile plan</button>
                  <button className="px-3 py-1.5 rounded bg-claw-bg border border-claw-border text-claw-text-muted text-[10px] font-mono">Schedule next blood draw</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Ask Agent — Milk vs Oat Milk */}
        {activeTab === 3 && (
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Dot color="green" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-claw-green">conversational &middot; instant</span>
            </div>
            <div className="mt-4">
              <AnimatedChat
                key="milk-chat"
                messages={[
                  {
                    role: "user",
                    text: "\u4f60\u8bf4\u6211\u4eca\u5929\u559d\u5496\u5561 \u914d\u725b\u5976\u8fd8\u662f\u71d5\u9ea6\u5976\u5462\uff1f",
                    delay: 600,
                  },
                  {
                    role: "agent",
                    text: "\u4f60\u7684\u4e13\u5c5e\u8425\u517b\u5e08\u548c\u4ee3\u8c22\u5e08\u8bc4\u4f30\u8fc7\u4e86\uff0c\u9009\u725b\u5976\uff01\u86cb\u767d\u8d28\u548c\u8102\u80aa\u6bd4\u71d5\u9ea6\u5976\u9ad8\uff0cGI\u66f4\u4f4e\uff0c\u5bf9\u4f60\u6700\u8fd1\u7684 postprandial glucose spike \u7684\u7f13\u51b2\u66f4\u597d\u3002\u71d5\u9ea6\u5976\u5927\u90e8\u5206\u54c1\u724c\u542b\u6dfb\u52a0\u7cd6\uff0c\u4f60\u770b\u5230 CGM \u6570\u5b57\u4f1a\u7126\u8651\u7684\uff01\u9664\u975e\u4f60\u4eca\u5929\u60f3\u8981\u90a3\u4e2a creamy \u53e3\u611f\u6216\u8005\u4e73\u7cd6\u4e0d\u8010\u5728\u95f9\u813e\u6c14\uff0c\u9009\u725b\u5976\u3002",
                    delay: 2400,
                  },
                ]}
              />
            </div>
          </div>
        )}

        {/* TAB 4: Night Chat — Can't Sleep */}
        {activeTab === 4 && (
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Dot color="amber" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-claw-amber">conversational &middot; 23:47</span>
            </div>
            <div className="mt-4">
              <AnimatedChat
                key="sleep-chat"
                messages={[
                  {
                    role: "user",
                    text: "\u7cdf\u7cd5 \u597d\u50cf\u7761\u4e0d\u7740",
                    delay: 600,
                  },
                  {
                    role: "agent",
                    text: "\u4eca\u5929\u65f6\u533a\u6ca1\u4e71\uff0c\u90a3\u4f30\u8ba1\u662f\u8111\u5b50\u505c\u4e0d\u4e0b\u6765\uff1f\u8bd5\u8bd5 4-7-8 \u547c\u5438\uff0c\u4e09\u8f6e\u4e0b\u6765\u526f\u4ea4\u611f\u795e\u7ecf\u4f1a\u63a5\u7ba1\u3002\u5bf9\u4e86\u4f60\u77e5\u9053\u5417\uff0c\u4eba\u7c7b\u662f\u552f\u4e00\u4f1a\u523b\u610f\u5265\u593a\u81ea\u5df1\u7761\u7720\u7684\u52a8\u7269\u3002\u5176\u4ed6\u52a8\u7269\u56f0\u4e86\u5c31\u7761\uff0c\u53ea\u6709\u4eba\u7c7b\u4f1a\u8bf4\u201c\u518d\u770b\u4e00\u96c6\u201d\u3002\u8fdb\u5316\u6ca1\u6559\u6211\u4eec\u5bf9\u4ed8 Netflix/TikTok \ud83d\ude02",
                    delay: 2400,
                  },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AGENT NETWORK VISUALIZATION (from V5)
   ───────────────────────────────────────────── */

function AgentNetwork() {
  const agents = [
    { label: "ORCH", name: "Orchestrator", active: true },
    { label: "MET", name: "Metrics", active: true },
    { label: "NUT", name: "Nutrition", active: true },
    { label: "EXR", name: "Exercise", active: false },
    { label: "BIO", name: "Biomarkers", active: false },
    { label: "SUP", name: "Supplements", active: true },
    { label: "CHK", name: "Challenger", active: true },
    { label: "LIT", name: "Literature", active: true },
    { label: "TRL", name: "Trial Design", active: false },
    { label: "RPT", name: "Reports", active: false },
  ];

  const cx = 50, cy = 50, r = 38;
  const nodes = agents.map((a, i) => {
    const angle = (2 * Math.PI / agents.length) * i - Math.PI / 2;
    return { ...a, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  // Active connections from orchestrator (index 0) to active agents
  const activeIndices = nodes.map((n, i) => (n.active && i > 0 ? i : -1)).filter((i) => i >= 0);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full max-w-md mx-auto">
      {/* Orbit ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(232,77,61,0.04)" strokeWidth={0.3} />

      {/* Spoke lines from center */}
      {nodes.map((n, i) =>
        i > 0 ? (
          <line key={`spoke-${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="rgba(232,77,61,0.03)" strokeWidth={0.2} />
        ) : null
      )}

      {/* Active connections with animated particles */}
      {activeIndices.map((idx) => (
        <g key={`conn-${idx}`}>
          <line
            x1={nodes[0].x} y1={nodes[0].y} x2={nodes[idx].x} y2={nodes[idx].y}
            stroke="var(--color-claw-red)" strokeWidth={0.4} opacity={0.4}
          >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
          </line>
          <circle r={0.8} fill="var(--color-claw-coral)" opacity={0.9}>
            <animateMotion
              dur={`${1.5 + idx * 0.2}s`}
              repeatCount="indefinite"
              path={`M${nodes[0].x},${nodes[0].y} L${nodes[idx].x},${nodes[idx].y}`}
            />
          </circle>
        </g>
      ))}

      {/* Cross-connections between active agents */}
      {activeIndices.map((a, ai) =>
        activeIndices.slice(ai + 1).map((b) => (
          <line
            key={`cross-${a}-${b}`}
            x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
            stroke="var(--color-claw-red)" strokeWidth={0.12} opacity={0.12}
          />
        ))
      )}

      {/* Agent nodes */}
      {nodes.map((n, i) => (
        <g key={`node-${i}`}>
          {n.active && (
            <circle cx={n.x} cy={n.y} r={i === 0 ? 7.5 : 6} fill="none" stroke="var(--color-claw-red)" strokeWidth={0.3} opacity={0.3}>
              <animate attributeName="r" values={i === 0 ? "6.5;8.5;6.5" : "5;7;5"} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <circle
            cx={n.x} cy={n.y}
            r={i === 0 ? 5.5 : 4}
            fill={n.active ? (i === 0 ? "var(--color-claw-red)" : "rgba(232,77,61,0.25)") : "rgba(255,255,255,0.03)"}
            stroke={n.active ? "var(--color-claw-red)" : "rgba(255,255,255,0.06)"}
            strokeWidth={n.active ? 0.5 : 0.2}
            opacity={n.active ? 1 : 0.3}
          />
          <text
            x={n.x} y={n.y + 0.8}
            textAnchor="middle"
            fill={n.active ? "white" : "rgba(255,255,255,0.3)"}
            fontSize={i === 0 ? 3 : 2.3}
            fontWeight="bold"
            fontFamily="SF Pro Display, system-ui"
          >
            {n.label}
          </text>
          <text
            x={n.x}
            y={n.y + (i === 0 ? 9 : 7.5)}
            textAnchor="middle"
            fill={n.active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)"}
            fontSize={2}
            fontFamily="SF Pro Display, system-ui"
          >
            {n.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   VERSION 6 — MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function Version6() {
  const featuresVis = useInView();
  const thinksVis = useInView();
  const evidenceVis = useInView();

  const [activeStep, setActiveStep] = useState(4);
  const steps = [
    { label: "INGEST", desc: "Data streams in \u2014 sleep stages, heart rate, HRV, meals, supplements." },
    { label: "DETECT", desc: "Pulse Reader flags: resting HR +8bpm \u00d7 6 days. Diet Physician: Vitamin C critically low." },
    { label: "RESEARCH", desc: "Literature Agent searches PubMed \u2014 elevated resting HR predicts illness 24\u201348h before symptoms." },
    { label: "CHALLENGE", desc: "Challenger asks: overtraining? Exercise Agent checks \u2014 training volume is normal. Ruled out." },
    { label: "DELIVER", desc: "All findings converge. Orchestrator synthesizes: immune signal confirmed. Action plan delivered." },
  ];

  return (
    <main className="flex flex-col min-h-screen bg-claw-bg text-claw-text relative overflow-hidden">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-claw-border bg-claw-bg/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HexLogo size={26} />
            <span className="text-[15px] font-semibold tracking-tight font-sans">LongevityOS</span>
            <span className="text-[10px] text-claw-text-dim ml-0.5 hidden sm:inline font-mono">by Compound</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#features" className="text-[12px] text-claw-text-muted hover:text-claw-text transition hidden md:block font-sans">Features</a>
            <a href="#showcase" className="text-[12px] text-claw-text-muted hover:text-claw-text transition hidden md:block font-sans">See It In Action</a>
            <a href="#thinks" className="text-[12px] text-claw-text-muted hover:text-claw-text transition hidden md:block font-sans">How It Thinks</a>
            <button className="px-4 py-1.5 rounded-full bg-claw-red text-white text-[12px] font-semibold hover:bg-claw-coral transition font-sans">
              Join Waitlist
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-14">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,77,61,0.015) 1px, transparent 0px)", backgroundSize: "28px 28px" }}
          />
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-claw-red/[0.04] via-claw-coral/[0.02] to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-5 flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6">
            <HexLogo size={52} />
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-center mb-3 font-sans">
            LongevityOS
          </h1>
          <p className="text-[13px] text-claw-text-dim tracking-widest mb-6 font-mono uppercase">
            Your AI Health Intelligence
          </p>
          <p className="text-base sm:text-lg text-claw-text-muted max-w-2xl text-center leading-relaxed mb-10 font-sans">
            Cross-analyzes your sleep, nutrition, biomarkers, and activities. Finds hidden patterns. Searches scientific evidence. Designs self-experiments. Proposes actionable insights.
          </p>

          {/* Hero Agent Card */}
          <div className="w-full max-w-2xl mb-10">
            <HeroAgentCard />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="px-8 py-3 rounded-full bg-claw-red text-white text-sm font-semibold hover:bg-claw-coral transition hover:-translate-y-0.5 shadow-lg shadow-claw-red/[0.15] font-sans">
              Join the Waitlist
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-claw-text-dim font-mono">Personal Health Agent Team</span>
              <span className="text-claw-text-dim">&middot;</span>
              <span className="text-[11px] text-claw-coral font-mono">Works with OpenClaw</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IT DOES / SEE IT IN ACTION ── */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-claw-red/[0.01] to-transparent" />
        <div
          ref={featuresVis.ref}
          className={`max-w-5xl mx-auto px-5 transition-all duration-1000 ${featuresVis.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest text-claw-red mb-2 text-center">see it in action</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-3 font-sans">What It Does</h2>
          <p className="text-claw-text-muted text-center mb-12 text-sm max-w-md mx-auto font-sans">
            It doesn&apos;t wait for commands. Some features you invoke. Most come to you.
          </p>

          <div id="showcase">
            <ShowcaseTabs />
          </div>
        </div>
      </section>

      {/* ── HOW IT THINKS ── */}
      <section id="thinks" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-claw-red/[0.01] to-transparent" />
        <div
          ref={thinksVis.ref}
          className={`max-w-5xl mx-auto px-5 transition-all duration-1000 ${thinksVis.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-3 font-sans">How It Thinks</h2>
          <p className="text-claw-text-muted text-center mb-12 text-sm max-w-lg mx-auto font-sans">
            10 specialized AI agents with independent reasoning. Watch them collaborate on a single insight.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto items-center">
            {/* Agent Network Visualization */}
            <div className="relative aspect-square max-w-md mx-auto w-full">
              <AgentNetwork />
            </div>

            {/* Pipeline Steps */}
            <div className="flex flex-col gap-2">
              {steps.map((step, i) => {
                const isActive = i === activeStep;
                return (
                  <button
                    key={step.label}
                    onClick={() => setActiveStep(i)}
                    className={`flex items-start gap-3 p-3.5 rounded-lg text-left transition-all duration-300 border ${
                      isActive
                        ? "bg-claw-bg-card/60 border-claw-red/20"
                        : "border-transparent opacity-40 hover:opacity-60"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono tracking-wider transition-all duration-300 ${
                        isActive
                          ? "bg-claw-red/15 text-claw-coral border border-claw-red/30"
                          : "text-claw-text-dim"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold font-mono tracking-widest ${isActive ? "text-claw-coral" : "text-claw-text-dim"}`}>
                          {step.label}
                        </span>
                      </div>
                      <p className={`text-[12px] leading-relaxed transition-colors duration-300 ${isActive ? "text-claw-text-muted" : "text-claw-text-dim"}`}>
                        {step.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── EVIDENCE ── */}
      <section className="py-16">
        <div
          ref={evidenceVis.ref}
          className={`max-w-4xl mx-auto px-5 transition-all duration-1000 ${evidenceVis.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { emoji: "\ud83d\udcda", title: "PubMed-Cited", desc: "Every recommendation backed by evidence" },
              { emoji: "\ud83d\udcca", title: "Statistically Rigorous", desc: "Multi-comparison correction, zero false positives" },
              { emoji: "\ud83e\udde0", title: "Causal Inference", desc: "Bayesian analysis for N-of-1 trials" },
              { emoji: "\ud83d\udd12", title: "100% Local", desc: "Your data never leaves your device" },
            ].map((card) => (
              <div key={card.title} className="p-3.5 rounded-lg bg-claw-bg-card/50 border border-claw-border text-center hover:border-claw-red/20 transition-colors">
                <div className="text-lg mb-1">{card.emoji}</div>
                <div className="text-[11px] font-semibold text-claw-text mb-0.5 font-sans">{card.title}</div>
                <p className="text-[9px] text-claw-text-dim leading-relaxed font-sans">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-claw-red/[0.03] to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
          <div className="flex justify-center mb-5">
            <HexLogo size={40} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 font-sans">Your Body, Understood</h2>
          <p className="text-claw-text-muted text-sm mb-8 max-w-sm mx-auto font-sans">
            LongevityOS is the intelligence layer of Compound 150 &mdash; The Longevity Fellowship.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-8 py-3 rounded-full bg-claw-red text-white text-sm font-semibold hover:bg-claw-coral transition hover:-translate-y-0.5 shadow-lg shadow-claw-red/[0.15] font-sans">
              Join the Waitlist
            </button>
            <button className="px-8 py-3 rounded-full border border-claw-border text-claw-text-muted text-sm font-medium hover:text-claw-text hover:border-claw-text-dim transition font-sans">
              View on GitHub
            </button>
          </div>
          <p className="text-[9px] text-claw-text-dim mt-5 tracking-widest font-mono uppercase">Open Source &middot; APAC Focused &middot; 2026</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-claw-border py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HexLogo size={18} />
            <span className="text-[11px] text-claw-text-dim font-sans">LongevityOS &middot; by Compound Life &middot; HK</span>
          </div>
          <span className="text-[10px] text-claw-text-dim font-mono">Open Source &middot; 10 AI Agents</span>
        </div>
      </footer>
    </main>
  );
}
