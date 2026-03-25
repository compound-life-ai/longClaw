---
name: compound-clawskill
description: Meta-skill for the Longevity OS bundle that routes natural language health conversations to the right capability — nutrition logging, health profile, pattern discovery, experiments, news, or daily coaching.
user-invocable: true
---

# Compound Clawskill

Use this skill when:

- the user wants an overview of everything available in this repository
- the user wants to know how to install the bundled skills in this directory
- the user sends a health-related message that could be handled by one of the sub-skills
- the user wants links to the repository or the bundled `skills/` directory
- the user asks "what can you do?", "help", "get started", or anything that suggests they want orientation

## Welcome and orientation

When the user asks what you can do, wants an overview, or appears to be new, **run the status check first** to tailor your response:

```bash
profile_exists=false; whoop_connected=false; has_meals=false; has_experiments=false; has_news=false
[ -f "{baseDir}/longevityOS-data/health/profile.json" ] && profile_exists=true
[ -f "{baseDir}/longevityOS-data/health/whoop_tokens.json" ] && whoop_connected=true
[ -f "{baseDir}/longevityOS-data/nutrition/meals.csv" ] && has_meals=true
[ -f "{baseDir}/longevityOS-data/insights/experiments.json" ] && has_experiments=true
[ -f "{baseDir}/longevityOS-data/news/cache.json" ] && has_news=true
echo "profile=$profile_exists whoop=$whoop_connected meals=$has_meals experiments=$has_experiments news=$has_news"
```

Then respond conversationally based on what exists. Here is what each capability looks like in practice — use these as the basis for your introduction, not dry feature names:

**Nutrition tracking** — Tell me what you ate ("had salmon and rice for lunch") or send a photo, and I'll break it down ingredient by ingredient: calories, protein, carbs, fat, plus the full micronutrient picture — zinc, selenium, vitamin D, omega-3, everything. I'll track your running totals and show you a weekly summary comparing your intake to recommended daily values, highlighting gaps and strengths.

**Health profile & Whoop** — I'll build a picture of your health goals, constraints, and preferences through natural conversation. If you have a Whoop, I can connect to it and pull in your recovery scores, sleep stages, strain, HRV, resting heart rate, and workout history — 30 days of data that makes every other recommendation smarter.

**Pattern discovery & experiments** — Ask me "why am I sleeping poorly?" and I'll cross-reference your meals, Whoop data, and activity to find correlations you'd never spot manually. When you want to test a change (like cutting caffeine earlier), I'll set up a structured experiment with a baseline period, daily check-ins, and statistical analysis at the end.

**Longevity news** — I pull from curated sources (Fight Aging!, NIA, ScienceDaily) and score articles by relevance. Ask "any interesting research today?" for a quick digest with summaries and links.

**Daily coaching** (optional, cron) — Every morning, 10 specialist agents each review your data from their angle — nutrition, exercise, sleep, body metrics, experiments, safety, supplements, patterns, new trial ideas, and relevant research — and deliver personalized coaching as separate messages.

### Adapting the introduction to what's set up

After running the status check, tailor the response:

- If **nothing is set up** (all false): Lead with the 5 capabilities above. Then offer: "Want to load some sample data to try things out, or start with your own? I can help you build your health profile right now — just tell me about your health goals."
- If **profile exists but no Whoop**: Mention what they'd gain from connecting Whoop: recovery trends, sleep staging, HRV data that powers pattern detection. Walk them through: "If you have a Whoop, I can connect to it — it takes about a minute. Want to set that up?"
- If **Whoop connected but few meals**: Nudge toward nutrition logging: "Your Whoop data gives me great sleep and recovery context. If you start logging meals, I can correlate what you eat with how you recover — that's where the real insights come from."
- If **meals + Whoop but no experiments**: Suggest: "You've got solid data flowing. Want to test a hypothesis? For example, I could set up an experiment to see if eating dinner earlier improves your deep sleep."
- If **everything is set up**: Show a status snapshot with real numbers — days of meals logged, current recovery trend, active experiments and their progress, last news fetch. Then: "What would you like to focus on?"

### Whoop setup guidance

When the user asks about Whoop integration or you detect they don't have it connected and they're interested:

1. Explain what it unlocks: "Connecting Whoop gives me your recovery score, sleep stages (light/deep/REM), HRV, resting heart rate, respiratory rate, SpO2, strain scores, and workout history. This makes pattern discovery and coaching much more specific to you."
2. Walk through the flow step by step:
   - Visit the authorization page in your browser: `https://whoop-oauth-five.vercel.app/api/whoop/authorize`
   - Log in with your Whoop credentials and authorize
   - On the success page, click "Copy Tokens for CLI"
   - Paste the token JSON back here
