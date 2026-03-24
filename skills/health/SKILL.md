---
name: health
description: Build and update a normalized personal health profile from Whoop data and natural conversation about goals, constraints, and preferences.
user-invocable: true
---

# Health

Use this skill when:

- the user mentions health goals, constraints, or preferences in conversation (e.g. "I want to improve my sleep", "no caffeine after 2pm", "I'm trying to hit 140g protein daily")
- the user wants more personalized recommendations
- the user wants to connect or sync their Whoop data
- the user is answering health baseline questions
- the user invokes `/health` (legacy shortcut)

Rules:

- Reply in the user's language.
- V1 supports Whoop API integration and structured questionnaire answers.
- Keep recommendations lifestyle-only.

Questionnaire flow:

1. Ask only the missing structured questions needed to update goals, constraints, preferences, and baseline notes.
2. Save a temp JSON file with fields such as `goals`, `constraints`, `preferences`, and `questionnaire`.
3. Run:

```bash
python3 "{baseDir}/../../scripts/health/profile_store.py" \
  --data-root "{baseDir}/../../longevityOS-data" \
  merge-questionnaire \
  --input-json /tmp/health_questionnaire.json
```

Whoop connect flow (first time):

1. Tell the user to visit the OAuth authorization page in their browser:
   `https://whoop-oauth-five.vercel.app/api/whoop/authorize`
2. After authenticating, the user clicks "Copy Tokens for CLI" on the success page.
3. Save the pasted JSON to `{baseDir}/../../longevityOS-data/health/whoop_tokens.json`.
4. Run the import to fetch and normalize Whoop data:

```bash
python3 "{baseDir}/../../scripts/health/import_whoop.py" \
  --token-file "{baseDir}/../../longevityOS-data/health/whoop_tokens.json" \
  > /tmp/whoop_summary.json
```

5. Merge the normalized summary into the profile:

```bash
python3 "{baseDir}/../../scripts/health/profile_store.py" \
  --data-root "{baseDir}/../../longevityOS-data" \
  merge-import \
  --input-json /tmp/whoop_summary.json
```

6. Tell the user what profile context is now available for future recommendations.

Whoop sync flow (already connected):

1. Run the import (token refresh is automatic):

```bash
python3 "{baseDir}/../../scripts/health/import_whoop.py" \
  --token-file "{baseDir}/../../longevityOS-data/health/whoop_tokens.json" \
  > /tmp/whoop_summary.json
```

2. Merge into profile:

```bash
python3 "{baseDir}/../../scripts/health/profile_store.py" \
  --data-root "{baseDir}/../../longevityOS-data" \
  merge-import \
  --input-json /tmp/whoop_summary.json
```

To inspect the current profile:

```bash
python3 "{baseDir}/../../scripts/health/profile_store.py" \
  --data-root "{baseDir}/../../longevityOS-data" \
  show
```
