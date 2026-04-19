// lib/bakery-db.js
// Central bakery database with SEO-friendly helpers
// In production, this would be backed by a real database (Postgres, etc.)
// For now, we import the compact DB and expand it on-demand

import { DB } from './bakery-data'; // The compact bakery data
import { EDITORIAL_BAKERIES, isEditorialBar } from './editorial-data';
import { ENRICHED } from './enriched-index'; // Google Places enrichment (ratings, photos, coords)

// ─── Editorial Lookup (spa-review-style scoring + badges) ───
import _editorialLookupRaw from './editorial-lookup.json' with { type: 'json' };
const EDITORIAL_LOOKUP = _editorialLookupRaw.default || _editorialLookupRaw;

function _editorialKey(name, city) {
  return (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
    + '|'
    + (city || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function _getEditorialData(name, city) {
  return EDITORIAL_LOOKUP[_editorialKey(name, city)] || null;
}

// Spa-review-style rating boost: editorial score → capped 0.3 boost
function _editorialRatingBoost(editorialScore) {
  if (!editorialScore || editorialScore <= 0) return 0;
  return Math.min(0.3, Math.log(1 + editorialScore) * 0.12);
}

// Blob photos are stored in a PRIVATE Vercel Blob store. Direct URLs
// return 403 to anonymous clients, so we route them through
// /api/blob-photo which reads via the server-side token.
function proxyBlobUrl(blobUrl) {
  if (!blobUrl || typeof blobUrl !== 'string') return blobUrl;
  if (!blobUrl.includes('blob.vercel-storage.com')) return blobUrl;
  // Extract the pathname after the host (e.g. "bakery-photos/slug/0.jpg")
  try {
    const u = new URL(blobUrl);
    const pathname = u.pathname.replace(/^\/+/, '');
    return `/api/blob-photo?path=${encodeURIComponent(pathname)}`;
  } catch {
    return blobUrl;
  }
}

// ─── Type Mappings ───
export const TYPE_MAP = {
  K: 'Bakery',
  P: 'Patisserie',
  B: 'Boulangerie',
  C: 'Cafe Bakery',
  A: 'Artisan Bakery',
  S: 'Pastry Shop',
  V: 'Viennoiserie',
  G: 'Bagel Shop',
  R: 'Bread Bakery',
  M: 'Macaron Shop',
  L: 'Cake Shop',
  D: 'Donut Shop',
  J: 'Croissanterie',
};

export const TYPE_COLORS = {
  'Bakery':          '#c2884a',
  'Patisserie':      '#d946a0',
  'Boulangerie':     '#8b5a2b',
  'Cafe Bakery':     '#92400e',
  'Artisan Bakery':  '#a16207',
  'Pastry Shop':     '#db2777',
  'Viennoiserie':    '#e0a458',
  'Bagel Shop':      '#78350f',
  'Bread Bakery':    '#b45309',
  'Macaron Shop':    '#f472b6',
  'Cake Shop':       '#ec4899',
  'Donut Shop':      '#f59e0b',
  'Croissanterie':   '#eab308',
};

export const TYPE_ICONS = {
  'Bakery':          '🥐',
  'Patisserie':      '🧁',
  'Boulangerie':     '🥖',
  'Cafe Bakery':     '☕',
  'Artisan Bakery':  '🍞',
  'Pastry Shop':     '🥮',
  'Viennoiserie':    '🥐',
  'Bagel Shop':      '🥯',
  'Bread Bakery':    '🍞',
  'Macaron Shop':    '🍬',
  'Cake Shop':       '🎂',
  'Donut Shop':      '🍩',
  'Croissanterie':   '🥐',
};

// ─── Slug Utilities ───
export function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function barSlug(name, city) {
  // Don't add city again if name already ends with it
  const nameSlug = toSlug(name);
  const citySlug = toSlug(city);
  if (nameSlug.endsWith(citySlug)) {
    return nameSlug;
  }
  return toSlug(`${name}-${city}`);
}

// ─── Photo URL (deterministic) ───
export function barHash(name, location) {
  let h = 0;
  const s = name + location;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getBarPhotoUrl(nameOrSlug, location, w = 600, h = 400) {
  const slug = location ? barSlug(nameOrSlug, location) : nameOrSlug;
  const blobBase = process.env.NEXT_PUBLIC_BLOB_BASE_URL || '';
  if (blobBase) {
    return `${blobBase}/bakery-photos/${slug}.jpg`;
  }
  return `/photos/${slug}.jpg`;
}

export function getBarDataUrl(slug) {
  return `https://www.50bestbakeries.com/bakery-data/${slug}.json`;
}

export function getFallbackPhotoUrl(nameOrSlug, location, w = 600, h = 400) {
  // Deterministic selection from a set of bakery-themed Unsplash stock photos
  const bakeryImages = [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=500&fit=crop', // croissants
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=500&fit=crop', // pastry display
    'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=500&fit=crop', // bread loaves
    'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=500&fit=crop', // artisan bread
    'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&h=500&fit=crop', // baker at work
    'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&h=500&fit=crop', // french patisserie
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=500&fit=crop', // bakery counter
    'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&h=500&fit=crop', // sourdough
    'https://images.unsplash.com/photo-1546538490-0fe0a8eba4e6?w=800&h=500&fit=crop', // macarons
    'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=800&h=500&fit=crop', // cupcakes and cakes
  ];
  const seed = location ? barHash(nameOrSlug, location) : [...nameOrSlug].reduce((a, c) => a + c.charCodeAt(0), 0);
  return bakeryImages[Math.abs(seed) % bakeryImages.length];
}

// ─── Expand compact entry to full bakery object ───
function expandBar(entry, city, country, rank = 0) {
  const [name, ratingX10, reviewsDiv10, typeChar] = entry;
  const fullName = name;
  const type = TYPE_MAP[typeChar] || 'Bakery';
  const slug = barSlug(fullName, city);
  const enriched = ENRICHED[slug];
  const editorial = _getEditorialData(fullName, city);

  // Base rating: prefer enriched (Google Places) → editorial Google data → Overture default
  const baseRating = enriched?.rating ?? editorial?.googleRating ?? (ratingX10 / 10);
  const baseReviews = enriched?.reviewCount ?? editorial?.googleReviews ?? (reviewsDiv10 * 10);

  // Apply spa-review-style editorial rating boost (capped at 0.3)
  const editorialScore = editorial?.s || 0;
  const boostedRating = Math.min(5, Math.round((baseRating + _editorialRatingBoost(editorialScore)) * 10) / 10);

  return {
    name: fullName,
    slug,
    city,
    country,
    rating: boostedRating,
    reviews: baseReviews,
    type,
    typeColor: TYPE_COLORS[type] || '#c2884a',
    typeIcon: TYPE_ICONS[type] || '🥐',
    rank,
    editorialScore,
    photo: proxyBlobUrl(enriched?.photoUrls?.[0]) || getBarPhotoUrl(fullName, city),
    address: enriched?.formattedAddress || null,
    phone: enriched?.phone || null,
    website: enriched?.website || null,
    coords: enriched?.coords || null,
    googleMapsUrl: enriched?.googleMapsUrl || null,
    openingHours: enriched?.openingHours || null,
    photoUrls: (enriched?.photoUrls || []).map(proxyBlobUrl),
    isEnriched: !!enriched,
    isEditorial: editorialScore > 0,
    badges: editorial?.b || null,
  };
}

// ─── Query Functions ───

// ─── World's 50 Best Bakeries (curated, not in DB) ───
export const G50 = [
  // Intentionally empty — curated "World's 50 Best Bakeries" list not yet assembled.
  // Prior contents were residual fake bar data from the 50bestbars fork.
];

function g50ToBar(entry) {
  const globalRank = G50.indexOf(entry) + 1;
  return {
    name: entry.name,
    slug: toSlug(`${entry.name}-${entry.city}`),
    city: entry.city,
    country: entry.country,
    rating: entry.rating,
    reviews: entry.reviews,
    type: entry.type,
    typeColor: TYPE_COLORS[entry.type] || '#c2884a',
    typeIcon: TYPE_ICONS[entry.type] || '🥐',
    rank: 0,
    globalRank,
    photo: getBarPhotoUrl(entry.name, entry.city),
    tag: entry.tag || null,
    aw: entry.aw || null,
    isTop50: true,
  };
}

// Look up a bakery's rating/reviews/type from the underlying DB.
// Editorial entries reference bakeries that already exist in DB[country][city],
// so we expand them with real type/rating data.
function _findDbEntry(name, city, country) {
  const cityArr = DB[country]?.[city];
  if (!cityArr) return null;
  const lc = name.toLowerCase();
  return cityArr.find(e => e[0].toLowerCase() === lc) || null;
}

function editorialToBar(entry) {
  const dbEntry = _findDbEntry(entry.name, entry.city, entry.country);
  const slug = barSlug(entry.name, entry.city);
  const enriched = ENRICHED[slug];
  const editorial = _getEditorialData(entry.name, entry.city);
  const ratingX10 = dbEntry ? dbEntry[1] : 49;
  const reviewsDiv10 = dbEntry ? dbEntry[2] : 10;
  const typeChar = dbEntry ? dbEntry[3] : 'K';
  const type = TYPE_MAP[typeChar] || 'Bakery';
  const editorialScore = editorial?.s || 0;
  const baseRating = enriched?.rating ?? editorial?.googleRating ?? (ratingX10 / 10);
  const baseReviews = enriched?.reviewCount ?? editorial?.googleReviews ?? (reviewsDiv10 * 10);
  const boostedRating = Math.min(5, Math.round((baseRating + _editorialRatingBoost(editorialScore)) * 10) / 10);
  const aw = (entry.sources || []).map(s =>
    s.name + (entry.sourceRank ? ` · ${entry.country} #${entry.sourceRank}` : '')
  );
  return {
    name: entry.name,
    slug,
    city: entry.city,
    country: entry.country,
    rating: boostedRating,
    reviews: baseReviews,
    type,
    typeColor: TYPE_COLORS[type] || '#c2884a',
    typeIcon: TYPE_ICONS[type] || '🥐',
    rank: 0,
    sourceRank: entry.sourceRank || null,
    photo: proxyBlobUrl(enriched?.photoUrls?.[0]) || entry.images?.[0] || getBarPhotoUrl(entry.name, entry.city),
    address: enriched?.formattedAddress || null,
    phone: enriched?.phone || null,
    website: enriched?.website || null,
    coords: enriched?.coords || entry.coords || null,
    googleMapsUrl: enriched?.googleMapsUrl || null,
    openingHours: enriched?.openingHours || null,
    photoUrls: (enriched?.photoUrls || []).map(proxyBlobUrl),
    editorialScore,
    tag: null,
    aw,
    badges: editorial?.b || entry.badges || null,
    sources: entry.sources || null,
    wikipediaUrl: entry.wikipediaUrl || null,
    isEditorial: editorialScore > 0 || true,
    isEnriched: !!enriched,
  };
}

export function getGlobalTop() {
  // Return the top 50 editorial bakeries worldwide.
  // Score = enriched rating × log10(reviews + 10), so well-rated + famous
  // bakeries outrank very-small-sample high-rated ones.
  // Curated entries get a small authority boost so my hand-picked famous
  // bakeries tend to lead.
  const AUTHORITY_BOOST = (b) => {
    const isCurated = (b.sources || []).some(s => s.name === 'Curated');
    return isCurated ? 1.0 : 0.0;
  };
  const score = (b) => {
    const base = editorialToBar(b);
    const rating = typeof base.rating === 'number' ? base.rating : 4.0;
    const reviews = typeof base.reviews === 'number' ? base.reviews : 10;
    return rating * Math.log10(Math.max(reviews, 1) + 10) + AUTHORITY_BOOST(b);
  };
  const scored = EDITORIAL_BAKERIES
    .map(b => ({ b, s: score(b) }))
    .sort((x, y) => y.s - x.s);

  // Dedupe by slug while we map to the final shape
  const seen = new Set();
  const out = [];
  for (const { b } of scored) {
    const expanded = editorialToBar(b);
    if (seen.has(expanded.slug)) continue;
    seen.add(expanded.slug);
    out.push(expanded);
    if (out.length >= 50) break;
  }
  return out.map((b, i) => ({ ...b, rank: i + 1, globalRank: i + 1, isTop50: true }));
}

export function getAllCountries() {
  return Object.keys(DB).sort();
}

export function getCitiesForCountry(country) {
  return DB[country] ? Object.keys(DB[country]).sort() : [];
}

export function getTotalBars() {
  let t = 0;
  for (const c of Object.keys(DB))
    for (const ct of Object.keys(DB[c]))
      t += DB[c][ct].length;
  return t;
}

export function getCountryStats() {
  const stats = [];
  for (const country of Object.keys(DB)) {
    let total = 0;
    const cities = Object.keys(DB[country]);
    for (const city of cities) total += DB[country][city].length;
    stats.push({ country, slug: toSlug(country), cities: cities.length, bakeries: total });
  }
  return stats.sort((a, b) => b.bakeries - a.bakeries);
}

export function getCityStats(country) {
  if (!DB[country]) return [];
  const stats = [];
  for (const city of Object.keys(DB[country])) {
    stats.push({
      city,
      country,
      slug: toSlug(city),
      bakeries: DB[country][city].length,
    });
  }
  return stats.sort((a, b) => b.bakeries - a.bakeries);
}

export function getBarsForCountry(country, limit = 50) {
  const all = [];
  // Add G50 bakeries for this country
  for (const entry of G50) {
    if (entry.country === country) all.push(g50ToBar(entry));
  }
  // Add editorial bakeries for this country
  for (const entry of EDITORIAL_BAKERIES) {
    if (entry.country === country) all.push(editorialToBar(entry));
  }
  // Add database bakeries
  if (DB[country]) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) all.push(expandBar(entry, city, country));
    }
  }
  // Deduplicate by slug (G50 first, then editorial, then DB)
  const seen = new Set();
  const unique = all.filter(b => {
    if (seen.has(b.slug)) return false;
    seen.add(b.slug);
    return true;
  });
  return unique
    .sort((a, b) =>
      // 1. World's Best (G50) first
      (b.isTop50 === a.isTop50 ? 0 : b.isTop50 ? 1 : -1) ||
      (a.isTop50 && b.isTop50 ? (a.globalRank || 999) - (b.globalRank || 999) : 0) ||
      // 2. Sort by editorial score descending (spa-review-style)
      (b.editorialScore || 0) - (a.editorialScore || 0) ||
      // 3. Then by boosted rating, then reviews
      (b.rating - a.rating) || (b.reviews - a.reviews)
    )
    .slice(0, limit)
    .map((b, i) => ({ ...b, rank: i + 1 }));
}

export function getBarsForCity(country, city, limit = 50) {
  const all = [];
  // Add G50 bakeries for this city
  for (const entry of G50) {
    if (entry.city === city && entry.country === country) all.push(g50ToBar(entry));
  }
  // Add editorial bakeries for this city
  for (const entry of EDITORIAL_BAKERIES) {
    if (entry.city === city && entry.country === country) all.push(editorialToBar(entry));
  }
  // Add database bakeries
  if (DB[country]?.[city]) {
    for (const entry of DB[country][city]) {
      all.push(expandBar(entry, city, country));
    }
  }
  // Deduplicate by slug
  const seen = new Set();
  const unique = all.filter(b => {
    if (seen.has(b.slug)) return false;
    seen.add(b.slug);
    return true;
  });
  return unique
    .sort((a, b) =>
      (b.isTop50 === a.isTop50 ? 0 : b.isTop50 ? 1 : -1) ||
      (b.editorialScore || 0) - (a.editorialScore || 0) ||
      (b.rating - a.rating) || (b.reviews - a.reviews)
    )
    .slice(0, limit)
    .map((b, i) => ({ ...b, rank: i + 1 }));
}

export function getBarBySlug(slug) {
  // Check G50 first
  for (const entry of G50) {
    const bakery = g50ToBar(entry);
    if (bakery.slug === slug) return bakery;
  }
  // Check editorial bakeries
  for (const entry of EDITORIAL_BAKERIES) {
    const bakery = editorialToBar(entry);
    if (bakery.slug === slug) return bakery;
  }
  // Then check the database
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) {
        const bakery = expandBar(entry, city, country);
        if (bakery.slug === slug) return bakery;
      }
    }
  }
  return null;
}

