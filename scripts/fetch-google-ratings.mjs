#!/usr/bin/env node
// fetch-google-ratings.mjs
// Fetches real Google ratings for bars using Places Find Place API.
// One API call per bar — returns exact match with rating + review count.
//
// Cost: $5 per 1,000 requests (Find Place from Text).
// Strategy: prioritize editorial cities, then by hotel count.
//
// Usage:
//   node scripts/fetch-google-ratings.mjs                  # run (default: editorial cities)
//   node scripts/fetch-google-ratings.mjs --limit 500      # first 500 cities
//   node scripts/fetch-google-ratings.mjs --all             # all 90K cities (~$1,150)
//   node scripts/fetch-google-ratings.mjs --dry-run        # show plan without API calls
//   node scripts/fetch-google-ratings.mjs --apply           # apply ratings to hotel-data.js

import { readFileSync, writeFileSync, existsSync } from 'fs';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyA-tVmuP-BlpbT9Dta93M-set2nlhba2s0';
const PROGRESS_FILE = './scripts/google-ratings-progress.json';
const RATINGS_FILE = './scripts/google-ratings.json';
const HOTEL_DATA_FILE = './lib/bakery-data.js';
const DELAY_MS = 50; // 20 req/sec

// ─── Parse args ───
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const applyMode = args.includes('--apply');
const allCities = args.includes('--all');
const limitIdx = args.indexOf('--limit');
const cityLimit = allCities ? Infinity : (limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 200);

// ─── Load editorial cities (highest priority) ───
function getEditorialCities() {
  const src = readFileSync('./lib/editorial-data.js', 'utf8');
  const cities = new Set();
  const re = /\["[^"]*","([^"]*)","([^"]*)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    cities.add(`${m[1]}|${m[2]}`);
  }
  return cities;
}

// ─── Parse DB ───
function parseDB() {
  const content = readFileSync(HOTEL_DATA_FILE, 'utf8');
  const dbStart = content.indexOf('export const DB = ') + 'export const DB = '.length;
  const dbStr = content.slice(dbStart).replace(/;\s*$/, '');
  const DB = JSON.parse(dbStr);

  const cityHotels = new Map();
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      const key = `${city}|${country}`;
      cityHotels.set(key, DB[country][city].map(([name, ratingX10, reviewsDiv10, type]) => ({
        name, ratingX10, reviewsDiv10, type,
      })));
    }
  }
  return cityHotels;
}

