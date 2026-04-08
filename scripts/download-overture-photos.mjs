// scripts/download-overture-photos.mjs
// Downloads photos for bakeries from a photo download list
// Usage: node scripts/download-overture-photos.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PHOTO_DIR = path.join(ROOT, 'public/photos');
const PROGRESS_FILE = path.join(__dirname, 'photo-download-progress.json');

if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR, { recursive: true });

const listFile = path.join(__dirname, 'photo-download-list.json');
if (!fs.existsSync(listFile)) {
  console.error('photo-download-list.json not found. Run import-overture-bars.mjs first.');
  process.exit(1);
}

const photoList = JSON.parse(fs.readFileSync(listFile, 'utf8'));
console.log(`Photos to download: ${photoList.length}`);

// Load progress
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
}

let downloaded = 0, failed = 0, skipped = 0;
const CONCURRENCY = 10;

async function downloadPhoto(item) {
  const { slug, photo } = item;

  if (progress[slug]) { skipped++; return; }
  if (fs.existsSync(path.join(PHOTO_DIR, `${slug}.jpg`))) {
    progress[slug] = true;
    skipped++;
    return;
  }

  try {
    const res = await fetch(photo, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (!res.ok) { failed++; progress[slug] = 'failed'; return; }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) { failed++; progress[slug] = 'failed'; return; } // too small

    fs.writeFileSync(path.join(PHOTO_DIR, `${slug}.jpg`), buffer);
    progress[slug] = true;
    downloaded++;
  } catch (e) {
    failed++;
    progress[slug] = 'failed';
  }
}

// Process in batches
for (let i = 0; i < photoList.length; i += CONCURRENCY) {
  const batch = photoList.slice(i, i + CONCURRENCY);
  await Promise.all(batch.map(downloadPhoto));

  // Save progress every 50 batches
  if ((i / CONCURRENCY) % 50 === 0) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
  }

  if ((i + CONCURRENCY) % 500 === 0 || i + CONCURRENCY >= photoList.length) {
    console.log(`  ${i + batch.length}/${photoList.length} — ${downloaded} downloaded, ${failed} failed, ${skipped} skipped`);
  }
}

// Final save
fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
console.log(`\nDone! Downloaded: ${downloaded}, Failed: ${failed}, Skipped: ${skipped}`);
