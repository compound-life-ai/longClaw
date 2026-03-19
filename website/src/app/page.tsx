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
        className={`inline-block w-[2px] h-[0.9em] bg-claw-red align-middle ml-0.5 ${done ? "animate-blink" : ""}`}
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
      className="flex items-center gap-1.5 px-3 py-1.5 bg-claw-bg-card hover:bg-claw-border text-claw-text-muted hover:text-claw-text text-xs font-mono rounded border border-claw-border transition-all duration-200"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-claw-green"><polyline points="20 6 9 17 4 12"/></svg>
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

function StatusDot({ color = "green" }: { color?: "green" | "red" | "amber" }) {
  const colorMap = {
    green: "bg-claw-green shadow-[0_0_6px_rgba(52,211,153,0.5)]",
    red: "bg-claw-red shadow-[0_0_6px_rgba(232,77,61,0.5)]",
    amber: "bg-claw-amber shadow-[0_0_6px_rgba(245,158,11,0.5)]",
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colorMap[color]}`} />;
}

function FeatureCard({
  icon,
  title,
  command,
  description,
  tag,
  tagColor = "default",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  command?: string;
  description: string;
  tag: string;
  tagColor?: "default" | "green" | "amber";
  children: React.ReactNode;
}) {
  const tagStyles = {
    default: "border-claw-border text-claw-text-muted",
    green: "border-claw-green/30 text-claw-green",
    amber: "border-claw-amber/30 text-claw-amber",
  };
  return (
    <div className="group flex flex-col rounded-lg border border-claw-border bg-claw-bg-card p-5 transition-all duration-300 hover:border-claw-red/40 hover:shadow-[0_0_20px_rgba(232,77,61,0.06)]">
      <div className="mb-3 flex justify-between items-start">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-claw-bg-elevated border border-claw-border text-claw-red">
          {icon}
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 border rounded ${tagStyles[tagColor]} flex items-center gap-1.5`}>
          {tagColor === "green" && <StatusDot color="green" />}
          {tagColor === "amber" && <StatusDot color="amber" />}
          {tag}
        </span>
      </div>
      {command && (
        <code className="text-xs font-mono text-claw-coral mb-1">{command}</code>
      )}
      <h3 className="text-base font-semibold mb-1.5 font-mono text-claw-text">{title}</h3>
      <p className="text-sm text-claw-text-muted leading-relaxed mb-4">{description}</p>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

