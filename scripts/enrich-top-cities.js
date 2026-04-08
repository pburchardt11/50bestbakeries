#!/usr/bin/env node
// scripts/enrich-top-cities.js
// Uses Google Places API to enrich the top 10 bakeries in each major city.
// Also includes G50 and editorial bakeries for each city.
//
// Run: node scripts/enrich-top-cities.js
//
// Requires in .env.local:
//   GOOGLE_PLACES_API_KEY
//   BLOB_READ_WRITE_TOKEN
//
// Cost: ~$0.024 per bar (Text Search Pro + photo)
// For ~500 bars (50 cities x 10): ~$12 one-time

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// ─── Load .env.local ───
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Missing .env.local — add GOOGLE_PLACES_API_KEY and BLOB_READ_WRITE_TOKEN');
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
  process.exit(1);
}

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!BLOB_TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN in .env.local');
  process.exit(1);
}

// ─── Major cities list ───
const MAJOR_CITIES = [
  'London',
  'New York',
  'Tokyo',
  'Barcelona',
  'Paris',
  'Singapore',
  'Bangkok',
  'Sydney',
  'Melbourne',
  'Berlin',
  'Mexico City',
  'Buenos Aires',
  'Hong Kong',
  'Shanghai',
  'Seoul',
  'Amsterdam',
  'Copenhagen',
  'Stockholm',
  'Rome',
  'Milan',
  'Dubai',
  'Mumbai',
  'Istanbul',
  'Athens',
  'Lisbon',
  'Prague',
  'Vienna',
  'Dublin',
  'Toronto',
  'Montreal',
  'Vancouver',
  'San Francisco',
  'Chicago',
  'Los Angeles',
  'Miami',
  'New Orleans',
  'Nashville',
  'Lima',
  'Bogotá',
  'São Paulo',
  'Rio de Janeiro',
  'Cape Town',
  'Johannesburg',
  'Taipei',
  'Manila',
  'Kuala Lumpur',
  'Bali',
  'Jakarta',
  'Oslo',
  'Helsinki',
  'Zurich',
  'Warsaw',
  'Moscow',
];

const ROOT = path.join(__dirname, '..');
const PHOTOS_DIR = path.join(ROOT, 'public', 'photos');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const PROGRESS_FILE = path.join(__dirname, 'enrich-cities-progress.json');

fs.mkdirSync(PHOTOS_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Slug utilities ───
function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function bakerySlug(name, city) {
  const n = toSlug(name);
  const c = toSlug(city);
  return n.endsWith(c) ? n : n + '-' + c;
}

// ─── Progress tracking ───
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return { done: {} };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ─── Load top bakeries from bakery-data.js (temp file approach) ───
function loadTopBarsForCity(city, limit = 10) {
  const tmpScript = path.join(__dirname, '_tmp_enrich_load.js');
  const tmpOutput = path.join(__dirname, '_tmp_enrich_bars.json');

  fs.writeFileSync(tmpScript, `
const fs = require('fs');
const content = fs.readFileSync(${JSON.stringify(path.join(ROOT, 'lib', 'bakery-data.js'))}, 'utf8');
const jsonStart = content.indexOf('{');
const jsonEnd = content.lastIndexOf('}');
const DB = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
const city = ${JSON.stringify(city)};
const limit = ${limit};
const bars = [];
for (const [country, cities] of Object.entries(DB)) {
  for (const [c, entries] of Object.entries(cities)) {
    if (c !== city) continue;
    for (const e of entries) {
      bars.push({ name: e[0], city: c, country, rating: e[1] || 0, reviews: e[2] || 0 });
    }
  }
}
bars.sort((a, b) => (b.rating - a.rating) || (b.reviews - a.reviews));
fs.writeFileSync(${JSON.stringify(tmpOutput)}, JSON.stringify(bars.slice(0, limit)));
`);

  try {
    execSync(`node --max-old-space-size=4096 ${tmpScript}`, { maxBuffer: 10 * 1024 * 1024 });
  } catch (err) {
    console.error(`  Failed to load bakeries for ${city}:`, err.message);
    return [];
  }

  fs.unlinkSync(tmpScript);
  const bars = JSON.parse(fs.readFileSync(tmpOutput, 'utf8'));
  fs.unlinkSync(tmpOutput);
  return bars;
}

// ─── Load G50 bakeries for a city (parse directly from bakery-db.js) ───
function loadG50BarsForCity(city) {
  const content = fs.readFileSync(path.join(ROOT, 'lib', 'bakery-db.js'), 'utf8');
  const match = content.match(/export const G50\s*=\s*\[([\s\S]*?)\n\];/);
  if (!match) return [];

  const bars = [];
  // Match object entries with name, city, country fields
  const re = /\{\s*name\s*:\s*"([^"]+)"\s*,\s*city\s*:\s*"([^"]+)"\s*,\s*country\s*:\s*"([^"]+)"[^}]*\}/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    if (m[2] === city) {
      bars.push({ name: m[1], city: m[2], country: m[3] });
    }
  }
  return bars;
}

