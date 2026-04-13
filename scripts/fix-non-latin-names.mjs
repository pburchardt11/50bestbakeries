// scripts/fix-non-latin-names.mjs
// Removes bakeries whose names contain zero Latin characters (unreadable on an
// English-language site), and strips non-Latin portions from mixed-script names.
// Also removes emoji from names.
//
// Run: node scripts/fix-non-latin-names.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'lib/bakery-data.js');

const src = fs.readFileSync(DATA_FILE, 'utf8');
const m = src.match(/export const DB\s*=\s*(\{[\s\S]*?\});?\s*$/);
const DB = JSON.parse(m[1]);

const HAS_LATIN = /[a-zA-ZÀ-ÖÙ-öù-ÿĀ-ž]/;
// Match non-Latin script blocks (Arabic, Thai, CJK, Cyrillic, Bengali, Khmer, etc.)
const NON_LATIN_BLOCK = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0E00-\u0E7F\u0E80-\u0EFF\u1000-\u109F\u1780-\u17FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0400-\u04FF\u0500-\u052F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u10A0-\u10FF\u2D00-\u2D2F\u2D80-\u2DDF\u1200-\u137F\u2E80-\u2EFF\u3100-\u312F\u3200-\u32FF\uF900-\uFAFF\u1100-\u11FF\uA000-\uA4CF]/g;
// Emoji range
const EMOJI = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2B50}\u{2764}\u{FE0F}®️™️]+/gu;

let removed = 0, cleaned = 0, total = 0;

for (const country of Object.keys(DB)) {
  for (const city of Object.keys(DB[country])) {
    const arr = DB[country][city];
    const filtered = [];
    for (const entry of arr) {
      total++;
      let name = entry[0];

      // Strip emoji
      name = name.replace(EMOJI, '').trim();

      // If name has NO Latin characters at all → drop
      if (!HAS_LATIN.test(name)) {
        removed++;
        continue;
      }

      // If name is mixed (has both Latin and non-Latin), strip non-Latin portions
      if (NON_LATIN_BLOCK.test(name)) {
        const before = name;
        name = name.replace(NON_LATIN_BLOCK, '').replace(/\s{2,}/g, ' ').replace(/^\s*[-–—|/\\:,]+\s*/, '').replace(/\s*[-–—|/\\:,]+\s*$/, '').trim();
        if (name.length >= 2 && HAS_LATIN.test(name)) {
          cleaned++;
        } else {
          removed++;
          continue;
        }
      }

      // Update entry with cleaned name
      filtered.push([name, entry[1], entry[2], entry[3]]);
    }
    DB[country][city] = filtered;
  }
}

// Remove empty cities
for (const country of Object.keys(DB)) {
  for (const city of Object.keys(DB[country])) {
    if (DB[country][city].length === 0) delete DB[country][city];
  }
  if (Object.keys(DB[country]).length === 0) delete DB[country];
}

let afterTotal = 0;
for (const c of Object.keys(DB))
  for (const ct of Object.keys(DB[c]))
    afterTotal += DB[c][ct].length;

console.log('Before:', total);
console.log('Removed (no Latin):', removed);
console.log('Cleaned (mixed → Latin only):', cleaned);
console.log('After:', afterTotal);

// Sort and write
const sorted = {};
for (const country of Object.keys(DB).sort()) {
  sorted[country] = {};
  for (const city of Object.keys(DB[country]).sort()) {
    sorted[country][city] = DB[country][city];
  }
}

const header = `// lib/bakery-data.js
// Bakery database — ${new Date().toISOString().slice(0, 10)} (normalized + curated + latin-cleaned)
// ${afterTotal.toLocaleString()} bakeries across ${Object.keys(sorted).length} countries
// Format: [name, rating*10, reviews/10, typeChar]
// Types: K=Bakery, P=Patisserie, B=Boulangerie, C=Cafe Bakery, A=Artisan Bakery,
//        S=Pastry Shop, V=Viennoiserie, G=Bagel Shop, R=Bread Bakery,
//        M=Macaron Shop, L=Cake Shop, D=Donut Shop, J=Croissanterie
`;

fs.writeFileSync(DATA_FILE, header + '\nexport const DB = ' + JSON.stringify(sorted) + ';\n');
console.log('Wrote ' + path.relative(ROOT, DATA_FILE));
