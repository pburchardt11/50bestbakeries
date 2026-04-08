#!/usr/bin/env node
// merge-city-districts.mjs — Merge city districts/neighborhoods into parent cities in bakery-data.js

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'lib', 'bakery-data.js');

// Read and parse the DB file
const raw = readFileSync(DB_PATH, 'utf-8');

// Extract the JS object from "export const DB = {...};"
const match = raw.match(/^([\s\S]*?export const DB = )([\s\S]+);(\s*)$/);
if (!match) {
  console.error('Could not parse bakery-data.js');
  process.exit(1);
}
const prefix = match[1];  // everything before the JSON object
const suffix = ';' + match[3];  // the trailing semicolon + whitespace
const DB = JSON.parse(match[2]);

// Define merges: [country, targetCity, [...districtNames]]
// District names are matched case-insensitively against city keys
const MERGES = [
  ['Japan', 'Tokyo', [
    'Shinjuku', 'Minato', 'Chiyoda', 'Meguro', 'Taito', 'Nakano', 'Shibuya',
    'Roppongi', 'Ginza', 'Ebisu', 'Azabu', 'Ikebukuro', 'Akasaka', 'Omotesando',
    'Nishi-Shinjuku', 'Kabukicho', 'Shimokitazawa', 'Koenji', 'Kichijoji',
    'Gotanda', 'Shinbashi', 'Yurakucho', 'Nihonbashi',
  ]],
  ['United States', 'New York', [
    'Brooklyn', 'Bronx', 'Astoria', 'Manhattan', 'Long Island City',
    'Williamsburg', 'Queens',
  ]],
  ['United States', 'Los Angeles', [
    'Hollywood', 'West Hollywood', 'Beverly Hills', 'Santa Monica', 'Silver Lake',
  ]],
  ['United Kingdom', 'London', [
    'Islington', 'Camden', 'Shoreditch', 'Soho', 'Westminster', 'Kensington',
    'Brixton', 'Chelsea', 'Covent Garden', 'Hackney', 'Mayfair',
    'Dalston', 'Peckham', 'Bermondsey', 'Fitzrovia', 'Notting Hill', 'Clerkenwell',
    'Battersea', 'Marylebone', 'Angel', 'Bethnal Green', 'Stoke Newington',
  ]],
  ['India', 'Delhi', [
    'New Delhi', 'Gurugram', 'Noida', 'Ghaziabad', 'Faridabad', 'Greater Noida', 'Gurgaon',
  ]],
  ['India', 'Mumbai', [
    'Navi Mumbai', 'Thane',
  ]],
  // Istanbul — check both Turkey and Türkiye
  ['Turkey', 'Istanbul', [
    'Beyoglu', 'Beyoğlu', 'Kadikoy', 'Kadıköy', 'Fatih', 'Besiktas', 'Beşiktaş',
    'Sisli', 'Şişli', 'Taksim', 'Karakoy', 'Karaköy',
  ]],
  ['Türkiye', 'Istanbul', [
    'Beyoglu', 'Beyoğlu', 'Kadikoy', 'Kadıköy', 'Fatih', 'Besiktas', 'Beşiktaş',
    'Sisli', 'Şişli', 'Taksim', 'Karakoy', 'Karaköy',
  ]],
  ['Indonesia', 'Jakarta', [
    'Kuningan', 'Kelapa Gading', 'South Jakarta', 'Jakarta Selatan',
    'Jakarta Pusat', 'Jakarta Barat', 'Menteng', 'Kemang',
  ]],
  ['South Korea', 'Seoul', [
    'Gangnam-gu', 'Gangnam', 'Mapo-gu', 'Itaewon', 'Hongdae', 'Jongno-gu',
    'Jung-gu', 'Songpa-gu', 'Yongsan-gu', 'Seongdong-gu', 'Seocho-gu',
  ]],
  ['Mexico', 'Mexico City', [
    'Coyoacán', 'Coyoacan', 'Juárez', 'Juarez', 'Condesa',
    'Roma', 'Polanco', 'Cuauhtémoc', 'Cuauhtemoc', 'Miguel Hidalgo',
  ]],
  ['Singapore', 'Singapore', [
    'Orchard', 'Tanjong Pagar',
  ]],
  ['Hong Kong SAR China', 'Hong Kong', [
    'Kowloon', 'Kowloon City District', 'Central', 'Wan Chai', 'WanChai|',
    'Tsim Sha Tsui', 'Mong Kok', 'Sheung Wan', 'Lan Kwai Fong',
    'Causeway Bay', 'Happy Valley', 'HongKongIsland|', 'Jordan',
    'KwunTong|', 'Tai Kok Tsui',
  ]],
  ['France', 'Paris', [
    'Belleville', 'Montmartre', 'Pigalle', 'Oberkampf', 'Le Marais', 'Bastille',
  ]],
  ['Germany', 'Berlin', [
    'Schöneberg', 'Schoneberg', 'Mitte', 'Kreuzberg', 'Friedrichshain',
    'Prenzlauer Berg', 'Charlottenburg', 'Neukölln', 'Neukolln',
  ]],
  ['UAE', 'Dubai', [
    'Marina', 'Dubai Marina', 'dubai', 'Bur Dubai',
  ]],
];

