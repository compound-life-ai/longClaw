import React from "react";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen dark:bg-zinc-950 dark:text-zinc-50">
      {/* Hero Section */}
      <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto w-full text-center">
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-600 mb-8 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
          OpenClaw Skill Bundle
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-serif">
          Compound Clawskill
        </h1>
        <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed font-serif">
          A personal health companion designed for Telegram and OpenClaw. 
          Focusing on deterministic nutrition, structured health profiles, curated longevity news, and rigorous self-experiments.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <a href="#install" className="rounded-full bg-zinc-900 text-white px-6 py-3 font-medium hover:bg-zinc-800 transition-colors dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
            Install via OpenClaw
          </a>
          <a href="https://github.com/compound-life-ai/longClaw" target="_blank" rel="noreferrer" className="rounded-full bg-white text-zinc-900 border border-zinc-200 px-6 py-3 font-medium hover:bg-zinc-50 transition-colors dark:bg-zinc-950 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-900">
            View on GitHub
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20 bg-white dark:bg-zinc-900 w-full border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-serif mb-4">Core Capabilities</h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
              Five specialized modules designed to bring structure to your longevity journey. Interactive skills allow for robust logging and profiling, while proactive coaching automates your daily insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: /snap (Interactive) */}
            <div className="flex flex-col group rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex justify-between items-start">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                </div>
                <span className="text-[10px] font-medium px-2 py-1 bg-zinc-200 text-zinc-700 rounded-full dark:bg-zinc-800 dark:text-zinc-300">
                  User-Initiated
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 font-serif">/snap</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Turns food photos into structured logs, enriching them with deterministic macro/micronutrient data.
              </p>
              
              <div className="mt-auto bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs space-y-2 font-sans">
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-3 py-1.5 max-w-[90%]">📸 [Photo of salmon]</div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-3 py-1.5 max-w-[90%]">
                    <p className="font-medium">✅ Logged</p>
                    <p className="opacity-80">150g Salmon • 380 kcal | Notable: Vitamin D</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: /health (Interactive) */}
            <div className="flex flex-col group rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex justify-between items-start">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 9.53a11.38 11.38 0 0 0-1.98 4.14"/></svg>
                </div>
                <span className="text-[10px] font-medium px-2 py-1 bg-zinc-200 text-zinc-700 rounded-full dark:bg-zinc-800 dark:text-zinc-300">
                  User-Initiated
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 font-serif">/health</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Builds a reusable health profile from Apple Health XML exports and structured questionnaire inputs.
              </p>
              
              <div className="mt-auto bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs space-y-2 font-sans">
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-3 py-1.5 max-w-[90%]">/health</div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-3 py-1.5 max-w-[90%]">What is your primary health goal right now?</div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-3 py-1.5 max-w-[90%]">Improve sleep.</div>
                </div>
              </div>
            </div>

            {/* Feature 3: /news (Proactive) */}
            <div className="flex flex-col group rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex justify-between items-start">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
                </div>
                <span className="text-[10px] font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> Proactive
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 font-serif">Curated News</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Automated daily digest focused exclusively on health, longevity, and exercise using high-signal sources.
              </p>
              
              <div className="mt-auto bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs space-y-2 font-sans">
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]">
                    <p className="font-medium mb-1">📰 Morning Digest</p>
                    <ul className="space-y-1 list-disc pl-3 opacity-80">
                      <li>Study on TRF shows metabolic benefits</li>
                      <li>Resistance training lowers mortality</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: /insights (Proactive/Interactive) */}
            <div className="flex flex-col group rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2 lg:col-span-1">
              <div className="mb-4 flex justify-between items-start">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                </div>
                <span className="text-[10px] font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> Automated
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 font-serif">Experiment Insights</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Tracks hypotheses and actively reaches out for daily check-ins to prevent data gaps.
              </p>
              
              <div className="mt-auto bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs space-y-2 font-sans">
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-3 py-1.5 max-w-[90%]">
                    Check-in: Sleep quality last night (1-10)?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-3 py-1.5 max-w-[90%]">
                    7. Late workout.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-3 py-1.5 max-w-[90%]">
                    Logged. 3 more days needed for analysis.
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5: Daily Coach (Proactive) */}
            <div className="flex flex-col group rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2 lg:col-span-2">
              <div className="mb-4 flex justify-between items-start">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <span className="text-[10px] font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> Proactive Coaching
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 font-serif">Daily Health Coach</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                A newly integrated, cron-driven coach that combines your local health data, experiment context, and curated news into personalized daily guidance.
              </p>
              
              <div className="mt-auto bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs space-y-2 font-sans">
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="font-medium mb-1">☀️ Good morning!</p>
                    <p className="mb-2 opacity-90">Yesterday you hit 1,850 kcal (145g protein) and slept for 7h 15m.</p>
                    <p className="opacity-90"><b>Coach tip:</b> Your HRV is up! Let's aim for a heavier training session today since you're well-recovered. Remember your 'Earlier caffeine cutoff' experiment starts at 12:00 PM.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Installation Prompt Section */}
      <section id="install" className="px-6 py-20 w-full bg-zinc-100 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-serif mb-4">Install to Your OpenClaw</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              It takes less than a minute. Ask your OpenClaw agent to install this bundle using the prompt below.
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Installation Prompt</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap">
{`1. Clone \`https://github.com/compound-life-ai/longClaw\` to a stable local path.
2. Change into the cloned repository.
3. Run \`python3 scripts/install_bundle.py\`.
4. Run \`python3 scripts/install_bundle.py --verify\`.
5. Confirm that \`~/.openclaw/openclaw.json\` includes the installed bundle \`skills/\` path inside \`skills.load.extraDirs\`.
6. Tell the user to start a new OpenClaw session.
7. Tell the user to verify that \`/snap\`, \`/health\`, \`/news\`, and \`/insights\` are available and usable.
8. Tell the user to verify that \`daily-coach\` is loaded with \`openclaw skills info daily-coach\`.
9. If needed, tell the user to configure the cron templates from the installed \`cron/\` directory with their Telegram DM chat id, including \`cron/daily-health-coach.example.json\` for proactive daily coaching.`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Local-First Banner */}
      <section className="px-6 py-20 w-full bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 font-serif">100% Local-First Architecture</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8">
            All your health metrics, meal logs, and active experiments stay on your machine inside <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded text-sm">longevityOS-data/</code>. 
            No cloud telemetry, no forced subscriptions.
          </p>
          <div className="text-left bg-zinc-900 rounded-xl p-6 shadow-xl text-zinc-300 font-mono text-sm overflow-x-auto border border-zinc-800">
            <pre>
{`longevityOS-data/
├── nutrition/
│   └── meals.csv        # Ingredient-centric determinism
├── health/
│   └── profile.json     # Apple Health XML aggregation
├── insights/
│   ├── experiments.json # Hypothesis & interventions
│   └── checkins.json    # Daily compliance logs
└── news/
    └── cache.json       # Off-grid reading cache`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 px-6 text-center text-zinc-500">
        <p>© {new Date().getFullYear()} Compound Clawskill. Built with Next.js & Tailwind CSS.</p>
      </footer>
    </main>
  );
}
