# Curated News Sources

Goal: a daily digest that is credible, automatable, and biased toward health, longevity, nutrition, sleep, exercise, and aging research.

I prioritized sources that are either verified RSS feeds or stable official/publication surfaces.

## Recommended V1 Source Set

### 1. Fight Aging!

- URL: https://www.fightaging.org/
- Feed: https://www.fightaging.org/feed/
- Why include it:
  - high-signal longevity and rejuvenation coverage
  - very automation-friendly feed
  - strong for hypothesis generation and trend spotting
- Caution:
  - opinionated and advocacy-oriented
  - should not be your only source

Verified feed scrape:

- https://www.fightaging.org/feed/

### 2. National Institute on Aging

- URL: https://www.nia.nih.gov/
- Feed: https://www.nia.nih.gov/news/rss.xml
- Why include it:
  - official and conservative
  - useful for aging and dementia-related developments
  - stable and credible
- Caution:
  - slower and narrower than media-style feeds

Verified feed scrape:

- https://www.nia.nih.gov/news/rss.xml

### 3. ScienceDaily Nutrition

- URL: https://www.sciencedaily.com/news/health_medicine/nutrition/
- Feed: https://www.sciencedaily.com/rss/health_medicine/nutrition.xml
- Why include it:
  - broad volume
  - easy automation
  - good for daily discovery
- Caution:
  - secondary coverage, not primary literature
  - headlines need filtering because quality varies a lot

Verified feed scrape:

- https://www.sciencedaily.com/rss/health_medicine/nutrition.xml

## Strong Manual Or Secondary Candidates

These are valuable, but I would treat them as secondary or manually reviewed until we verify a stable automation path.

### Examine

- URL: https://examine.com/
- Why include it:
  - practical evidence summaries in nutrition and supplementation
  - closer to decision support than hype media
- Caution:
  - feed discovery was not confirmed in this pass
  - some content may be gated or structured less predictably for automation

### Lifespan.io News

- URL: https://www.lifespan.io/news/
- Why include it:
  - longevity-focused editorial coverage
  - potentially useful for translational updates
- Caution:
  - the feed URL we checked did not cleanly surface article content
  - needs a second pass before using in automated ingestion

### PubMed Saved Queries

- URL: https://pubmed.ncbi.nlm.nih.gov/
- Why include it:
  - primary literature
  - best source for evidence-backed experiment support
- Caution:
  - not a normal "news site"
  - better handled as a query-based fetcher than a generic feed reader

## Suggested V1 Digest Policy

Use a blended source policy:

- 1 official source: NIA
- 1 longevity-native source: Fight Aging!
- 1 broad secondary source: ScienceDaily Nutrition
- optional query-based research fetch: PubMed for targeted topics

This gives you:

- credibility
- daily freshness
- enough variety without turning the digest into noise

## Suggested Scoring Rules

For a daily digest, rank articles higher when they touch:

- diet quality
- protein intake
- fiber
- sleep quality
- exercise adaptation
- recovery
- biomarkers
- aging mechanisms
- RCTs or human cohort studies
- direct actionability for self-experimentation

Rank lower when they are:

- pure startup PR
- animal-only with no plausible translation path
- generic wellness content
- duplicate summaries of the same paper

## Recommendation

Start with exactly these three automated inputs:

- Fight Aging! RSS
- NIA RSS
- ScienceDaily Nutrition RSS

Then add one research-query source later:

- PubMed saved query for aging, sleep, exercise, and nutrition terms

That is enough to ship a useful digest without building a fragile web crawler.