export function getAllSlugs() {
  const slugs = new Set();
  // Include G50
  for (const entry of G50) {
    slugs.add(toSlug(`${entry.name}-${entry.city}`));
  }
  // Include all DB bakeries
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) {
        const bakery = expandBar(entry, city, country);
        slugs.add(bakery.slug);
      }
    }
  }
  return [...slugs];
}

// ─── Specialties by Type ───
export function getSpecialties(type) {
  const byType = {
    'Bakery':         ['Fresh Bread', 'Pastries', 'Cakes', 'Cookies', 'Sandwiches', 'Daily Bakes'],
    'Patisserie':     ['French Pastries', 'Tarts', 'Éclairs', 'Mille-feuille', 'Petits Fours', 'Seasonal Desserts'],
    'Boulangerie':    ['Baguettes', 'Sourdough', 'Pain au Levain', 'Country Loaves', 'Fougasse', 'Whole Grain Breads'],
    'Cafe Bakery':    ['Coffee & Pastries', 'Breakfast Menu', 'Sandwiches', 'Brunch', 'Laptop-Friendly', 'House-Baked Treats'],
    'Artisan Bakery': ['Naturally Leavened Bread', 'Heritage Grains', 'Stone-Milled Flour', 'Long Ferment', 'Hand-Shaped Loaves', 'Seasonal Pastries'],
    'Pastry Shop':    ['Viennoiserie', 'Fruit Tarts', 'Chocolate Desserts', 'Seasonal Specials', 'Custom Orders', 'Gift Boxes'],
    'Viennoiserie':   ['Croissants', 'Pain au Chocolat', 'Brioche', 'Chaussons', 'Kouign-Amann', 'Laminated Doughs'],
    'Bagel Shop':     ['Hand-Rolled Bagels', 'Cream Cheese Varieties', 'Lox & Schmear', 'Bialys', 'Breakfast Sandwiches', 'House Spreads'],
    'Bread Bakery':   ['Sourdough', 'Rye', 'Whole Wheat', 'Multigrain', 'Specialty Loaves', 'Bread Subscriptions'],
    'Macaron Shop':   ['Classic Macarons', 'Seasonal Flavours', 'Gift Boxes', 'Wedding Macarons', 'Chocolate Macarons', 'Fruit Macarons'],
    'Cake Shop':      ['Custom Cakes', 'Wedding Cakes', 'Cupcakes', 'Celebration Cakes', 'Cake Slices', 'Birthday Orders'],
    'Donut Shop':     ['Glazed Donuts', 'Filled Donuts', 'Specialty Rings', 'Cake Donuts', 'Coffee Pairings', 'Daily Fresh'],
    'Croissanterie':  ['Butter Croissants', 'Almond Croissants', 'Pain au Chocolat', 'Ham & Cheese', 'Savoury Croissants', 'Laminated Pastries'],
  };
  return byType[type] || byType['Bakery'];
}

