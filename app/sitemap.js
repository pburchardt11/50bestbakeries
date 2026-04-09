// app/sitemap.js
// Generates multiple sitemaps using Next.js sitemap index support
// Splits bakery URLs across multiple sitemaps (max 40,000 per sitemap)

import {
  getAllCountries, getCitiesForCountry, getAllSlugs, toSlug,
  getTypeStats, getTypeCountryCombinations,
} from '../lib/bakery-db';

const BARS_PER_SITEMAP = 40000;

// Next.js calls this to generate the sitemap index
export async function generateSitemaps() {
  const totalSlugs = getAllSlugs().length;
  const barSitemapCount = Math.ceil(totalSlugs / BARS_PER_SITEMAP);

  // id 0 = static/structural pages, ids 1..N = bakery pages
  const ids = [{ id: 0 }];
  for (let i = 1; i <= barSitemapCount; i++) {
    ids.push({ id: i });
  }
  return ids;
}

export default function sitemap({ id }) {
  const baseUrl = 'https://www.50bestbakeries.com';
  const now = new Date().toISOString();

  // Sitemap 0: all structural pages (countries, cities, types, blog, etc.)
  if (id === 0) {
    const urls = [];

    // Homepage
    urls.push({ url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 });

    // Country pages
    for (const country of getAllCountries()) {
      urls.push({ url: `${baseUrl}/country/${toSlug(country)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 });
      urls.push({ url: `${baseUrl}/best-bakeries-in/${toSlug(country)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 });
    }

    // City pages
    for (const country of getAllCountries()) {
      for (const city of getCitiesForCountry(country)) {
        urls.push({ url: `${baseUrl}/city/${toSlug(city)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
      }
    }

    // Type pages
    for (const type of getTypeStats()) {
      urls.push({ url: `${baseUrl}/type/${type.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 });
    }

    // Type x Country combos
    for (const combo of getTypeCountryCombinations(3)) {
      urls.push({ url: `${baseUrl}/type/${combo.typeSlug}/${combo.countrySlug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 });
    }

    // Blog
    urls.push({ url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 });
    const blogSlugs = [
      'best-sourdough-bakeries-world',
      'patisserie-vs-boulangerie',
      'best-croissants-world',
      'what-is-a-viennoiserie',
      'beginners-guide-to-sourdough',
      'beginners-guide-to-macarons',
      'beginners-guide-to-bagels',
      'beginners-guide-to-babka',
      'how-to-choose-bread',
      'classic-pastries-guide',
    ];
    for (const slug of blogSlugs) {
      urls.push({ url: `${baseUrl}/blog/${slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 });
    }

    // Legal
    for (const page of ['about', 'contact', 'privacy-policy', 'terms']) {
      urls.push({ url: `${baseUrl}/${page}`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 });
    }

    return urls;
  }

  // Sitemaps 1..N: bakery pages (40,000 per sitemap)
  const allSlugs = getAllSlugs();
  const offset = (id - 1) * BARS_PER_SITEMAP;
  const chunk = allSlugs.slice(offset, offset + BARS_PER_SITEMAP);

  return chunk.map(slug => ({
    url: `${baseUrl}/bakery/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
}
