#!/usr/bin/env node
// scripts/upload-to-blob.js
// Uploads local photos (and data JSON files) to Vercel Blob Storage
// Run: node scripts/upload-to-blob.js
//
// Requires BLOB_READ_WRITE_TOKEN in .env.local (run: npx vercel env pull .env.local)

const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Load .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Missing .env.local — run: npx vercel env pull .env.local');
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

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!BLOB_TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN in .env.local');
  process.exit(1);
}

const PROGRESS_FILE = path.join(__dirname, 'upload-progress.json');
const PHOTOS_DIR = path.join(__dirname, '..', 'public', 'photos');
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

// Concurrency limit
const CONCURRENCY = 10;

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return { uploaded: {} };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
}

async function uploadFile(localPath, blobPath, progress) {
  if (progress.uploaded[blobPath]) return 'skip';

  const content = fs.readFileSync(localPath);
  const contentType = blobPath.endsWith('.json') ? 'application/json' : 'image/jpeg';

  try {
    await put(blobPath, content, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      token: BLOB_TOKEN,
    });
    progress.uploaded[blobPath] = true;
    return 'ok';
  } catch (err) {
    console.error(`  Failed: ${blobPath} — ${err.message}`);
    return 'fail';
  }
}

async function main() {
  const progress = loadProgress();
  const alreadyDone = Object.keys(progress.uploaded).length;

  // Collect files to upload
  const files = [];

  // Photos
  if (fs.existsSync(PHOTOS_DIR)) {
    const photos = fs.readdirSync(PHOTOS_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
    for (const file of photos) {
      const blobPath = `bakery-photos/${file}`;
      if (!progress.uploaded[blobPath]) {
        files.push({ local: path.join(PHOTOS_DIR, file), blob: blobPath });
      }
    }
    const photosAlreadyUploaded = photos.length - files.filter(f => f.blob.startsWith('bakery-photos/')).length;
    console.log(`Photos: ${photos.length} total, ${photosAlreadyUploaded} already uploaded`);
  } else {
    console.log('No public/photos/ directory found — skipping photos');
  }

  // Data JSON files
  if (fs.existsSync(DATA_DIR)) {
    const dataFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const newData = [];
    for (const file of dataFiles) {
      const blobPath = `bar-data/${file}`;
      if (!progress.uploaded[blobPath]) {
        files.push({ local: path.join(DATA_DIR, file), blob: blobPath });
        newData.push(file);
      }
    }
    console.log(`Data files: ${dataFiles.length} total, ${dataFiles.length - newData.length} already uploaded`);
  } else {
    console.log('No public/data/ directory found — skipping data files');
  }

  if (files.length === 0) {
    console.log('\nAll files already uploaded!');
    return;
  }

  console.log(`\nUploading ${files.length} files to Vercel Blob (${CONCURRENCY} concurrent)...\n`);

  let ok = 0, fail = 0, skip = 0;
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(f => uploadFile(f.local, f.blob, progress))
    );

    for (const r of results) {
      if (r === 'ok') ok++;
      else if (r === 'fail') fail++;
      else skip++;
    }

    // Save progress every batch
    saveProgress(progress);

    const total = ok + fail + skip;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const rate = (ok / (elapsed || 1)).toFixed(1);
    process.stdout.write(`\r  ${total}/${files.length} — ${ok} uploaded, ${fail} failed — ${rate} files/sec — ${elapsed}s elapsed`);
  }

  saveProgress(progress);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\nDone! ${ok} uploaded, ${fail} failed, ${skip} skipped in ${totalTime}s`);
  console.log(`Total files in Blob: ${Object.keys(progress.uploaded).length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
