// scripts/import-overture-bakeries.mjs
// Queries Overture Maps S3 parquet files directly via DuckDB and generates bakery-data.js
// Usage: node scripts/import-overture-bakeries.mjs [--skip-download] [--download-only]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PARQUET_FILE = path.join(__dirname, 'overture-bakeries.parquet');

const skipDownload = process.argv.includes('--skip-download');
const downloadOnly = process.argv.includes('--download-only');

// ─── Utility functions ───
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

// ─── Country code to name mapping ───
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
const COUNTRY_OVERRIDES = {
  'GB': 'United Kingdom',
  'US': 'United States',
  'KR': 'South Korea',
  'KP': 'North Korea',
  'TW': 'Taiwan',
  'CZ': 'Czech Republic',
  'AE': 'UAE',
  'VN': 'Vietnam',
  'RU': 'Russia',
  'IR': 'Iran',
  'SY': 'Syria',
  'LA': 'Laos',
  'BO': 'Bolivia',
  'VE': 'Venezuela',
  'TZ': 'Tanzania',
  'PS': 'Palestine',
  'CD': 'DR Congo',
  'CI': 'Ivory Coast',
  'XK': 'Kosovo',
};

function getCountryName(code) {
  if (!code) return null;
  if (COUNTRY_OVERRIDES[code]) return COUNTRY_OVERRIDES[code];
  try {
    return countryNames.of(code);
  } catch {
    return null;
  }
}

// ─── Category mapping ───
// Types:
//   K=Bakery, P=Patisserie, B=Boulangerie, C=Cafe Bakery, A=Artisan Bakery,
//   S=Pastry Shop, V=Viennoiserie, G=Bagel Shop, R=Bread Bakery,
//   M=Macaron Shop, L=Cake Shop, D=Donut Shop, J=Croissanterie
function mapOvertureCategory(category) {
  switch (category) {
    case 'bakery':              return 'K';
    case 'patisserie':          return 'P';
    case 'boulangerie':         return 'B';
    case 'pastry_shop':         return 'S';
    case 'bagel_shop':          return 'G';
    case 'donut_shop':
    case 'doughnut_shop':       return 'D';
    case 'cake_shop':           return 'L';
    case 'bread_shop':
    case 'bread_bakery':        return 'R';
    case 'cafe_and_bakery':
    case 'cafe_bakery':         return 'C';
    case 'croissanterie':       return 'J';
    case 'macaron_shop':        return 'M';
    case 'viennoiserie':        return 'V';
    default:                    return 'K';
  }
}

// Refine type char using name keywords
function refineType(typeChar, name) {
  const n = name.toLowerCase();
  if (n.includes('macaron') || n.includes('macron'))                              return 'M';
  if (n.includes('croissant'))                                                    return 'J';
  if (n.includes('viennois'))                                                     return 'V';
  if (n.includes('bagel'))                                                        return 'G';
  if (n.includes('donut') || n.includes('doughnut'))                              return 'D';
  if (n.includes('cupcake') || n.includes('cake shop') || n.includes('cakery') ||
      n.includes('patisserie') && n.includes('cake'))                             return 'L';
  if (n.includes('boulangerie') || n.includes('boulanger'))                       return 'B';
  if (n.includes('patisserie') || n.includes('pâtisserie') ||
      n.includes('patissier'))                                                    return 'P';
  if (n.includes('pastry') || n.includes('pastries'))                             return 'S';
  if (n.includes('sourdough') || n.includes('rye') || n.includes('bread') ||
      n.includes('loaf') || n.includes('miche'))                                  return 'R';
  if (n.includes('artisan') || n.includes('artesan'))                             return 'A';
  if (n.includes('café') || n.includes('cafe') || n.includes('coffee'))           return 'C';
  return typeChar;
}

