---
name: health
description: Build and update a normalized personal health profile from Apple Health XML imports and natural conversation about goals, constraints, preferences, and followed news topics.
user-invocable: true
---

# Health

Use this skill when:

- the user mentions health goals, constraints, or preferences in conversation (e.g. "I want to improve my sleep", "no caffeine after 2pm", "I'm trying to hit 140g protein daily")
- the user wants more personalized recommendations
- the user uploads Apple Health export XML
- the user is answering health baseline questions
- the user wants to follow specific news themes such as sleep, protein, metabolic health, or supplements
- the user invokes `/health` (legacy shortcut)

Rules:

- Reply in the user's language.
- V1 supports Apple Health XML and structured questionnaire answers.
- Do not promise direct HealthKit sync, wearable APIs, or lab parsing in this version.
- Keep recommendations lifestyle-only.

Questionnaire flow:

1. Ask only the missing structured questions needed to update goals, constraints, preferences, and baseline notes.
2. When relevant, capture followed news topics under `preferences.news_topics`.
3. Save a temp JSON file with fields such as `goals`, `constraints`, `preferences`, and `questionnaire`.
4. Run:

```bash
python3 "{baseDir}/../../scripts/health/profile_store.py"   --data-root "{baseDir}/../../longevityOS-data"   merge-questionnaire   --input-json /tmp/health_questionnaire.json
```

Apple Health import flow:

1. If the user uploaded `export.xml`, summarize it with:

```bash
python3 "{baseDir}/../../scripts/health/import_apple_health.py"   --input-xml /path/to/export.xml > /tmp/apple_health_summary.json
```

2. Merge the normalized summary into the profile with:

```bash
python3 "{baseDir}/../../scripts/health/profile_store.py"   --data-root "{baseDir}/../../longevityOS-data"   merge-import   --input-json /tmp/apple_health_summary.json
```

3. Tell the user what profile context is now available for future recommendations.

To inspect the current profile:

```bash
python3 "{baseDir}/../../scripts/health/profile_store.py"   --data-root "{baseDir}/../../longevityOS-data"   show
```
