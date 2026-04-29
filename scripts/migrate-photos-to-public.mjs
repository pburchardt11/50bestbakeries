// scripts/migrate-photos-to-public.mjs
// Copies all photos from the private Blob store to the new public Blob store.
// Then updates lib/enriched-data/*.json with the new public URLs.
//
// Usage: node --env-file=.env.local scripts/migrate-photos-to-public.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { get, put } from '@vercel/blob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENRICHED_DIR = path.join(ROOT, 'lib/enriched-data');

const PRIVATE_TOKEN = process.env.Bakeries_READ_WRITE_TOKEN;
const PUBLIC_TOKEN = process.env.BLOB2_READ_WRITE_TOKEN;
if (!PRIVATE_TOKEN) { console.error('Bakeries_READ_WRITE_TOKEN required'); process.exit(1); }
if (!PUBLIC_TOKEN) { console.error('BLOB2_READ_WRITE_TOKEN required'); process.exit(1); }

const files = fs.readdirSync(ENRICHED_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
console.log(`Migrating photos for ${files.length} enriched bakeries\n`);

let migrated = 0, skipped = 0, failed = 0;

for (let i = 0; i < files.length; i++) {
  const fp = path.join(ENRICHED_DIR, files[i]);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));

  if (!data.photoUrls || data.photoUrls.length === 0) { skipped++; continue; }

  const newUrls = [];
  let changed = false;

  for (const url of data.photoUrls) {
    if (!url || !url.includes('private.blob.vercel-storage.com')) {
      newUrls.push(url); // Already public or non-blob
      continue;
    }

    try {
      // Extract the pathname from the private URL
      const u = new URL(url);
      const pathname = u.pathname.replace(/^\/+/, '');

      // Download from private store
      const blob = await get(pathname, { token: PRIVATE_TOKEN, access: 'private' });
      if (!blob || blob.statusCode >= 400) { newUrls.push(url); failed++; continue; }

      // Read the stream into a buffer
      const chunks = [];
      for await (const chunk of blob.stream) chunks.push(chunk);
      const buf = Buffer.concat(chunks);

      // Upload to public store
      const uploaded = await put(pathname, buf, {
        access: 'public',
        token: PUBLIC_TOKEN,
        contentType: 'image/jpeg',
      });

      newUrls.push(uploaded.url);
      changed = true;
      migrated++;
    } catch (e) {
      newUrls.push(url); // Keep old URL on failure
      failed++;
    }
  }

  if (changed) {
    data.photoUrls = newUrls;
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
  }

  if ((i + 1) % 200 === 0 || i < 3)
    console.log(`[${i + 1}/${files.length}] migrated: ${migrated}, skipped: ${skipped}, failed: ${failed}`);

  // Small delay to avoid rate limiting
  if (changed) await new Promise(r => setTimeout(r, 50));
}

console.log(`\n─── Migration Summary ───`);
console.log(`Migrated: ${migrated} photos`);
console.log(`Skipped (no photos): ${skipped}`);
console.log(`Failed: ${failed}`);
console.log(`Total files processed: ${files.length}`);
