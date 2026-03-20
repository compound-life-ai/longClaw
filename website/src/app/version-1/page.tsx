"use client";
import React, { useState, useEffect } from "react";

function Typewriter({ text, speed = 100 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <>
      {displayed}
      <span
        className={`inline-block w-[2px] h-[0.9em] bg-purple-500 align-middle ml-0.5 ${done ? "animate-blink" : ""}`}
        aria-hidden="true"
      />
    </>
  );
}

const installText = `1. Clone \`https://github.com/compound-life-ai/longClaw\` to a stable local path.
2. Change into the cloned repository.
3. Run \`python3 scripts/install_bundle.py\`.
4. Run \`python3 scripts/install_bundle.py --verify\`.
5. Confirm that \`~/.openclaw/openclaw.json\` includes the installed bundle \`skills/\` path inside \`skills.load.extraDirs\`.
6. Tell the user to start a new OpenClaw session.
7. Tell the user to verify that \`/snap\`, \`/health\`, \`/news\`, and \`/insights\` are available and usable.
8. Tell the user to verify that \`daily-coach\` is loaded with \`openclaw skills info daily-coach\`.
9. If needed, tell the user to configure the cron templates from the installed \`cron/\` directory with their Telegram DM chat id, including \`cron/daily-health-coach.example.json\` for proactive daily coaching.`;

function CopyButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(installText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1525] hover:bg-[#2a2040] text-gray-400 hover:text-white text-xs font-mono rounded border border-purple-500/20 transition-all duration-200"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><polyline points="20 6 9 17 4 12"/></svg>
          copied
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          copy
        </>
      )}
    </button>
  );
}


