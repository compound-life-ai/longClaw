"use client";
import React, { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   HELPER COMPONENTS
   ───────────────────────────────────────────── */

/* Compound logo image */
function Logo({ size = 26 }: { size?: number }) {
  return <img src="/logo-light.svg" alt="LongevityOS" className="rounded-lg" style={{ height: size, width: size }} />;
}

/* ─── SVG Icons ─── */
const IconChart = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 15h12M5 15v-5m4 5V6m4 9V9" /></svg>
);
const IconSearch = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="8" r="5" /><path d="m11.5 11.5 4 4" /></svg>
);
const IconDna = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 3c0 6 10 6 10 12M14 3c0 6-10 6-10 12M4 6h10M4 12h10" /></svg>
);
const IconCoffee = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 7v4a4 4 0 0 0 8 0V7H4Z" /><path d="M12 8h1a2 2 0 0 1 0 4h-1" /><path d="M6 3v2M9 2v3M12 3v2" /><path d="M2 15h14" /></svg>
);
const IconMoon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 9.5A6.5 6.5 0 1 1 8.5 3a5.5 5.5 0 0 0 6.5 6.5Z" /></svg>
);
const IconBook = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 4c2-1.5 4-1.5 7 0v12c-3-1.5-5-1.5-7 0V4ZM16 4c-2-1.5-4-1.5-7 0v12c3-1.5 5-1.5 7 0V4Z" /></svg>
);
const IconBarChart = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="9" width="3" height="7" rx="0.5" /><rect x="7.5" y="5" width="3" height="11" rx="0.5" /><rect x="13" y="2" width="3" height="14" rx="0.5" /></svg>
);
const IconBrain = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 16V9M9 9C9 6 7 4 5 4S2 6 2 8c0 1.5 1 3 3 3M9 9c0-3 2-5 4-5s3 2 3 4c0 1.5-1 3-3 3" /><path d="M5 11c-2 1-3 3-1 5M13 11c2 1 3 3 1 5" /></svg>
);
const IconShield = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 2 3 5v4c0 4 3 6.5 6 8 3-1.5 6-4 6-8V5L9 2Z" /><path d="m6.5 9 2 2 3.5-4" /></svg>
);
const IconZap = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 2 4 10h5l-1 6 6-8H9l1-6Z" /></svg>
);

