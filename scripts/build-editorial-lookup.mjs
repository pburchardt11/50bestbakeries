// scripts/build-editorial-lookup.mjs
// Builds lib/editorial-lookup.json — a pre-computed lookup mapping every
// bakery with editorial mentions to { score, badges, sources }.
//
// Mirrors spa-review.com's approach:
// 1. Load all editorial sources (curated, wikidata, wikipedia, city-editorials)
// 2. Fuzzy-match each editorial mention against the bakery DB
// 3. Score each bakery using: tierWeight × mentionTypeWeight + rankBonus × scopeMultiplier × recencyMultiplier
// 4. Select top 3 badges per bakery
// 5. Output JSON keyed by "normalized_name|normalized_city"
//
// Usage: node scripts/build-editorial-lookup.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SOURCES, MENTION_TYPE_WEIGHT, SCOPE_MULTIPLIER, getRecencyMultiplier } from '../lib/editorial-sources.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'lib/editorial-sources');

// ─── Normalize for matching ───
function norm(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}
function lookupKey(name, city) {
  return norm(name) + '|' + norm(city);
}

// ─── Load DB ───
const src = fs.readFileSync(path.join(ROOT, 'lib/bakery-data.js'), 'utf8');
const m = src.match(/export const DB\s*=\s*(\{[\s\S]*?\});?\s*$/);
const DB = JSON.parse(m[1]);

// Build word index for fuzzy matching (same approach as spa-review)
const dbIndex = new Map(); // key → { name, city, country, entry }
for (const country of Object.keys(DB)) {
  for (const city of Object.keys(DB[country])) {
    for (const entry of DB[country][city]) {
      const key = lookupKey(entry[0], city);
      if (!dbIndex.has(key)) {
        dbIndex.set(key, { name: entry[0], city, country, entry });
      }
    }
  }
}
console.log('DB index:', dbIndex.size, 'entries');

// ─── Load all editorial sources ───
function loadJson(filename) {
  const fp = path.join(SRC_DIR, filename);
  return fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : [];
}

// 1. City editorials from Google Places
const cityEditorials = loadJson('city-editorials.json');

// 2. Curated picks
const curated = loadJson('curated.json');

// 3. Wikidata
const wikidata = loadJson('wikidata.json');

// 4. Wikipedia list
const wikiList = loadJson('wikipedia-list.json');

// Normalize all mentions into a unified format
const allMentions = [];

for (const e of cityEditorials) {
  allMentions.push({
    name: e.name,
    city: e.city,
    country: e.country,
    sourceId: e.sourceId || 'google-top-rated',
    mentionType: e.mentionType || 'UNRANKED_LIST',
    rank: e.rank || null,
    scope: e.scope || 'city',
    year: e.year || 2026,
    displayLabel: e.displayLabel || e.name,
    googleRating: e.googleRating || null,
    googleReviews: e.googleReviews || null,
    googlePlaceId: e.googlePlaceId || null,
  });
}

for (const e of curated) {
  allMentions.push({
    name: e.name,
    city: e.city,
    country: e.country,
    sourceId: 'curated',
    mentionType: 'RANKED_LIST',
    rank: null,
    scope: 'country',
    year: 2026,
    displayLabel: '50 Best Bakeries Pick',
  });
}

for (const e of wikidata) {
  if (!e.name || !e.country) continue;
  allMentions.push({
    name: e.name,
    city: e.city || '',
    country: e.country,
    sourceId: 'wikidata',
    mentionType: 'UNRANKED_LIST',
    rank: null,
    scope: e.city ? 'city' : 'country',
    year: 2024,
    displayLabel: 'Wikidata',
  });
}

for (const e of wikiList) {
  allMentions.push({
    name: e.name,
    city: e.city || '',
    country: e.country,
    sourceId: 'wikipedia',
    mentionType: 'UNRANKED_LIST',
    rank: null,
    scope: 'country',
    year: 2024,
    displayLabel: 'Wikipedia',
  });
}

console.log('Total mentions:', allMentions.length);
console.log('  city-editorials:', cityEditorials.length);
console.log('  curated:', curated.length);
console.log('  wikidata:', wikidata.length);
console.log('  wikipedia:', wikiList.length);

// ─── Match mentions against DB and score ───
const lookup = {}; // key → { s: score, mentions: [...], b: badges }

let matched = 0, unmatched = 0;