// ─── Step 1: Download from S3 via DuckDB (if needed) ───
if (!skipDownload && !fs.existsSync(PARQUET_FILE)) {
  console.log('Downloading Overture Maps bakery data from S3 via DuckDB...');
  console.log('This may take 10-30 minutes depending on network speed.\n');

  let Database;
  try {
    ({ Database } = require('duckdb'));
  } catch {
    console.error('duckdb package not found. Install it: npm install --save-dev duckdb');
    process.exit(1);
  }

  await new Promise((resolve, reject) => {
    const db = new Database(':memory:');
    const conn = db.connect();

    const query = `
      INSTALL httpfs;
      LOAD httpfs;
      SET s3_region='us-west-2';

      COPY (
        SELECT
          names.primary AS name,
          addresses[1].locality AS city,
          addresses[1].country AS country_code,
          categories.primary AS category
        FROM read_parquet('s3://overturemaps-us-west-2/release/2026-02-18.0/theme=places/type=place/*')
        WHERE categories.primary IN (
          'bakery','patisserie','boulangerie','pastry_shop','bagel_shop',
          'donut_shop','doughnut_shop','cake_shop','bread_shop','bread_bakery',
          'cafe_and_bakery','cafe_bakery','croissanterie','macaron_shop','viennoiserie'
        )
          AND names.primary IS NOT NULL
          AND addresses[1].locality IS NOT NULL
      ) TO '${PARQUET_FILE}' (FORMAT PARQUET);
    `;

    conn.exec(query, (err) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        console.log(`Saved parquet to ${PARQUET_FILE}`);
        resolve();
      }
    });
  });
} else if (skipDownload) {
  console.log('--skip-download flag set, using existing parquet file.');
} else {
  console.log(`Parquet file already exists at ${PARQUET_FILE}, skipping download.`);
}

if (downloadOnly) {
  console.log('--download-only flag set, exiting after download.');
  process.exit(0);
}

if (!fs.existsSync(PARQUET_FILE)) {
  console.error(`Parquet file not found: ${PARQUET_FILE}`);
  process.exit(1);
}

// ─── Step 2: Load existing bakery-data.js (may be empty) ───
console.log('\nBuilding existing slug index...');
const bakeryDataSrcRaw = fs.readFileSync(path.join(ROOT, 'lib/bakery-data.js'), 'utf8');
const dbMatch = bakeryDataSrcRaw.match(/export const DB\s*=\s*(\{[\s\S]*?\});?\s*$/);
const DB = dbMatch ? eval('(' + dbMatch[1] + ')') : {};

const existingSlugs = new Set();
const existingNames = new Set();
for (const country of Object.keys(DB)) {
  for (const city of Object.keys(DB[country])) {
    for (const entry of DB[country][city]) {
      const [name] = entry;
      existingSlugs.add(bakerySlug(name, city));
      existingNames.add(toSlug(name) + '|' + toSlug(city));
    }
  }
}
console.log(`Existing: ${existingSlugs.size} slugs`);

// ─── Step 3: Read parquet and process records ───
console.log('\nReading local parquet file...');

let Database;
try {
  ({ Database } = require('duckdb'));
} catch {
  console.error('duckdb package not found. Install it: npm install --save-dev duckdb');
  process.exit(1);
}

const totalRows = await new Promise((resolve, reject) => {
  const db = new Database(':memory:');
  const conn = db.connect();
  conn.all(`SELECT COUNT(*) AS n FROM read_parquet('${PARQUET_FILE}')`, (err, rows) => {
    db.close();
    if (err) reject(err);
    else resolve(Number(rows[0].n));
  });
});
console.log(`Total rows in parquet: ${totalRows.toLocaleString()}`);

const newDB = {};
let totalProcessed = 0, added = 0, skippedDup = 0, skippedNoCity = 0, skippedNoName = 0;

const CHUNK_SIZE = 50000;

