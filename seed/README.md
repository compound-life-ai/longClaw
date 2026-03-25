# Seed Data

Fixture files that mirror `longevityOS-data/` for development and testing.

## Contents

| File | Description |
|---|---|
| `nutrition/meals.csv` | 3 days of meals (7 meals, 20 ingredient rows) |
| `health/profile.json` | Health profile with goals, questionnaire answers, and Apple Health import |
| `insights/experiments.json` | 1 active + 1 completed experiment |
| `insights/checkins.json` | 9 check-ins across both experiments |
| `news/cache.json` | 6 sample news items from the 3 configured sources |
| `news/topic_history.json` | prior normalized news interests for personalized `/news` ranking |

## Usage

Copy the seed files into your data directory:

```bash
cp -r seed/* longevityOS-data/
```

To reset back to empty:

```bash
rm longevityOS-data/nutrition/meals.csv
rm longevityOS-data/health/profile.json
rm longevityOS-data/insights/experiments.json
rm longevityOS-data/insights/checkins.json
rm longevityOS-data/news/cache.json
rm longevityOS-data/news/topic_history.json
```