// ─── Google Find Place ───
async function findPlace(hotelName, city, country) {
  const query = `${hotelName} ${city} ${country}`;
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=name,rating,user_ratings_total,place_id&key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  if (data.status === 'REQUEST_DENIED') throw new Error(`REQUEST_DENIED: ${data.error_message}`);
  if (data.status === 'OVER_QUERY_LIMIT') throw new Error('OVER_QUERY_LIMIT');

  const candidate = data.candidates?.[0];
  if (!candidate || !candidate.rating) return null;

  return {
    rating: candidate.rating,
    reviews: candidate.user_ratings_total || 0,
    googleName: candidate.name,
    placeId: candidate.place_id,
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Main ───
async function main() {
  console.log('Parsing hotel database...');
  const cityHotels = parseDB();
  console.log(`Found ${cityHotels.size} cities in DB`);

  const editorialCities = getEditorialCities();
  console.log(`Found ${editorialCities.size} editorial cities`);

  // Prioritize cities: editorial first, then by hotel count
  const cityList = [...cityHotels.entries()]
    .map(([key, hotels]) => {
      const [city, country] = key.split('|');
      const isEditorial = editorialCities.has(key);
      return { key, city, country, hotelCount: hotels.length, isEditorial, hotels };
    })
    .sort((a, b) => {
      if (a.isEditorial !== b.isEditorial) return b.isEditorial ? 1 : -1;
      return b.hotelCount - a.hotelCount;
    })
    .slice(0, cityLimit);

  const totalHotels = cityList.reduce((sum, c) => sum + c.hotelCount, 0);
  console.log(`\nPlan: query ${cityList.length} cities, ${totalHotels} hotels`);
  console.log(`  Editorial cities: ${cityList.filter(c => c.isEditorial).length}`);
  console.log(`  API calls: ${totalHotels} (one per hotel)`);
  console.log(`  Estimated cost: ~$${(totalHotels / 1000 * 5).toFixed(2)}`);

  if (dryRun) {
    console.log('\nTop 20 cities to query:');
    for (const c of cityList.slice(0, 20)) {
      console.log(`  ${c.city}, ${c.country} — ${c.hotelCount} hotels ${c.isEditorial ? '* editorial' : ''}`);
    }
    return;
  }

  if (applyMode) {
    applyRatings();
    return;
  }

  // Load progress
  let progress = new Set();
  if (existsSync(PROGRESS_FILE)) {
    const p = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8'));
    progress = new Set(p);
    console.log(`Resuming: ${progress.size} hotels already done`);
  }

  // Load existing ratings
  let ratings = {};
  if (existsSync(RATINGS_FILE)) {
    ratings = JSON.parse(readFileSync(RATINGS_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(ratings).length} existing ratings`);
  }

  let done = 0;
  let matched = 0;
  let apiCalls = 0;
  let errors = 0;
  const CONCURRENCY = 10; // parallel requests
  const startTime = Date.now();

  // Flatten all hotels into a single queue
  const queue = [];
  for (const cityInfo of cityList) {
    for (const hotel of cityInfo.hotels) {
      const hotelKey = `${hotel.name}|${cityInfo.city}|${cityInfo.country}`;
      if (progress.has(hotelKey)) {
        done++;
        continue;
      }
      queue.push({ hotel, city: cityInfo.city, country: cityInfo.country, key: hotelKey });
    }
  }
  console.log(`${done} already done, ${queue.length} remaining\n`);

  // Process in batches of CONCURRENCY
  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async ({ hotel, city, country, key }) => {
        const result = await findPlace(hotel.name, city, country);
        return { key, result };
      })
    );

    for (const r of results) {
      apiCalls++;
      done++;
      if (r.status === 'fulfilled') {
        progress.add(r.value.key);
        if (r.value.result) {
          ratings[r.value.key] = r.value.result;
          matched++;
        }
      } else {
        errors++;
        const errMsg = r.reason?.message || '';
        if (errMsg.includes('OVER_QUERY_LIMIT') || errMsg.includes('REQUEST_DENIED')) {
          writeFileSync(PROGRESS_FILE, JSON.stringify([...progress]));
          writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2));
          console.error('\nQuota/auth error. Stopping. Resume later.');
          console.error(errMsg);
          process.exit(1);
        }
      }
    }

    // Save progress every 200 hotels
    if (done % 200 < CONCURRENCY) {
      writeFileSync(PROGRESS_FILE, JSON.stringify([...progress]));
      writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2));
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const pct = ((done / totalHotels) * 100).toFixed(1);
      const rate = (apiCalls / (Date.now() - startTime) * 1000).toFixed(1);
      const eta = ((queue.length - i) / rate / 60).toFixed(0);
      console.log(`[${pct}%] ${done}/${totalHotels} | ${matched} matched | ${rate} req/s | ETA ${eta}m`);
    }

    await sleep(DELAY_MS);
  }

  // Final save
  writeFileSync(PROGRESS_FILE, JSON.stringify([...progress]));
  writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2));
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\nDone in ${elapsed}s!`);
  console.log(`  ${matched}/${totalHotels} hotels matched with real Google ratings`);
  console.log(`  ${apiCalls} API calls | ${errors} errors`);
  console.log(`  Estimated cost: ~$${(apiCalls / 1000 * 5).toFixed(2)}`);
  console.log(`\nRun with --apply to update hotel-data.js`);
}

// ─── Apply ratings to hotel-data.js ───
function applyRatings() {
  if (!existsSync(RATINGS_FILE)) {
    console.error('No ratings file found. Run fetch first.');
    process.exit(1);
  }

  const ratings = JSON.parse(readFileSync(RATINGS_FILE, 'utf8'));
  console.log(`Loaded ${Object.keys(ratings).length} ratings to apply`);

  let content = readFileSync(HOTEL_DATA_FILE, 'utf8');
  let updated = 0;
  let skipped = 0;

  for (const [key, data] of Object.entries(ratings)) {
    const [name] = key.split('|');
    if (!data.rating) { skipped++; continue; }

    const ratingX10 = Math.round(data.rating * 10);
    const reviewsDiv10 = Math.max(1, Math.round(data.reviews / 10));

    // Find and replace: ["name", 45, 1, "X"] → ["name", ratingX10, reviewsDiv10, "X"]
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\["${escaped}",\\s*\\d+,\\s*\\d+,\\s*"([A-Z])"\\]`);

    if (re.test(content)) {
      content = content.replace(re, `["${name}",${ratingX10},${reviewsDiv10},"$1"]`);
      updated++;
    } else {
      skipped++;
    }
  }

  writeFileSync(HOTEL_DATA_FILE, content);
  console.log(`Updated ${updated} hotels with real Google ratings (${skipped} skipped).`);

  // Show rating distribution of updated hotels
  const dist = {};
  for (const data of Object.values(ratings)) {
    if (!data.rating) continue;
    const bucket = data.rating.toFixed(1);
    dist[bucket] = (dist[bucket] || 0) + 1;
  }
  console.log('\nRating distribution:');
  for (const [r, count] of Object.entries(dist).sort()) {
    console.log(`  ${r}/5: ${count} hotels`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
