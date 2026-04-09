// app/blog/feed.xml/route.js
// RSS feed for the blog — helps with syndication, Google News, and feed readers

const BLOG_POSTS = [
  { slug: 'best-sourdough-bakeries-world', title: 'The Best Sourdough Bakeries in the World', description: 'From Tartine in San Francisco to Hart Bageri in Copenhagen, the bakeries that defined the modern sourdough movement.', category: 'Destinations', date: '2026-03-01' },
  { slug: 'patisserie-vs-boulangerie', title: 'Pâtisserie vs Boulangerie — What\'s the Difference?', description: 'Two of the most common French bakery terms, and the real distinction between them.', category: 'Education', date: '2026-02-22' },
  { slug: 'best-croissants-world', title: 'Where to Find the Best Croissants in the World', description: 'The bakeries that have made croissants a destination food — from Melbourne\'s Lune to Paris\'s Utopie.', category: 'Destinations', date: '2026-02-18' },
  { slug: 'what-is-a-viennoiserie', title: 'What Is a Viennoiserie? A Guide to Laminated Pastry', description: 'The family of enriched, laminated pastries that sits between bread and pastry — and the bakeries that specialise in it.', category: 'Education', date: '2026-02-12' },
  { slug: 'beginners-guide-to-sourdough', title: 'A Beginner\'s Guide to Sourdough Bread', description: 'How to read a sourdough bakery\'s display case — and what the vocabulary actually means.', category: 'Education', date: '2026-02-04' },
  { slug: 'beginners-guide-to-macarons', title: 'A Beginner\'s Guide to Macarons', description: 'What to look for in a real French macaron — and the bakeries that make them best.', category: 'Education', date: '2026-01-28' },
  { slug: 'beginners-guide-to-bagels', title: 'A Beginner\'s Guide to Bagels — New York, Montreal and Beyond', description: 'The two great North American bagel traditions, and why they taste so different.', category: 'Education', date: '2026-01-22' },
  { slug: 'beginners-guide-to-babka', title: 'A Beginner\'s Guide to Babka', description: 'The Eastern European chocolate-swirl bread that has become a global bakery obsession.', category: 'Education', date: '2026-01-15' },
  { slug: 'how-to-choose-bread', title: 'How to Choose a Great Loaf of Bread', description: 'The signs of real artisan bread — from crust to crumb to weight in the hand.', category: 'Education', date: '2026-01-08' },
  { slug: 'classic-pastries-guide', title: 'Classic Pastries Every Bakery Traveller Should Know', description: 'A short glossary of essential European pastries, from sfogliatelle to kouign-amann.', category: 'Education', date: '2026-01-02' },
];

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = 'https://www.50bestbakeries.com';

  const items = BLOG_POSTS.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>50 Best Bakeries Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Expert guides to bread, pastry, baking traditions, and the world's greatest bakery destinations.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
