// scripts/enrich-top50-countries.mjs
// Enriches the top 50 bakeries per country that don't yet have enriched data.
// Uses Google Places Find Place + Details + 1 photo, uploads to Blob.
//
// Usage: node --env-file=.env.local scripts/enrich-top50-countries.mjs
//
// Cost: ~$0.041 per bakery (Find Place $0.017 + Details $0.017 + 1 Photo $0.007)

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
if (!KEY) { console.error('GOOGLE_PLACES_API_KEY required'); process.exit(1); }
if (!BLOB_TOKEN) { console.error('Blob token required'); process.exit(1); }

// ─── Load DB + lookup + existing enriched ───
const src = fs.readFileSync(path.join(ROOT, 'lib/bakery-data.js'), 'utf8');
const m = src.match(/export const DB\s*=\s*(\{[\s\S]*?\});?\s*$/);
const DB = JSON.parse(m[1]);
const lookup = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/editorial-lookup.json'), 'utf8'));

const enrichedFiles = new Set(
  fs.readdirSync(ENRICHED_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => f.replace('.json', ''))
);

function toSlug(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function slugify(name, city) { const ns = toSlug(name), cs = toSlug(city || ''); return cs && !ns.endsWith(cs) ? ns + '-' + cs : ns; }
function editKey(name, city) {
  return (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim() + '|' +
    (city || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Build candidates: top 50 per country, not yet enriched ───
const candidates = [];
for (const country of Object.keys(DB)) {
  const all = [];
  for (const city of Object.keys(DB[country])) {
    for (const entry of DB[country][city]) {
      const slug = slugify(entry[0], city);
      const ek = editKey(entry[0], city);
      const score = lookup[ek]?.s || 0;
      const rating = entry[1] / 10;
      all.push({ name: entry[0], city, country, slug, score, rating, enriched: enrichedFiles.has(slug) });
    }
  }
  all.sort((a, b) => (b.score - a.score) || (b.rating - a.rating));
  const top50 = all.slice(0, 50);
  for (const b of top50) {
    if (!b.enriched) candidates.push(b);
  }
}

console.log(`Top-50-per-country enrichment`);
console.log(`Candidates: ${candidates.length} (across ${Object.keys(DB).length} countries)`);
console.log(`Already enriched: ${enrichedFiles.size}`);
console.log(`Estimated cost: $${(candidates.length * 0.041).toFixed(2)}\n`);

// ─── Cost tracking ───
let totalCost = 0;
let ok = 0, failed = 0;

// ─── Google Places helpers ───
async function findPlace(name, city, country) {
  const q = `${name} ${city || ''} ${country}`.trim();
  const url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
    + '?input=' + encodeURIComponent(q)
    + '&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total,geometry&language=en&key=' + KEY;
  totalCost += 0.017;
  return (await fetch(url)).json();
}

async function placeDetails(placeId) {
  const url = 'https://maps.googleapis.com/maps/api/place/details/json'
    + '?place_id=' + encodeURIComponent(placeId)
    + '&fields=name,formatted_address,formatted_phone_number,website,url,rating,user_ratings_total,opening_hours,geometry,photos,business_status,editorial_summary&language=en&key=' + KEY;
  totalCost += 0.017;
  return (await fetch(url)).json();
}

async function downloadPhoto(photoRef, slug) {
  const url = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=' + encodeURIComponent(photoRef) + '&key=' + KEY;
  totalCost += 0.007;
  const r = await fetch(url, { redirect: 'follow' });
  if (!r.ok) return null;
  const buf = Buffer.from(await r.arrayBuffer());
  const uploaded = await put(`bakery-photos/${slug}/0.jpg`, buf, { access: 'private', token: BLOB_TOKEN, contentType: 'image/jpeg' });
  return { url: uploaded.url, size: buf.length };
}

// ─── Process ───
for (let i = 0; i < candidates.length; i++) {
  const c = candidates[i];

  if (i % 100 === 0 || i < 5)
    console.log(`[${i + 1}/${candidates.length}] ${c.name} (${c.city}, ${c.country}) — $${totalCost.toFixed(2)}`);

  try {
    const find = await findPlace(c.name, c.city, c.country);
    if (find.status !== 'OK' || !find.candidates?.length) { failed++; continue; }

    const placeId = find.candidates[0].place_id;
    const details = await placeDetails(placeId);
    if (details.status !== 'OK') { failed++; continue; }

    const d = details.result;
    let photoUrl = null;
    if (d.photos?.length > 0) {
      const p = await downloadPhoto(d.photos[0].photo_reference, c.slug);
      if (p) photoUrl = p.url;
    }

    const enriched = {
      slug: c.slug,
      name: c.name,
      city: c.city,
      country: c.country,
      placeId,
      googleName: d.name,
      formattedAddress: d.formatted_address,
      phone: d.formatted_phone_number || null,
      website: d.website || null,
      googleMapsUrl: d.url || null,
      rating: d.rating || null,
      reviewCount: d.user_ratings_total || null,
      coords: d.geometry?.location ? [d.geometry.location.lat, d.geometry.location.lng] : null,
      openingHours: d.opening_hours?.weekday_text || null,
      editorialSummary: d.editorial_summary?.overview || null,
      photoUrls: photoUrl ? [photoUrl] : [],
      enrichedAt: new Date().toISOString(),
    };

    fs.writeFileSync(path.join(ENRICHED_DIR, c.slug + '.json'), JSON.stringify(enriched, null, 2));
    ok++;
  } catch (e) {
    failed++;
  }

  await new Promise(r => setTimeout(r, 150));
}

console.log(`\n─── Top-50 Country Enrichment Summary ───`);
console.log(`OK: ${ok} | Failed: ${failed}`);
console.log(`Total cost: $${totalCost.toFixed(2)}`);
console.log(`Total enriched files: ${fs.readdirSync(ENRICHED_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_')).length}`);
