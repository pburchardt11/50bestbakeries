// scripts/build-editorial-data.mjs
// Phase 3: Convert matched editorials into lib/editorial-data.js
// Each entry gets a badge per source it appears in.
//
// Run: node scripts/build-editorial-data.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'lib/editorial-sources');

const matched = JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'matched.json'), 'utf8'));

// ─── Group by (normalizedCountry, matchedCity, name) → merge multiple sources ───
const byKey = new Map();
for (const m of matched) {
  const country = m.normalizedCountry;
  const city = m.matchedCity;
  const name = m.matchedDb[0];
  const key = country + '|||' + city + '|||' + name.toLowerCase();
  if (!byKey.has(key)) {
    byKey.set(key, {
      name,
      city,
      country,
      sources: [],
      images: [],
      wikipedia: null,
      coords: null,
      founded: null,
      curatorRank: null,
    });
  }
  const e = byKey.get(key);
  e.sources.push({
    name: m.source,
    url: m.sourceUrl,
    description: m.description || null,
  });
  if (m.image && !e.images.includes(m.image)) e.images.push(m.image);
  if (m.wikipedia && !e.wikipedia) e.wikipedia = m.wikipedia;
  if (m.coords && !e.coords) e.coords = m.coords;
  if (m.founded && !e.founded) e.founded = m.founded;
  // Track the best (lowest) curatorRank if this bakery appears multiple times
  if (m.curatorRank && (!e.curatorRank || m.curatorRank < e.curatorRank)) {
    e.curatorRank = m.curatorRank;
  }
}

// ─── Per-country ranking ───
// Authority weights: Curated > Wikipedia > Wikidata.
// Score = sum of weights across sources.
const SOURCE_WEIGHT = {
  'Curated': 100,
  'Wikipedia: List of bakeries': 10,
  'Wikidata': 5,
};
function authorityScore(e) {
  let s = 0;
  for (const src of e.sources) s += (SOURCE_WEIGHT[src.name] || 1);
  return s;
}

const byCountry = new Map();
for (const e of byKey.values()) {
  if (!byCountry.has(e.country)) byCountry.set(e.country, []);
  byCountry.get(e.country).push(e);
}
for (const [country, arr] of byCountry) {
  arr.sort((a, b) =>
    // 1. Authority: Curated > Wikipedia > Wikidata
    (authorityScore(b) - authorityScore(a)) ||
    // 2. Within curated tier, preserve the order the curator wrote them in
    ((a.curatorRank || 999) - (b.curatorRank || 999)) ||
    // 3. More sources is better
    (b.sources.length - a.sources.length) ||
    // 4. Alphabetical as final tie-breaker
    a.name.localeCompare(b.name)
  );
  arr.forEach((e, i) => { e.sourceRank = i + 1; });
}

// ─── Generate badges ───
const BADGE_COLORS = {
  gold:   { bg: 'rgba(212,175,55,0.15)', color: '#d4af37', border: 'rgba(212,175,55,0.3)' },
  bronze: { bg: 'rgba(212,148,76,0.15)', color: '#d4944c', border: 'rgba(212,148,76,0.3)' },
  silver: { bg: 'rgba(180,180,180,0.15)', color: '#b4b4b4', border: 'rgba(180,180,180,0.3)' },
};

const out = [];
for (const arr of byCountry.values()) {
  for (const e of arr) {
    const badges = [];
    // Top-3 ranking badge per country
    if (e.sourceRank <= 3) {
      const color = e.sourceRank === 1 ? BADGE_COLORS.gold : (e.sourceRank === 2 ? BADGE_COLORS.silver : BADGE_COLORS.bronze);
      badges.push({
        label: 'Editorial Pick · ' + e.country + ' #' + e.sourceRank,
        ...color,
      });
    }
    // Per-source citation badges
    for (const s of e.sources) {
      const short = s.name.replace('Wikipedia: List of bakeries', 'Wikipedia');
      badges.push({
        label: short,
        ...BADGE_COLORS.bronze,
      });
    }

    out.push({
      name: e.name,
      city: e.city,
      country: e.country,
      sourceRank: e.sourceRank,
      sources: e.sources,
      sourceCount: e.sources.length,
      badges,
      wikipediaUrl: e.wikipedia,
      images: e.images,
      coords: e.coords,
      foundedDate: e.founded,
    });
  }
}

console.log('Total editorial bakeries: ' + out.length);
console.log('Across countries: ' + new Set(out.map(b => b.country)).size);

// ─── Write lib/editorial-data.js ───
const fileBody = `// lib/editorial-data.js
// Curated editorial bakery rankings, generated from free public sources.
// Sources: Wikidata SPARQL, Wikipedia "List of bakeries"
// Generated: ${new Date().toISOString().slice(0, 10)}
// Total entries: ${out.length}
// Run \`node scripts/build-editorial-data.mjs\` to regenerate.

export const EDITORIAL_BAKERIES = ${JSON.stringify(out, null, 2)};

export function getEditorialBarsForCountry(country) {
  return EDITORIAL_BAKERIES
    .filter(b => b.country === country)
    .sort((a, b) => (a.sourceRank || 999) - (b.sourceRank || 999));
}

export function getEditorialSources() {
  const set = new Set();
  for (const b of EDITORIAL_BAKERIES) for (const s of b.sources) set.add(s.name);
  return [...set];
}

export function isEditorialBar(name, city) {
  const n = name.toLowerCase();
  const c = (city || '').toLowerCase();
  return EDITORIAL_BAKERIES.some(b =>
    b.name.toLowerCase() === n && (b.city || '').toLowerCase() === c
  );
}

export function getEditorialEntry(name, city) {
  const n = name.toLowerCase();
  const c = (city || '').toLowerCase();
  return EDITORIAL_BAKERIES.find(b =>
    b.name.toLowerCase() === n && (b.city || '').toLowerCase() === c
  ) || null;
}
`;

fs.writeFileSync(path.join(ROOT, 'lib/editorial-data.js'), fileBody);
console.log('Wrote lib/editorial-data.js (' + (Buffer.byteLength(fileBody) / 1024).toFixed(1) + ' KB)');
