// scripts/match-editorials.mjs
// Phase 2b: Match raw editorial entries against the bakery DB.
//   - Normalize country names
//   - Fuzzy-match name + city
//   - Output: lib/editorial-sources/matched.json
//
// Run: node scripts/match-editorials.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'lib/editorial-sources');

// ─── Load DB ───
const src = fs.readFileSync(path.join(ROOT, 'lib/bakery-data.js'), 'utf8');
const m = src.match(/export const DB\s*=\s*(\{[\s\S]*?\});?\s*$/);
const DB = JSON.parse(m[1]);

// ─── Country name normalization ───
const COUNTRY_ALIASES = {
  'United States of America': 'United States',
  'USA': 'United States',
  'U.S.': 'United States',
  'US': 'United States',
  'Great Britain': 'United Kingdom',
  'Britain': 'United Kingdom',
  'England': 'United Kingdom',
  'Scotland': 'United Kingdom',
  'Wales': 'United Kingdom',
  'Northern Ireland': 'United Kingdom',
  'UK': 'United Kingdom',
  "People's Republic of China": 'China',
  'PRC': 'China',
  'Republic of China': 'Taiwan',
  'Russian Federation': 'Russia',
  'Russian Empire': 'Russia',
  'Soviet Union': 'Russia',
  'USSR': 'Russia',
  'German Reich': 'Germany',
  'Deutschland': 'Germany',
  'Czechia': 'Czech Republic',
  'Republic of Ireland': 'Ireland',
  'Republic of Korea': 'South Korea',
  'Korea': 'South Korea',
  'Democratic People\'s Republic of Korea': 'North Korea',
  'Burma': 'Myanmar',
  'Holland': 'Netherlands',
  'The Netherlands': 'Netherlands',
  'Vatican City': 'Vatican',
  'Eswatini': 'Swaziland',
  'Czechoslovakia': 'Czech Republic',
  'Bohemia': 'Czech Republic',
};

function normalizeCountry(c) {
  if (!c) return null;
  const trimmed = c.trim();
  return COUNTRY_ALIASES[trimmed] || trimmed;
}

// ─── Name normalization ───
const STOPWORDS = new Set([
  'the', 'la', 'le', 'el', 'los', 'las', 'los', 'di', 'da', 'de', 'del', 'des', 'der',
  'di', 'da', 'do', 'dos', 'das', 'i', 'a', 'an', 'and', '&', 'et', 'und', 'y',
  'cafe', 'café', 'caffè', 'caffé', 'koffie', 'coffee',
  // Bakery type words — remove so 'Boulangerie X' matches 'X'
  'bakery', 'bakeries', 'boulangerie', 'patisserie', 'pâtisserie', 'pasteleria',
  'pastelería', 'panaderia', 'panadería', 'konditorei', 'bäckerei', 'baeckerei',
  'fornaio', 'pasticceria', 'bakkerij', 'bagaria', 'firin', 'fırın',
  'co', 'company', 'inc', 'incorporated', 'ltd', 'limited', 'gmbh', 'sa', 'sl', 'srl',
]);

function tokens(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(t => t && !STOPWORDS.has(t));
}

function nameKey(name) {
  return tokens(name).sort().join(' ');
}

function nameKeyOrdered(name) {
  return tokens(name).join(' ');
}

// ─── Build city → bakery index per country ───
console.log('Building DB index...');
const dbIndex = {}; // country → [{ name, city, slug, key, keyOrdered, entry }]
for (const country of Object.keys(DB)) {
  const arr = [];
  for (const city of Object.keys(DB[country])) {
    for (const entry of DB[country][city]) {
      const name = entry[0];
      arr.push({
        name,
        city,
        cityKey: city.toLowerCase(),
        key: nameKey(name),
        keyOrdered: nameKeyOrdered(name),
        entry,
      });
    }
  }
  dbIndex[country] = arr;
}
console.log('Indexed ' + Object.keys(dbIndex).length + ' countries');

