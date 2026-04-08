#!/usr/bin/env node
// scripts/scrape-ratings.mjs
// Scrapes bakery ratings from Bing search results — completely free
// Bing often shows Google ratings in the search snippet
//
// Usage: node scripts/scrape-ratings.mjs [--limit 50000] [--offset 0]
//
// Updates lib/bakery-data.js with real ratings

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PROGRESS_FILE = path.join(__dirname, 'ratings-progress.json');

const args = process.argv.slice(2);
function getArg(name, def) {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def;
}
const LIMIT = parseInt(getArg('--limit', '50000'));
const OFFSET = parseInt(getArg('--offset', '0'));
const CONCURRENCY = 5;
const DELAY_MS = 1200;

function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function bakerySlug(name, city) {
  const n = toSlug(name), c = toSlug(city);
  return n.endsWith(c) ? n : n + '-' + c;
}

// ─── Load all bakeries ───
function loadAllBars() {
  const tmpScript = path.join(__dirname, '_tmp_load_ratings.js');
  const tmpOutput = path.join(__dirname, '_tmp_bars_ratings.json');
  fs.writeFileSync(tmpScript, `
const fs = require('fs');
const content = fs.readFileSync(${JSON.stringify(path.join(ROOT, 'lib', 'bakery-data.js'))}, 'utf8');
const jsonStart = content.indexOf('{');
const jsonEnd = content.lastIndexOf('}');
const DB = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
const bars = [];
for (const [country, cities] of Object.entries(DB)) {
  for (const [city, entries] of Object.entries(cities)) {
    for (const e of entries) {
      bars.push({ name: e[0], city, country, ratingX10: e[1], reviewsDiv10: e[2], type: e[3] });
    }
  }
}
// Sort by default rating (prioritize bars that still have default 40 rating)
bars.sort((a, b) => {
  // Bars with default rating (40) first — they need real ratings most
  const aDefault = a.ratingX10 === 40 ? 1 : 0;
  const bDefault = b.ratingX10 === 40 ? 1 : 0;
  if (aDefault !== bDefault) return bDefault - aDefault;
  return b.ratingX10 - a.ratingX10;
});
fs.writeFileSync(${JSON.stringify(tmpOutput)}, JSON.stringify(bars));
console.log('Loaded', bars.length, 'bars');
`);
  execSync(`node --max-old-space-size=4096 ${tmpScript}`, { maxBuffer: 10 * 1024 * 1024 });
  fs.unlinkSync(tmpScript);
  const bars = JSON.parse(fs.readFileSync(tmpOutput, 'utf8'));
  fs.unlinkSync(tmpOutput);
  return bars;
}

// ─── Progress ───
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  return { ratings: {}, stats: { found: 0, notFound: 0, failed: 0 } };
}
function saveProgress(prog) { fs.writeFileSync(PROGRESS_FILE, JSON.stringify(prog)); }

// ─── User agents ───
const UAS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
];
let uaIdx = 0;
function getUA() { return UAS[uaIdx++ % UAS.length]; }

async function safeFetch(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      ...opts, signal: controller.signal,
      headers: { 'User-Agent': getUA(), 'Accept': 'text/html,*/*', 'Accept-Language': 'en-US,en;q=0.9', ...(opts.headers || {}) },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return res;
  } catch { clearTimeout(timeout); return null; }
}

// ─── Extract rating from Bing search results ───
function extractRating(html) {
  // Pattern 1: "X.X/5" or "X.X out of 5" in rating widgets
  // Bing shows ratings like: "Rating: 4.5/5 · 234 reviews"
  const patterns = [
    /(\d\.\d)\s*\/\s*5(?:\.0)?(?:\s*·?\s*\(?(\d[\d,]*)\s*(?:reviews?|votes?|ratings?|Google reviews?)\)?)?/gi,
    /(?:rating|rated|stars?)[\s:]*(\d\.\d)\s*(?:\/\s*5)?(?:\s*·?\s*\(?(\d[\d,]*)\s*(?:reviews?|votes?)\)?)?/gi,
    /(\d\.\d)\s*stars?\s*(?:\(?(\d[\d,]*)\s*(?:reviews?|votes?)\)?)?/gi,
    /aria-label="[^"]*(\d\.\d)\s*(?:out of 5|\/5)[^"]*?(\d[\d,]*)\s*(?:reviews?|votes?)?/gi,
    /(\d\.\d)<\/span>\s*<span[^>]*>\s*\((\d[\d,]*)\)/g,
  ];

  let bestRating = null;
  let bestReviews = null;

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const rating = parseFloat(match[1]);
      const reviews = match[2] ? parseInt(match[2].replace(/,/g, '')) : null;

      // Validate rating is reasonable for a bar
      if (rating >= 2.0 && rating <= 5.0) {
        // Prefer results with more reviews
        if (!bestRating || (reviews && (!bestReviews || reviews > bestReviews))) {
          bestRating = rating;
          bestReviews = reviews;
        }
      }
    }
  }

  return bestRating ? { rating: bestRating, reviews: bestReviews } : null;
}