3. After receiving the token, save it and run the import (handled by the `health` skill).
4. Confirm what data was pulled in and what it means for their experience.

### Daily coaching setup guidance

When the user asks about the daily coaching feature or cron setup:

1. Explain what it does: "Every morning, 10 specialist agents each review all your data — nutrition, recovery, strain, experiments, news — and send you a personalized coaching message on Telegram. It's like having a health team that reads your data overnight."
2. Explain the requirements:
   - A Telegram bot set up with OpenClaw (the user needs their Telegram DM chat ID)
   - Cron job configuration (3 template files in `cron/`)
   - For all 10 agents: bump `maxChildrenPerAgent` and `maxConcurrent` to 10 in `~/.openclaw/openclaw.json`
3. Offer to walk them through each step when they're ready.

## Natural language routing

The agent should understand user intent from natural conversation and route to the right sub-skill without requiring slash commands. Examples:

- "had chicken and rice for lunch" → route to `snap` (meal logging)
- "I want to improve my sleep" → route to `health` (profile update)
- "why have I been sleeping poorly?" → route to `insights` (pattern discovery)
- "any longevity news today?" → route to `news` (digest)
- "how's my nutrition looking this week?" → route to `snap` (weekly summary)
- "how's my HRV?" → route to `health-qa` (specialist Q&A)
- "should I train today?" → route to `health-qa` (specialist Q&A)
- "am I eating enough protein?" → route to `health-qa` (specialist Q&A)

Slash commands (`/snap`, `/health`, `/news`, `/insights`) are supported as legacy shortcuts, but the primary interaction mode is natural language.

## First-run data check

Before routing to any sub-skill, check whether the data directory has content:

```bash
ls "{baseDir}/longevityOS-data/nutrition/" "{baseDir}/longevityOS-data/health/" "{baseDir}/longevityOS-data/insights/" 2>/dev/null | head -5
```

If all directories are empty or missing, ask the user:
"It looks like you have no data yet. Would you like to load sample data so you can try the skills right away? Or if you'd prefer, I can help you start building your own profile — just tell me about your health goals."

If the user agrees to sample data, copy the seed fixtures:

```bash
mkdir -p "{baseDir}/longevityOS-data/nutrition" "{baseDir}/longevityOS-data/health" "{baseDir}/longevityOS-data/insights" "{baseDir}/longevityOS-data/news"
cp "{baseDir}/seed/nutrition/meals.csv" "{baseDir}/longevityOS-data/nutrition/"
cp "{baseDir}/seed/health/profile.json" "{baseDir}/longevityOS-data/health/"
cp "{baseDir}/seed/insights/experiments.json" "{baseDir}/longevityOS-data/insights/"
cp "{baseDir}/seed/insights/checkins.json" "{baseDir}/longevityOS-data/insights/"
cp "{baseDir}/seed/news/cache.json" "{baseDir}/longevityOS-data/news/"
```

After loading seed data, briefly explain what was loaded and suggest something to try: "I loaded 3 days of sample meals, a health profile with Whoop data, an active experiment, and some news. Try asking 'how's my nutrition this week?' or 'what's my active experiment?' to see it in action."

If the user declines, proceed normally — the skills will start with an empty dataset.

## Repository links

- repo root: `https://github.com/compound-life-ai/longClaw/tree/main`
- skills directory: `https://github.com/compound-life-ai/longClaw/tree/main/skills`
- install guide entry point: `https://github.com/compound-life-ai/longClaw/blob/main/README.md`

## Install summary

1. Clone `https://github.com/compound-life-ai/longClaw`.
2. Change into the repository.
3. Run `openclaw plugins install -l .`.
4. Run `openclaw plugins doctor` and `openclaw plugins inspect compound-clawskill` to verify.
5. Start a fresh OpenClaw session.
6. Verify that `/snap`, `/health`, `/news`, `/insights`, and `daily-coach` are available.

## What to inspect for details

- `README.md` for installation, verification, cron setup, and bundle-level architecture
- `docs/install.md` for the direct install workflow
- `skills/snap/SKILL.md` for meal logging behavior and payload shape
- `skills/health/SKILL.md` for Whoop import and questionnaire flows
- `skills/news/SKILL.md` for curated digest behavior
- `skills/insights/SKILL.md` for experiment creation, check-ins, and analysis
- `skills/daily-coach/SKILL.md` for the scheduled coaching workflow
- `skills/health-qa/SKILL.md` for interactive health Q&A via specialist agents
