// scripts/discover-editorials.mjs
// Phase 2: Editorial discovery from free public sources.
//   - Wikidata SPARQL: bakeries with structured city/country/coords/image
//   - Wikipedia "List of bakeries" wikitext
// Output: lib/editorial-sources/{source}.json
//
// Run: node scripts/discover-editorials.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'lib/editorial-sources');
fs.mkdirSync(SRC_DIR, { recursive: true });

const UA = '50bestbakeries-editorial-discovery/1.0 (research)';

// ─── Source 1: Wikidata SPARQL ───
async function fetchWikidata() {
  console.log('Source 1/2: Wikidata SPARQL...');
  const query = `
    SELECT ?item ?itemLabel ?countryLabel ?cityLabel ?coords ?founded ?image ?wikipedia WHERE {
      ?item wdt:P31/wdt:P279* wd:Q274393 .
      OPTIONAL { ?item wdt:P17 ?country . }
      OPTIONAL { ?item wdt:P131 ?city . }
      OPTIONAL { ?item wdt:P625 ?coords . }
      OPTIONAL { ?item wdt:P571 ?founded . }
      OPTIONAL { ?item wdt:P18 ?image . }
      OPTIONAL { ?wikipedia schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language 'en'. }
    }
    LIMIT 5000
  `;
  const r = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query), {
    headers: { 'User-Agent': UA, 'Accept': 'application/sparql-results+json' },
  });
  if (!r.ok) throw new Error('Wikidata HTTP ' + r.status);
  const j = await r.json();

  // Dedupe by item URI
  const items = {};
  for (const row of j.results.bindings) {
    const id = row.item.value;
    if (!items[id]) {
      items[id] = {
        wikidataId: id.replace('http://www.wikidata.org/entity/', ''),
        name: row.itemLabel?.value || null,
        city: row.cityLabel?.value || null,
        country: row.countryLabel?.value || null,
        coords: row.coords?.value || null,
        founded: row.founded?.value || null,
        image: row.image?.value || null,
        wikipedia: row.wikipedia?.value || null,
        source: 'Wikidata',
        sourceUrl: id,
      };
    }
  }
  const arr = Object.values(items)
    .filter(b => b.name && b.country)
    // Drop items where the "name" is just the literal Wikidata ID — those have no English label
    .filter(b => !/^Q\d+$/.test(b.name));
  fs.writeFileSync(path.join(SRC_DIR, 'wikidata.json'), JSON.stringify(arr, null, 2));
  console.log('  ' + arr.length + ' bakeries → wikidata.json');
  return arr;
}

// ─── Source 2: Wikipedia "List of bakeries" ───
async function fetchWikipediaList() {
  console.log('Source 2/2: Wikipedia "List of bakeries"...');
  const r = await fetch(
    'https://en.wikipedia.org/w/api.php?action=parse&page=List_of_bakeries&format=json&prop=wikitext&origin=*',
    { headers: { 'User-Agent': UA } }
  );
  const j = await r.json();
  const txt = j.parse.wikitext['*'];
  const sections = txt.split(/==+\s*([^=]+?)\s*==+/);
  const out = [];
  for (let i = 1; i < sections.length; i += 2) {
    const country = sections[i].trim();
    if (country === 'See also' || country === 'References' || country === 'External links' || country === 'Worldwide' || country === 'Kosher bakeries') continue;
    const body = sections[i+1] || '';
    // Match bullet items: * [[Name]] – description
    const lines = body.split('\n');
    for (const line of lines) {
      const m = line.match(/^\*+\s*\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]\s*[–\-]?\s*(.*)$/);
      if (!m) continue;
      const wikiTitle = m[1].trim();
      const display = (m[2] || wikiTitle).trim();
      let description = (m[3] || '').replace(/\{\{[^}]+\}\}/g, '').replace(/<ref[^>]*>.*?<\/ref>/g, '').trim();
      // Skip non-bakery references like 'Category:'
      if (/^File:|^Category:|^Image:/.test(wikiTitle)) continue;
      out.push({
        name: display,
        wikiTitle,
        city: null,
        country,
        description: description.slice(0, 240),
        source: 'Wikipedia: List of bakeries',
        sourceUrl: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(wikiTitle.replace(/ /g, '_')),
      });
    }
  }
  fs.writeFileSync(path.join(SRC_DIR, 'wikipedia-list.json'), JSON.stringify(out, null, 2));
  console.log('  ' + out.length + ' bakeries → wikipedia-list.json');
  return out;
}

// ─── Run ───
const wikidata = await fetchWikidata();
const wikiList = await fetchWikipediaList();

// Build per-country and per-source summary
const byCountry = {};
for (const b of [...wikidata, ...wikiList]) {
  const c = b.country || 'Unknown';
  byCountry[c] = (byCountry[c] || 0) + 1;
}

console.log('\n─── Discovery Summary ───');
console.log('Wikidata:           ' + wikidata.length);
console.log('Wikipedia list:     ' + wikiList.length);
console.log('Combined raw:       ' + (wikidata.length + wikiList.length));
console.log('Countries covered:  ' + Object.keys(byCountry).length);
console.log('\nTop 20 countries by editorial mentions:');
for (const [c, n] of Object.entries(byCountry).sort((a,b) => b[1]-a[1]).slice(0, 20)) {
  console.log('  ' + c.padEnd(35) + ' ' + n);
}