// ─── Load editorial bakeries for a city ───
function loadEditorialBarsForCity(city) {
  const content = fs.readFileSync(path.join(ROOT, 'lib', 'editorial-data.js'), 'utf8');
  const bars = [];

  // Match full object blocks containing city
  const blockRe = /\{[^{}]*city\s*:\s*"([^"]+)"[^{}]*\}/gs;
  let m;
  while ((m = blockRe.exec(content)) !== null) {
    if (m[1] !== city) continue;
    const block = m[0];
    const nameMatch = block.match(/name\s*:\s*"([^"]+)"/);
    const countryMatch = block.match(/country\s*:\s*"([^"]+)"/);
    const ratingMatch = block.match(/rating\s*:\s*([\d.]+)/);
    if (nameMatch && countryMatch) {
      bars.push({
        name: nameMatch[1],
        city,
        country: countryMatch[1],
        rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
      });
    }
  }
  return bars;
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

// ─── Upload to Vercel Blob ───
async function uploadToBlob(filePath, slug) {
  const { put, del } = await import('@vercel/blob');
  const blobPath = `bakery-photos/${slug}.jpg`;
  const blobUrl = `https://wfmolibajntmnqfo.public.blob.vercel-storage.com/${blobPath}`;
  // Delete existing if any
  try { await del(blobUrl, { token: BLOB_TOKEN }); } catch {}
  const buffer = fs.readFileSync(filePath);
  const result = await put(blobPath, buffer, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'image/jpeg',
    token: BLOB_TOKEN,
  });
  return result.url;
}

// ─── Field mask ───
const FIELD_MASK = 'places.id,places.displayName,places.photos,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.reviews';

