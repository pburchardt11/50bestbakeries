#!/usr/bin/env node
// scripts/fix-major-cities.mjs
// Re-imports bakeries from major cities that were lost due to non-Latin city names
// Maps Thai, Japanese, Korean, Greek, Russian etc. city names to English

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import duckdb from 'duckdb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PARQUET = path.join(__dirname, 'overture-bars.parquet');

// Major city name mappings: local script → English
const CITY_MAP = {
  // Thailand
  'กรุงเทพมหานคร': 'Bangkok',
  'พัทยา': 'Pattaya',
  'เชียงใหม่': 'Chiang Mai',
  'กะทู้': 'Kathu',
  'ภูเก็ต': 'Phuket',
  'เกาะสมุย': 'Koh Samui',
  'หัวหิน': 'Hua Hin',
  'กระบี่': 'Krabi',
  'นครราชสีมา': 'Nakhon Ratchasima',
  'เกาะพะงัน': 'Koh Phangan',
  'ขอนแก่น': 'Khon Kaen',
  'ชลบุรี': 'Chonburi',
  'หาดใหญ่': 'Hat Yai',
  'อุดรธานี': 'Udon Thani',
  'เชียงราย': 'Chiang Rai',
  'บางละมุง': 'Bang Lamung',
  'ศรีราชา': 'Si Racha',
  'ถลาง': 'Thalang',
  'เกาะช้าง': 'Koh Chang',
  'สุราษฎร์ธานี': 'Surat Thani',
  'นนทบุรี': 'Nonthaburi',

  // Japan
  '東京': 'Tokyo',
  '大阪': 'Osaka',
  '京都': 'Kyoto',
  '横浜': 'Yokohama',
  '名古屋': 'Nagoya',
  '福岡': 'Fukuoka',
  '神戸': 'Kobe',
  '札幌': 'Sapporo',
  '仙台': 'Sendai',
  '広島': 'Hiroshima',
  '那覇': 'Naha',
  '北九州': 'Kitakyushu',
  '新宿': 'Shinjuku',
  '渋谷': 'Shibuya',
  '六本木': 'Roppongi',
  '銀座': 'Ginza',
  '中央区': 'Chuo',
  '港区': 'Minato',
  '千代田区': 'Chiyoda',
  '新宿区': 'Shinjuku',
  '台東区': 'Taito',
  '豊島区': 'Toshima',
  '目黒区': 'Meguro',
  '世田谷区': 'Setagaya',
  '中野区': 'Nakano',
  '杉並区': 'Suginami',
  '品川区': 'Shinagawa',
  '大田区': 'Ota',
  '墨田区': 'Sumida',
  '江東区': 'Koto',
  '文京区': 'Bunkyo',
  '荒川区': 'Arakawa',
  '北区': 'Kita',
  '板橋区': 'Itabashi',
  '練馬区': 'Nerima',
  '足立区': 'Adachi',
  '葛飾区': 'Katsushika',
  '江戸川区': 'Edogawa',
  '浅草': 'Asakusa',
  '池袋': 'Ikebukuro',
  '中目黒': 'Nakameguro',
  '恵比寿': 'Ebisu',
  '下北沢': 'Shimokitazawa',
  '吉祥寺': 'Kichijoji',
  '心斎橋': 'Shinsaibashi',
  '難波': 'Namba',
  '梅田': 'Umeda',
  '天王寺': 'Tennoji',
  '博多': 'Hakata',
  '天神': 'Tenjin',
  '栄': 'Sakae',
  '長崎': 'Nagasaki',
  '金沢': 'Kanazawa',
  '岡山': 'Okayama',
  '熊本': 'Kumamoto',
  '鹿児島': 'Kagoshima',
  '松山': 'Matsuyama',
  '高松': 'Takamatsu',
  '新潟': 'Niigata',
  '静岡': 'Shizuoka',
  '浜松': 'Hamamatsu',
  '宇都宮': 'Utsunomiya',
  '奈良': 'Nara',
  '和歌山': 'Wakayama',
  '大分': 'Oita',
  '宮崎': 'Miyazaki',
  '盛岡': 'Morioka',
  '秋田': 'Akita',
  '函館': 'Hakodate',
  '旭川': 'Asahikawa',
  '小樽': 'Otaru',
  '別府': 'Beppu',

  // South Korea
  '서울': 'Seoul',
  '부산': 'Busan',
  '인천': 'Incheon',
  '대구': 'Daegu',
  '대전': 'Daejeon',
  '광주': 'Gwangju',
  '제주': 'Jeju',
  '수원': 'Suwon',
  '울산': 'Ulsan',
  '성남': 'Seongnam',
  '이태원': 'Itaewon',
  '강남': 'Gangnam',
  '홍대': 'Hongdae',

  // Russia
  'Москва': 'Moscow',
  'Санкт-Петербург': 'St. Petersburg',
  'Новосибирск': 'Novosibirsk',
  'Екатеринбург': 'Yekaterinburg',
  'Казань': 'Kazan',
  'Нижний Новгород': 'Nizhny Novgorod',
  'Красноярск': 'Krasnoyarsk',
  'Самара': 'Samara',
  'Ростов-на-Дону': 'Rostov-on-Don',
  'Сочи': 'Sochi',
  'Краснодар': 'Krasnodar',
  'Владивосток': 'Vladivostok',
  'Калининград': 'Kaliningrad',
  'Воронеж': 'Voronezh',

  // Greece
  'Αθήνα': 'Athens',
  'Θεσσαλονίκη': 'Thessaloniki',
  'Ηράκλειο': 'Heraklion',
  'Χανιά': 'Chania',
  'Ρόδος': 'Rhodes',
  'Κέρκυρα': 'Corfu',
  'Μύκονος': 'Mykonos',
  'Σαντορίνη': 'Santorini',
  'Πάτρα': 'Patras',
  'Ρέθυμνο': 'Rethymno',

  // Taiwan
  '台北': 'Taipei',
  '台中': 'Taichung',
  '高雄': 'Kaohsiung',
  '台南': 'Tainan',

  // UAE
  'دبي': 'Dubai',
  'أبوظبي': 'Abu Dhabi',

  // Israel
  'תל אביב': 'Tel Aviv',
  'ירושלים': 'Jerusalem',
  'חיפה': 'Haifa',

  // Ukraine
  'Київ': 'Kyiv',
  'Одеса': 'Odesa',
  'Львів': 'Lviv',
  'Харків': 'Kharkiv',
  'Дніпро': 'Dnipro',

  // Bulgaria
  'София': 'Sofia',
  'Пловдив': 'Plovdiv',
  'Варна': 'Varna',
  'Бургас': 'Burgas',

  // Georgia
  'თბილისი': 'Tbilisi',
  'ბათუმი': 'Batumi',

  // Serbia
  'Београд': 'Belgrade',
  'Нови Сад': 'Novi Sad',

  // Cambodia
  'ភ្នំពេញ': 'Phnom Penh',
  'សៀមរាប': 'Siem Reap',

  // Saudi Arabia
  'الرياض': 'Riyadh',
  'جدة': 'Jeddah',

  // Lebanon
  'بيروت': 'Beirut',

  // Egypt
  'القاهرة': 'Cairo',
  'الإسكندرية': 'Alexandria',

  // Myanmar
  'ရန်ကုန်': 'Yangon',
};