export default function VersionOne() {
  return (
    <main
      className="flex flex-col min-h-screen text-white relative overflow-hidden"
      style={{ backgroundColor: "#0e0c14" }}
    >
      {/* Hero reflection glow — SurrealDB style */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center overflow-hidden">
        <img
          src="/hero-reflection.jpg"
          alt=""
          className="w-[200vw] max-w-none -mt-[10%]"
          style={{ mixBlendMode: "lighten" }}
        />
      </div>

      {/* ============ NAVBAR ============ */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <img src="/logo-light.svg" alt="Longevity OS" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-bold tracking-tight">Longevity OS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#install" className="hover:text-white transition-colors">Install</a>
          <a href="https://github.com/compound-life-ai/longClaw" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
        </div>
        <a
          href="#install"
          className="rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white px-5 py-2 text-sm font-medium transition-all duration-200 hover:shadow-[0_0_24px_rgba(168,85,247,0.4)] hover:from-purple-500 hover:to-purple-400"
        >
          Get started
        </a>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative z-10 px-6 pt-36 pb-32 md:pt-52 md:pb-44 max-w-5xl mx-auto w-full text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-6 leading-tight text-white">
          Your longevity agent
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mt-6">
          The AI health companion where nutrition, wearables, and coaching are one conversation.
        </p>

        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <a
            href="#install"
            className="rounded-full bg-gradient-to-r from-[#a855f7] to-[#c084fc] text-white px-8 py-3.5 text-base font-medium transition-all duration-200 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:brightness-110"
          >
            Start building
          </a>
          <a
            href="https://github.com/compound-life-ai/longClaw"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-transparent text-white border border-white/20 px-8 py-3.5 text-base font-medium transition-all duration-200 hover:bg-white/5 hover:border-white/30"
          >
            View source
          </a>
        </div>
      </section>

      {/* ============ LOGO STRIP ============ */}
      <section className="relative z-10 border-t border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest text-gray-600 mb-6">Built for</p>
          <div className="flex items-center justify-center gap-12 flex-wrap text-gray-600">
            <span className="text-lg font-bold tracking-wider">OpenClaw</span>
            <span className="text-lg font-bold tracking-wider">Telegram</span>
            <span className="text-lg font-bold tracking-wider">Apple Health</span>
            <span className="text-lg font-bold tracking-wider">Oura</span>
            <span className="text-lg font-bold tracking-wider">Whoop</span>
          </div>
        </div>
      </section>

      {/* ============ FEATURES - STAGGERED CARDS ============ */}
      <section id="features" className="relative z-10 px-6 py-24">
        {/* Subtle purple glow behind features */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[1000px] h-[600px] opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(ellipse at center, rgba(168,85,247,0.3) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-sm font-mono uppercase tracking-widest text-purple-400 mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Talk naturally. Get quantified.
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              No buttons, no slash commands. Just say what you ate, ask about your sleep, or let it coach you proactively.
            </p>
          </div>

          {/* SurrealDB-style pillar cards — 3 staggered with 3D illustrations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8">
          {/* Card 1 — Nutrition */}
          <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#13111a] p-6 pb-8 min-h-[340px]">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Nutrition</p>
              <h3 className="text-xl font-bold text-white mb-3">Meal Snap</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[70%] drop-shadow-md">
                Send a food photo or describe what you ate. Full micronutrient breakdown in seconds.
              </p>
              <button className="mt-6 h-10 w-10 rounded-full border border-white/10 bg-[#13111a]/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            <img src="/card-memory.png" alt="" className="absolute -right-8 -bottom-4 w-[280px] h-[280px] object-contain pointer-events-none z-0 opacity-80" />
          </div>

          {/* Card 2 — Wearables */}
          <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#13111a] p-6 pb-8 min-h-[340px]">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Wearables</p>
              <h3 className="text-xl font-bold text-white mb-3">Pattern Insights</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[70%] drop-shadow-md">
                Cross-references sleep, HRV, nutrition, and activity to surface hidden correlations.
              </p>
              <button className="mt-6 h-10 w-10 rounded-full border border-white/10 bg-[#13111a]/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            <img src="/card-context.png" alt="" className="absolute -right-8 -bottom-4 w-[280px] h-[280px] object-contain pointer-events-none z-0 opacity-80" />
          </div>

          {/* Card 3 — Coaching */}
          <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#13111a] p-6 pb-8 min-h-[340px]">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Coaching</p>
              <h3 className="text-xl font-bold text-white mb-3">Daily Coach</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[70%] drop-shadow-md">
                Morning briefing with overnight sleep, nutrition gaps, active experiments, and longevity news.
              </p>
              <button className="mt-6 h-10 w-10 rounded-full border border-white/10 bg-[#13111a]/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            <img src="/card-storage.png" alt="" className="absolute -right-8 -bottom-4 w-[280px] h-[280px] object-contain pointer-events-none z-0 opacity-80" />
          </div>
          </div>

          {/* Purple glow strip beneath cards */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-24 -translate-y-1/2 bg-purple-500/20 blur-[50px] -z-10" />
        </div>
      </section>

      {/* ============ SHOWCASE: PROACTIVE INTELLIGENCE ============ */}
      <section className="relative z-10 px-6 py-24">
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/3 w-[1200px] h-[800px] opacity-15 blur-3xl"
          style={{
            background: "radial-gradient(ellipse at center, rgba(168,85,247,0.3) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-sm font-mono uppercase tracking-widest text-purple-400 mb-3">Proactive Intelligence</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your agent thinks ahead
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              No prompting needed. Your agent continuously analyzes your data and reaches out with insights, reviews, and discoveries.
            </p>
          </div>

          {/* Showcase Card 1 — Weekly Nutrition Review */}
          <div className="relative mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-3xl blur opacity-20" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0a0615] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 lg:p-10 shadow-2xl backdrop-blur-sm">
              <div className="lg:col-span-7 relative z-10 order-2 lg:order-1">
                <div className="flex items-center gap-2 mb-5">
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest">Weekly Review</span>
                  <span className="text-gray-500 text-xs font-mono">Sunday 8:00 AM</span>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Here&apos;s your weekly nutrition breakdown. Based on your profile <span className="text-white font-medium">(186cm, 82kg, muscle gain)</span>, here&apos;s how you&apos;re tracking:
                </p>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="pb-3 pr-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Nutrient</th>
                        <th className="pb-3 pr-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Daily Avg</th>
                        <th className="pb-3 pr-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Target</th>
                        <th className="pb-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-400">
                      <tr className="border-b border-white/5">
                        <td className="py-3 pr-4 font-medium text-gray-200">Protein</td>
                        <td className="py-3 pr-4 font-mono text-xs">168g</td>
                        <td className="py-3 pr-4 font-mono text-xs">160g</td>
                        <td className="py-3"><span className="text-gray-300 text-xs">On track</span></td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 pr-4 font-medium text-gray-200">Carbs</td>
                        <td className="py-3 pr-4 font-mono text-xs">220g</td>
                        <td className="py-3 pr-4 font-mono text-xs">300g</td>
                        <td className="py-3"><span className="text-gray-300 text-xs">Gap: -80g</span></td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 pr-4 font-medium text-gray-200">Fat</td>
                        <td className="py-3 pr-4 font-mono text-xs">72g</td>
                        <td className="py-3 pr-4 font-mono text-xs">75g</td>
                        <td className="py-3"><span className="text-gray-300 text-xs">On track</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-medium text-gray-200">Vitamin D</td>
                        <td className="py-3 pr-4 font-mono text-xs">400 IU</td>
                        <td className="py-3 pr-4 font-mono text-xs">2,000 IU</td>
                        <td className="py-3"><span className="text-gray-300 text-xs">Low</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-white/[0.02] rounded-lg p-4 text-sm text-gray-300 leading-relaxed border border-white/5">
                  On training days, add a post-workout carb source — your favorite mantou would cover the gap perfectly. Also, take Vitamin D with breakfast fats — it&apos;s fat-soluble, so without lipids it won&apos;t absorb properly.
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center relative min-h-[280px] order-1 lg:order-2">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 blur-[100px] pointer-events-none rounded-full" />
                <img src="/showcase-nutrition.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] object-contain pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Showcase Card 2 — Pattern & Correlation Discovery */}
          <div className="relative mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-500 rounded-3xl blur opacity-15" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0a0615] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 lg:p-10 shadow-2xl backdrop-blur-sm">
              <div className="lg:col-span-5 flex justify-center relative min-h-[280px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />
                <img src="/showcase-patterns.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] object-contain pointer-events-none" />
              </div>

              <div className="lg:col-span-7 relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">Pattern Detected</span>
                  <span className="text-gray-500 text-xs font-mono">Wednesday 7:15 AM</span>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  I noticed something in your data this week. Three nights with sleep under 5 hours all followed afternoon coffee after 4 PM. Your HRV also dropped significantly after both flights.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 bg-white/[0.02] rounded-lg p-4 border border-white/5">
                    <div className="mt-0.5 p-1.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
                    </div>
                    <div>
                      <p className="text-gray-200 text-sm font-medium mb-1">Late caffeine &rarr; Poor sleep</p>
                      <p className="text-gray-400 text-xs leading-relaxed">Coffee after 4 PM correlated with sleep &lt; 5hrs on 3 of 3 occasions this week. Deep sleep averaged 28 min vs your baseline 52 min.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/[0.02] rounded-lg p-4 border border-white/5">
                    <div className="mt-0.5 p-1.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-.5-.5-2.5 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.6c-.1.4.1.9.5 1.1L9 14l-3 3-3.5-.5c-.4-.1-.8.1-1 .5l-.5 1.5c-.1.3.1.7.4.8l4.6 1.9 1.9 4.6c.1.3.5.5.8.4l1.5-.5c.4-.2.6-.6.5-1l-.5-3.5 3-3 2.4 6c.2.4.7.6 1.1.5l3.6-1.2c.5-.2.8-.6.7-1.1Z"/></svg>
                    </div>
                    <div>
                      <p className="text-gray-200 text-sm font-medium mb-1">Air travel &rarr; HRV crash</p>
                      <p className="text-gray-400 text-xs leading-relaxed">HRV dropped 23% after both flights. Deep sleep fell below 40 min for 2 nights post-travel. Recovery took ~48 hours each time.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] rounded-lg p-4 text-sm text-gray-300 leading-relaxed border border-white/5">
                  Want to run a caffeine metabolism experiment? We can find your personal cutoff time and optimal dose. I also have protocols for faster post-flight recovery — including light exposure timing and sleep schedule pre-adjustment.
                </div>
              </div>
            </div>
          </div>

          {/* Showcase Card 3 — Deep Data Integration */}
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-3xl blur opacity-20" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0a0615] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 lg:p-10 shadow-2xl backdrop-blur-sm">
              <div className="lg:col-span-7 relative z-10 order-2 lg:order-1">
                <div className="flex items-center gap-2 mb-5">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">New Data Unlocked</span>
                  <span className="text-gray-500 text-xs font-mono">Oct 25, 3:42 PM</span>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Your Oct 24 blood panel filled in the missing metabolic markers <span className="text-white font-medium">(triglycerides, Lp(a))</span>. I&apos;ve cross-referenced with your December results. Here&apos;s how you&apos;ve changed:
                </p>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="pb-3 pr-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Marker</th>
                        <th className="pb-3 pr-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Oct 24</th>
                        <th className="pb-3 pr-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Dec 15</th>
                        <th className="pb-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-400">
                      <tr className="border-b border-white/5">
                        <td className="py-3 pr-4 font-medium text-gray-200">LDL-C</td>
                        <td className="py-3 pr-4 font-mono text-xs">112 mg/dL</td>
                        <td className="py-3 pr-4 font-mono text-xs">98 mg/dL</td>
                        <td className="py-3"><span className="text-gray-300 text-xs">&darr; Improved</span></td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 pr-4 font-medium text-gray-200">ApoB</td>
                        <td className="py-3 pr-4 font-mono text-xs">85 mg/dL</td>
                        <td className="py-3 pr-4 font-mono text-xs">72 mg/dL</td>
                        <td className="py-3"><span className="text-gray-300 text-xs">&darr; Improved</span></td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 pr-4 font-medium text-gray-200">Triglycerides</td>
                        <td className="py-3 pr-4 font-mono text-xs">68 mg/dL</td>
                        <td className="py-3 pr-4 font-mono text-xs text-gray-600">&mdash;</td>
                        <td className="py-3"><span className="text-gray-300 text-xs">New</span></td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 pr-4 font-medium text-gray-200">Lp(a)</td>
                        <td className="py-3 pr-4 font-mono text-xs">12 nmol/L</td>
                        <td className="py-3 pr-4 font-mono text-xs text-gray-600">&mdash;</td>
                        <td className="py-3"><span className="text-gray-300 text-xs">New</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-medium text-gray-200">HbA1c</td>
                        <td className="py-3 pr-4 font-mono text-xs">5.1%</td>
                        <td className="py-3 pr-4 font-mono text-xs">4.9%</td>
                        <td className="py-3"><span className="text-gray-300 text-xs">&darr; Improved</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-white/[0.02] rounded-lg p-4 text-sm text-gray-300 leading-relaxed border border-white/5">
                  Your metabolic profile is excellent — your diet plan and Zone 2 training are clearly working. To push further, adjust your fat intake composition to drive ApoB below 60 mg/dL. That&apos;s the &ldquo;infant-level&rdquo; vascular purity that longevity experts like Peter Attia advocate for.
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center relative min-h-[280px] order-1 lg:order-2">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
                <img src="/showcase-integration.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] object-contain pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Purple glow strip beneath showcase cards */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-24 -translate-y-1/2 bg-purple-500/20 blur-[50px] -z-10" />
        </div>
      </section>

      {/* ============ INSTALLATION ============ */}
      <section id="install" className="relative z-10 px-6 py-24">
        {/* Subtle glow behind section */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-[800px] h-[400px] opacity-15 blur-3xl"
          style={{
            background: "radial-gradient(ellipse at center, rgba(168,85,247,0.4) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center pb-8">
            <div>
              <p className="text-sm font-mono uppercase tracking-widest text-purple-400 mb-3">Get Started</p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Install in one prompt
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Ask your OpenClaw agent to install this bundle using the prompt. It handles the clone, verification, and loading automatically.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25" />
              <div className="relative bg-[#0a0615] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 flex justify-between items-center backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    </div>
                    <span className="text-xs font-mono text-gray-400">installation_prompt.md</span>
                  </div>
                  <CopyButton />
                </div>
                <div className="p-6 overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
{installText}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Purple glow strip beneath install section */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-24 -translate-y-1/2 bg-purple-500/20 blur-[50px] -z-10" />
        </div>
      </section>

      {/* ============ LOCAL-FIRST ============ */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center pb-8">
            
            <div className="relative group order-2 lg:order-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-20" />
              <div className="relative bg-[#0a0615] border border-white/10 rounded-xl p-6 lg:p-8 font-mono text-sm overflow-x-auto shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <span className="text-gray-300">longevityOS-data/</span>
                </div>
                <pre className="text-gray-300 leading-relaxed text-xs sm:text-sm">
{`├── nutrition/
│   └── meals.csv        `}<span className="text-gray-500"># deterministic macros</span>{`
├── health/
│   └── profile.json     `}<span className="text-gray-500"># Apple Health aggregation</span>{`
├── insights/
│   ├── experiments.json `}<span className="text-gray-500"># hypotheses & interventions</span>{`
│   └── checkins.json    `}<span className="text-gray-500"># daily compliance logs</span>{`
└── news/
    └── cache.json       `}<span className="text-gray-500"># off-grid reading cache</span>
                </pre>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-sm font-mono uppercase tracking-widest text-cyan-400 mb-3">Architecture</p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Local-first.<br />No cloud required.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                All health metrics, meal logs, and experiments stay on your machine inside <code className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-sm font-mono text-gray-300">longevityOS-data/</code>. No telemetry. No subscriptions. Completely private and auditable.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" /> Portable CSV & JSON formats
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" /> Works completely offline
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" /> Easily scriptable with Python/Bash
                </li>
              </ul>
            </div>
            
          </div>

          {/* Cyan glow strip beneath local-first section */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-24 -translate-y-1/2 bg-cyan-500/20 blur-[50px] -z-10" />
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-light.svg" alt="Longevity OS" className="h-6 w-6 rounded-md" />
            <span className="text-sm font-bold">Longevity OS</span>
          </div>
          <p className="text-xs text-gray-600">
            {new Date().getFullYear()} &middot; Built with Next.js + Tailwind
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="https://github.com/compound-life-ai/longClaw" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="#install" className="hover:text-white transition-colors">Install</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