// ─── SEO Content Generation ───

export function getBarMetaTitle(bakery) {
  return `${bakery.name} — Reviews, Pastries & Info`;
}

export function getBarMetaDescription(bakery) {
  return `${bakery.name} in ${bakery.city}, ${bakery.country} — rated ${bakery.rating}/5 from ${bakery.reviews.toLocaleString()} reviews. ${bakery.type} featuring ${getSpecialties(bakery.type).slice(0, 3).join(', ')} and more. Read reviews, explore the menu & plan your visit.`;
}

export function getCityMetaTitle(city, country) {
  return `Best Bakeries in ${city}, ${country} (2026) — Top-Rated & Reviewed`;
}

export function getCityMetaDescription(city, country, count) {
  return `Discover the ${count}+ best bakeries in ${city}, ${country}. Compare ratings, read reviews, and find top-rated artisan bakeries, patisseries, boulangeries & more.`;
}

export function getCountryMetaTitle(country) {
  return `Best Bakeries in ${country} (2026) — Complete Guide`;
}

export function getCountryMetaDescription(country, cityCount, barCount) {
  return `Explore ${barCount}+ bakeries across ${cityCount} cities in ${country}. From world-class patisseries to hidden boulangeries, find the perfect bakery experience. Ratings, reviews & insider guides.`;
}

