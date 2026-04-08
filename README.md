# 50bestbakeries

Next.js app showcasing 460,000+ bakeries worldwide with editorial rankings, badges, and per-country / per-city guides. Data sourced from Overture Maps, Wikidata, and Wikipedia.

## Stack

- **Next.js 14** (App Router, React Server Components)
- **Overture Maps** — 461k+ bakery points of interest
- **Wikidata SPARQL + Wikipedia** — editorial rankings source
- **Vercel** — deployment + Blob storage + (optional) Google Places enrichment

## Setup

```bash
npm install
```

Create `.env.local` with at minimum:

```
GOOGLE_PLACES_API_KEY=<your key>        # for editorial enrichment (optional)
VERCEL_OIDC_TOKEN=<auto-provisioned>    # auto-populated by `vercel env pull`
```

If this project is linked to a Vercel project, run:

```bash
vercel env pull .env.local
```

## Generated data pipeline

The large data files are not checked into git. Regenerate them in this order:

```bash
# 1. Download Overture Maps bakery data and build lib/bakery-data.js
#    (takes 10–30 min; downloads ~8 MB parquet from S3)
node scripts/import-overture-bakeries.mjs

# 2. Normalize city names (drop postal codes, title-case ALL CAPS, merge case variants)
node scripts/normalize-cities.mjs

# 3. Discover editorial bakeries from Wikidata + Wikipedia
node scripts/discover-editorials.mjs

# 4. Fuzzy-match editorial entries against the DB
node scripts/match-editorials.mjs

# 5. Build lib/editorial-data.js with badges and per-country ranking
node scripts/build-editorial-data.mjs
```

After step 5, `lib/bakery-data.js` and `lib/editorial-data.js` exist and the app can be started:

```bash
npm run dev
```

## Data flow

```
Overture Maps S3 (parquet)
        │
        ▼
scripts/import-overture-bakeries.mjs
        │
        ▼
lib/bakery-data.js  (461k bakeries across 223 countries, 70k cities)
        │
        ├── scripts/normalize-cities.mjs  (in-place clean-up)
        │
        ├── Wikidata SPARQL ─┐
        │                    ├── scripts/match-editorials.mjs
        ├── Wikipedia ───────┘            │
        │                                 ▼
        │                    lib/editorial-sources/matched.json
        │                                 │
        │                                 ▼
        │                    scripts/build-editorial-data.mjs
        │                                 │
        │                                 ▼
        └───────────────────► lib/editorial-data.js (with badges + ranks)
                              │
                              ▼
                    lib/bakery-db.js (query layer)
                              │
                              ▼
                    Next.js pages, API routes
```

## Scripts

| Script | Purpose |
|---|---|
| `import-overture-bakeries.mjs` | Download + filter Overture Maps bakeries into `lib/bakery-data.js` |
| `normalize-cities.mjs` | Clean city names in-place |
| `discover-editorials.mjs` | Fetch Wikidata + Wikipedia bakery entries |
| `match-editorials.mjs` | Fuzzy-match editorial entries to DB bakeries |
| `build-editorial-data.mjs` | Consolidate matches into `lib/editorial-data.js` |
| `geocode-bakeries.js` | Nominatim geocoding for lat/lng (slow, ~5 days at 1 req/s) |
| `fetch-google-ratings.mjs` | Google Places ratings enrichment (requires `GOOGLE_PLACES_API_KEY`) |
| `scrape-bakery-photos.mjs` | Scrape bakery photos from websites |
| `upload-to-blob.js` | Upload photos + enriched data to Vercel Blob |
| `upload-stock-fallbacks.mjs` | Upload 10 fallback bakery Unsplash stock photos |

## Deployment

```bash
vercel                 # preview deployment
vercel --prod          # production
```

The project is linked to `peters-projects-95e95139/50bestbakeries` via `.vercel/project.json`.
