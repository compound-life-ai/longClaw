---
name: snap
description: Log meals from food photos or meal text with ingredient-centric calorie and micronutrient estimates, brief confirmations, and daily running totals.
user-invocable: true
---

# Snap

Use this skill when:

- the user invokes `/snap`
- the user sends a likely food photo
- the user sends a meal description they want logged

Behavior rules:

- Reply in the user's language.
- If a photo-only message has low confidence, ask a brief confirmation before logging anything.
- If confidence is high, proceed directly.
- Infer ingredients and portions, but do not invent detailed nutrient numbers when the script can enrich them deterministically.
- Store the full micronutrient payload, but only mention the top 3 notable micronutrient signals in the visible confirmation.

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
- include today's running totals if they are useful
- keep the response short unless the user asks for detail