export function getTotalBarsInCountry(country) {
  if (!DB[country]) return 0;
  let t = 0;
  for (const city of Object.keys(DB[country])) t += DB[country][city].length;
  return t;
}

export function getTotalBarsInCity(country, city) {
  return DB[country]?.[city]?.length || 0;
}

export function getGlobalBars(limit = 50, offset = 0) {
  // Build global ranking: G50 first, then editorial, then all DB bakeries
  const all = [];
  for (const entry of G50) all.push(g50ToBar(entry));
  for (const entry of EDITORIAL_BAKERIES) all.push(editorialToBar(entry));
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) all.push(expandBar(entry, city, country));
    }
  }
  // Deduplicate
  const seen = new Set();
  const unique = all.filter(b => {
    if (seen.has(b.slug)) return false;
    seen.add(b.slug);
    return true;
  });
  // Sort: G50 first (by globalRank), editorial second, then by rating
  unique.sort((a, b) =>
    (b.isTop50 === a.isTop50 ? 0 : b.isTop50 ? 1 : -1) ||
    (a.isTop50 && b.isTop50 ? (a.globalRank || 999) - (b.globalRank || 999) : 0) ||
    (b.isEditorial === a.isEditorial ? 0 : b.isEditorial ? 1 : -1) ||
    (b.rating - a.rating) || (b.reviews - a.reviews)
  );
  return unique.slice(offset, offset + limit).map((b, i) => ({ ...b, rank: offset + i + 1 }));
}

