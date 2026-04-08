// app/sitemap-index.xml/route.js
// Generates a sitemap index pointing to all individual sitemaps

import { getAllSlugs } from '../../lib/bakery-db';

export async function GET() {
  const totalSlugs = getAllSlugs().length;
  const barsPerSitemap = 40000;
  const barSitemapCount = Math.ceil(totalSlugs / barsPerSitemap);
  const totalSitemaps = 1 + barSitemapCount; // sitemap 0 = structural, 1..N = bakeries

  const now = new Date().toISOString();
  const baseUrl = 'https://www.50bestbakeries.com';

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (let i = 0; i < totalSitemaps; i++) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}/sitemap/${i}.xml</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }

  xml += '</sitemapindex>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