function ChatMock({ messages }: { messages: { role: "user" | "assistant"; text: string }[] }) {
  return (
    <div className="bg-claw-bg rounded-lg p-3 border border-claw-border-subtle text-xs space-y-2 font-mono">
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`rounded-lg px-3 py-1.5 max-w-[90%] ${
              m.role === "user"
                ? "bg-claw-red/20 text-claw-coral border border-claw-red/20"
                : "bg-claw-bg-elevated text-claw-text-muted border border-claw-border-subtle"
            }`}
            dangerouslySetInnerHTML={{ __html: m.text }}
          />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-claw-bg text-claw-text relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(232,77,61,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(232,77,61,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Hero */}
      <section className="relative px-6 py-24 md:py-32 max-w-5xl mx-auto w-full text-center">
        <div className="inline-flex items-center rounded border border-claw-border bg-claw-bg-card px-3 py-1 text-xs font-mono text-claw-text-muted mb-8 gap-2">
          <StatusDot color="green" />
          <span>openclaw skill bundle</span>
          <span className="text-claw-text-dim">|</span>
          <span className="text-claw-red">v1.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-mono text-claw-text">
          <Typewriter text="Longevity OS" speed={120} />
        </h1>

        <p className="text-lg md:text-xl text-claw-text-muted max-w-3xl mx-auto leading-relaxed">
          An AI health agent for{" "}
          <span className="text-claw-coral">OpenClaw</span> &{" "}
          <span className="text-claw-cyan">Telegram</span>.
          Talk to it naturally. It quantifies your nutrition, discovers patterns in your wearable data, and coaches you daily.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href="#install"
            className="group rounded-md bg-claw-red text-white px-6 py-3 text-sm font-mono font-medium transition-all duration-200 hover:bg-claw-coral hover:shadow-[0_0_24px_rgba(232,77,61,0.3)]"
          >
            $ install
          </a>
          <a
            href="https://github.com/compound-life-ai/longClaw"
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-claw-bg-card text-claw-text border border-claw-border px-6 py-3 text-sm font-mono font-medium transition-all duration-200 hover:border-claw-text-dim hover:text-white"
          >
            view source
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 w-full border-t border-claw-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold font-mono mb-3 text-claw-text">
              <span className="text-claw-red">&gt;</span> core_capabilities
            </h2>
            <p className="text-claw-text-muted max-w-2xl mx-auto">
              Just talk to it. No buttons, no slash commands — natural language in, quantified health out.
            </p>
          </div>

          {/* Conversational Skills */}
          <div className="mb-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-claw-text-dim mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-claw-border inline-block" />
              you talk, it acts
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>}
                title="Meal Snap"
                description="Send a food photo or describe what you ate. The agent breaks it down into ingredients with full micronutrient detail."
                tag="conversational"
              >
                <ChatMock messages={[
                  { role: "user", text: "had salmon with brown rice and broccoli for lunch" },
                  { role: "assistant", text: "<b>logged</b> &mdash; lunch &bull; 495 kcal &bull; 53g protein<br/><span style='opacity:0.7'>Zn 3.2mg · Ca 58mg · VitD 16.4µg · Se 73mcg · Fe 1.8mg · Folate 57µg · Omega-3 1.98g</span>" },
                ]} />
              </FeatureCard>

              <FeatureCard
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>}
                title="Health Profile"
                description="Tell the agent about your goals and constraints. Import Apple Health data for a complete baseline."
                tag="conversational"
              >
                <ChatMock messages={[
                  { role: "user", text: "I want to improve my sleep. No caffeine after 2pm." },
                  { role: "assistant", text: "Got it. Goals updated: <b>improve sleep quality</b>. Constraint added: <b>no caffeine after 14:00</b>. Want me to import your Apple Health data for a sleep baseline?" },
                ]} />
              </FeatureCard>
            </div>
          </div>

          {/* Proactive Skills */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-claw-text-dim mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-claw-border inline-block" />
              it thinks, it tells you
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureCard
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>}
                title="Curated News"
                description="Automated daily digest from high-signal longevity, health, and exercise sources. Also responds to natural questions about recent research."
                tag="proactive"
                tagColor="green"
              >
                <ChatMock messages={[
                  { role: "assistant", text: "<b>morning digest</b> &mdash; Mar 19<br/><span style='opacity:0.7'>&bull; Senolytics trial shows 12% improvement in grip strength (Fight Aging!)<br/>&bull; High-protein breakfast linked to better satiety markers (NIA)<br/>&bull; Sleep fragmentation accelerates cognitive decline (ScienceDaily)</span>" },
                ]} />
              </FeatureCard>

              <FeatureCard
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>}
                title="Insights"
                description="Ask about patterns in your data. The agent cross-references wearable metrics, nutrition, and activity to surface correlations — then helps you design experiments to test them."
                tag="agent-initiated"
                tagColor="green"
              >
                <ChatMock messages={[
                  { role: "assistant", text: "<b>pattern detected</b> &mdash; sleep + caffeine<br/><span style='opacity:0.7'>Past 14 days: 4 nights deep sleep &lt;1hr &mdash; 3 had caffeine after 15:00.<br/>Late eating (after 21:00) → resting HR +5bpm avg.<br/>Want me to set up an experiment to test an earlier cutoff?</span>" },
                ]} />
              </FeatureCard>

              <FeatureCard
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
                title="Daily Health Coach"
                description="A morning briefing that synthesizes overnight sleep, yesterday's nutrition, active experiments, and relevant longevity news."
                tag="coaching"
                tagColor="amber"
              >
                <ChatMock messages={[
                  { role: "assistant", text: "<b>good morning</b> &mdash; Mar 19<br/><span style='opacity:0.7'>Sleep 7h15m · HRV 52ms (↑8%) · RHR 56bpm<br/>Yesterday: 1,850 kcal · protein 134g ✓ · zinc low<br/><b>Try:</b> pumpkin seeds or beef today for zinc<br/>Experiment day 8/14: caffeine cutoff ✓</span>" },
                ]} />
              </FeatureCard>
            </div>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section id="install" className="px-6 py-20 w-full border-t border-claw-border bg-claw-bg-elevated/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold font-mono mb-3 text-claw-text">
              <span className="text-claw-red">&gt;</span> install
            </h2>
            <p className="text-claw-text-muted">
              Ask your OpenClaw agent to install this bundle using the prompt below.
            </p>
          </div>

          <div className="bg-claw-bg border border-claw-border rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-claw-bg-card border-b border-claw-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-claw-red/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-claw-amber/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-claw-green/60" />
                </div>
                <span className="text-xs font-mono text-claw-text-dim">installation_prompt.md</span>
              </div>
              <CopyButton />
            </div>
            <div className="p-5 overflow-x-auto">
              <pre className="text-sm font-mono text-claw-text-muted whitespace-pre-wrap leading-relaxed">
{installText}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Local-First Architecture */}
      <section className="px-6 py-20 w-full border-t border-claw-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold font-mono mb-4 text-claw-text">
            <span className="text-claw-red">&gt;</span> local_first
          </h2>
          <p className="text-claw-text-muted mb-8">
            All health metrics, meal logs, and experiments stay on your machine inside{" "}
            <code className="bg-claw-bg-card border border-claw-border px-1.5 py-0.5 rounded text-xs font-mono text-claw-coral">longevityOS-data/</code>.
            No cloud telemetry. No forced subscriptions.
          </p>
          <div className="text-left bg-claw-bg-card rounded-lg p-5 border border-claw-border font-mono text-sm overflow-x-auto">
            <div className="text-claw-text-dim mb-2 text-xs">$ tree longevityOS-data/</div>
            <pre className="text-claw-text-muted leading-relaxed">
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
      </section>

      {/* Footer */}
      <footer className="border-t border-claw-border py-10 px-6 text-center">
        <p className="text-xs font-mono text-claw-text-dim">
          <span className="text-claw-red">longevity-os</span>
          <span className="mx-2">/</span>
          {new Date().getFullYear()}
          <span className="mx-2">/</span>
          built with next.js + tailwind
        </p>
      </footer>
    </main>
  );
}
