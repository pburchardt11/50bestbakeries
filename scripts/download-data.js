#!/usr/bin/env node
// scripts/download-data.js
// Downloads Google Places detail data (reviews, contact info, photos) for all bakeries
// Saves JSON to public/data/{slug}.json and photos to public/photos/{slug}.jpg
//
// Run: node scripts/download-data.js
//
// Requires GOOGLE_PLACES_API_KEY in .env.local
// Cost: ~$0.017 per bar (Text Search Pro fields) + $0.007 per photo = ~$0.024 per bar
// Total for ~25K bars: ~$600 one-time

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Missing .env.local — add GOOGLE_PLACES_API_KEY');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('Missing GOOGLE_PLACES_API_KEY in .env.local');
  console.error('Add it: echo "GOOGLE_PLACES_API_KEY=your_key_here" >> .env.local');
  process.exit(1);
}

// ─── Load bar database ───
function loadBars() {
  const barDataPath = path.join(__dirname, '..', 'lib', 'bakery-data.js');
  const content = fs.readFileSync(barDataPath, 'utf8');

  // Convert ESM to CJS
  const tmpPath = '/tmp/_tmp_bar_data_dl.js';
  const cjsContent = content
    .replace(/^export\s+const\s+/gm, 'exports.')
    .replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '');
  fs.writeFileSync(tmpPath, cjsContent);

  const mod = require(tmpPath);
  fs.unlinkSync(tmpPath);
  return mod.DB;
}

function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function bakerySlug(name, city) {
  const n = toSlug(name);
  const c = toSlug(city);
  return n.endsWith(c) ? n : n + '-' + c;
}

// ─── Directories ───
const PHOTOS_DIR = path.join(__dirname, '..', 'public', 'photos');
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const PROGRESS_FILE = path.join(__dirname, 'download-progress.json');

fs.mkdirSync(PHOTOS_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Progress tracking ───
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return { done: {} };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
}

// ─── HTTP helpers ───
function fetchJSON(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        ...(options.headers || {}),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ error: data }); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'Accept': 'image/jpeg' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// ─── Main ───
const FIELD_MASK = 'places.id,places.displayName,places.photos,places.formattedAddress,places.websiteUri,places.googleMapsUri,places.currentOpeningHours,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.reviews,places.location';

const DELAY_MS = 100; // 100ms between requests to stay under rate limits

