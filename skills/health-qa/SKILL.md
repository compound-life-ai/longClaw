---
name: health-qa
description: Answer health questions by routing to the most relevant specialist subagent(s) from the 10-agent roster, grounded in the user's own data.
user-invocable: false
---

# Health Q&A

Use this skill when:

- the user asks a health-related question about their own data (e.g. "how's my HRV?", "am I eating enough protein?", "should I train today?")
- the user asks for health advice that can be answered by one or more specialist agents
- the user references sleep, recovery, strain, nutrition, supplements, experiments, or body metrics

Do NOT use this skill when:

- the user wants to log a meal (use `snap`)
- the user wants to update their health profile (use `health`)
- the user wants to start/manage an experiment (use `insights`)
- the question is general knowledge with no connection to the user's data

## Step 1: Classify the question

Map the user's question to 1-3 relevant specialist agents using this routing table:

| Domain | Agent File | When to Route |
|--------|-----------|---------------|
| Overall priority / "what should I focus on?" | `imperial-physician.md` | General health questions, "how am I doing?", priority questions |
| Nutrition, meals, macros, calories, diet | `diet-physician.md` | Food, eating, protein, calories, macros, meal timing |
| Exercise, training, strain, workout | `movement-master.md` | Training advice, workout planning, strain, exercise |
| HRV, heart rate, SpO2, recovery score, body metrics | `pulse-reader.md` | Vital signs, cardiovascular, Whoop metrics |
| Cross-domain patterns, correlations | `formula-tester.md` | "Why is my X affecting Y?", pattern questions |
| Supplements, micronutrients, vitamins | `herbalist.md` | Supplement questions, vitamin/mineral gaps |
| Experiment status, check-ins, compliance | `trial-monitor.md` | "How's my experiment going?", check-in reminders |
| Experiment design, "should I test X?" | `court-magistrate.md` | Trial design, hypothesis questions |
| Safety, overtraining, warning signs | `medical-censor.md` | "Am I overtraining?", safety concerns, red flags |
| Research, studies, news | `court-scribe.md` | "Any research on X?", literature questions |

Routing rules:

- Always include `imperial-physician.md` if the question is broad or ambiguous
- Always include `medical-censor.md` if there's any safety concern in the question
- For narrow questions (e.g. "how's my HRV?"), route to just 1 agent
- Maximum 3 agents per question — pick the most relevant
- When in doubt between 2 agents, include both

## Step 2: Gather data for the agents

Call the raw tools to fetch the data each selected agent will need. Only fetch what's relevant:

| Agent Needs | Tool Call |
|-------------|-----------|
| Nutrition data | `nutrition` with `command: "weekly_summary"` and/or `command: "lookup"` |
| Health profile / Whoop metrics | `health_profile` with `command: "show"` |
| Experiment status | `experiments` with `command: "status"` |
| News / research | `news_digest` with `command: "show"` |

Fetch in parallel when multiple tools are needed.

## Step 3: Spawn specialist agents

For each selected agent:

1. Read the agent prompt: `read("{baseDir}/../../agents/{file}")`
2. Construct the task:

```
{contents of the agent .md file}

---

USER'S QUESTION:
{the user's original question}

AVAILABLE DATA:
{paste the relevant data fetched in Step 2}
```

3. Spawn: `sessions_spawn(task=<constructed task>, label=<role name>)`

Spawn all selected agents in parallel.

## Step 4: Collect and respond

Wait for all spawned agents to complete. Collect their responses and present them to the user as a unified answer:

- If only 1 agent was spawned: present its response directly
- If 2-3 agents were spawned: present each response as a separate section, preserving the agent's emoji prefix (e.g. `[Pulse Reader]`)
- After the specialist responses, add a brief 1-sentence synthesis if the agents' advice needs to be reconciled or prioritized

## Rules

- Reply in the user's language if obvious from context. Otherwise English.
- Each agent response should be 2-3 sentences as defined in their prompt files.
- Recommendations must be conservative, lifestyle-only, grounded in the user's own data.
- Do not overclaim from sparse data. Agents should say "insufficient data" when appropriate.
- If no data is available for the question (e.g. no Whoop connected, no meals logged), skip agent dispatch and tell the user what data they need to provide first.