// ─── Load raw editorial entries ───
const wikidata = JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'wikidata.json'), 'utf8'));
const wikiList = JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'wikipedia-list.json'), 'utf8'));
// Curated entries from training knowledge — tagged with source + per-country ordinal
const curatedRaw = JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'curated.json'), 'utf8'));
// Within each country, preserve curator's original order as curatorRank (1 = best)
const _curatorRankByCountry = {};
const curated = curatedRaw.map(c => {
  const country = c.country;
  _curatorRankByCountry[country] = (_curatorRankByCountry[country] || 0) + 1;
  return {
    ...c,
    source: 'Curated',
    sourceUrl: null,
    isCurated: true,
    curatorRank: _curatorRankByCountry[country],
  };
});
const raw = [...wikidata, ...wikiList, ...curated];
console.log('Editorial entries to match: ' + raw.length + ' (wikidata ' + wikidata.length + ', wikipedia ' + wikiList.length + ', curated ' + curated.length + ')');

// ─── Match ───
let matchedExact = 0, matchedTokens = 0, matchedTokensCityFuzzy = 0, unmatched = 0;
const matched = [];
const unmatchedList = [];

for (const ed of raw) {
  const country = normalizeCountry(ed.country);
  const bucket = dbIndex[country];
  if (!bucket) {
    unmatched++;
    unmatchedList.push({ ...ed, normalizedCountry: country, reason: 'country-not-in-db' });
    continue;
  }

  const edKey = nameKey(ed.name);
  if (!edKey) {
    unmatched++;
    unmatchedList.push({ ...ed, normalizedCountry: country, reason: 'empty-name-after-normalize' });
    continue;
  }
  const edCity = ed.city ? ed.city.toLowerCase() : null;

  // 1) Exact name + matching city if city given
  let hit = null;
  if (edCity) {
    hit = bucket.find(b => b.key === edKey && b.cityKey === edCity);
    if (hit) { matchedExact++; matched.push({ ...ed, normalizedCountry: country, matchedDb: hit.entry, matchedCity: hit.city, matchType: 'exact-name-and-city' }); continue; }

    // 2) Token-set match (sorted) + city
    hit = bucket.find(b => b.key === edKey && (b.cityKey.includes(edCity) || edCity.includes(b.cityKey)));
    if (hit) { matchedTokensCityFuzzy++; matched.push({ ...ed, normalizedCountry: country, matchedDb: hit.entry, matchedCity: hit.city, matchType: 'token-name-fuzzy-city' }); continue; }
  }

  // 3) Token-set match anywhere in country (no city constraint)
  const candidates = bucket.filter(b => b.key === edKey);
  if (candidates.length === 1) {
    hit = candidates[0];
    matchedTokens++;
    matched.push({ ...ed, normalizedCountry: country, matchedDb: hit.entry, matchedCity: hit.city, matchType: 'token-name-no-city' });
    continue;
  }
  if (candidates.length > 1) {
    // Multiple matches — pick one but mark ambiguous; choose the first
    hit = candidates[0];
    matchedTokens++;
    matched.push({ ...ed, normalizedCountry: country, matchedDb: hit.entry, matchedCity: hit.city, matchType: 'token-name-ambiguous-' + candidates.length });
    continue;
  }

  unmatched++;
  unmatchedList.push({ ...ed, normalizedCountry: country, reason: 'no-name-match' });
}

console.log('\n─── Match Results ───');
console.log('Exact (name+city):           ' + matchedExact);
console.log('Token name + fuzzy city:     ' + matchedTokensCityFuzzy);
console.log('Token name (no/multi city):  ' + matchedTokens);
console.log('Total matched:               ' + matched.length + ' / ' + raw.length + ' (' + ((matched.length/raw.length*100).toFixed(1)) + '%)');
console.log('Unmatched:                   ' + unmatched);

// Reason breakdown for unmatched
const reasons = {};
for (const u of unmatchedList) reasons[u.reason] = (reasons[u.reason] || 0) + 1;
console.log('\nUnmatched reasons:');
for (const [r, n] of Object.entries(reasons).sort((a,b) => b[1]-a[1])) console.log('  ' + r + ': ' + n);

// Save
fs.writeFileSync(path.join(SRC_DIR, 'matched.json'), JSON.stringify(matched, null, 2));
fs.writeFileSync(path.join(SRC_DIR, 'unmatched.json'), JSON.stringify(unmatchedList, null, 2));
console.log('\nWrote ' + matched.length + ' matched + ' + unmatchedList.length + ' unmatched');
