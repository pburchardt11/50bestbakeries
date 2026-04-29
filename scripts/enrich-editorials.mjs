// scripts/enrich-editorials.mjs
// Phase 4: Google Places enrichment for editorial bakeries.
// Test batch mode (--limit N) writes enriched JSON + uploads photos to Blob.
//
// Cost per bakery: 1 Find Place ($0.017) + 1 Details ($0.017) + up to 5 Photos ($0.007 each) = ~$0.069
//
// Run: node --env-file=.env.local scripts/enrich-editorials.mjs --limit=10

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { put } from '@vercel/blob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENRICHED_DIR = path.join(ROOT, 'lib/enriched-data');
fs.mkdirSync(ENRICHED_DIR, { recursive: true });

const KEY = process.env.GOOGLE_PLACES_API_KEY;
const BLOB_TOKEN = process.env.Bakeries_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
if (!KEY) { console.error('GOOGLE_PLACES_API_KEY missing'); process.exit(1); }
if (!BLOB_TOKEN) { console.error('Blob token missing'); process.exit(1); }

const argLimit = process.argv.find(a => a.startsWith('--limit='));
const LIMIT = argLimit ? parseInt(argLimit.split('=')[1], 10) : 10;
const argPhotos = process.argv.find(a => a.startsWith('--photos='));
const MAX_PHOTOS = argPhotos ? parseInt(argPhotos.split('=')[1], 10) : 5;
const argDryRun = process.argv.includes('--dry-run');
const argAllEditorial = process.argv.includes('--all-editorial');
const argFromLookup = process.argv.includes('--from-lookup');
const argSkipEnriched = !process.argv.includes('--force');

console.log(`Phase 4 enrichment — limit=${LIMIT}, photos=${MAX_PHOTOS}${argDryRun ? ' (DRY RUN)' : ''}${argFromLookup ? ' (FROM LOOKUP)' : argAllEditorial ? ' (ALL editorial)' : ' (curated only)'}${argSkipEnriched ? ' (skip already-enriched)' : ''}`);

// ─── Cost tracking ───
const COST = { findPlace: 0, details: 0, photos: 0, totalCalls: 0 };
const PRICE = { findPlace: 0.017, details: 0.017, photo: 0.007 };
function logCost() {
  const total = COST.findPlace * PRICE.findPlace + COST.details * PRICE.details + COST.photos * PRICE.photo;
  console.log(`  cost: $${total.toFixed(4)} (find=${COST.findPlace}, details=${COST.details}, photos=${COST.photos})`);
  return total;
}

// ─── Slug helper ───
function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function bakerySlug(name, city) {
  const ns = toSlug(name), cs = toSlug(city || '');
  return cs && !ns.endsWith(cs) ? ns + '-' + cs : ns;
}

// ─── Load sources ───
let rawPool = [];

if (argFromLookup) {
  // Read directly from editorial-lookup.json (all editorial bakeries)
  const lookupData = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/editorial-lookup.json'), 'utf8'));
  for (const [key, entry] of Object.entries(lookupData)) {
    rawPool.push({
      name: entry.name,
      city: entry.city,
      country: entry.country,
      editorialScore: entry.s || 0,
      googlePlaceId: entry.googlePlaceId || null,
    });
  }
} else {
  const { EDITORIAL_BAKERIES } = await import('../lib/editorial-data.js');
  rawPool = argAllEditorial
    ? EDITORIAL_BAKERIES.map(b => ({ name: b.name, city: b.city, country: b.country, editorialScore: 0 }))
    : EDITORIAL_BAKERIES.filter(b => b.sources?.some(s => s.name === 'Curated')).map(b => ({ name: b.name, city: b.city, country: b.country, editorialScore: 0 }));
}

// Build set of already-enriched slugs
const alreadyEnriched = new Set();
if (argSkipEnriched && fs.existsSync(ENRICHED_DIR)) {
  for (const f of fs.readdirSync(ENRICHED_DIR)) {
    if (f.endsWith('.json') && !f.startsWith('_')) {
      alreadyEnriched.add(f.replace(/\.json$/, ''));
    }
  }
}

function slugify(name, city) {
  const ns = toSlug(name), cs = toSlug(city || '');
  return cs && !ns.endsWith(cs) ? ns + '-' + cs : ns;
}

// Skip already-enriched
let pool = rawPool.filter(b => !alreadyEnriched.has(slugify(b.name, b.city)));

const candidates = pool
  .sort((a, b) => (b.editorialScore || 0) - (a.editorialScore || 0) || (a.country || '').localeCompare(b.country || ''))
  .slice(0, LIMIT);

console.log(`Pool: ${pool.length} (from ${rawPool.length} total). Already enriched: ${alreadyEnriched.size}. Selected: ${candidates.length}.`);
if (candidates.length <= 20) {
  for (const c of candidates) console.log(`  - ${c.name} (${c.city}, ${c.country})`);
}
console.log();

// ─── Helper: Google Places Find Place ───
async function findPlace(name, city, country) {
  const q = `${name} ${city || ''} ${country}`.trim();
  const url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
    + '?input=' + encodeURIComponent(q)
    + '&inputtype=textquery'
    + '&fields=place_id,name,formatted_address,rating,user_ratings_total,geometry'
    + '&language=en'
    + '&key=' + KEY;
  COST.findPlace++;
  COST.totalCalls++;
  const r = await fetch(url);
  return r.json();
}