// Category to type char mapping
function mapCategory(cat) {
  switch (cat) {
    case 'bakery': return 'C';
    case 'pub': return 'P';
    case 'nightclub': return 'N';
    case 'wine_bar': return 'W';
    case 'beer_garden': return 'B';
    case 'cocktail_bar': return 'C';
    case 'lounge': return 'L';
    case 'beer_bar': return 'B';
    case 'sports_bar': return 'P';
    case 'karaoke_bar': return 'L';
    case 'hookah_bar': return 'L';
    default: return 'C';
  }
}

function refineType(typeChar, name) {
  const n = name.toLowerCase();
  if (n.includes('speakeasy') || n.includes('hidden') || n.includes('secret')) return 'S';
  if (n.includes('rooftop') || n.includes('sky bar') || n.includes('terrace')) return 'R';
  if (n.includes('jazz') || n.includes('blues')) return 'J';
  if (n.includes('tiki') || n.includes('tropical')) return 'T';
  if (n.includes('hotel') || n.includes('ritz') || n.includes('hyatt') || n.includes('hilton') || n.includes('marriott') || n.includes('sheraton') || n.includes('westin') || n.includes('mandarin') || n.includes('four seasons')) return 'H';
  if (n.includes('gastropub') || n.includes('gastro')) return 'G';
  if (n.includes('dive')) return 'D';
  return typeChar;
}

function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function bakerySlug(name, city) {
  const n = toSlug(name), c = toSlug(city);
  return n.endsWith(c) ? n : n + '-' + c;
}