export function getTotalGlobalBars() {
  // G50 + editorial + DB (deduplicated count)
  const slugs = new Set();
  for (const entry of G50) slugs.add(toSlug(`${entry.name}-${entry.city}`));
  for (const entry of EDITORIAL_BAKERIES) slugs.add(barSlug(entry.name, entry.city));
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) slugs.add(barSlug(entry[0], city));
    }
  }
  return slugs.size;
}

export function searchCountriesAndCities(query) {
  if (!query || query.length < 2) return { countries: [], cities: [] };
  const q = query.toLowerCase();

  // Search countries
  const countries = [];
  for (const country of Object.keys(DB)) {
    if (country.toLowerCase().includes(q)) {
      const cities = Object.keys(DB[country]);
      let barCount = 0;
      for (const city of cities) barCount += DB[country][city].length;
      for (const entry of G50) {
        if (entry.country === country) barCount++;
      }
      countries.push({
        name: country,
        slug: toSlug(country),
        cityCount: cities.length,
        barCount: barCount,
      });
    }
    if (countries.length >= 3) break;
  }

  // Search cities
  const cityMap = new Map();
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      if (city.toLowerCase().includes(q)) {
        const key = `${city}|${country}`;
        if (!cityMap.has(key)) {
          cityMap.set(key, {
            name: city,
            slug: toSlug(city),
            country,
            barCount: DB[country][city].length,
          });
        }
      }
    }
  }
  for (const entry of G50) {
    if (entry.city.toLowerCase().includes(q)) {
      const key = `${entry.city}|${entry.country}`;
      if (cityMap.has(key)) {
        cityMap.get(key).barCount++;
      } else {
        cityMap.set(key, {
          name: entry.city,
          slug: toSlug(entry.city),
          country: entry.country,
          barCount: 1,
        });
      }
    }
  }

  const cities = [...cityMap.values()]
    .sort((a, b) => b.barCount - a.barCount)
    .slice(0, 5);

  return { countries, cities };
}

