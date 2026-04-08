// scripts/normalize-cities.mjs
// Normalizes city names in lib/bakery-data.js:
//   - Drops pure-numeric "cities" (postal codes)
//   - Drops too-short cities (< 2 chars)
//   - Title-cases ALL CAPS city names
//   - Merges case-collision pairs (e.g. "SÃO PAULO" + "São Paulo" → "São Paulo")
//   - Deduplicates merged bakery entries by name+city slug
//
// Usage: node scripts/normalize-cities.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'lib/bakery-data.js');

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function bakerySlug(name, city) {
  const ns = toSlug(name), cs = toSlug(city);
  return ns.endsWith(cs) ? ns : ns + '-' + cs;
}

// Title-case a string while preserving common lowercase particles
const LOWERCASE_PARTICLES = new Set([
  'de', 'del', 'la', 'las', 'los', 'el', 'da', 'das', 'do', 'dos',
  'di', 'du', 'des', 'le', 'les', 'van', 'von', 'der', 'den', 'al',
  'and', 'of', 'the', 'a', 'an', 'in', 'on', 'op', 'aan', 'bij',
]);
function titleCase(s) {
  return s
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((token, i) => {
      if (/^\s+$/.test(token) || token === '-') return token;
      if (i > 0 && LOWERCASE_PARTICLES.has(token)) return token;
      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join('');
}

function isAllCaps(s) {
  return s === s.toUpperCase() && /[A-ZÀ-Ý]/.test(s);
}

// ─── Load DB ───
const src = fs.readFileSync(DATA_FILE, 'utf8');
const m = src.match(/export const DB\s*=\s*(\{[\s\S]*?\});?\s*$/);
if (!m) { console.error('Could not parse DB'); process.exit(1); }
const DB = JSON.parse(m[1]);

let droppedNumeric = 0, droppedShort = 0, titleCased = 0, merged = 0, mergedBakeryDups = 0;

const newDB = {};

for (const country of Object.keys(DB)) {
  // Step 1: filter and bucket cities
  const buckets = new Map(); // lowercased key → { canonical, bakeries }
  for (const rawCity of Object.keys(DB[country])) {
    const entries = DB[country][rawCity];

    // Drop garbage
    if (/^\d+$/.test(rawCity)) { droppedNumeric += entries.length; continue; }
    if (rawCity.length < 2) { droppedShort += entries.length; continue; }

    // Normalize the casing
    let normalized = rawCity;
    if (isAllCaps(rawCity) && rawCity.length > 3) {
      normalized = titleCase(rawCity);
      titleCased += entries.length;
    }

    const key = normalized.toLowerCase();
    if (!buckets.has(key)) {
      buckets.set(key, { variants: [], totalEntries: 0 });
    }
    const b = buckets.get(key);
    b.variants.push({ form: normalized, entries });
    b.totalEntries += entries.length;
  }

  // Step 2: pick canonical form per bucket and merge
  newDB[country] = {};
  for (const [key, b] of buckets) {
    // Canonical: prefer non-all-caps, then most entries, then alphabetical
    b.variants.sort((a, c) => {
      const aAllCaps = isAllCaps(a.form) ? 1 : 0;
      const cAllCaps = isAllCaps(c.form) ? 1 : 0;
      if (aAllCaps !== cAllCaps) return aAllCaps - cAllCaps;
      if (c.entries.length !== a.entries.length) return c.entries.length - a.entries.length;
      return a.form.localeCompare(c.form);
    });
    const canonical = b.variants[0].form;

    if (b.variants.length > 1) merged += b.variants.length - 1;

    // Dedupe bakeries by slug under the canonical city
    const seen = new Set();
    const out = [];
    for (const v of b.variants) {
      for (const entry of v.entries) {
        const slug = bakerySlug(entry[0], canonical);
        if (seen.has(slug)) { mergedBakeryDups++; continue; }
        seen.add(slug);
        out.push(entry);
      }
    }
    newDB[country][canonical] = out;
  }
}

// ─── Stats ───
let totalAfter = 0, citiesAfter = 0;
for (const c of Object.keys(newDB)) {
  citiesAfter += Object.keys(newDB[c]).length;
  for (const ct of Object.keys(newDB[c])) totalAfter += newDB[c][ct].length;
}

console.log('Dropped (numeric "cities"):', droppedNumeric);
console.log('Dropped (too short):', droppedShort);
console.log('Title-cased entries:', titleCased);
console.log('City variants merged into canonical:', merged);
console.log('Duplicate bakeries removed during merge:', mergedBakeryDups);
console.log('---');
console.log('Total bakeries after:', totalAfter.toLocaleString());
console.log('Total cities after:', citiesAfter.toLocaleString());
console.log('Total countries:', Object.keys(newDB).length);

// ─── Sort ───
const sorted = {};
for (const country of Object.keys(newDB).sort()) {
  sorted[country] = {};
  for (const city of Object.keys(newDB[country]).sort()) {
    sorted[country][city] = newDB[country][city];
  }
}

// ─── Write ───
const header = `// lib/bakery-data.js
// Bakery database — ${new Date().toISOString().slice(0, 10)} (normalized)
// ${totalAfter.toLocaleString()} bakeries across ${Object.keys(sorted).length} countries
// Format: [name, rating*10, reviews/10, typeChar]
// Types: K=Bakery, P=Patisserie, B=Boulangerie, C=Cafe Bakery, A=Artisan Bakery,
//        S=Pastry Shop, V=Viennoiserie, G=Bagel Shop, R=Bread Bakery,
//        M=Macaron Shop, L=Cake Shop, D=Donut Shop, J=Croissanterie
`;

fs.writeFileSync(DATA_FILE, header + '\nexport const DB = ' + JSON.stringify(sorted) + ';\n');
console.log('\nWrote ' + path.relative(ROOT, DATA_FILE));
