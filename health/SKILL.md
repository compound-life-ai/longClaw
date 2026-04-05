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
2. Call the `health_profile` tool with `command: "merge_questionnaire"` and the questionnaire payload:

```json
{
  "command": "merge_questionnaire",
  "input_json": {
    "goals": ["..."],
    "constraints": ["..."],
    "preferences": {},
    "questionnaire": {}
  }
}
```

Whoop connect flow (first time only):

1. Tell the user to visit the OAuth authorization page in their browser:
   `https://whoop-oauth-five.vercel.app/api/whoop/authorize`
2. After authenticating, the user clicks "Copy Tokens for CLI" on the success page.
3. Save the pasted JSON to `{baseDir}/../../longevityOS-data/health/whoop_tokens.json`.
4. Call the `whoop_initiate` tool to validate the tokens and fetch initial data:

```json
{ }
```

5. Show the user what data was fetched, then merge into the profile by calling `health_profile`:

```json
{
  "command": "merge_import",
  "input_json": { /* paste the whoop_initiate output here */ }
}
```

6. Tell the user what profile context is now available for future recommendations.

Whoop sync flow (already connected):

Always use the `whoop_sync` tool for ongoing data refreshes — it fetches new data and merges into the profile in one step:

```json
{ }
```

**Never use `whoop_initiate` for routine syncs.** It is only for first-time onboarding.

To inspect the current profile:

```json
{ "command": "show" }
```