async function processBar(bar, progress) {
  const slug = bakerySlug(bar.name, bar.city);
  if (progress.done[slug]) return 'skip';

  const photoPath = path.join(PHOTOS_DIR, `${slug}.jpg`);
  const dataPath = path.join(DATA_DIR, `${slug}.json`);

  try {
    // Text Search with Pro fields
    const searchResult = await fetchJSON('https://places.googleapis.com/v1/places:searchText', {
      headers: { 'X-Goog-FieldMask': FIELD_MASK },
      body: { textQuery: `${bar.name} ${bar.city} ${bar.country || ''}`.trim() },
    });

    const place = searchResult.places?.[0];
    if (!place) {
      progress.done[slug] = 'no-result';
      return 'no-result';
    }

    // Save JSON data
    const data = {
      placeId: place.id,
      name: place.displayName?.text,
      address: place.formattedAddress,
      website: place.websiteUri,
      phone: place.nationalPhoneNumber,
      googleUrl: place.googleMapsUri,
      rating: place.rating,
      reviewCount: place.userRatingCount,
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      openingHours: place.currentOpeningHours?.weekdayDescriptions,
      reviews: (place.reviews || []).slice(0, 5).map(r => ({
        author: r.authorAttribution?.displayName || 'Anonymous',
        rating: r.rating,
        text: r.text?.text || '',
        time: r.relativePublishTimeDescription || '',
      })),
    };
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    // Download photo (if not already downloaded)
    if (!fs.existsSync(photoPath) && place.photos?.length > 0) {
      const photoRef = place.photos[0].name;
      const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=800&key=${API_KEY}`;
      await downloadFile(photoUrl, photoPath);
    }

    progress.done[slug] = 'ok';
    return 'ok';
  } catch (err) {
    console.error(`\n  Error for ${slug}: ${err.message}`);
    return 'fail';
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Loading bar database...');
  const DB = loadBars();

  // Expand all bakeries
  const TYPE_MAP = {
    C: 'Cocktail Bar', S: 'Speakeasy', W: 'Wine Bar', D: 'Dive Bar',
    R: 'Rooftop Bar', T: 'Tiki Bar', P: 'Pub', B: 'Beer Garden',
    L: 'Lounge', N: 'Nightclub', H: 'Hotel Bar', G: 'Gastropub', J: 'Jazz Bar',
  };

  const allBars = [];
  for (const [country, cities] of Object.entries(DB)) {
    for (const [city, bars] of Object.entries(cities)) {
      for (const b of bakeries) {
        allBars.push({
          name: b[0],
          city,
          country,
          type: TYPE_MAP[b[3]] || b[3],
          rating: b[1],
          reviews: b[2],
        });
      }
    }
  }

  // Selection criteria:
  // 1. All bars with rating >= 4.0 and reviews >= 50
  // 2. Top 50 bars per country (by rating, then reviews)
  const selectedSlugs = new Set();

  // Criterion 1: quality bars
  for (const bar of allBars) {
    if ((bar.rating / 10) >= 4.0 && (bar.reviews * 10) >= 50) {
      selectedSlugs.add(bakerySlug(bar.name, bar.city));
    }
  }

  // Criterion 2: top 50 per country
  const byCountry = {};
  for (const bar of allBars) {
    if (!byCountry[bar.country]) byCountry[bar.country] = [];
    byCountry[bar.country].push(bar);
  }
  for (const [country, bars] of Object.entries(byCountry)) {
    bars.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0));
    for (const bar of bakeries.slice(0, 50)) {
      selectedSlugs.add(bakerySlug(bar.name, bar.city));
    }
  }

  const topBars = allBars.filter(b => selectedSlugs.has(bakerySlug(b.name, b.city)));
  // Sort by rating descending to prioritize best bars
  topBars.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0));

  const progress = loadProgress();
  const alreadyDone = Object.keys(progress.done).length;
  const remaining = topBars.filter(b => !progress.done[bakerySlug(b.name, b.city)]);

  console.log(`Total bars: ${allBars.length}`);
  console.log(`Selected (4.0+ & 50+ reviews + top 50/country): ${topBars.length}`);
  console.log(`Already done: ${alreadyDone}`);
  console.log(`Remaining: ${remaining.length}`);
  console.log(`Estimated cost: ~$${(remaining.length * 0.024).toFixed(0)}`);
  console.log('');

  if (remaining.length === 0) {
    console.log('All bars already processed!');
    return;
  }

  let ok = 0, fail = 0, skip = 0, noResult = 0;
  const startTime = Date.now();

  for (let i = 0; i < remaining.length; i++) {
    const bar = remaining[i];
    const result = await processBar(bar, progress);

    if (result === 'ok') ok++;
    else if (result === 'fail') fail++;
    else if (result === 'no-result') noResult++;
    else skip++;

    // Save progress every 50 bars
    if ((i + 1) % 50 === 0) {
      saveProgress(progress);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const rate = ((ok + noResult) / (elapsed || 1)).toFixed(1);
    process.stdout.write(`\r  ${i + 1}/${remaining.length} — ${ok} ok, ${noResult} no-result, ${fail} failed — ${rate} req/sec — ${elapsed}s`);

    await sleep(DELAY_MS);
  }

  saveProgress(progress);

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n\nDone in ${totalTime} minutes!`);
  console.log(`  OK: ${ok}, No result: ${noResult}, Failed: ${fail}`);
  console.log(`  Total processed: ${Object.keys(progress.done).length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
