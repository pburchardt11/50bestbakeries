#!/usr/bin/env node
// scripts/upload-stock-fallbacks.mjs
// Downloads 10 bakery-themed Unsplash stock photos and uploads them to Blob
// as fallbacks for bakeries without real photos
//
// Each bakery gets assigned a deterministic stock photo based on its name hash
// Uploaded to bakery-photos/{slug}.jpg in Blob

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!BLOB_TOKEN) {
  console.error('Set BLOB_READ_WRITE_TOKEN env var');
  process.exit(1);
}

const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=500&fit=crop', // croissants
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=500&fit=crop', // pastry display
  'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=500&fit=crop', // bread loaves
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=500&fit=crop', // artisan bread
  'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&h=500&fit=crop', // baker at work
  'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&h=500&fit=crop', // french patisserie
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=500&fit=crop', // bakery counter
  'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&h=500&fit=crop', // sourdough
  'https://images.unsplash.com/photo-1546538490-0fe0a8eba4e6?w=800&h=500&fit=crop', // macarons
  'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=800&h=500&fit=crop', // cupcakes and cakes
];

function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function bakerySlug(name, city) {
  const n = toSlug(name), c = toSlug(city);
  return n.endsWith(c) ? n : n + '-' + c;
}
function barHash(name, location) {
  let h = 0;
  const s = name + location;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

async function main() {
  // Step 1: Download the 10 stock images locally
  console.log('Downloading 10 stock images...');
  const stockDir = path.join(__dirname, '_stock_photos');
  if (!fs.existsSync(stockDir)) fs.mkdirSync(stockDir);

  const stockBuffers = [];
  for (let i = 0; i < STOCK_IMAGES.length; i++) {
    const localPath = path.join(stockDir, `stock-${i}.jpg`);
    if (!fs.existsSync(localPath)) {
      const res = await fetch(STOCK_IMAGES[i], { redirect: 'follow' });
      if (!res.ok) { console.error(`Failed to download stock ${i}`); continue; }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(localPath, buffer);
      console.log(`  Downloaded stock-${i}.jpg (${(buffer.length / 1024).toFixed(0)} KB)`);
    }
    stockBuffers.push(fs.readFileSync(localPath));
  }
  console.log(`Got ${stockBuffers.length} stock images\n`);

  // Step 2: Get list of all bakery slugs
  console.log('Loading all bakery slugs...');
  const tmpScript = path.join(__dirname, '_tmp_slugs.js');
  const tmpOutput = path.join(__dirname, '_tmp_slugs.json');
  fs.writeFileSync(tmpScript, `
const fs = require('fs');
const content = fs.readFileSync(${JSON.stringify(path.join(ROOT, 'lib', 'bakery-data.js'))}, 'utf8');
const jsonStart = content.indexOf('{');
const jsonEnd = content.lastIndexOf('}');
const DB = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
const slugs = [];
function toSlug(str) { return str.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function bakerySlug(name, city) { const n = toSlug(name), c = toSlug(city); return n.endsWith(c) ? n : n + '-' + c; }
function barHash(name, loc) { let h = 0; const s = name + loc; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }
for (const [country, cities] of Object.entries(DB)) {
  for (const [city, entries] of Object.entries(cities)) {
    for (const e of entries) {
      slugs.push({ slug: bakerySlug(e[0], city), hash: barHash(e[0], city) });
    }
  }
}
fs.writeFileSync(${JSON.stringify(tmpOutput)}, JSON.stringify(slugs));
console.log('Slugs:', slugs.length);
`);
  execSync(`node --max-old-space-size=4096 ${tmpScript}`, { maxBuffer: 10 * 1024 * 1024 });
  fs.unlinkSync(tmpScript);
  const allSlugs = JSON.parse(fs.readFileSync(tmpOutput, 'utf8'));
  fs.unlinkSync(tmpOutput);
  console.log(`Total bakery slugs: ${allSlugs.length}\n`);

  // Step 3: Get list of existing photos in Blob
  console.log('Listing existing photos in Blob...');
  const { list, put } = await import('@vercel/blob');
  const existingSlugs = new Set();
  let cursor;
  do {
    const result = await list({ limit: 1000, cursor, prefix: 'bakery-photos/', token: BLOB_TOKEN });
    for (const blob of result.blobs) {
      existingSlugs.add(blob.pathname.replace('bakery-photos/', '').replace('.jpg', ''));
    }
    cursor = result.cursor;
  } while (cursor);
  console.log(`Existing photos in Blob: ${existingSlugs.size}`);

  // Step 4: Find bakeries without photos
  const missing = allSlugs.filter(s => !existingSlugs.has(s.slug));
  console.log(`Bars without photos: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log('All bars have photos!');
    return;
  }

  // Step 5: Upload stock photos for missing bars
  console.log(`Uploading stock photos for ${missing.length} bars...`);
  const CONCURRENCY = 20;
  let uploaded = 0, failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < missing.length; i += CONCURRENCY) {
    const batch = missing.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(async ({ slug, hash }) => {
      const stockIdx = hash % stockBuffers.length;
      try {
        await put(`bakery-photos/${slug}.jpg`, stockBuffers[stockIdx], {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'image/jpeg',
          token: BLOB_TOKEN,
        });
        return 'ok';
      } catch {
        return 'fail';
      }
    }));

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value === 'ok') uploaded++;
      else failed++;
    }

    const done = Math.min(i + CONCURRENCY, missing.length);
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = (uploaded / (elapsed || 1)).toFixed(1);
    const eta = uploaded > 0 ? (((missing.length - done) / (uploaded / elapsed)) / 60).toFixed(0) : '?';
    if (done % 500 === 0 || done === missing.length) {
      process.stdout.write(`\r  ${done}/${missing.length} — ${uploaded} uploaded, ${failed} failed — ${rate}/sec — ETA ${eta}m`);
    }
  }

  console.log(`\n\nDone! Uploaded ${uploaded} stock photos, ${failed} failed.`);
  console.log(`Total photos in Blob now: ${existingSlugs.size + uploaded}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