// ─── Process one bar ───
async function processBar(bar, progress) {
  const slug = bakerySlug(bar.name, bar.city);

  // Skip if already done
  if (progress.ratings[slug]) return 'skip';

  try {
    const query = `${bar.name} ${bar.city} bar rating`;
    const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=en`;

    const res = await safeFetch(bingUrl);
    if (!res || !res.ok) {
      progress.ratings[slug] = { status: 'fail' };
      return 'fail';
    }

    const html = await res.text();
    const result = extractRating(html);

    if (result) {
      progress.ratings[slug] = { status: 'ok', rating: result.rating, reviews: result.reviews };
      return 'ok';
    } else {
      progress.ratings[slug] = { status: 'not-found' };
      return 'not-found';
    }
  } catch {
    progress.ratings[slug] = { status: 'fail' };
    return 'fail';
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Apply ratings to bakery-data.js ───
function applyRatings(progress) {
  console.log('\nApplying scraped ratings to bakery-data.js...');

  const tmpScript = path.join(__dirname, '_tmp_apply_ratings.js');
  const ratingsPath = path.join(__dirname, 'ratings-progress.json');

  fs.writeFileSync(tmpScript, `
const fs = require('fs');
const barDataPath = ${JSON.stringify(path.join(ROOT, 'lib', 'bakery-data.js'))};
const content = fs.readFileSync(barDataPath, 'utf8');
const jsonStart = content.indexOf('{');
const jsonEnd = content.lastIndexOf('}');
const DB = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
const progress = JSON.parse(fs.readFileSync(${JSON.stringify(ratingsPath)}, 'utf8'));

function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function bakerySlug(name, city) {
  const n = toSlug(name), c = toSlug(city);
  return n.endsWith(c) ? n : n + '-' + c;
}

let updated = 0;
for (const [country, cities] of Object.entries(DB)) {
  for (const [city, entries] of Object.entries(cities)) {
    for (const entry of entries) {
      const slug = bakerySlug(entry[0], city);
      const data = progress.ratings[slug];
      if (data && data.status === 'ok' && data.rating) {
        const newRatingX10 = Math.round(data.rating * 10);
        if (entry[1] !== newRatingX10) {
          entry[1] = newRatingX10;
          updated++;
        }
        if (data.reviews) {
          const newReviewsDiv10 = Math.max(1, Math.round(data.reviews / 10));
          if (entry[2] !== newReviewsDiv10) {
            entry[2] = newReviewsDiv10;
          }
        }
      }
    }
  }
}

// Count totals
let totalBars = 0;
for (const country of Object.keys(DB)) {
  for (const city of Object.keys(DB[country])) {
    totalBars += DB[country][city].length;
  }
}

// Sort and write
const sortedDB = {};
for (const country of Object.keys(DB).sort()) {
  sortedDB[country] = {};
  for (const city of Object.keys(DB[country]).sort()) {
    sortedDB[country][city] = DB[country][city];
  }
}

const header = '// lib/bakery-data.js\\n// Bar database — ' + new Date().toISOString().slice(0, 10) + '\\n// ' + totalBars.toLocaleString() + ' bars across ' + Object.keys(sortedDB).length + ' countries\\n// Format: [name, rating*10, reviews/10, typeChar]\\n// Types: C=Cocktail Bar, S=Speakeasy, W=Wine Bar, D=Dive Bar, R=Rooftop Bar, T=Tiki Bar, P=Pub, B=Beer Garden, L=Lounge, N=Nightclub, H=Hotel Bar, G=Gastropub, J=Jazz Bar\\n';

fs.writeFileSync(barDataPath, header + '\\nexport const DB = ' + JSON.stringify(sortedDB) + ';\\n');
console.log('Updated ' + updated + ' bakery ratings');
console.log('Total bars: ' + totalBars);
`);
  execSync(`node --max-old-space-size=4096 ${tmpScript}`, { maxBuffer: 10 * 1024 * 1024, stdio: 'inherit' });
  fs.unlinkSync(tmpScript);
}

// ─── Main ───
async function main() {
  console.log('Loading bar database...');
  const allBars = loadAllBars();
  console.log(`Total bars: ${allBars.length}`);

  const bars = allBars.slice(OFFSET, OFFSET + LIMIT);
  const progress = loadProgress();
  const existingRatings = Object.values(progress.ratings).filter(r => r.status === 'ok').length;

  console.log(`Processing ${bars.length} bars (offset ${OFFSET}, limit ${LIMIT})`);
  console.log(`Already have ratings: ${existingRatings}`);
  console.log(`Concurrency: ${CONCURRENCY}, delay: ${DELAY_MS}ms\n`);

  let ok = 0, notFound = 0, failed = 0, skipped = 0;
  const startTime = Date.now();

  for (let i = 0; i < bars.length; i += CONCURRENCY) {
    const batch = bars.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(b => processBar(b, progress)));

    for (const r of results) {
      if (r === 'ok') ok++;
      else if (r === 'skip') skipped++;
      else if (r === 'not-found') notFound++;
      else failed++;
    }

    if ((i / CONCURRENCY) % 20 === 0) saveProgress(progress);

    const done = Math.min(i + CONCURRENCY, bars.length);
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = (ok / (elapsed || 1) * 60).toFixed(1);
    const eta = ok > 0 ? (((bars.length - done) / ((ok + notFound + failed) / elapsed)) / 60).toFixed(0) : '?';
    process.stdout.write(`\r  ${done}/${bars.length} — ${ok} ratings found, ${notFound} not-found, ${failed} fail, ${skipped} skip — ${rate}/min — ETA ${eta}m`);

    if (i + CONCURRENCY < bars.length) await sleep(DELAY_MS);
  }

  saveProgress(progress);

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const totalRatings = Object.values(progress.ratings).filter(r => r.status === 'ok').length;
  console.log(`\n\nDone in ${totalTime} minutes!`);
  console.log(`  Ratings found: ${ok}`);
  console.log(`  Not found: ${notFound}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total ratings collected: ${totalRatings}`);

  // Apply ratings to bakery-data.js
  if (ok > 0) {
    applyRatings(progress);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
