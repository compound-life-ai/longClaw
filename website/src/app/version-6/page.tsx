"use client";
import React, { useState, useEffect, useRef } from "react";

const INSTALL_PROMPT = `Clone https://github.com/compound-life-ai/longClaw and run python3 scripts/install_bundle.py to install. Then verify with python3 scripts/install_bundle.py --verify.`;

const InstallModalContext = React.createContext<{ open: () => void }>({ open: () => {} });

function InstallModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTALL_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-claw-bg border border-claw-border rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-claw-text-dim hover:text-claw-text transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Header */}
        <h3 className="text-lg font-bold tracking-tight mb-1">Install LongevityOS</h3>
        <p className="text-sm text-claw-text-muted mb-5">Copy this prompt and paste it into your OpenClaw or agent session.</p>

        {/* Prompt block */}
        <div className="relative group">
          <pre className="bg-claw-card border border-claw-border rounded-xl p-4 pr-12 text-[13px] text-claw-text leading-relaxed whitespace-pre-wrap break-words select-all">
            {INSTALL_PROMPT}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-claw-bg/80 border border-claw-border text-claw-text-muted hover:text-claw-text hover:border-claw-text-muted transition"
            title="Copy to clipboard"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
          </button>
        </div>

        {/* Big copy button */}
        <button
          onClick={handleCopy}
          className="mt-4 w-full py-2.5 rounded-full bg-claw-red text-white text-sm font-semibold hover:bg-claw-coral transition flex items-center justify-center gap-2"
        >
          {copied ? "Copied!" : "Copy Prompt"}
        </button>
      </div>
    </div>
  );
}

function InstallButton({ size = "lg" }: { size?: "sm" | "lg" }) {
  const { open } = React.useContext(InstallModalContext);

  if (size === "sm") {
    return (
      <button
        onClick={open}
        className="px-4 py-1.5 rounded-full bg-claw-red text-white text-[12px] font-semibold hover:bg-claw-coral transition font-sans"
      >
        Install Now
      </button>
    );
  }

  return (
    <button
      onClick={open}
      className="px-8 py-3 rounded-full bg-claw-red text-white text-sm font-semibold hover:bg-claw-coral transition hover:-translate-y-0.5 shadow-lg shadow-claw-red/[0.15] font-sans"
    >
      Install Now
    </button>
  );
}

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
/* ─────────────────────────────────────────────
   MOCKUP CAROUSEL (Proposal A)
   ───────────────────────────────────────────── */

const mockups = [
  { id: "daily-coach", label: "Daily Coaching", desc: "10 specialists review your data every morning", src: "/mockups/daily-coach.png" },
  { id: "nutrition", label: "Nutrition Review", desc: "Macros, micros, and personalized food suggestions", src: "/mockups/nutrition.png" },
  { id: "patterns", label: "Pattern Detection", desc: "Caffeine, sleep, and travel correlations", src: "/mockups/patterns.png" },
  { id: "bloodwork", label: "Blood Work", desc: "Biomarker trends and optimization advice", src: "/mockups/bloodwork.png" },
  { id: "sleep", label: "Always On", desc: "Late night chat — empathetic and human", src: "/mockups/sleep.png" },
];

function MockupCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % mockups.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Phone frame */}
      <div className="relative w-[280px] sm:w-[320px] mx-auto">
        {/* Glow behind phone */}
        <div className="absolute -inset-8 bg-claw-red/[0.04] rounded-full blur-3xl" />
        <div className="relative rounded-[2rem] border-2 border-claw-border bg-claw-bg-card overflow-hidden shadow-2xl shadow-black/30">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-10" />
          {/* Screen */}
          <div className="relative aspect-[9/19.5] overflow-hidden">
            {mockups.map((m, i) => (
              <img
                key={m.id}
                src={m.src}
                alt={m.label}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${
                  i === active ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tab pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-8">
        {mockups.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-sans transition-all duration-300 ${
              i === active
                ? "bg-claw-red/15 text-claw-coral border border-claw-red/30"
                : "text-claw-text-dim hover:text-claw-text border border-claw-border hover:border-claw-text-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-claw-text-muted font-sans mt-4 text-center h-5 transition-all duration-300">
        {mockups[active].desc}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AGENT TEAM STRIP (Proposal B)
   ───────────────────────────────────────────── */

const specialists = [
  { id: "yuyi", name: "Imperial Physician", role: "Orchestrator", src: "/characters/yuyi.svg" },
  { id: "shiyi", name: "Diet Physician", role: "Nutrition", src: "/characters/shiyi.svg" },
  { id: "daoyin", name: "Movement Master", role: "Exercise", src: "/characters/daoyin.svg" },
  { id: "zhenmai", name: "Pulse Reader", role: "Body Metrics", src: "/characters/zhenmai.svg" },
  { id: "yanfang", name: "Formula Tester", role: "Biomarkers", src: "/characters/yanfang.svg" },
  { id: "bencao", name: "Herbalist", role: "Supplements", src: "/characters/bencao.svg" },
  { id: "shixiao", name: "Trial Monitor", role: "Experiments", src: "/characters/shixiao.svg" },
  { id: "yuanpan", name: "Court Magistrate", role: "Trial Design", src: "/characters/yuanpan.svg" },
  { id: "yizheng", name: "Medical Censor", role: "Safety", src: "/characters/yizheng.svg" },
  { id: "baogao", name: "Court Scribe", role: "Research", src: "/characters/baogao.svg" },
];

function AgentTeamStrip() {
  return (
    <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
      {specialists.map((agent, i) => (
        <div key={agent.id} className="group flex flex-col items-center gap-2 w-[72px] sm:w-[80px]">
          <div
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-claw-bg-card border border-claw-border p-1.5 group-hover:border-claw-red/30 transition-all duration-300 group-hover:-translate-y-1"
            style={{ animation: `agentFloat 3s ease-in-out ${i * 0.3}s infinite` }}
          >
            <img src={agent.src} alt={agent.name} className="w-full h-full" />
            {/* Active dot */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-claw-green border-2 border-claw-bg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-center opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-[10px] font-sans font-semibold text-claw-text truncate">{agent.name}</div>
            <div className="text-[9px] font-sans text-claw-text-dim">{agent.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
    { id: "nutrition", label: "Your Week, Decoded", icon: <IconChart className="w-3.5 h-3.5" /> },
    { id: "patterns", label: "Connecting the Dots", icon: <IconSearch className="w-3.5 h-3.5" /> },
    { id: "analysis", label: "New Data, New Insight", icon: <IconDna className="w-3.5 h-3.5" /> },
    { id: "ask-milk", label: "Just Ask", icon: <IconCoffee className="w-3.5 h-3.5" /> },
    { id: "ask-sleep", label: "Always On", icon: <IconMoon className="w-3.5 h-3.5" /> },
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

        {/* TAB 3: Just Ask — Sushi vs Italian + Bubble Tea */}
        {activeTab === 3 && (
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Dot color="green" />
              <span className="text-[10px] font-sans uppercase tracking-widest text-claw-green">conversational &middot; instant</span>
            </div>
            <div className="mt-4">
              <AnimatedChat
                key="ask-chat"
                messages={[
                  {
                    role: "user",
                    text: "Grabbing lunch with a client - sushi or Italian?",
                    delay: 600,
                  },
                  {
                    role: "agent",
                    text: "Sushi. You had pasta last night (high glycemic load, your CGM showed a 2-hr plateau at 155), and your fasting glucose this morning was 96 - slightly elevated for you. Go with sashimi-heavy, skip the rice or keep it to 1 small bowl. If you\u2019re ordering drinks, dry sake over wine - 40% less sugar.",
                    delay: 2400,
                  },
                  {
                    role: "user",
                    text: "Craving bubble tea - yes or no?",
                    delay: 1200,
                  },
                  {
                    role: "agent",
                    text: "Not today. You\u2019re day 21 in your cycle, progesterone is peaking - insulin resistance is at its monthly high. Your last bubble tea on a similar cycle day spiked you to 185 for 90 min. If you really want it: go for less ice, no sugar, sub oat milk with almond or fresh milk, and walk after.",
                    delay: 2800,
                  },
                ]}
              />
            </div>
          </div>
        )}

        {/* TAB 4: Always On — Can't Sleep */}
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
                    text: "Uh oh, I can\u2019t fall asleep.",
                    delay: 600,
                  },
                  {
                    role: "agent",
                    text: "Your resting HR is 71 - 8 bpm above your sleep baseline. Probably the espresso at 4 pm still clearing. Playing Body Scan for Sleep - your favourite meditation (you fall asleep by minute 11 usually). Tomorrow I\u2019m flagging your caffeine cutoff back to 2 pm.\n\nOk I know you probably want to chat\u2026 You had dinner with K tonight, right? How\u2019d it go?",
                    delay: 2400,
                  },
                  {
                    role: "user",
                    text: "Nice but idk I\u2019ve been feeling kind of scattered lately. Like I\u2019m doing a lot but not sure what it\u2019s all for\u2026",
                    delay: 1400,
                  },
                  {
                    role: "agent",
                    text: "Hey I noticed. Your body\u2019s been saying the same thing, actually. But it\u2019s normal - you don\u2019t need perfect HRV and RHR every night. We can talk more tomorrow when your prefrontal cortex is actually online.\n\nFor now, magnesium, lights off. Breath 4-7-8. Night, night.",
                    delay: 2800,
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
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const installModalCtx = React.useMemo(() => ({ open: () => setInstallModalOpen(true) }), []);

  const steps = [
    { label: "INGEST", desc: "Data streams in \u2014 sleep stages, heart rate, HRV, meals, supplements." },
    { label: "DETECT", desc: "Pulse Reader flags: resting HR +8bpm \u00d7 6 days. Diet Physician: Vitamin C critically low." },
    { label: "RESEARCH", desc: "Literature Agent searches PubMed \u2014 elevated resting HR predicts illness 24\u201348h before symptoms." },
    { label: "CHALLENGE", desc: "Challenger asks: overtraining? Exercise Agent checks \u2014 training volume is normal. Ruled out." },
    { label: "DELIVER", desc: "All findings converge. Orchestrator synthesizes: immune signal confirmed. Action plan delivered." },
  ];

  return (
    <InstallModalContext.Provider value={installModalCtx}>
    <InstallModal isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
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
            <InstallButton size="sm" />
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
          <div className="flex flex-col items-center gap-4">
            <InstallButton />
            <a
              href="https://github.com/compound-life-ai/longClaw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-claw-text-muted hover:text-claw-text transition font-sans"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              View on GitHub
            </a>
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

      {/* ── MEET YOUR AGENTS ── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-claw-red/[0.01] to-transparent" />
        <div className="max-w-5xl mx-auto px-5 relative z-10">
          <p className="text-[10px] font-sans uppercase tracking-widest text-claw-red mb-2 text-center">your team</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-3 font-sans">Your Personal Health Specialists</h2>
          <p className="text-claw-text-muted text-center mb-12 text-sm max-w-md mx-auto font-sans">
            10 specialists with independent reasoning. Each one watches a different dimension of your health.
          </p>
          <AgentTeamStrip />
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
            <InstallButton />
          </div>
        </div>
      </section>

      {/* ── SUBSCRIBE ── */}
      <section className="border-t border-claw-border py-16">
        <div className="max-w-md mx-auto px-5 text-center">
          <h3 className="text-lg font-semibold tracking-tight mb-2 font-sans">Subscribe to hear more from Compound</h3>
          <p className="text-sm text-claw-text-muted mb-6 font-sans">Stay updated on LongevityOS, new agents, and longevity research.</p>
          <form
            action="https://formspree.io/f/mykbgdeg"
            method="POST"
            className="flex gap-2"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="flex-1 px-4 py-2.5 rounded-full bg-claw-card border border-claw-border text-sm text-claw-text placeholder:text-claw-text-dim focus:outline-none focus:border-claw-text-muted transition font-sans"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-claw-red text-white text-sm font-semibold hover:bg-claw-coral transition font-sans shrink-0"
            >
              Subscribe
            </button>
          </form>
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
          <a
            href="https://github.com/compound-life-ai/longClaw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-claw-text-dim hover:text-claw-text transition-colors font-sans flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            GitHub
          </a>
        </div>
      </footer>
    </main>
    </InstallModalContext.Provider>
  );
}