for (const mention of allMentions) {
  const key = lookupKey(mention.name, mention.city);
  const dbEntry = dbIndex.get(key);

  if (!dbEntry) {
    // Try fallback: match by name only within the country
    // (handles city name mismatches)
    let found = false;
    const normName = norm(mention.name);
    for (const [k, v] of dbIndex) {
      if (k.startsWith(normName + '|') && v.country === mention.country) {
        const fallbackKey = k;
        if (!lookup[fallbackKey]) lookup[fallbackKey] = { s: 0, mentions: [], name: v.name, city: v.city, country: v.country };
        scoreMention(lookup[fallbackKey], mention);
        matched++;
        found = true;
        break;
      }
    }
    if (!found) unmatched++;
    continue;
  }

  if (!lookup[key]) lookup[key] = { s: 0, mentions: [], name: dbEntry.name, city: dbEntry.city, country: dbEntry.country };
  scoreMention(lookup[key], mention);
  matched++;
}

function scoreMention(entry, mention) {
  const source = SOURCES[mention.sourceId];
  if (!source) return;

  const tierWeight = source.weight;
  const mentionWeight = MENTION_TYPE_WEIGHT[mention.mentionType] || 0.5;
  const rankBonus = mention.rank ? (mention.rank <= 3 ? 0.3 : mention.rank <= 10 ? 0.15 : 0.05) : 0;
  const scopeMult = SCOPE_MULTIPLIER[mention.scope] || 1.0;
  const recencyMult = getRecencyMultiplier(mention.year);

  const score = (tierWeight * mentionWeight + rankBonus) * scopeMult * recencyMult;
  entry.s += score;
  entry.mentions.push({
    sourceId: mention.sourceId,
    label: mention.displayLabel,
    color: source.color,
    bg: source.bg,
    border: source.border,
    score,
    googleRating: mention.googleRating || null,
    googleReviews: mention.googleReviews || null,
    googlePlaceId: mention.googlePlaceId || null,
  });
}

console.log('\nMatched:', matched, '| Unmatched:', unmatched);

// ─── Select top 3 badges per bakery (highest score) ───
for (const key of Object.keys(lookup)) {
  const entry = lookup[key];
  // Dedupe by sourceId (keep highest-scoring mention per source)
  const bySource = {};
  for (const m of entry.mentions) {
    if (!bySource[m.sourceId] || m.score > bySource[m.sourceId].score) {
      bySource[m.sourceId] = m;
    }
  }
  const sorted = Object.values(bySource).sort((a, b) => b.score - a.score);
  entry.b = sorted.slice(0, 3).map(m => ({
    label: m.label,
    color: m.color,
    bg: m.bg,
    border: m.border,
  }));

  // Pick the best Google rating from any mention (for rating override)
  const googleMentions = entry.mentions.filter(m => m.googleRating);
  if (googleMentions.length > 0) {
    const best = googleMentions.sort((a, b) => (b.googleRating * Math.log10(b.googleReviews + 10)) - (a.googleRating * Math.log10(a.googleReviews + 10)))[0];
    entry.googleRating = best.googleRating;
    entry.googleReviews = best.googleReviews;
    entry.googlePlaceId = best.googlePlaceId;
  }

  // Round score to 2 decimals, remove raw mentions to shrink output
  entry.s = Math.round(entry.s * 100) / 100;
  entry.mentionCount = entry.mentions.length;
  delete entry.mentions;
}

// ─── Write lookup ───
const outPath = path.join(ROOT, 'lib/editorial-lookup.json');
fs.writeFileSync(outPath, JSON.stringify(lookup));
const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(0);

// ─── Summary ───
const entries = Object.keys(lookup).length;
const withBadges = Object.values(lookup).filter(e => e.b.length > 0).length;
const avgScore = Object.values(lookup).reduce((a, e) => a + e.s, 0) / entries;
const maxScore = Math.max(...Object.values(lookup).map(e => e.s));

console.log(`\n─── Editorial Lookup Summary ───`);
console.log(`Total bakeries with editorial data: ${entries}`);
console.log(`With badges: ${withBadges}`);
console.log(`Avg editorial score: ${avgScore.toFixed(2)}`);
console.log(`Max editorial score: ${maxScore.toFixed(2)}`);
console.log(`Output: lib/editorial-lookup.json (${sizeKB} KB)`);

// Per-source breakdown
const sourceBreaks = {};
for (const e of Object.values(lookup)) {
  for (const b of e.b) sourceBreaks[b.label?.split(' ')[0] || 'other'] = (sourceBreaks[b.label?.split(' ')[0] || 'other'] || 0) + 1;
}
console.log('\nBadge label prefixes:');
for (const [k, v] of Object.entries(sourceBreaks).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${k.padEnd(20)} ${v}`);
}
