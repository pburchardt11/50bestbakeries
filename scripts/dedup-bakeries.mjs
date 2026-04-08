// scripts/dedup-bars.mjs
// Removes duplicate bakeries within the same country by fuzzy name matching

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Normalize name for comparison: strip common bar-related words, articles, punctuation
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, '')
    .replace(/\b(bar|the|and|&|cocktail|lounge|club|pub|tavern|inn)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

console.log('Loading bakery-data.js...');
const barDataSrc = fs.readFileSync(path.join(ROOT, 'lib/bakery-data.js'), 'utf8');
const dbMatch = barDataSrc.match(/export const DB\s*=\s*(\{[\s\S]*\});?\s*$/);
if (!dbMatch) { console.error('Could not parse DB from bakery-data.js'); process.exit(1); }
const DB = eval('(' + dbMatch[1] + ')');

let totalBefore = 0, dupsRemoved = 0;

// Deduplicate within each country
for (const country of Object.keys(DB)) {
  // Build index of all bakeries in this country by normalized name
  const seen = new Map(); // normalizedKey -> { city, entry, name }

  for (const city of Object.keys(DB[country])) {
    const kept = [];
    for (const entry of DB[country][city]) {
      totalBefore++;
      const [name, ratingX10, reviewsDiv10, typeChar] = entry;
      const norm = normalizeName(name);
      // Two bars with same normalized name in same country = likely duplicate
      const key = norm;

      if (seen.has(key)) {
        const existing = seen.get(key);
        // Keep the one with higher rating, or more reviews
        const existingScore = existing.entry[1] * 100 + existing.entry[2];
        const newScore = ratingX10 * 100 + reviewsDiv10;
        if (newScore > existingScore) {
          // Replace existing with this one - remove from old city
          const oldCity = existing.city;
          const oldIdx = DB[country][oldCity].indexOf(existing.entry);
          if (oldIdx !== -1) {
            DB[country][oldCity].splice(oldIdx, 1);
          }
          kept.push(entry);
          seen.set(key, { city, entry, name });
        }
        // else skip this one (existing is better)
        dupsRemoved++;
      } else {
        seen.set(key, { city, entry, name });
        kept.push(entry);
      }
    }
    DB[country][city] = kept;
  }

  // Clean up empty cities
  for (const city of Object.keys(DB[country])) {
    if (DB[country][city].length === 0) delete DB[country][city];
  }
}

// Remove empty countries
for (const country of Object.keys(DB)) {
  if (Object.keys(DB[country]).length === 0) delete DB[country];
}

let totalAfter = 0;
for (const country of Object.keys(DB)) {
  for (const city of Object.keys(DB[country])) {
    totalAfter += DB[country][city].length;
  }
}

console.log(`Before: ${totalBefore}`);
console.log(`Duplicates removed: ${dupsRemoved}`);
console.log(`After: ${totalAfter}`);

// Write
const sortedDB = {};
for (const country of Object.keys(DB).sort()) {
  sortedDB[country] = {};
  for (const city of Object.keys(DB[country]).sort()) {
    sortedDB[country][city] = DB[country][city];
  }
}

const header = `// lib/bakery-data.js
// Bar database — ${new Date().toISOString().slice(0, 10)}
// ${totalAfter.toLocaleString()} bars across ${Object.keys(sortedDB).length} countries
// Format: [name, rating*10, reviews/10, typeChar]
// Types: C=Cocktail Bar, S=Speakeasy, W=Wine Bar, D=Dive Bar, R=Rooftop Bar,
//        T=Tiki Bar, P=Pub, B=Beer Garden, L=Lounge, N=Nightclub,
//        H=Hotel Bar, G=Gastropub, J=Jazz Bar
`;

fs.writeFileSync(path.join(ROOT, 'lib/bakery-data.js'), header + `\nexport const DB = ${JSON.stringify(sortedDB)};\n`);
console.log('Done!');