export function searchBars(query, limit = 20) {
  const q = query.toLowerCase();
  const results = [];
  // Search G50 first
  for (const entry of G50) {
    if (entry.name.toLowerCase().includes(q) || entry.city.toLowerCase().includes(q)) {
      results.push(g50ToBar(entry));
    }
  }
  // Search editorial bakeries
  for (const entry of EDITORIAL_BAKERIES) {
    if (entry.name.toLowerCase().includes(q) || entry.city.toLowerCase().includes(q)) {
      results.push(editorialToBar(entry));
    }
  }
  // Search DB
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) {
        const bakery = expandBar(entry, city, country);
        if (bakery.name.toLowerCase().includes(q) || city.toLowerCase().includes(q)) {
          results.push(bakery);
        }
      }
    }
  }
  // Deduplicate by slug
  const seen = new Set();
  return results
    .filter(b => {
      if (seen.has(b.slug)) return false;
      seen.add(b.slug);
      return true;
    })
    .slice(0, limit);
}

export function getBarsOfType(type, limit = 50) {
  const all = [];
  // G50 of this type
  for (const entry of G50) {
    if (entry.type === type) all.push(g50ToBar(entry));
  }
  // DB bakeries of this type
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) {
        const bakery = expandBar(entry, city, country);
        if (bakery.type === type) all.push(bakery);
      }
    }
  }
  const seen = new Set();
  return all
    .filter(b => {
      if (seen.has(b.slug)) return false;
      seen.add(b.slug);
      return true;
    })
    .sort((a, b) => (b.isTop50 === a.isTop50 ? 0 : b.isTop50 ? 1 : -1) || (b.rating - a.rating) || (b.reviews - a.reviews))
    .slice(0, limit)
    .map((b, i) => ({ ...b, rank: i + 1 }));
}