const DELAY_MS = 200;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Process one bar ───
async function processBar(bar, progress) {
  const slug = bakerySlug(bar.name, bar.city);
  if (progress.done[slug]) return 'skip';

  const photoPath = path.join(PHOTOS_DIR, `${slug}.jpg`);
  const dataPath = path.join(DATA_DIR, `${slug}.json`);

  try {
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
      rating: place.rating,
      reviewCount: place.userRatingCount,
      reviews: (place.reviews || []).slice(0, 5).map(r => ({
        author: r.authorAttribution?.displayName || 'Anonymous',
        rating: r.rating,
        text: r.text?.text || '',
        time: r.relativePublishTimeDescription || '',
      })),
    };
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    // Download and upload photo
    let blobUrl = null;
    if (place.photos?.length > 0) {
      const photoRef = place.photos[0].name;
      const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=800&key=${API_KEY}`;

      if (!fs.existsSync(photoPath)) {
        await downloadFile(photoUrl, photoPath);
      }

      try {
        blobUrl = await uploadToBlob(photoPath, slug);
      } catch (err) {
        console.error(`\n  Blob upload failed for ${slug}: ${err.message}`);
      }
    }

    // Update rating in bakery-data.js if we got a Google rating
    if (place.rating && bar.country) {
      await updateBarRating(bar, place.rating, place.userRatingCount || 0);
    }

    progress.done[slug] = 'ok';
    if (blobUrl) progress.done[`${slug}:blobUrl`] = blobUrl;
    return 'ok';
  } catch (err) {
    console.error(`\n  Error for ${slug}: ${err.message}`);
    progress.done[slug] = 'error';
    return 'fail';
  }
}

// ─── Update bar rating in bakery-data.js ───
// Uses a lightweight in-place string replacement to avoid loading the 23MB file fully
const pendingRatingUpdates = [];

function queueRatingUpdate(bar, googleRating, reviewCount) {
  pendingRatingUpdates.push({ bar, googleRating, reviewCount });
}

async function updateBarRating(bar, googleRating, reviewCount) {
  queueRatingUpdate(bar, googleRating, reviewCount);
}

function flushRatingUpdates() {
  if (pendingRatingUpdates.length === 0) return;
  console.log(`\nApplying ${pendingRatingUpdates.length} rating updates to bakery-data.js...`);

  const barDataPath = path.join(ROOT, 'lib', 'bakery-data.js');
  let content = fs.readFileSync(barDataPath, 'utf8');

  let updated = 0;
  for (const { bar, googleRating, reviewCount } of pendingRatingUpdates) {
    const ratingX10 = Math.round(googleRating * 10);
    const reviewsDiv10 = Math.floor(reviewCount / 10);

    // Look for the bakery entry: ["Bar Name", <rating>, <reviews>, "<type>"]
    // We match the name exactly and update rating and reviews
    const escapedName = bar.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`("${escapedName}",\\s*)(\\d+)(,\\s*)(\\d+)`, 'g');
    const newContent = content.replace(re, (match, p1, _oldRating, p3, _oldReviews) => {
      updated++;
      return `${p1}${ratingX10}${p3}${reviewsDiv10}`;
    });

    if (newContent !== content) {
      content = newContent;
    }
  }

  fs.writeFileSync(barDataPath, content);
  console.log(`  Updated ${updated} bakeries in bakery-data.js`);
}

// ─── Main ───
async function main() {
  console.log('Starting enrich-top-cities...');
  console.log(`Cities to process: ${MAJOR_CITIES.length}`);
  console.log('');

  const progress = loadProgress();
  const alreadyDone = Object.keys(progress.done).filter(k => !k.includes(':blobUrl')).length;
  console.log(`Already processed: ${alreadyDone} bars\n`);

  let totalOk = 0, totalFail = 0, totalSkip = 0, totalNoResult = 0;
  const startTime = Date.now();
  let barCount = 0;

  for (const city of MAJOR_CITIES) {
    console.log(`\n── ${city} ──`);

    // Gather bars: DB top 10 + G50 + editorial (deduplicated)
    const dbBars = loadTopBarsForCity(city, 10);
    const g50Bars = loadG50BarsForCity(city);
    const editorialBars = loadEditorialBarsForCity(city);

    // Merge and deduplicate by slug
    const allCityBars = [...g50Bars, ...editorialBars, ...dbBars];
    const seen = new Set();
    const uniqueBars = allCityBars.filter(b => {
      const s = bakerySlug(b.name, b.city);
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });

    console.log(`  Found: ${uniqueBars.length} bars (${g50Bars.length} G50, ${editorialBars.length} editorial, ${dbBars.length} db-top10)`);

    for (const bar of uniqueBars) {
      const slug = bakerySlug(bar.name, bar.city);
      barCount++;
      process.stdout.write(`  [${barCount}] ${bar.name}... `);

      const result = await processBar(bar, progress);

      if (result === 'ok') { totalOk++; process.stdout.write('ok\n'); }
      else if (result === 'skip') { totalSkip++; process.stdout.write('skip\n'); }
      else if (result === 'no-result') { totalNoResult++; process.stdout.write('no-result\n'); }
      else { totalFail++; process.stdout.write('fail\n'); }

      // Save progress every 10 bars
      if (barCount % 10 === 0) saveProgress(progress);

      await sleep(DELAY_MS);
    }
  }

  // Flush all rating updates
  flushRatingUpdates();

  // Final save
  saveProgress(progress);

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n\nDone in ${totalTime} minutes!`);
  console.log(`  OK: ${totalOk}`);
  console.log(`  No result: ${totalNoResult}`);
  console.log(`  Skipped: ${totalSkip}`);
  console.log(`  Failed: ${totalFail}`);
  console.log(`  Total processed: ${Object.keys(progress.done).filter(k => !k.includes(':blobUrl')).length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
