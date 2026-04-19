// scripts/discover-city-editorials.mjs
// Phase: Discover editorial-quality bakeries for top cities using Google Places Text Search.
// For each of the top N cities (by bakery count), search Google Places for "best bakery in [city]"
// and take the top-rated results. These become editorial entries tagged as 'google-top-rated'.
//
// Merges with existing curated/wikidata/wikipedia editorials.
// Output: lib/editorial-sources/city-editorials.json
//
// Usage: node --env-file=.env.local scripts/discover-city-editorials.mjs [--limit=500] [--per-city=10]
//
// Cost: Google Places Text Search = $0.032/query. 500 cities = ~$16.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'lib/editorial-sources');
fs.mkdirSync(SRC_DIR, { recursive: true });

const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) { console.error('GOOGLE_PLACES_API_KEY required'); process.exit(1); }

const argLimit = process.argv.find(a => a.startsWith('--limit='));
const CITY_LIMIT = argLimit ? parseInt(argLimit.split('=')[1], 10) : 500;
const argPerCity = process.argv.find(a => a.startsWith('--per-city='));
const PER_CITY = argPerCity ? parseInt(argPerCity.split('=')[1], 10) : 10;

// ─── Load DB to find top cities ───
const src = fs.readFileSync(path.join(ROOT, 'lib/bakery-data.js'), 'utf8');
const m = src.match(/export const DB\s*=\s*(\{[\s\S]*?\});?\s*$/);
const DB = JSON.parse(m[1]);

const cityList = [];
for (const country of Object.keys(DB)) {
  for (const city of Object.keys(DB[country])) {
    cityList.push({ city, country, count: DB[country][city].length });
  }
}
cityList.sort((a, b) => b.count - a.count);
const targetCities = cityList.filter(c => c.count >= 10).slice(0, CITY_LIMIT);

console.log(`Discovering editorials for ${targetCities.length} cities (${PER_CITY} per city)`);
console.log(`Estimated cost: ~$${(targetCities.length * 0.032).toFixed(2)} (Text Search)\n`);

// ─── Load existing editorials to avoid duplicates ───
const existingEditorials = new Set();
for (const f of ['matched.json']) {
  const fp = path.join(SRC_DIR, f);
  if (fs.existsSync(fp)) {
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    for (const e of data) {
      if (e.matchedDb) existingEditorials.add((e.matchedDb[0] + '|' + (e.matchedCity || '')).toLowerCase());
    }
  }
}
console.log(`Existing editorial entries: ${existingEditorials.size}`);

// ─── Google Places Text Search (New API) ───
async function textSearch(query) {
  const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    + '?query=' + encodeURIComponent(query)
    + '&type=bakery'
    + '&language=en'
    + '&key=' + KEY;
  const r = await fetch(url);
  return r.json();
}

// ─── Process cities ───
const allEntries = [];
let totalCost = 0;
let processed = 0;

for (const { city, country, count } of targetCities) {
  processed++;
  const query = `best bakery in ${city} ${country}`;

  try {
    const result = await textSearch(query);
    totalCost += 0.032;

    if (result.status !== 'OK' || !result.results?.length) {
      if (processed % 50 === 0 || processed <= 5)
        console.log(`[${processed}/${targetCities.length}] ${city}, ${country}: ${result.status} (0 results)`);
      continue;
    }

    const topResults = result.results
      .filter(r => r.rating >= 3.5 && r.user_ratings_total >= 5)
      .slice(0, PER_CITY);

    for (let i = 0; i < topResults.length; i++) {
      const r = topResults[i];
      const name = r.name;
      const key = (name + '|' + city).toLowerCase();

      // Determine mention type based on rank position
      const mentionType = i < 3 ? 'RANKED_LIST' : 'UNRANKED_LIST';
      const rank = i + 1;

      allEntries.push({
        name,
        city,
        country,
        sourceId: 'google-top-rated',
        mentionType,
        rank,
        scope: 'city',
        year: 2026,
        displayLabel: `Top Rated ${city} #${rank}`,
        googleRating: r.rating,
        googleReviews: r.user_ratings_total,
        googleAddress: r.formatted_address,
        googlePlaceId: r.place_id,
        isNew: !existingEditorials.has(key),
      });
    }

    if (processed % 50 === 0 || processed <= 5)
      console.log(`[${processed}/${targetCities.length}] ${city}, ${country}: ${topResults.length} results (cost so far: $${totalCost.toFixed(2)})`);

  } catch (e) {
    console.error(`[${processed}/${targetCities.length}] ${city}, ${country}: ERROR ${e.message}`);
  }

  // Rate limit: ~5 QPS to stay under Google's burst limits
  await new Promise(r => setTimeout(r, 200));
}

// ─── Save ───
fs.writeFileSync(path.join(SRC_DIR, 'city-editorials.json'), JSON.stringify(allEntries, null, 2));

// ─── Summary ───
const byCountry = {};
for (const e of allEntries) byCountry[e.country] = (byCountry[e.country] || 0) + 1;
const newEntries = allEntries.filter(e => e.isNew).length;

console.log(`\n─── Discovery Summary ───`);
console.log(`Cities searched:   ${processed}`);
console.log(`Total entries:     ${allEntries.length}`);
console.log(`New (not in existing editorials): ${newEntries}`);
console.log(`Countries covered: ${Object.keys(byCountry).length}`);
console.log(`Total API cost:    $${totalCost.toFixed(2)}`);
console.log(`\nWrote lib/editorial-sources/city-editorials.json`);
