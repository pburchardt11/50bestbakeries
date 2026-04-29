// scripts/build-enriched-index.mjs
// Consolidates lib/enriched-data/*.json into a single lib/enriched-index.js
// keyed by bakery slug for fast runtime lookup.
//
// Run: node scripts/build-enriched-index.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'lib/enriched-data');
const OUT = path.join(ROOT, 'lib/enriched-index.json');

if (!fs.existsSync(SRC)) {
  console.log('No enriched-data directory. Writing empty index.');
  fs.writeFileSync(OUT, '{}');
  process.exit(0);
}

const files = fs.readdirSync(SRC).filter(f => f.endsWith('.json') && !f.startsWith('_'));
const index = {};
for (const f of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
    if (data.slug && !data.error) index[data.slug] = data;
  } catch (e) {
    console.warn('  skip ' + f + ': ' + e.message);
  }
}

console.log('Indexed ' + Object.keys(index).length + ' enriched bakeries');

fs.writeFileSync(OUT, JSON.stringify(index));
console.log('Wrote ' + path.relative(ROOT, OUT) + ' (' + (fs.statSync(OUT).size / 1024).toFixed(1) + ' KB)');
