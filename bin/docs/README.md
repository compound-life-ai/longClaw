# Compound Clawskill Docs

This repo is currently a documentation-first skeleton for an OpenClaw-based personal health assistant.

Current assumptions gathered from the earlier discussion:

- Primary channel: Telegram
- Food logging UX: phone photo -> send
- Food logging response: confirm + short summary, not a full report every time
- Nutrition accuracy: fast AI estimate is acceptable
- Wearable source: Apple Watch
- Apple Health ingestion: manual XML export is acceptable
- Morning automation: both tips and summary, plus experiment check-in
- News goal: curated daily digest
- Experiment UX: structured phases, not just free-form chat
- High-interest domains: diet -> energy/mood, sleep optimization, exercise performance
- Desired storage preference from interview: CSV for nutrition, JSON for the rest

Read these docs in order:

1. `openclaw-extension-survey.md`
2. `longevity-os-reference-notes.md`
3. `proposed-health-companion-architecture.md`
4. `install.md`
5. `news-sources.md`
6. `open-questions.md`

What these docs are trying to answer:

- What OpenClaw mechanism should be used for each feature
- What should be copied from `longevity-os`, and what should not
- Where the real implementation boundaries are between skill prompt, helper script, hook, cron job, and plugin
- Which decisions are still unresolved before implementation starts
