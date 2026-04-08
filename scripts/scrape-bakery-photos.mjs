#!/usr/bin/env node
// scripts/scrape-bar-photos-v3.mjs
// Improved scraper — specifically targets bakery interior photos
// Searches: "{bar name} {city} bakery interior" on Bing Images
// Filters out logos, food, portraits, and tiny images
//
// Usage:
//   node scripts/scrape-bar-photos-v3.mjs --limit 10000 [--offset 0] [--fix-bad]
//   --fix-bad: re-download photos under 15KB (likely logos/icons)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PROGRESS_FILE = path.join(__dirname, 'scrape-v3-progress.json');

const args = process.argv.slice(2);
function getArg(name, def) {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def;
}
const LIMIT = parseInt(getArg('--limit', '10000'));
const OFFSET = parseInt(getArg('--offset', '0'));
const FIX_BAD = args.includes('--fix-bad');
const CONCURRENCY = 5;
const DELAY_MS = 1200;

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!BLOB_TOKEN) {
  console.error('Set BLOB_READ_WRITE_TOKEN env var (run: source .env.local)');
  process.exit(1);
}

// Dynamic import for @vercel/blob
const { put, del: blobDel } = await import('@vercel/blob');

function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function bakerySlug(name, city) {
  const n = toSlug(name), c = toSlug(city);
  return n.endsWith(c) ? n : n + '-' + c;
}

// ─── Load G50 ───
function loadG50() {
  const content = fs.readFileSync(path.join(ROOT, 'lib', 'bakery-db.js'), 'utf8');
  const match = content.match(/const G50\s*=\s*\[([\s\S]*?)\n\];/);
  if (!match) return [];
  const bars = [];
  const re = /\{\s*name\s*:\s*"([^"]+)"\s*,\s*city\s*:\s*"([^"]+)"\s*,\s*country\s*:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(match[1])) !== null) bars.push({ name: m[1], city: m[2], country: m[3] });
  return bars;
}

