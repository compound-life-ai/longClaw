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
          <a href="#features" className="rounded-full bg-zinc-900 text-white px-6 py-3 font-medium hover:bg-zinc-800 transition-colors dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
            Explore Features
          </a>
          <a href="https://github.com/ianhsiao/compound-clawskill" target="_blank" rel="noreferrer" className="rounded-full bg-white text-zinc-900 border border-zinc-200 px-6 py-3 font-medium hover:bg-zinc-50 transition-colors dark:bg-zinc-950 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-900">
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
              Four specialized modules designed to bring structure to your longevity journey without the hallucinations of raw LLMs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Feature 1: /snap */}
            <div className="flex flex-col group rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 font-serif">/snap</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                Turns food photos or meal descriptions into highly structured meal logs. It identifies likely ingredients and portions, enriching them with deterministic macro and micronutrient data.
              </p>
              
              {/* Chat Mockup */}
              <div className="mt-auto bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm text-sm space-y-3 font-sans">
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                    📸 [Photo of grilled salmon & asparagus]
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
                    <p className="font-medium mb-1">✅ Meal Logged</p>
                    <p>• 150g Salmon<br/>• 100g Asparagus</p>
                    <p className="mt-2 text-xs opacity-80">~380 kcal | 35g Protein<br/>Notable: High Vitamin D & Selenium</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: /health */}
            <div className="flex flex-col group rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  <path d="M12 5 9.04 9.53a11.38 11.38 0 0 0-1.98 4.14"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 font-serif">/health</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                Builds a reusable health profile from Apple Health XML exports and structured questionnaire inputs. This profile acts as shared context for future recommendations.
              </p>
              
              {/* Chat Mockup */}
              <div className="mt-auto bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm text-sm space-y-3 font-sans">
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                    /health
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
                    Let's update your baseline. What is your primary health goal right now?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                    Improve my sleep quality.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
                    Got it, I've updated your profile. You can also upload your Apple Health XML export anytime to enrich this further.
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: /news */}
            <div className="flex flex-col group rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                  <path d="M18 14h-8"/>
                  <path d="M15 18h-5"/>
                  <path d="M10 6h8v4h-8V6Z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 font-serif">/news</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                Produces a curated daily digest focused exclusively on health, longevity, nutrition, sleep, and exercise using high-signal predefined sources.
              </p>
              
              {/* Chat Mockup */}
              <div className="mt-auto bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm text-sm space-y-3 font-sans">
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                    /news
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
                    <p className="font-medium mb-2">📰 Morning Digest</p>
                    <ul className="space-y-2 list-decimal pl-4">
                      <li>Study on early time-restricted feeding shows metabolic benefits <i>(Cell)</i></li>
                      <li>Resistance training lowers all-cause mortality <i>(BJSM)</i></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: /insights */}
            <div className="flex flex-col group rounded-2xl border border-zinc-200 bg-zinc-50 p-8 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                  <line x1="2" x2="22" y1="2" y2="22"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 font-serif">/insights</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                Designed for structured self-experimentation. Tracks hypotheses, interventions, daily check-ins, and explicitly refuses to draw conclusions without enough data.
              </p>
              
              {/* Chat Mockup */}
              <div className="mt-auto bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm text-sm space-y-3 font-sans">
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                    /insights
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
                    You're tracking <b>"Earlier caffeine cutoff"</b>. How was your sleep quality last night (1-10)?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                    7. Better, but had a late workout.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
                    Logged! We need 3 more days of data before running a reliable gap analysis. Keep it up.
                  </div>
                </div>
              </div>
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
        <p className="mt-2 text-sm">To install: <code className="bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded">python3 scripts/install_bundle.py</code></p>
      </footer>
    </main>
  );
}
