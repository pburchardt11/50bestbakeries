// scripts/fix-non-latin.mjs
// Removes or transliterates non-Latin city and bakery names in bakery-data.js
// Unlike the spa-review version, this works directly with the DB (no batch files)
// Strategy:
//   - Non-Latin city names: attempt simple transliteration (strip diacritics, romanize)
//     via common character maps; if not possible, remove those entries
//   - Non-Latin bakery names: same approach; remove if no transliteration available

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Matches purely Latin-extended + ASCII characters (allows spaces, hyphens, common punctuation)
const latinCheck = /^[\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\s\-'.,()&/]+$/;

// ─── Transliteration table for common non-Latin scripts ───
// Maps individual characters (or sequences) to Latin equivalents.
// Covers: Cyrillic, Greek, Arabic (rough), CJK (skip), Devanagari (skip), etc.
const TRANSLIT_MAP = {
  // Cyrillic
  'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'Zh','З':'Z',
  'И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R',
  'С':'S','Т':'T','У':'U','Ф':'F','Х':'Kh','Ц':'Ts','Ч':'Ch','Ш':'Sh',
  'Щ':'Shch','Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'Yu','Я':'Ya',
  'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
  'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
  'с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh',
  'щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  // Greek
  'Α':'A','Β':'B','Γ':'G','Δ':'D','Ε':'E','Ζ':'Z','Η':'I','Θ':'Th',
  'Ι':'I','Κ':'K','Λ':'L','Μ':'M','Ν':'N','Ξ':'X','Ο':'O','Π':'P',
  'Ρ':'R','Σ':'S','Τ':'T','Υ':'Y','Φ':'Ph','Χ':'Ch','Ψ':'Ps','Ω':'O',
  'α':'a','β':'b','γ':'g','δ':'d','ε':'e','ζ':'z','η':'i','θ':'th',
  'ι':'i','κ':'k','λ':'l','μ':'m','ν':'n','ξ':'x','ο':'o','π':'p',
  'ρ':'r','σ':'s','ς':'s','τ':'t','υ':'y','φ':'ph','χ':'ch','ψ':'ps','ω':'o',
  // Ukrainian extras
  'Є':'Ye','І':'I','Ї':'Yi','Ґ':'G',
  'є':'ye','і':'i','ї':'yi','ґ':'g',
  // Serbian/Macedonian extras
  'Ђ':'Dj','Ј':'J','Љ':'Lj','Њ':'Nj','Ћ':'C','Џ':'Dz',
  'ђ':'dj','ј':'j','љ':'lj','њ':'nj','ћ':'c','џ':'dz',
};

function transliterate(str) {
  let result = '';
  for (const ch of str) {
    if (TRANSLIT_MAP[ch] !== undefined) {
      result += TRANSLIT_MAP[ch];
    } else if (ch.codePointAt(0) > 127) {
      // Non-ASCII, non-mapped character — signal failure with null
      return null;
    } else {
      result += ch;
    }
  }
  return result.replace(/\s+/g, ' ').trim() || null;
}

function fixString(str) {
  if (latinCheck.test(str)) return str; // already Latin
  const t = transliterate(str);
  return t; // null if failed
}

// ─── Load DB ───
console.log('Loading bakery-data.js...');
const barDataSrc = fs.readFileSync(path.join(ROOT, 'lib/bakery-data.js'), 'utf8');
const dbMatch = barDataSrc.match(/export const DB\s*=\s*(\{[\s\S]*\});?\s*$/);
if (!dbMatch) { console.error('Could not parse DB from bakery-data.js'); process.exit(1); }
const DB = eval('(' + dbMatch[1] + ')');

// ─── Dry run: check scope ───
let nonLatinCities = 0, nonLatinNames = 0;
for (const country of Object.keys(DB)) {
  for (const city of Object.keys(DB[country])) {
    if (!latinCheck.test(city)) nonLatinCities++;
    for (const entry of DB[country][city]) {
      if (!latinCheck.test(entry[0])) nonLatinNames++;
    }
  }
}
console.log(`Non-Latin cities: ${nonLatinCities}`);
console.log(`Non-Latin bakery names: ${nonLatinNames}`);

// ─── Fix the DB ───
let citiesFixed = 0, citiesRemoved = 0, namesFixed = 0, namesRemoved = 0;

const newDB = {};

for (const country of Object.keys(DB)) {
  newDB[country] = {};

  for (const city of Object.keys(DB[country])) {
    let targetCity = city;

    // Fix non-Latin city name
    if (!latinCheck.test(city)) {
      const fixed = fixString(city);
      if (fixed) {
        targetCity = fixed;
        citiesFixed++;
      } else {
        // Cannot transliterate — drop all entries for this city
        citiesRemoved++;
        namesRemoved += DB[country][city].length;
        continue;
      }
    }

    // Fix bakery names within this city
    const fixedBars = [];
    for (const entry of DB[country][city]) {
      const [name, ...rest] = entry;
      if (!latinCheck.test(name)) {
        const fixed = fixString(name);
        if (fixed) {
          fixedBars.push([fixed, ...rest]);
          namesFixed++;
        } else {
          namesRemoved++;
          // Drop — cannot produce a usable Latin name
        }
      } else {
        fixedBars.push(entry);
      }
    }

    if (fixedBars.length > 0) {
      if (!newDB[country][targetCity]) {
        newDB[country][targetCity] = [];
      }
      newDB[country][targetCity].push(...fixedBars);
    }
  }

  // Remove empty countries
  if (Object.keys(newDB[country]).length === 0) {
    delete newDB[country];
  }
}

console.log(`\nCities fixed (transliterated): ${citiesFixed}`);
console.log(`Cities removed (untransliterable): ${citiesRemoved}`);
console.log(`Bakery names fixed: ${namesFixed}`);
console.log(`Bars removed: ${namesRemoved}`);

// Count totals
let totalBars = 0;
for (const country of Object.keys(newDB)) {
  for (const city of Object.keys(newDB[country])) {
    totalBars += newDB[country][city].length;
  }
}
console.log(`Total bars remaining: ${totalBars.toLocaleString()}`);

// ─── Write the fixed DB ───
const sortedDB = {};
for (const country of Object.keys(newDB).sort()) {
  sortedDB[country] = {};
  for (const city of Object.keys(newDB[country]).sort()) {
    sortedDB[country][city] = newDB[country][city];
  }
}

const header = `// lib/bakery-data.js
// Bar database — ${new Date().toISOString().slice(0, 10)}
// ${totalBars.toLocaleString()} bars across ${Object.keys(sortedDB).length} countries
// Format: [name, rating*10, reviews/10, typeChar]
// Types: C=Cocktail Bar, S=Speakeasy, W=Wine Bar, D=Dive Bar, R=Rooftop Bar,
//        T=Tiki Bar, P=Pub, B=Beer Garden, L=Lounge, N=Nightclub,
//        H=Hotel Bar, G=Gastropub, J=Jazz Bar
`;

const dbJson = JSON.stringify(sortedDB);
const barDataContent = header + `\nexport const DB = ${dbJson};\n`;
fs.writeFileSync(path.join(ROOT, 'lib/bakery-data.js'), barDataContent);
console.log(`\nWrote bakery-data.js (${(Buffer.byteLength(barDataContent) / 1024 / 1024).toFixed(1)} MB)`);

// Verify no non-Latin cities remain
let remaining = 0;
for (const country of Object.keys(sortedDB)) {
  for (const city of Object.keys(sortedDB[country])) {
    if (!latinCheck.test(city)) remaining++;
  }
}
console.log(`Non-Latin cities remaining: ${remaining}`);