/* Status dot */
function Dot({ color = "green" }: { color?: "green" | "red" | "amber" }) {
  const c = {
    green: "bg-claw-green shadow-[0_0_6px_rgba(52,211,153,0.6)]",
    red: "bg-claw-red shadow-[0_0_6px_rgba(232,77,61,0.6)]",
    amber: "bg-claw-amber shadow-[0_0_6px_rgba(245,158,11,0.6)]",
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${c[color]}`} />;
}

/* iMessage-style chat bubbles for hero agent card */
function HeroAgentCard() {
  const bubbles = [
    { text: "Hey \u2014 I want to flag something.", delay: 800 },
    { text: "Your resting HR has been +8 bpm for 72 hours. HRV is down 23%. Deep sleep shortened by 40 min.", delay: 2800 },
    { text: "[lit]Sustained resting HR elevation >48h is an early immune mobilization signal before symptom onset.\n(Jarczok et al., Psychoneuroendocrinology 2019)", delay: 5200 },
    { text: "[act]Action plan: rest today, supplement Vitamin C + Zinc, skip HIIT. I\u2019ll keep monitoring.", delay: 7800 },
  ];

  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers = bubbles.map((b, i) =>
      setTimeout(() => setVisibleCount(i + 1), b.delay)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-2xl space-y-2.5 min-h-[280px]">
      {bubbles.map((bubble, i) => {
        const isLit = bubble.text.startsWith("[lit]");
        const isAct = bubble.text.startsWith("[act]");
        const text = bubble.text.replace(/^\[(lit|act)\]/, "");
        const visible = i < visibleCount;

        return (
          <div
            key={i}
            className="flex items-end gap-2 transition-all duration-500"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            {/* Avatar — only on first bubble */}
            <div className="flex-shrink-0 w-7">
              {i === 0 && <Logo size={28} />}
            </div>
            {/* Bubble */}
            <div
              className={`relative max-w-[85%] px-4 py-3 text-[13px] sm:text-[14px] leading-relaxed font-sans whitespace-pre-line ${
                isAct
                  ? "bg-claw-red/15 border border-claw-red/25 text-claw-coral rounded-2xl rounded-bl-md"
                  : isLit
                  ? "bg-claw-bg-elevated border border-claw-border text-claw-text-dim rounded-2xl rounded-bl-md"
                  : "bg-claw-bg-elevated border border-claw-border text-claw-text-muted rounded-2xl rounded-bl-md"
              }`}
            >
              {(isLit || isAct) && (
                <span className="inline-flex items-center gap-1 mr-1 align-middle">
                  {isLit && <IconBook className="w-3.5 h-3.5 inline" />}
                  {isAct && <IconZap className="w-3.5 h-3.5 inline" />}
                </span>
              )}
              {text}
            </div>
          </div>
        );
      })}
      {/* Typing indicator */}
      {visibleCount < bubbles.length && visibleCount > 0 && (
        <div className="flex items-end gap-2">
          <div className="w-7" />
          <div className="bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-claw-text-dim animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-claw-text-dim animate-pulse [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-claw-text-dim animate-pulse [animation-delay:0.3s]" />
          </div>
        </div>
      )}
    </div>
  );
}

/* Sequential bubble reveal — shows children one at a time with typing indicator */
function BubbleSequence({ children, interval = 1800 }: { children: React.ReactNode; interval?: number }) {
  const items = React.Children.toArray(children);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= items.length) return;
    const timer = setTimeout(() => setVisibleCount((v) => v + 1), visibleCount === 0 ? 400 : interval);
    return () => clearTimeout(timer);
  }, [visibleCount, items.length, interval]);

  return (
    <div className="space-y-2.5">
      {items.map((child, i) => (
        <div
          key={i}
          className="transition-all duration-500"
          style={{
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? "translateY(0)" : "translateY(12px)",
            maxHeight: i < visibleCount ? "2000px" : "0",
            overflow: "hidden",
          }}
        >
          {child}
        </div>
      ))}
      {/* Typing indicator */}
      {visibleCount > 0 && visibleCount < items.length && (
        <div className="flex items-end gap-2 transition-opacity duration-300">
          <div className="w-7" />
          <div className="bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-claw-text-dim animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-claw-text-dim animate-pulse [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-claw-text-dim animate-pulse [animation-delay:0.3s]" />
          </div>
        </div>
      )}
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
      className="space-y-2.5 max-h-[380px] overflow-y-auto py-2"
    >
      {messages.map((msg, i) => {
        const visible = i < visibleCount;
        const isUser = msg.role === "user";
        return (
          <div
            key={i}
            className={`flex items-end gap-2 transition-all duration-500 ${isUser ? "justify-end" : "justify-start"}`}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            {/* Agent avatar */}
            {!isUser && (
              <div className="flex-shrink-0 w-7">
                <Logo size={28} />
              </div>
            )}
            {/* Bubble */}
            <div
              className={`max-w-[85%] px-4 py-3 text-[13px] sm:text-[14px] leading-relaxed font-sans ${
                isUser
                  ? "bg-claw-red/15 border border-claw-red/25 text-claw-coral rounded-2xl rounded-br-md"
                  : "bg-claw-bg-elevated border border-claw-border text-claw-text-muted rounded-2xl rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
            {/* User avatar spacer */}
            {isUser && <div className="flex-shrink-0 w-1" />}
          </div>
        );
      })}
      {/* Typing indicator */}
      {visibleCount < messages.length && visibleCount > 0 && (
        <div className="flex items-end gap-2">
          <div className="w-7" />
          <div className="bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-claw-text-dim animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-claw-text-dim animate-pulse [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-claw-text-dim animate-pulse [animation-delay:0.3s]" />
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
    <div className="grid grid-cols-[80px_1fr_50px_45px_40px] sm:grid-cols-[100px_1fr_55px_50px_40px] items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-sans py-1.5 border-b border-claw-border-subtle last:border-0">
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
    <div className="grid grid-cols-[1fr_55px_55px_25px_55px] sm:grid-cols-[1fr_65px_65px_30px_65px] items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-sans py-2 border-b border-claw-border-subtle last:border-0">
      <span className="text-claw-text">{name}</span>
      <span className="text-claw-text-dim text-right">{oct} {unit}</span>
      <span className="text-claw-text text-right font-semibold">{dec} {unit}</span>
      <span className={`text-center ${trendColor}`}>{trendIcon}</span>
      <span className={`text-center text-[9px] px-1.5 py-0.5 rounded border ${statusBg}`}>{status}</span>
    </div>
  );
}