let totalMerged = 0;
let totalBars = 0;

for (const [country, targetCity, districts] of MERGES) {
  const countryData = DB[country];
  if (!countryData) {
    console.log(`  SKIP: Country "${country}" not found`);
    continue;
  }

  // Find the target city key — prefer exact case match, then case-insensitive
  let targetKey = countryData[targetCity] !== undefined
    ? targetCity
    : Object.keys(countryData).find(k => k.toLowerCase() === targetCity.toLowerCase());

  // If target doesn't exist yet, create it
  if (!targetKey) {
    targetKey = targetCity;
    countryData[targetKey] = [];
    console.log(`  Created new city "${targetCity}" in "${country}"`);
  }

  // If the found key has wrong casing (e.g., JAKARTA instead of Jakarta), rename it
  if (targetKey !== targetCity && targetKey.toLowerCase() === targetCity.toLowerCase()) {
    countryData[targetCity] = countryData[targetKey];
    delete countryData[targetKey];
    console.log(`  Renamed "${targetKey}" → "${targetCity}" in "${country}"`);
    targetKey = targetCity;
  }

  const targetBars = countryData[targetKey];
  const beforeCount = targetBars.length;
  let mergedForCity = 0;

  // Build case-insensitive lookup of all city keys
  const cityKeysByLower = new Map();
  for (const k of Object.keys(countryData)) {
    const lower = k.toLowerCase();
    if (!cityKeysByLower.has(lower)) cityKeysByLower.set(lower, []);
    cityKeysByLower.get(lower).push(k);
  }

  for (const district of districts) {
    const lower = district.toLowerCase();

    const matchingKeys = cityKeysByLower.get(lower) || [];
    for (const key of matchingKeys) {
      if (key === targetKey) continue;  // don't merge target into itself
      if (!countryData[key]) continue;  // already deleted (duplicate in list)
      const bars = countryData[key];
      targetBars.push(...bars);
      mergedForCity += bars.length;
      console.log(`  ${country} > ${key} (${bars.length} bars) → ${targetKey}`);
      delete countryData[key];
    }
  }

  if (mergedForCity > 0) {
    console.log(`  => ${targetKey}: ${beforeCount} + ${mergedForCity} = ${targetBars.length} bars\n`);
    totalMerged++;
    totalBars += mergedForCity;
  }
}

console.log(`\nDone: ${totalMerged} cities received merges, ${totalBars} bars relocated.`);

// Write back
const output = prefix + JSON.stringify(DB) + suffix;
writeFileSync(DB_PATH, output, 'utf-8');
console.log(`Wrote ${DB_PATH}`);