// ─── Helper: Google Places Details ───
async function placeDetails(placeId) {
  const url = 'https://maps.googleapis.com/maps/api/place/details/json'
    + '?place_id=' + encodeURIComponent(placeId)
    + '&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,url,rating,user_ratings_total,opening_hours,geometry,photos,price_level,types,business_status,editorial_summary'
    + '&language=en'
    + '&key=' + KEY;
  COST.details++;
  COST.totalCalls++;
  const r = await fetch(url);
  return r.json();
}

// ─── Helper: Download a Google Place photo and upload to Blob ───
async function downloadPhotoToBlob(photoReference, slug, idx) {
  const url = 'https://maps.googleapis.com/maps/api/place/photo'
    + '?maxwidth=1200'
    + '&photo_reference=' + encodeURIComponent(photoReference)
    + '&key=' + KEY;
  COST.photos++;
  COST.totalCalls++;
  const r = await fetch(url, { redirect: 'follow' });
  if (!r.ok) throw new Error('photo HTTP ' + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  if (argDryRun) return { skipped: 'dry-run', size: buf.length };
  const uploaded = await put(`bakery-photos/${slug}/${idx}.jpg`, buf, {
    access: 'private',
    token: BLOB_TOKEN,
    contentType: 'image/jpeg',
  });
  return { url: uploaded.url, size: buf.length };
}

// ─── Run enrichment ───
const results = [];
for (let i = 0; i < candidates.length; i++) {
  const c = candidates[i];
  const slug = bakerySlug(c.name, c.city);
  console.log(`\n[${i+1}/${candidates.length}] ${c.name}`);

  try {
    // 1. Find Place
    const find = await findPlace(c.name, c.city, c.country);
    if (find.status !== 'OK' || !find.candidates?.length) {
      console.log(`  ✗ findPlace ${find.status}`);
      results.push({ slug, name: c.name, city: c.city, country: c.country, error: 'findPlace ' + find.status });
      continue;
    }
    const placeId = find.candidates[0].place_id;
    console.log(`  ✓ findPlace → ${placeId}`);

    // 2. Place Details
    const details = await placeDetails(placeId);
    if (details.status !== 'OK') {
      console.log(`  ✗ details ${details.status}`);
      results.push({ slug, name: c.name, city: c.city, country: c.country, error: 'details ' + details.status });
      continue;
    }
    const d = details.result;
    console.log(`  ✓ details — rating ${d.rating}/${d.user_ratings_total} reviews, ${d.photos?.length || 0} photos available`);

    // 3. Download up to 5 photos
    const photoUrls = [];
    const photos = (d.photos || []).slice(0, MAX_PHOTOS);
    for (let p = 0; p < photos.length; p++) {
      try {
        const u = await downloadPhotoToBlob(photos[p].photo_reference, slug, p);
        photoUrls.push(u);
        console.log(`    photo ${p+1}/${photos.length}: ${(u.size/1024).toFixed(0)}KB`);
      } catch (e) {
        console.log(`    photo ${p+1}/${photos.length}: FAIL ${e.message}`);
      }
    }

    // 4. Build enriched record
    const enriched = {
      slug,
      name: c.name,
      curatedName: c.name,
      city: c.city,
      country: c.country,
      placeId,
      googleName: d.name,
      formattedAddress: d.formatted_address,
      phone: d.formatted_phone_number || null,
      internationalPhone: d.international_phone_number || null,
      website: d.website || null,
      googleMapsUrl: d.url || null,
      rating: d.rating || null,
      reviewCount: d.user_ratings_total || null,
      priceLevel: d.price_level ?? null,
      types: d.types || [],
      businessStatus: d.business_status || null,
      coords: d.geometry?.location ? [d.geometry.location.lat, d.geometry.location.lng] : null,
      openingHours: d.opening_hours?.weekday_text || null,
      editorialSummary: d.editorial_summary?.overview || null,
      photoUrls: photoUrls.map(p => p.url || p.skipped).filter(Boolean),
      enrichedAt: new Date().toISOString(),
    };

    fs.writeFileSync(path.join(ENRICHED_DIR, slug + '.json'), JSON.stringify(enriched, null, 2));
    results.push(enriched);
    logCost();
  } catch (e) {
    console.log(`  ✗ ${e.message}`);
    results.push({ slug, name: c.name, city: c.city, country: c.country, error: e.message });
  }

  // small delay to avoid bursting
  await new Promise(r => setTimeout(r, 200));
}

// ─── Final summary ───
console.log('\n─── Phase 4 Test Batch Summary ───');
const total = logCost();
const ok = results.filter(r => !r.error).length;
const failed = results.filter(r => r.error).length;
console.log(`OK:     ${ok}`);
console.log(`Failed: ${failed}`);
console.log(`Total cost: $${total.toFixed(4)}`);
console.log(`Avg per bakery: $${(total / candidates.length).toFixed(4)}`);
console.log(`Projected cost for 737 bakeries: $${((total / candidates.length) * 737).toFixed(2)}`);

fs.writeFileSync(path.join(ENRICHED_DIR, '_batch-results.json'), JSON.stringify(results, null, 2));
console.log(`\nResults written to ${path.relative(ROOT, ENRICHED_DIR)}/`);