export function getTypeStats() {
  const counts = {};
  for (const type of Object.values(TYPE_MAP)) counts[type] = 0;
  for (const entry of G50) {
    if (counts[entry.type] !== undefined) counts[entry.type]++;
  }
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) {
        const type = TYPE_MAP[entry[3]] || 'Bakery';
        if (counts[type] !== undefined) counts[type]++;
        else counts[type] = 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([type, count]) => ({
      type,
      count,
      slug: toSlug(type),
      color: TYPE_COLORS[type] || '#c2884a',
      icon: TYPE_ICONS[type] || '🥐',
    }))
    .sort((a, b) => b.count - a.count);
}

export function getCountriesForType(type) {
  const countries = new Set();
  for (const entry of G50) {
    if (entry.type === type) countries.add(entry.country);
  }
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) {
        if ((TYPE_MAP[entry[3]] || 'Bakery') === type) countries.add(country);
      }
    }
  }
  return [...countries].sort();
}

export function getTopCities(limit = 20) {
  const cityCounts = {};
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      const key = `${city}||${country}`;
      cityCounts[key] = (cityCounts[key] || 0) + DB[country][city].length;
    }
  }
  // Also count G50
  for (const entry of G50) {
    const key = `${entry.city}||${entry.country}`;
    cityCounts[key] = (cityCounts[key] || 0) + 1;
  }
  return Object.entries(cityCounts)
    .map(([key, count]) => {
      const [city, country] = key.split('||');
      return { city, country, count, slug: toSlug(city) };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getBarsOfTypeInCountry(type, country, limit = 50) {
  const all = [];
  for (const entry of G50) {
    if (entry.type === type && entry.country === country) all.push(g50ToBar(entry));
  }
  if (DB[country]) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) {
        const bakery = expandBar(entry, city, country);
        if (bakery.type === type) all.push(bakery);
      }
    }
  }
  const seen = new Set();
  return all
    .filter(b => {
      if (seen.has(b.slug)) return false;
      seen.add(b.slug);
      return true;
    })
    .sort((a, b) => (b.isTop50 === a.isTop50 ? 0 : b.isTop50 ? 1 : -1) || (b.rating - a.rating) || (b.reviews - a.reviews))
    .slice(0, limit)
    .map((b, i) => ({ ...b, rank: i + 1 }));
}

