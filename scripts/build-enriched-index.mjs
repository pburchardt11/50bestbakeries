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
const OUT = path.join(ROOT, 'lib/enriched-index.js');

if (!fs.existsSync(SRC)) {
  console.log('No enriched-data directory. Writing empty index.');
  fs.writeFileSync(OUT, '// Auto-generated — run `node scripts/build-enriched-index.mjs` to rebuild.\nexport const ENRICHED = {};\n');
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

const header = `// lib/enriched-index.js
// Auto-generated from lib/enriched-data/*.json — ${new Date().toISOString().slice(0,10)}
// ${Object.keys(index).length} bakeries enriched with Google Places data + photos.
// Run \`node scripts/build-enriched-index.mjs\` to rebuild.
`;

fs.writeFileSync(OUT, header + '\nexport const ENRICHED = ' + JSON.stringify(index) + ';\n');
console.log('Wrote ' + path.relative(ROOT, OUT) + ' (' + (fs.statSync(OUT).size / 1024).toFixed(1) + ' KB)');