/* Glow divider — adapted from V1's "blue glow strip" with V6 palette */
function GlowDivider() {
  return (
    <div className="relative z-10 w-full max-w-3xl mx-auto pointer-events-none">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-claw-red/20 to-transparent" />
      <div className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 w-full h-24 bg-claw-red/[0.07] blur-[50px]" />
    </div>
  );
}

/* Intersection observer hook for fade-in (callback ref to avoid ref-during-render lint) */
function useInView(threshold = 0.15) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!node) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(node);
    return () => obs.disconnect();
  }, [node, threshold]);
  return [setNode, inView] as const;
}

/* ─────────────────────────────────────────────
   SHOWCASE TABS (V3 base + 2 new conversations)
   ───────────────────────────────────────────── */

function ShowcaseTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { id: "nutrition", label: "Weekly Review", icon: <IconChart className="w-3.5 h-3.5" /> },
    { id: "patterns", label: "Pattern Detection", icon: <IconSearch className="w-3.5 h-3.5" /> },
    { id: "analysis", label: "Deep Analysis", icon: <IconDna className="w-3.5 h-3.5" /> },
    { id: "ask-milk", label: "Ask Agent", icon: <IconCoffee className="w-3.5 h-3.5" /> },
    { id: "ask-sleep", label: "Night Chat", icon: <IconMoon className="w-3.5 h-3.5" /> },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex sm:grid sm:grid-cols-5 overflow-x-auto sm:overflow-visible gap-1 p-1 rounded-lg bg-claw-bg-card border border-claw-border mb-6 scrollbar-none">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 sm:w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-sans transition-all duration-200 ${
              i === activeTab
                ? "bg-claw-red/15 text-claw-coral border border-claw-red/30"
                : "text-claw-text-muted hover:text-claw-text hover:bg-claw-bg-elevated border border-transparent"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-claw-border bg-claw-bg-card/60 backdrop-blur-sm overflow-hidden">

        {/* TAB 0: Weekly Nutrition Review */}
        {activeTab === 0 && (
          <div className="p-5 sm:p-6">
            <BubbleSequence key="tab0" interval={2000}>
            {/* Bubble 1: Intro */}
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0 w-7"><Logo size={28} /></div>
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Dot color="green" />
                  <span className="text-[10px] font-sans uppercase tracking-widest text-claw-green">weekly review</span>
                  <span className="text-[10px] font-sans text-claw-text-dim ml-auto">Sun, Mar 19</span>
                </div>
                <div className="text-[14px] font-sans text-claw-text font-semibold mb-0.5">Weekly Nutrition Review &mdash; Mar 13&ndash;19</div>
                <div className="text-xs font-sans text-claw-text-muted">Profile: 186 cm / 82 kg / male / muscle gain goal</div>
              </div>
            </div>
            {/* Bubble 2: Nutrition table */}
            <div className="flex items-end gap-2">
              <div className="w-7" />
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="grid grid-cols-[80px_1fr_50px_45px_40px] sm:grid-cols-[100px_1fr_55px_50px_40px] items-center gap-1.5 sm:gap-2 text-[10px] font-sans uppercase tracking-wider text-claw-text-dim pb-2 mb-1 border-b border-claw-border">
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
            </div>
            {/* Bubble 3: Recommendations */}
            <div className="flex items-end gap-2">
              <div className="w-7" />
              <div className="max-w-[90%] bg-claw-red/8 border border-claw-red/20 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="text-xs font-sans text-claw-coral font-semibold flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                  Personalized Recommendations
                </div>
                <div className="text-[13px] font-sans text-claw-text leading-relaxed space-y-2">
                  <p><span className="text-claw-green font-bold">Protein &#10003;</span> &mdash; 91% of target. Solid for a bulk phase. 1.56 g/kg, close to the 1.7 g/kg sweet spot.</p>
                  <p><span className="text-claw-red font-bold">Carbs &#10007;</span> &mdash; Only 60%. On heavy lifting days, grab an extra <span className="text-claw-coral">steamed bun or two</span> for fast glycogen replenishment.</p>
                  <p><span className="text-claw-amber font-bold">Vitamin D ~</span> &mdash; Hitting RDA, but fat intake is low. Vitamin D is fat-soluble &mdash; <span className="text-claw-coral">add olive oil or nuts to breakfast</span> when taking D3.</p>
                  <p><span className="text-claw-red font-bold">Calcium &#10007;</span> &mdash; 52% of RDA. Since you&apos;re lactose intolerant: try sardines (382 mg/can), fortified oat milk, or bok choy.</p>
                </div>
                <div className="text-[10px] font-sans text-claw-text-dim mt-3">Based on 19 meals logged across 7 days &middot; next review: Mar 26</div>
              </div>
            </div>
            {/* User reply */}
            <div className="flex justify-end">
              <div className="max-w-[75%] bg-claw-red/15 border border-claw-red/25 rounded-2xl rounded-br-md px-4 py-3 text-[14px] font-sans text-claw-coral leading-relaxed">
                What should I eat for lunch to cover the calcium and carb gaps?
              </div>
            </div>
            {/* Agent follow-up */}
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0 w-7"><Logo size={28} /></div>
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3 text-[14px] font-sans text-claw-text-muted leading-relaxed">
                Sardine rice bowl &mdash; one can of sardines gets you 382 mg calcium, add a cup of rice for 45 g carbs. Drizzle sesame oil for fat-soluble vitamin absorption. Want me to log it now?
              </div>
            </div>
            </BubbleSequence>
          </div>
        )}

        {/* TAB 1: Pattern Detection */}
        {activeTab === 1 && (
          <div className="p-5 sm:p-6">
            <BubbleSequence key="tab1" interval={1800}>
            {/* Bubble 1: Intro */}
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0 w-7"><Logo size={28} /></div>
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Dot color="amber" />
                  <span className="text-[10px] font-sans uppercase tracking-widest text-claw-amber">pattern alert</span>
                  <span className="text-[10px] font-sans text-claw-text-dim ml-auto">Tue, Mar 18</span>
                </div>
                <div className="text-[14px] font-sans text-claw-text leading-relaxed">Hey &mdash; I noticed you&apos;ve been pushing yourself pretty hard lately.</div>
              </div>
            </div>
            {/* Bubble 2: Caffeine pattern */}
            <div className="flex items-end gap-2">
              <div className="w-7" />
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="text-xs font-sans text-claw-amber font-semibold mb-2">Sleep + Caffeine Correlation</div>
                <div className="space-y-1.5 text-xs font-sans text-claw-text-muted">
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
                          {bad && <div className="text-[8px] text-claw-amber mt-0.5 flex items-center gap-0.5 justify-center"><IconCoffee className="w-2.5 h-2.5 inline" /> 5pm</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/* Bubble 3: Travel pattern */}
            <div className="flex items-end gap-2">
              <div className="w-7" />
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="text-xs font-sans text-claw-coral font-semibold mb-2">Travel Impact on Recovery</div>
                <div className="space-y-1.5 text-xs font-sans text-claw-text-muted">
                  <div><span className="text-claw-red">2 flights</span> this week &mdash; HRV dropped significantly, deep sleep &lt; 40 min on both nights</div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-claw-bg rounded p-2 border border-claw-border-subtle">
                      <div className="text-[9px] text-claw-text-dim">Post-flight HRV</div>
                      <div className="text-lg font-bold text-claw-red">32 ms</div>
                      <div className="text-[9px] text-claw-text-dim">vs. 52 ms baseline (\u2193 38%)</div>
                    </div>
                    <div className="bg-claw-bg rounded p-2 border border-claw-border-subtle">
                      <div className="text-[9px] text-claw-text-dim">Post-flight deep sleep</div>
                      <div className="text-lg font-bold text-claw-red">35 min</div>
                      <div className="text-[9px] text-claw-text-dim">vs. 1h 20m baseline (\u2193 56%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Bubble 4: Experiment proposal */}
            <div className="flex items-end gap-2">
              <div className="w-7" />
              <div className="max-w-[90%] bg-claw-green/5 border border-claw-green/20 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="text-xs font-sans text-claw-green font-semibold mb-2">Proposed Experiment</div>
                <div className="text-[13px] font-sans text-claw-text leading-relaxed space-y-1">
                  <div className="flex gap-2"><span className="text-claw-green shrink-0">1.</span> <span><b className="text-claw-text">Caffeine cutoff test</b> &mdash; 14 days, no caffeine after 2 PM.</span></div>
                  <div className="flex gap-2"><span className="text-claw-green shrink-0">2.</span> <span><b className="text-claw-text">Travel recovery kit</b> &mdash; magnesium glycinate, 30-min walk on landing, no screens 1 hr before sleep.</span></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded-full bg-claw-green/15 border border-claw-green/30 text-claw-green text-[10px] font-sans">Start both experiments</button>
                  <button className="px-3 py-1.5 rounded-full bg-claw-bg border border-claw-border text-claw-text-muted text-[10px] font-sans">Just caffeine cutoff</button>
                </div>
              </div>
            </div>
            {/* User reply */}
            <div className="flex justify-end">
              <div className="max-w-[75%] bg-claw-red/15 border border-claw-red/25 rounded-2xl rounded-br-md px-4 py-3 text-[14px] font-sans text-claw-coral leading-relaxed">
                Let&apos;s do the caffeine one first. I travel too randomly to test that properly.
              </div>
            </div>
            {/* Agent follow-up */}
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0 w-7"><Logo size={28} /></div>
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3 text-[14px] font-sans text-claw-text-muted leading-relaxed">
                Done &mdash; caffeine cutoff experiment starts today. No caffeine after 2 PM for 14 days. I&apos;ll track your deep sleep and HRV delta each morning. Day 1/14.
              </div>
            </div>
            </BubbleSequence>
          </div>
        )}

        {/* TAB 2: Deep Analysis */}
        {activeTab === 2 && (
          <div className="p-5 sm:p-6">
            <BubbleSequence key="tab2" interval={2000}>
            {/* Bubble 1: Intro */}
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0 w-7"><Logo size={28} /></div>
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Dot color="green" />
                  <span className="text-[10px] font-sans uppercase tracking-widest text-claw-green">new data integrated</span>
                  <span className="text-[10px] font-sans text-claw-text-dim ml-auto">Thu, Dec 24</span>
                </div>
                <div className="text-[14px] font-sans text-claw-text font-semibold mb-0.5">New blood work detected &mdash; cross-analyzed with 2 months of training and nutrition data.</div>
                <div className="text-xs font-sans text-claw-text-muted">Triglycerides and Lp(a) now fill in the missing metabolic markers.</div>
              </div>
            </div>
            {/* Bubble 2: Biomarker table */}
            <div className="flex items-end gap-2">
              <div className="w-7" />
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="text-[10px] font-sans uppercase tracking-wider text-claw-text-dim mb-3">Biomarker Comparison &mdash; Oct vs Dec</div>
                <div className="grid grid-cols-[1fr_55px_55px_25px_55px] sm:grid-cols-[1fr_65px_65px_30px_65px] items-center gap-1.5 sm:gap-2 text-[10px] font-sans uppercase tracking-wider text-claw-text-dim pb-2 mb-1 border-b border-claw-border">
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
            </div>
            {/* Bubble 3: Analysis */}
            <div className="flex items-end gap-2">
              <div className="w-7" />
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="text-[13px] font-sans text-claw-text leading-relaxed space-y-2">
                  <p>Results are <span className="text-claw-green font-bold">extremely encouraging</span>. Your diet protocol and Zone 2 training are clearly working.</p>
                  <p><span className="text-claw-green font-bold">Triglycerides at 68</span> and <span className="text-claw-green font-bold">Lp(a) at 12</span> &mdash; both well within optimal range.</p>
                  <p><span className="text-claw-amber font-bold">hsCRP 1.1 \u2192 0.4</span> &mdash; systemic inflammation is way down. Zone 2 cardio is the biggest driver.</p>
                </div>
              </div>
            </div>
            {/* Bubble 4: Perfectionist recommendation */}
            <div className="flex items-end gap-2">
              <div className="w-7" />
              <div className="max-w-[90%] bg-claw-red/8 border border-claw-coral/20 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="text-xs font-sans text-claw-coral font-semibold mb-2">For the perfectionist in you</div>
                <div className="text-[13px] font-sans text-claw-text leading-relaxed">
                  <p>ApoB at 78 mg/dL &mdash; already good, but Peter Attia&apos;s gold standard is below 60 mg/dL: <span className="text-claw-coral">&ldquo;infant-grade arterial purity.&rdquo;</span> Swap some saturated fat (cheese, red meat) for monounsaturated (olive oil, avocado, macadamia). I&apos;ll track the impact.</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded-full bg-claw-red/15 border border-claw-red/30 text-claw-coral text-[10px] font-sans">Optimize fat profile plan</button>
                  <button className="px-3 py-1.5 rounded-full bg-claw-bg border border-claw-border text-claw-text-muted text-[10px] font-sans">Schedule next blood draw</button>
                </div>
              </div>
            </div>
            {/* User reply */}
            <div className="flex justify-end">
              <div className="max-w-[75%] bg-claw-red/15 border border-claw-red/25 rounded-2xl rounded-br-md px-4 py-3 text-[14px] font-sans text-claw-coral leading-relaxed">
                That&apos;s wild. Set a reminder for bloods in 3 months &mdash; I want to see if the fat swap moves ApoB.
              </div>
            </div>
            {/* Agent follow-up */}
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0 w-7"><Logo size={28} /></div>
              <div className="max-w-[90%] bg-claw-bg-elevated border border-claw-border rounded-2xl rounded-bl-md px-4 py-3 text-[14px] font-sans text-claw-text-muted leading-relaxed">
                Reminder set for Mar 24. I&apos;ll start shifting your meal suggestions toward more monounsaturated fats this week. You probably won&apos;t even notice the swap.
              </div>
            </div>
            </BubbleSequence>
          </div>
        )}

        {/* TAB 3: Ask Agent — Milk vs Oat Milk */}
        {activeTab === 3 && (
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Dot color="green" />
              <span className="text-[10px] font-sans uppercase tracking-widest text-claw-green">conversational &middot; instant</span>
            </div>
            <div className="mt-4">
              <AnimatedChat
                key="milk-chat"
                messages={[
                  {
                    role: "user",
                    text: "Do you think I should have my coffee with regular milk or oat milk today?",
                    delay: 600,
                  },
                  {
                    role: "agent",
                    text: "Your nutrition and metabolism coaches both reviewed this - go with regular milk. It has more protein and fat than oat milk, a lower glycemic impact, and should better blunt the post-meal glucose spikes you've been seeing. Most oat milk brands also contain added sugar, which could make your CGM readings jump and stress you out. Unless you're specifically craving that creamy texture or your lactose intolerance is acting up, pick regular milk.",
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
              <span className="text-[10px] font-sans uppercase tracking-widest text-claw-amber">conversational &middot; 23:47</span>
            </div>
            <div className="mt-4">
              <AnimatedChat
                key="sleep-chat"
                messages={[
                  {
                    role: "user",
                    text: "Uh oh, I don't think I can fall asleep.",
                    delay: 600,
                  },
                  {
                    role: "agent",
                    text: "Your timezone wasn't disrupted today, so your mind is probably just running too fast. Try 4-7-8 breathing - after three rounds, your parasympathetic system should start taking over. Fun fact: humans are the only animals that intentionally deprive themselves of sleep. Other animals sleep when they're tired; only humans say, 'just one more episode.' Evolution never prepared us for Netflix and TikTok.",
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
  const [featuresRef, featuresInView] = useInView();
  const [thinksRef, thinksInView] = useInView();
  const [evidenceRef, evidenceInView] = useInView();

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
            <Logo size={26} />
            <span className="text-[15px] font-semibold tracking-tight font-sans">LongevityOS</span>
            <a
              href="https://compound.zeabur.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-claw-text-dim ml-0.5 hidden sm:inline font-sans hover:text-claw-text transition-colors underline-offset-2 hover:underline"
            >
              by Compound
            </a>
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
            <Logo size={52} />
          </div>

          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight text-center mb-3 font-sans pb-2"
            style={{
              background: "linear-gradient(180deg, #ffffff, #a1a1aa)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LongevityOS
          </h1>
          <p className="text-[13px] text-claw-text-dim tracking-widest mb-6 font-sans uppercase">
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
              <span className="text-[11px] text-claw-text-dim font-sans">Personal Health Agent Team</span>
              <span className="text-claw-text-dim">&middot;</span>
              <span className="text-[11px] text-claw-coral font-sans">Works with OpenClaw</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUILT FOR ── */}
      <section className="relative z-10 pt-8 pb-10">
        <div className="flex items-center justify-center gap-6 mb-10 w-full max-w-5xl mx-auto px-5">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-claw-border to-claw-border/60 flex-1" />
          <p className="text-[10px] uppercase tracking-widest text-claw-text-dim shrink-0 font-sans">Built for</p>
          <div className="h-[1px] bg-gradient-to-l from-transparent via-claw-border to-claw-border/60 flex-1" />
        </div>
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex items-center justify-center gap-10 sm:gap-12 flex-wrap text-claw-text-dim">
            <span className="text-base font-bold tracking-wider font-sans">OpenClaw</span>
            <span className="text-base font-bold tracking-wider font-sans">Telegram</span>
            <span className="text-base font-bold tracking-wider font-sans">Apple Health</span>
            <span className="text-base font-bold tracking-wider font-sans">Oura</span>
            <span className="text-base font-bold tracking-wider font-sans">Whoop</span>
          </div>
        </div>
      </section>

      {/* ── WHAT IT DOES / SEE IT IN ACTION ── */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-claw-red/[0.01] to-transparent" />
        <div
          ref={featuresRef}
          className={`max-w-5xl mx-auto px-5 transition-all duration-1000 ${featuresInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-[10px] font-sans uppercase tracking-widest text-claw-red mb-2 text-center">see it in action</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-3 font-sans">What It Does</h2>
          <p className="text-claw-text-muted text-center mb-12 text-sm max-w-md mx-auto font-sans">
            It doesn&apos;t wait for commands. Some features you invoke. Most come to you.
          </p>

          <div id="showcase">
            <ShowcaseTabs />
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ── HOW IT THINKS ── */}
      <section id="thinks" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-claw-red/[0.01] to-transparent" />
        <div
          ref={thinksRef}
          className={`max-w-5xl mx-auto px-5 transition-all duration-1000 ${thinksInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
                return (
                  <div
                    key={step.label}
                    className="flex items-start gap-3 p-3.5 rounded-lg text-left transition-all duration-300 border bg-claw-bg-card/60 border-claw-red/20"
                  >
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold font-sans tracking-wider transition-all duration-300 bg-claw-red/15 text-claw-coral border border-claw-red/30"
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold font-sans tracking-widest text-claw-coral">
                          {step.label}
                        </span>
                      </div>
                      <p className="text-[12px] leading-relaxed transition-colors duration-300 text-claw-text">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ── EVIDENCE ── */}
      <section className="py-16">
        <div
          ref={evidenceRef}
          className={`max-w-4xl mx-auto px-5 transition-all duration-1000 ${evidenceInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { icon: <IconBook className="w-5 h-5" />, title: "PubMed-Cited", desc: "Every recommendation backed by evidence" },
              { icon: <IconBarChart className="w-5 h-5" />, title: "Statistically Rigorous", desc: "Multi-comparison correction, zero false positives" },
              { icon: <IconBrain className="w-5 h-5" />, title: "Causal Inference", desc: "Bayesian analysis for N-of-1 trials" },
              { icon: <IconShield className="w-5 h-5" />, title: "100% Local", desc: "Your data never leaves your device" },
            ].map((card) => (
              <div key={card.title} className="p-3.5 rounded-lg bg-claw-bg-card/50 border border-claw-border text-center hover:border-claw-red/20 transition-colors">
                <div className="flex justify-center text-claw-text-muted mb-1.5">{card.icon}</div>
                <div className="text-[11px] font-semibold text-claw-text mb-0.5 font-sans">{card.title}</div>
                <p className="text-[9px] text-claw-text-dim leading-relaxed font-sans">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ── FINAL CTA ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-claw-red/[0.03] to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
          <div className="flex justify-center mb-5">
            <Logo size={40} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 font-sans">Your Body, Understood</h2>
          <p className="text-claw-text-muted text-sm mb-8 max-w-sm mx-auto font-sans">
            LongevityOS is the intelligence layer of Compound 150 &mdash; The Longevity Fellowship.
          </p>
          <div className="flex justify-center">
            <button className="px-8 py-3 rounded-full bg-claw-red text-white text-sm font-semibold hover:bg-claw-coral transition hover:-translate-y-0.5 shadow-lg shadow-claw-red/[0.15] font-sans">
              Join the Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-claw-border py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo size={18} />
            <span className="text-[11px] text-claw-text-dim font-sans">
              LongevityOS &middot;{" "}
              <a
                href="https://compound.zeabur.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit hover:text-claw-text transition-colors underline-offset-2 hover:underline"
              >
                by Compound
              </a>
            </span>
          </div>
          <span className="text-[10px] text-claw-text-dim font-sans">Open Source</span>
        </div>
      </footer>
    </main>
  );
}