export function getTotalBarsOfTypeInCountry(type, country) {
  let t = G50.filter(e => e.type === type && e.country === country).length;
  if (DB[country]) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) {
        if ((TYPE_MAP[entry[3]] || 'Bakery') === type) t++;
      }
    }
  }
  return t;
}

export function getTypeCountryCombinations() {
  const combos = new Map();
  for (const entry of G50) {
    const key = `${entry.type}||${entry.country}`;
    combos.set(key, (combos.get(key) || 0) + 1);
  }
  for (const country of Object.keys(DB)) {
    for (const city of Object.keys(DB[country])) {
      for (const entry of DB[country][city]) {
        const type = TYPE_MAP[entry[3]] || 'Bakery';
        const key = `${type}||${country}`;
        combos.set(key, (combos.get(key) || 0) + 1);
      }
    }
  }
  return [...combos.entries()]
    .map(([key, count]) => {
      const [type, country] = key.split('||');
      return { type, country, count, typeSlug: toSlug(type), countrySlug: toSlug(country) };
    })
    .sort((a, b) => b.count - a.count);
}

export function getBarRankings(country = null, city = null, limit = 50) {
  let bakeries = [];
  if (city && country) {
    bakeries = getBarsForCity(country, city, limit);
  } else if (country) {
    bakeries = getBarsForCountry(country, limit);
  } else {
    bakeries = getGlobalBars(limit);
  }
  return bakeries.map((b, i) => ({ ...b, rank: i + 1 }));
}

// ─── Similar Bakeries ───
export function getSimilarBakeries(slug, limit = 6) {
  const bakery = getBarBySlug(slug);
  if (!bakery) return [];

  const { city, country, type } = bakery;
  const results = [];
  const seen = new Set([slug]);

  function addBar(b) {
    if (seen.has(b.slug)) return;
    seen.add(b.slug);
    results.push({
      name: b.name,
      slug: b.slug,
      city: b.city,
      country: b.country,
      rating: b.rating,
      reviews: b.reviews,
      type: b.type,
      typeColor: b.typeColor || TYPE_COLORS[b.type] || '#c2884a',
      photo: b.photo || getBarPhotoUrl(b.name, b.city),
    });
  }

  // Priority 1: Same city, same type
  const cityBars = getBarsForCity(country, city, 200);
  for (const b of cityBars) {
    if (results.length >= limit) return results;
    if (b.type === type) addBar(b);
  }

  // Priority 2: Same city, different type
  for (const b of cityBars) {
    if (results.length >= limit) return results;
    addBar(b);
  }

  // Priority 3: Same country, same type
  const countryBars = getBarsForCountry(country, 200);
  for (const b of countryBars) {
    if (results.length >= limit) return results;
    if (b.type === type) addBar(b);
  }

  return results.slice(0, limit);
}
