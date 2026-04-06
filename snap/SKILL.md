---
name: snap
description: Log meals from food photos or natural language descriptions — infer ingredients, call the nutrition tool immediately, and return full micronutrient detail. Do not estimate nutrition in chat manually.
user-invocable: true
---

# Snap

Use this skill when:

- the user sends a likely food photo
- the user describes what they ate or are eating (e.g. "had salmon with rice for lunch", "just grabbed a yogurt and some berries")
- the user invokes `/snap` (legacy shortcut)

Behavior rules:

- Reply in the user's language.
- **Always log via the `nutrition` tool.** Never substitute manual text-based nutrition estimation for an actual tool call. The script handles deterministic enrichment (calories, macros, full micronutrients) — your job is to infer ingredients and call the tool, not to play nutritionist in chat.
- Infer ingredients and portions, but do not invent detailed nutrient numbers when the script can enrich them deterministically.
- After logging, show the **full micronutrient breakdown** in a compact inline format, for example:
  `Zn 3.2mg · Ca 58mg · VitD 16.4µg · Se 73mcg · Fe 1.8mg · Folate 57µg · Omega-3 1.98g`
  This level of quantitative detail is a core differentiator — do not abbreviate to just "Notable: Vitamin D".

### When to proceed vs. when to confirm

- **Proceed directly (no confirmation needed):**
  - Photo + any meal context (e.g. "正在吃早餐", "lunch", "having a snack") — the text removes ambiguity.
  - Natural language description (e.g. "had salmon and rice") — user intent is clear.
  - Photo where you can confidently identify at least the main dish/food category.
- **Ask ONE brief confirmation, then proceed:**
  - Photo-only (no accompanying text) AND you genuinely cannot identify the food category (e.g. blurry photo, unfamiliar dish, ambiguous container).
  - The confirmation question should be specific: "這看起來像是優格碗，對嗎？" — not an open-ended ingredient list request.
  - Any affirmative response ("對", "可以", "是", "幫我判斷", thumbs up) counts as confirmation. After confirmation, **immediately call the tool** with your best estimate. Do not ask again or offer more estimates.
- **Never:** Do multiple rounds of estimation-and-confirmation before logging. One round max. If you're wrong, the user can correct after seeing the logged result.

Meal-type inference rules:

- **Always use the current wall-clock time** (not photo content) as the primary signal for `meal_type`:
  - 05:00–10:29 → `breakfast`
  - 10:30–14:29 → `lunch`
  - 14:30–17:29 → `snack`
  - 17:30–21:59 → `dinner`
  - 22:00–04:59 → `snack`
- If the user **explicitly states** a meal type (e.g. "this was my breakfast"), use their stated type regardless of the time.
- **Never infer meal_type from the visual content of the photo** (e.g. do not classify eggs as "breakfast" if it is dinner time).

Logging flow:

1. Infer a meal-level estimate and decompose it into ingredients.
2. For each ingredient, provide:
   - `name`
   - either `amount_g` or `portion`
   - optional `confidence`
3. Only include explicit nutrient fields if the user supplied a trustworthy label, barcode, or exact recipe and you want the script to preserve those values as `provided`.
4. Call the `nutrition` tool with `command: "log"` and `input_json` containing the meal payload:

```json
{
  "command": "log",
  "input_json": {
    "timestamp": "2026-03-18T12:30:00-07:00",
    "meal_type": "lunch",
    "source": "photo",
    "photo_ref": "telegram:file-id-or-message-ref",
    "confidence": 0.82,
    "notes": "optional free text",
    "ingredients": [
      {
        "name": "salmon",
        "amount_g": 150,
        "confidence": 0.78
      }
    ]
  }
}
```

The logger will:

- normalize ingredient names
- enrich ingredients from deterministic nutrition data when nutrient fields are omitted
- preserve explicitly supplied nutrient values as `provided`
- record the nutrient source in storage

After logging:

- confirm what was logged
- show meal calories/macros
- show the full micronutrient breakdown (all non-zero micronutrients) in compact inline format
- include today's running totals if they are useful
- keep the response short unless the user asks for detail

Weekly nutrition review:

When the user asks about weekly nutrition (e.g. "how's my nutrition looking this week?", "weekly summary"), call the `nutrition` tool:

```json
{
  "command": "weekly_summary",
  "end_date": "YYYY-MM-DD",
  "rda_profile": "default"
}
```

Present the results as:
- daily averages for macros and key micronutrients
- percentage of RDA for each nutrient
- highlight gaps (below 75% of RDA) and strengths (above 100%)
- suggest specific foods to address the biggest gaps
