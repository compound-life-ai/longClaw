# Open Questions

These are the non-obvious decisions still worth settling before implementation starts.

## Product Behavior

1. When a user sends a photo with no text, should the system always assume "log this meal", or should it first ask a short confirmation when confidence is low?
2. Should `/snap` be a visible Telegram native command, or should food logging stay mostly implicit to preserve command-menu space?
3. For micronutrients, what is the minimum useful output in the confirmation message: top 3 noteworthy micros, deficiency-risk flags, or a full stored payload with short visible summary?

## Data Model

4. You previously preferred CSV for nutrition and JSON for the rest. Do you want to hold that line for v1 even if `/insights` becomes query-heavy quickly, or are you open to migrating experiments into SQLite earlier than the rest?
5. Should nutrition logs be meal-centric or ingredient-centric in storage? Meal-centric is faster now; ingredient-centric is better for future analysis.
6. Should the health profile store raw imports alongside normalized summaries, or should it keep only normalized summaries and discard raw files after import?

## Recommendation Engine

7. For health recommendations, should the system optimize for caution, usefulness, or novelty when the evidence is mixed?
8. Should recommendations be constrained to lifestyle actions only at first, or may the system also suggest supplements and lab follow-ups?
9. When data is sparse, should `/insights` produce weak-but-actionable hypotheses from day 1, or explicitly label most outputs as exploratory until a minimum evidence threshold is reached?

## Experiments

10. Should every experiment require an explicit null hypothesis, or should the system generate one automatically and let the user edit it?
11. What should count as a completed daily check-in: one quick subjective score, or a structured form with compliance, outcome, confounders, and notes?
12. Should overlapping experiments be blocked by default when they share the same outcome domain, or merely warned about?

## Automation And Delivery

13. Should the morning cron send one compact message every day no matter what, or skip low-signal days and only send when there is something worth saying?
14. Do you want the morning message in a Telegram DM, a group, or a dedicated topic?
15. Should the news digest be folded into the morning health brief, or stay as a separate scheduled message?

## Integrations

16. Is Apple Health XML import enough for the near term, or do you want the architecture shaped now for future Oura/Whoop/Garmin connectors even if they are deferred?
17. Do you want lab-report upload support to begin as structured manual entry, semi-structured text extraction, or full PDF ingestion?
18. If a future integration requires a plugin, which would matter more: a custom typed tool surface, or a long-running service process?

## Recommendation For The Next Discussion Round

The highest-value questions to answer next are:

1. implicit photo logging vs confirmation threshold
2. meal-centric vs ingredient-centric nutrition storage
3. morning brief delivery target and whether news is merged into it
4. how strict experiment gating should be when evidence is weak

