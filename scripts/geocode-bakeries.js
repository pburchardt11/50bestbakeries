#!/usr/bin/env node
// scripts/geocode-bars.js
// Geocodes all bakeries using Nominatim (free, 1 req/sec rate limit)
// Saves progress incrementally to lib/bakery-coords.json
//
// Run:   node scripts/geocode-bars.js
// Resume: just run again — skips already-geocoded bars
// Stop:   Ctrl+C — progress is saved every 50 bars
//
// Expected runtime: ~9 days for 770K bars at 1 req/sec

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Load bar database ───
function loadBars() {
  const barDataPath = path.join(__dirname, '..', 'lib', 'bakery-data.js');
  const content = fs.readFileSync(barDataPath, 'utf8');
  const tmpPath = '/tmp/_tmp_bar_data_geo.js';
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

// ─── Nominatim geocoding ───
function geocode(query) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    https.get(url, {
      headers: { 'User-Agent': '50BestBar/1.0 (contact@50bestbakeries.com)' },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results.length > 0) {
            resolve([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ───
const COORDS_FILE = path.join(__dirname, '..', 'lib', 'bakery-coords.json');
const PROGRESS_FILE = path.join(__dirname, 'geocode-progress.json');

async function main() {
  console.log('Loading bar database...');
  const DB = loadBars();

  // Load existing coords
  let coords = {};
  if (fs.existsSync(COORDS_FILE)) {
    coords = JSON.parse(fs.readFileSync(COORDS_FILE, 'utf8'));
  }

  // Load progress (tracks slugs we've attempted, even if no result)
  let progress = {};
  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }

  // Build list of bakeries to geocode
  const allBars = [];
  for (const [country, cities] of Object.entries(DB)) {
    for (const [city, bars] of Object.entries(cities)) {
      for (const b of bakeries) {
        const slug = bakerySlug(b[0], city);
        if (!coords[slug] && !progress[slug]) {
          allBars.push({ name: b[0], city, country, slug, rating: b[1] });
        }
      }
    }
  }

  // Sort by rating descending — geocode best bars first
  allBars.sort((a, b) => b.rating - a.rating);

  const alreadyDone = Object.keys(coords).length + Object.keys(progress).length;
  console.log(`Already geocoded: ${Object.keys(coords).length} (with coords)`);
  console.log(`Already attempted: ${Object.keys(progress).length} (no result)`);
  console.log(`Remaining: ${allBars.length}`);
  console.log(`Rate: ~1 req/sec (Nominatim limit)`);
  console.log(`ETA: ~${(allBars.length / 3600).toFixed(1)} hours\n`);

  if (allBars.length === 0) {
    console.log('All bars already geocoded!');
    return;
  }

  let ok = 0, noResult = 0;
  const startTime = Date.now();

  // Save on exit
  function saveAll() {
    fs.writeFileSync(COORDS_FILE, JSON.stringify(coords));
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
    console.log(`\n\nSaved! ${ok} new coords, ${noResult} no-result.`);
    console.log(`Total coords: ${Object.keys(coords).length}`);
  }

  process.on('SIGINT', () => { saveAll(); process.exit(0); });
  process.on('SIGTERM', () => { saveAll(); process.exit(0); });

  for (let i = 0; i < allBars.length; i++) {
    const bar = allBars[i];
    const query = `${bar.name}, ${bar.city}, ${bar.country}`;

    const result = await geocode(query);

    if (result) {
      coords[bar.slug] = result;
      ok++;
    } else {
      progress[bar.slug] = 1; // mark as attempted
      noResult++;
    }

    // Save every 50 bars
    if ((ok + noResult) % 50 === 0) {
      fs.writeFileSync(COORDS_FILE, JSON.stringify(coords));
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = (ok + noResult) / elapsed;
    const remaining = allBars.length - i - 1;
    const eta = remaining / rate;
    const etaH = Math.floor(eta / 3600);
    const etaM = Math.floor((eta % 3600) / 60);

    process.stdout.write(`\r  ${i + 1}/${allBars.length} — ${ok} coords, ${noResult} no-result — ${rate.toFixed(1)} req/s — ETA ${etaH}h${etaM}m`);

    // Respect Nominatim rate limit: 1 req/sec
    await sleep(1050);
  }

  saveAll();
  const totalTime = ((Date.now() - startTime) / 1000 / 3600).toFixed(1);
  console.log(`Completed in ${totalTime} hours.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