for (let offset = 0; offset < totalRows; offset += CHUNK_SIZE) {
  const rows = await new Promise((resolve, reject) => {
    const db = new Database(':memory:');
    const conn = db.connect();
    const q = `SELECT name, city, country_code, category FROM read_parquet('${PARQUET_FILE}') LIMIT ${CHUNK_SIZE} OFFSET ${offset}`;
    conn.all(q, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const row of rows) {
    totalProcessed++;

    const { name: rawName, city: rawCity, country_code, category } = row;

    if (!rawName || rawName.trim().length < 2) { skippedNoName++; continue; }
    if (!rawCity || rawCity.trim() === '') { skippedNoCity++; continue; }

    const name = rawName.trim();
    const city = rawCity.trim();

    const countryName = getCountryName(country_code);
    if (!countryName) continue;

    let typeChar = mapOvertureCategory(category);
    typeChar = refineType(typeChar, name);

    const slug = bakerySlug(name, city);
    const nameKey = toSlug(name) + '|' + toSlug(city);

    if (existingSlugs.has(slug) || existingNames.has(nameKey)) { skippedDup++; continue; }
    if (newDB[countryName] && newDB[countryName][city]) {
      const dup = newDB[countryName][city].find(e => bakerySlug(e[0], city) === slug);
      if (dup) { skippedDup++; continue; }
    }

    existingSlugs.add(slug);
    existingNames.add(nameKey);

    if (!newDB[countryName]) newDB[countryName] = {};
    if (!newDB[countryName][city]) newDB[countryName][city] = [];

    newDB[countryName][city].push([name, 40, 1, typeChar]);
    added++;
  }

  const pct = Math.min(100, ((offset + CHUNK_SIZE) / totalRows * 100)).toFixed(1);
  process.stdout.write(`\r  Progress: ${pct}% — ${added.toLocaleString()} added, ${skippedDup.toLocaleString()} dups, ${totalProcessed.toLocaleString()} processed`);
}

console.log(`\n\nTotal processed: ${totalProcessed.toLocaleString()}`);
console.log(`Added: ${added.toLocaleString()}`);
console.log(`Skipped (duplicate): ${skippedDup.toLocaleString()}`);
console.log(`Skipped (no city): ${skippedNoCity.toLocaleString()}`);
console.log(`Skipped (no name): ${skippedNoName.toLocaleString()}`);

// ─── Step 4: Merge into existing DB ───
console.log('\nMerging into bakery-data.js...');

for (const [country, cities] of Object.entries(newDB)) {
  if (!DB[country]) DB[country] = {};
  for (const [city, bakeries] of Object.entries(cities)) {
    if (!DB[country][city]) DB[country][city] = [];
    DB[country][city].push(...bakeries);
  }
}

let totalBakeries = 0;
for (const country of Object.keys(DB)) {
  for (const city of Object.keys(DB[country])) {
    totalBakeries += DB[country][city].length;
  }
}
console.log(`Total bakeries in merged DB: ${totalBakeries.toLocaleString()}`);

const sortedDB = {};
for (const country of Object.keys(DB).sort()) {
  sortedDB[country] = {};
  for (const city of Object.keys(DB[country]).sort()) {
    sortedDB[country][city] = DB[country][city];
  }
}

const header = `// lib/bakery-data.js
// Bakery database — ${new Date().toISOString().slice(0, 10)}
// ${totalBakeries.toLocaleString()} bakeries across ${Object.keys(sortedDB).length} countries
// Format: [name, rating*10, reviews/10, typeChar]
// Types: K=Bakery, P=Patisserie, B=Boulangerie, C=Cafe Bakery, A=Artisan Bakery,
//        S=Pastry Shop, V=Viennoiserie, G=Bagel Shop, R=Bread Bakery,
//        M=Macaron Shop, L=Cake Shop, D=Donut Shop, J=Croissanterie
`;

const dbJson = JSON.stringify(sortedDB);
const bakeryDataContent = header + `\nexport const DB = ${dbJson};\n`;

fs.writeFileSync(path.join(ROOT, 'lib/bakery-data.js'), bakeryDataContent);
console.log(`Wrote bakery-data.js (${(Buffer.byteLength(bakeryDataContent) / 1024 / 1024).toFixed(1)} MB)`);
console.log('\nDone!');
