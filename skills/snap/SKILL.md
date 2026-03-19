---
name: snap
description: Log meals from food photos or natural language meal descriptions with ingredient-centric calorie, macro, and full micronutrient detail.
user-invocable: true
---

# Snap

Use this skill when:

- the user sends a likely food photo
- the user describes what they ate or are eating (e.g. "had salmon with rice for lunch", "just grabbed a yogurt and some berries")
- the user invokes `/snap` (legacy shortcut)

Behavior rules:

- Reply in the user's language.
- If a photo-only message has low confidence, ask a brief confirmation before logging anything.
- If confidence is high, proceed directly.
- Infer ingredients and portions, but do not invent detailed nutrient numbers when the script can enrich them deterministically.
- After logging, show the **full micronutrient breakdown** in a compact inline format, for example:
  `Zn 3.2mg · Ca 58mg · VitD 16.4µg · Se 73mcg · Fe 1.8mg · Folate 57µg · Omega-3 1.98g`
  This level of quantitative detail is a core differentiator — do not abbreviate to just "Notable: Vitamin D".

Logging flow:

1. Infer a meal-level estimate and decompose it into ingredients.
2. For each ingredient, provide:
   - `name`
   - either `amount_g` or `portion`
   - optional `confidence`
3. Only include explicit nutrient fields if the user supplied a trustworthy label, barcode, or exact recipe and you want the script to preserve those values as `provided`.
4. Write a JSON payload to a temp file.
5. Run:

```bash
python3 "{baseDir}/../../scripts/nutrition/estimate_and_log.py" \
  --data-root "{baseDir}/../../longevityOS-data" \
  log \
  --input-json /tmp/snap_payload.json
```

Payload shape:

```json
{
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

When the user asks about weekly nutrition (e.g. "how's my nutrition looking this week?", "weekly summary"), run:

```bash
python3 "{baseDir}/../../scripts/nutrition/weekly_summary.py" \
  --data-root "{baseDir}/../../longevityOS-data" \
  --end-date "YYYY-MM-DD" \
  --rda-profile default
```

Present the results as:
- daily averages for macros and key micronutrients
- percentage of RDA for each nutrient
- highlight gaps (below 75% of RDA) and strengths (above 100%)
- suggest specific foods to address the biggest gaps