const latinCheck = /^[\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\s\-'.,()&/]+$/;

// ─── Main ───
console.log('Querying local parquet for bakeries in mapped cities...');

const db = new duckdb.Database(':memory:');
const conn = db.connect();

// Build SQL IN clause for all local city names
const localNames = Object.keys(CITY_MAP).map(k => `'${k.replace(/'/g, "''")}'`).join(',');

const query = `
SELECT name, city, country_code, category
FROM read_parquet('${PARQUET}')
WHERE city IN (${localNames})
AND name IS NOT NULL AND length(name) > 1
`;

console.log('Running query...');

const rows = await new Promise((resolve, reject) => {
  conn.all(query, (err, rows) => err ? reject(err) : resolve(rows));
});

console.log(`Found ${rows.length} bakeries in mapped cities`);

{
  // Load existing DB
  const tmpScript = path.join(__dirname, '_tmp_load_fix.js');
  const tmpOutput = path.join(__dirname, '_tmp_db_fix.json');
  fs.writeFileSync(tmpScript, `
const fs = require('fs');
const content = fs.readFileSync(${JSON.stringify(path.join(ROOT, 'lib', 'bakery-data.js'))}, 'utf8');
const jsonStart = content.indexOf('{');
const jsonEnd = content.lastIndexOf('}');
const DB = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
fs.writeFileSync(${JSON.stringify(tmpOutput)}, JSON.stringify(DB));
console.log('Loaded DB');
`);
  execSync(`node --max-old-space-size=4096 ${tmpScript}`);
  fs.unlinkSync(tmpScript);
  const DB = JSON.parse(fs.readFileSync(tmpOutput, 'utf8'));
  fs.unlinkSync(tmpOutput);

  // Build existing slugs
  const existingSlugs = new Set();
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) {
        existingSlugs.add(bakerySlug(entry[0], city));
      }
    }
  }

  const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const COUNTRY_OVERRIDES = {
    'GB': 'United Kingdom', 'US': 'United States', 'KR': 'South Korea',
    'TW': 'Taiwan', 'CZ': 'Czech Republic', 'AE': 'UAE', 'VN': 'Vietnam',
    'RU': 'Russia', 'LA': 'Laos', 'BO': 'Bolivia', 'VE': 'Venezuela',
    'CD': 'DR Congo', 'CI': 'Ivory Coast', 'XK': 'Kosovo', 'PS': 'Palestine',
    'IR': 'Iran', 'SY': 'Syria', 'TZ': 'Tanzania', 'KP': 'North Korea',
  };
  function getCountryName(code) {
    if (COUNTRY_OVERRIDES[code]) return COUNTRY_OVERRIDES[code];
    try { return countryNames.of(code); } catch { return null; }
  }

  let added = 0, skippedDup = 0, skippedNonLatin = 0;

  for (const row of rows) {
    const englishCity = CITY_MAP[row.city];
    if (!englishCity) continue;

    const countryName = getCountryName(row.country_code);
    if (!countryName) continue;

    const name = row.name.trim();
    if (!name || name.length < 2) continue;

    // Skip non-Latin names
    if (!latinCheck.test(name)) { skippedNonLatin++; continue; }

    const slug = bakerySlug(name, englishCity);
    if (existingSlugs.has(slug)) { skippedDup++; continue; }

    let typeChar = mapCategory(row.category);
    typeChar = refineType(typeChar, name);

    if (!DB[countryName]) DB[countryName] = {};
    if (!DB[countryName][englishCity]) DB[countryName][englishCity] = [];

    DB[countryName][englishCity].push([name, 40, 1, typeChar]);
    existingSlugs.add(slug);
    added++;
  }

  console.log(`Added: ${added}`);
  console.log(`Skipped (duplicate): ${skippedDup}`);
  console.log(`Skipped (non-Latin name): ${skippedNonLatin}`);

  // Write back
  const sortedDB = {};
  for (const c of Object.keys(DB).sort()) {
    sortedDB[c] = {};
    for (const ct of Object.keys(DB[c]).sort()) sortedDB[c][ct] = DB[c][ct];
  }
  let total = 0;
  for (const c of Object.keys(sortedDB)) for (const ct of Object.keys(sortedDB[c])) total += sortedDB[c][ct].length;

  const header = `// lib/bakery-data.js\n// Bar database — ${new Date().toISOString().slice(0, 10)}\n// ${total.toLocaleString()} bars across ${Object.keys(sortedDB).length} countries\n// Format: [name, rating*10, reviews/10, typeChar]\n// Types: C=Cocktail Bar, S=Speakeasy, W=Wine Bar, D=Dive Bar, R=Rooftop Bar, T=Tiki Bar, P=Pub, B=Beer Garden, L=Lounge, N=Nightclub, H=Hotel Bar, G=Gastropub, J=Jazz Bar\n`;
  fs.writeFileSync(path.join(ROOT, 'lib', 'bakery-data.js'), header + '\nexport const DB = ' + JSON.stringify(sortedDB) + ';\n');
  console.log(`Total bars: ${total.toLocaleString()}`);
  console.log('Done!');

  db.close();
}