// ─── Load top bakeries from DB ───
function loadTopBars() {
  // Write bakeries to a temp JSON file to avoid stdout buffer limits
  const tmpScript = path.join(__dirname, '_tmp_load_v3.js');
  const tmpOutput = path.join(__dirname, '_tmp_bars_v3.json');
  fs.writeFileSync(tmpScript, `
const fs = require('fs');
const content = fs.readFileSync(${JSON.stringify(path.join(ROOT, 'lib', 'bakery-data.js'))}, 'utf8');
const jsonStart = content.indexOf('{');
const jsonEnd = content.lastIndexOf('}');
const DB = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
const bars = [];
for (const [country, cities] of Object.entries(DB)) {
  for (const [city, entries] of Object.entries(cities)) {
    for (const e of entries) bars.push({ name: e[0], city, country, rating: e[1] || 40 });
  }
}
bars.sort((a, b) => b.rating - a.rating);
fs.writeFileSync(${JSON.stringify(tmpOutput)}, JSON.stringify(bars));
console.log('Wrote', bars.length, 'bars');
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
  return {};
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
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      ...opts, signal: controller.signal,
      headers: { 'User-Agent': getUA(), 'Accept': opts.accept || 'text/html,*/*', 'Accept-Language': 'en-US,en;q=0.9', ...(opts.headers || {}) },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return res;
  } catch { clearTimeout(timeout); return null; }
}

// ─── Extract image URLs from Bing Image Search ───
function extractImageUrls(html) {
  const urls = [];
  const murlMatches = html.matchAll(/murl&quot;:&quot;(https?[^&]+?)&quot;/g);
  for (const m of murlMatches) {
    try {
      const url = m[1].replace(/\\u002f/g, '/');
      if (isGoodImageUrl(url)) urls.push(url);
    } catch {}
  }
  return [...new Set(urls)];
}

function isGoodImageUrl(url) {
  const u = url.toLowerCase();
  if (u.includes('logo') || u.includes('icon') || u.includes('favicon') || u.includes('avatar')) return false;
  if (u.includes('pixel') || u.includes('tracking') || u.includes('1x1') || u.includes('spacer')) return false;
  if (u.includes('.svg') || u.includes('.gif')) return false;
  if (u.includes('bing.com') || u.includes('microsoft.com') || u.includes('facebook.com') || u.includes('tiktok')) return false;
  if (u.includes('profile') || u.includes('thumbnail') || u.includes('thumb_')) return false;
  return true;
}

// ─── Process one bar ───
async function processBar(bar, progress) {
  const slug = bakerySlug(bar.name, bar.city);

  // Skip if already done successfully in this run
  if (progress[slug] === 'ok') return 'skip';

  try {
    // Search specifically for interior/atmosphere photos
    const queries = [
      `"${bar.name}" ${bar.city} bakery interior`,
      `${bar.name} ${bar.city} bar inside`,
    ];

    let imageUrls = [];
    for (const query of queries) {
      const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&count=15&qft=+filterui:photo-photo+filterui:imagesize-medium`;
      const res = await safeFetch(bingUrl);
      if (res && res.ok) {
        const html = await res.text();
        imageUrls.push(...extractImageUrls(html));
      }
      if (imageUrls.length >= 5) break;
    }

    if (imageUrls.length === 0) {
      progress[slug] = 'no-images';
      return 'no-images';
    }

    // Try downloading images until we get a good one
    for (let i = 0; i < Math.min(imageUrls.length, 5); i++) {
      try {
        const imgRes = await safeFetch(imageUrls[i], { accept: 'image/*' });
        if (!imgRes || !imgRes.ok) continue;

        const ct = imgRes.headers.get('content-type') || '';
        if (!ct.includes('image')) continue;

        const buffer = Buffer.from(await imgRes.arrayBuffer());
        if (buffer.length < 15000) continue;  // skip tiny (logos)
        if (buffer.length > 10 * 1024 * 1024) continue; // skip huge

        // Upload directly to Blob
        const blobPath = `bakery-photos/${slug}.jpg`;
        try {
          await blobDel(`https://wfmolibajntmnqfo.public.blob.vercel-storage.com/${blobPath}`, { token: BLOB_TOKEN });
        } catch {}

        await put(blobPath, buffer, {
          access: 'public', addRandomSuffix: false, contentType: 'image/jpeg', token: BLOB_TOKEN,
        });

        progress[slug] = 'ok';
        return 'ok';
      } catch { continue; }
    }

    progress[slug] = 'download-fail';
    return 'download-fail';
  } catch {
    progress[slug] = 'error';
    return 'error';
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ───
async function main() {
  console.log('Loading bar database...');

  const g50 = loadG50();
  const dbBars = loadTopBars(15000);
  const allBars = [...g50, ...dbBars];

  // Deduplicate
  const seen = new Set();
  const unique = allBars.filter(b => {
    const s = bakerySlug(b.name, b.city);
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });

  console.log(`Total unique bars: ${unique.length}`);

  let barsToProcess;

  if (FIX_BAD) {
    // Re-download bad photos (under 15KB in Blob)
    const badSlugs = JSON.parse(fs.readFileSync('/tmp/bad-photo-slugs.json', 'utf8'));
    const badSet = new Set(badSlugs);
    barsToProcess = unique.filter(b => badSet.has(bakerySlug(b.name, b.city)));
    console.log(`Fix-bad mode: ${barsToProcess.length} bars with bad photos`);
  } else {
    barsToProcess = unique.slice(OFFSET, OFFSET + LIMIT);
  }

  const progress = loadProgress();

  console.log(`Processing ${barsToProcess.length} bars`);
  console.log(`Concurrency: ${CONCURRENCY}, delay: ${DELAY_MS}ms\n`);

  let ok = 0, noImages = 0, failed = 0, skipped = 0;
  const startTime = Date.now();

  for (let i = 0; i < barsToProcess.length; i += CONCURRENCY) {
    const batch = barsToProcess.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(b => processBar(b, progress)));

    for (const r of results) {
      if (r === 'ok') ok++;
      else if (r === 'skip') skipped++;
      else if (r === 'no-images') noImages++;
      else failed++;
    }

    if ((i / CONCURRENCY) % 10 === 0) saveProgress(progress);

    const done = Math.min(i + CONCURRENCY, barsToProcess.length);
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = (ok / (elapsed || 1) * 60).toFixed(1);
    const eta = ok > 0 ? (((barsToProcess.length - done) / (ok / elapsed)) / 60).toFixed(0) : '?';
    process.stdout.write(`\r  ${done}/${barsToProcess.length} — ${ok} uploaded — ${noImages} no-img, ${failed} fail, ${skipped} skip — ${rate}/min — ETA ${eta}m`);

    if (i + CONCURRENCY < barsToProcess.length) await sleep(DELAY_MS);
  }

  saveProgress(progress);
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n\nDone in ${totalTime} minutes!`);
  console.log(`  Uploaded: ${ok}`);
  console.log(`  No images: ${noImages}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Skipped: ${skipped}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
