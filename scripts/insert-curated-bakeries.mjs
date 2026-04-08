// scripts/insert-curated-bakeries.mjs
// Phase 2c: Insert unmatched curated editorial bakeries directly into lib/bakery-data.js
// so they appear in rankings alongside Overture entries.
//
// Run: node scripts/insert-curated-bakeries.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'lib/bakery-data.js');
const UNMATCHED_FILE = path.join(ROOT, 'lib/editorial-sources/unmatched.json');

// Reverse TYPE_MAP (name → char), matching lib/bakery-db.js
const TYPE_TO_CHAR = {
  'Bakery': 'K',
  'Patisserie': 'P',
  'Boulangerie': 'B',
  'Cafe Bakery': 'C',
  'Artisan Bakery': 'A',
  'Pastry Shop': 'S',
  'Viennoiserie': 'V',
  'Bagel Shop': 'G',
  'Bread Bakery': 'R',
  'Macaron Shop': 'M',
  'Cake Shop': 'L',
  'Donut Shop': 'D',
  'Croissanterie': 'J',
};

// Country name normalization (matching match-editorials.mjs)
const COUNTRY_ALIASES = {
  'United States of America': 'United States',
  'USA': 'United States',
  'Great Britain': 'United Kingdom',
  'UK': 'United Kingdom',
  "People's Republic of China": 'China',
  'Russian Federation': 'Russia',
  'German Reich': 'Germany',
  'Czechia': 'Czech Republic',
  'Republic of Ireland': 'Ireland',
  'Republic of Korea': 'South Korea',
};
function normalizeCountry(c) { return COUNTRY_ALIASES[c?.trim()] || c?.trim() || null; }

// ─── Load DB ───
const src = fs.readFileSync(DATA_FILE, 'utf8');
const m = src.match(/export const DB\s*=\s*(\{[\s\S]*?\});?\s*$/);
const DB = JSON.parse(m[1]);

// ─── Load unmatched curated entries ───
const unmatched = JSON.parse(fs.readFileSync(UNMATCHED_FILE, 'utf8'));
const curated = unmatched.filter(u => u.isCurated);
console.log('Unmatched curated entries to insert: ' + curated.length);

let inserted = 0, skippedNoCity = 0, skippedNoCountry = 0, alreadyPresent = 0, newCities = 0;

for (const c of curated) {
  const country = normalizeCountry(c.country);
  if (!country) { skippedNoCountry++; continue; }
  if (!c.city) { skippedNoCity++; continue; }

  // Ensure country/city exists in DB
  if (!DB[country]) DB[country] = {};
  if (!DB[country][c.city]) {
    DB[country][c.city] = [];
    newCities++;
  }

  // Check if already present (case-insensitive name match)
  const lcName = c.name.toLowerCase();
  if (DB[country][c.city].some(e => e[0].toLowerCase() === lcName)) {
    alreadyPresent++;
    continue;
  }

  // Default: rating 4.8 (editorial picks are top-tier), reviews count 200
  const ratingX10 = 48;
  const reviewsDiv10 = 20;
  const typeChar = TYPE_TO_CHAR[c.type] || 'K';

  DB[country][c.city].push([c.name, ratingX10, reviewsDiv10, typeChar]);
  inserted++;
}

console.log('\n─── Insert Results ───');
console.log('Inserted:         ' + inserted);
console.log('Already present:  ' + alreadyPresent);
console.log('Skipped (no city):    ' + skippedNoCity);
console.log('Skipped (no country): ' + skippedNoCountry);
console.log('New cities created:   ' + newCities);

// ─── Sort and write back ───
const sorted = {};
for (const country of Object.keys(DB).sort()) {
  sorted[country] = {};
  for (const city of Object.keys(DB[country]).sort()) {
    sorted[country][city] = DB[country][city];
  }
}

let totalBakeries = 0;
for (const c of Object.keys(sorted)) for (const ct of Object.keys(sorted[c])) totalBakeries += sorted[c][ct].length;

const header = `// lib/bakery-data.js
// Bakery database — ${new Date().toISOString().slice(0, 10)} (normalized + curated)
// ${totalBakeries.toLocaleString()} bakeries across ${Object.keys(sorted).length} countries
// Format: [name, rating*10, reviews/10, typeChar]
// Types: K=Bakery, P=Patisserie, B=Boulangerie, C=Cafe Bakery, A=Artisan Bakery,
//        S=Pastry Shop, V=Viennoiserie, G=Bagel Shop, R=Bread Bakery,
//        M=Macaron Shop, L=Cake Shop, D=Donut Shop, J=Croissanterie
`;

fs.writeFileSync(DATA_FILE, header + '\nexport const DB = ' + JSON.stringify(sorted) + ';\n');
console.log('\nWrote ' + path.relative(ROOT, DATA_FILE) + ' (total: ' + totalBakeries.toLocaleString() + ' bakeries)');
