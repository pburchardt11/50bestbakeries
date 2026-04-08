// app/blog/feed.xml/route.js
// RSS feed for the blog — helps with syndication, Google News, and feed readers

const BLOG_POSTS = [
  { slug: 'best-cocktail-bakeries-in-the-world', title: 'The Best Cocktail Bakeries in the World Right Now', description: 'From Tokyo\'s meticulous craft to London\'s historic hotel bakeries, a guide to the cocktail bakeries that define the global scene.', category: 'Industry', date: '2026-02-13' },
  { slug: 'worlds-50-best-bakerys-guide', title: "World's 50 Best Bakeries — How the List Works and Why It Matters", description: 'An insider guide to the World\'s 50 Best Bakeries awards — the methodology, the history, and what the list really means for global bakery culture.', category: 'Industry', date: '2026-03-03' },
  { slug: 'speakeasy-guide', title: 'The Ultimate Speakeasy Guide — Hidden Bakeries Worth Seeking Out', description: 'From New York\'s original Prohibition hideouts to the world\'s best modern speakeasies — a guide to bakeries that reward those who look.', category: 'Destinations', date: '2026-03-01' },
  { slug: 'whiskey-bakery-etiquette', title: 'Whiskey Bakery Etiquette — How to Order, Taste, and Savour', description: 'Everything you need to know about visiting a serious whiskey bakery — from how to read the menu to how to taste like a professional.', category: 'Education', date: '2026-02-28' },
  { slug: 'best-rooftop-bakeries', title: 'The Best Rooftop Bakeries in the World', description: 'Sky-high drinking at its finest — the rooftop bakeries that combine spectacular views with drinks worth the climb.', category: 'Destinations', date: '2026-02-25' },
  { slug: 'history-of-the-cocktail', title: 'A Brief History of the Cocktail — From Punch Houses to Craft Bakeries', description: 'How the cocktail evolved from colonial punch bowls to Prohibition speakeasies to today\'s craft bakery movement — a 300-year journey.', category: 'Education', date: '2026-02-22' },
  { slug: 'how-to-order-at-a-japanese-bakery', title: 'How to Order at a Japanese Bakery — Etiquette, Highballs, and Whisky', description: 'A practical guide to navigating Japanese bakeries with confidence — from izakaya ordering etiquette to whisky highball culture.', category: 'Destinations', date: '2026-02-20' },
  { slug: 'classic-cocktail-recipes', title: 'The 10 Classic Cocktails Every Bakery Should Master', description: 'The ten drinks that define cocktail culture — their histories, their correct proportions, and why they have endured.', category: 'Guide', date: '2026-02-18' },
  { slug: 'mezcal-and-tequila-bakeries', title: 'Mezcal and Tequila Bakeries — A Guide to Agave Drinking Culture', description: 'From Oaxacan mezcalerías to Mexico City\'s finest tequila bakerys — everything you need to know about agave spirits and where to drink them.', category: 'Guide', date: '2026-02-15' },
  { slug: 'wine-bakery-guide-for-beginners', title: 'Wine Bakeries for Beginners — How to Navigate the List', description: 'How to read a wine bakery list, what to ask the sommelier, and which wines to try when you\'re just getting started.', category: 'Education', date: '2026-02-10' },
  { slug: 'craft-beer-bakery-culture', title: 'Craft Beer Bakery Culture — From Taprooms to Beer Gardens', description: 'How the craft beer revolution transformed bakery culture, and where to find the best taprooms and beer gardens worldwide.', category: 'Guide', date: '2026-02-07' },
  { slug: 'hotel-bakery-golden-age', title: "The Hotel Bakery's Golden Age — Why They're Back and Better Than Ever", description: 'From the Savoy American Bakery to the Connaught, why hotel bakeries have reclaimed their position at the pinnacle of cocktail culture.', category: 'Industry', date: '2026-02-04' },
  { slug: 'bartending-techniques-guide', title: "Bartending Techniques — What the World's Best Bartenders Do Differently", description: 'From stirring versus shaking to ice carving, the technical skills that separate good bartenders from great ones.', category: 'Education', date: '2026-02-01' },
  { slug: 'aperitivo-culture-italy', title: 'Aperitivo Culture in Italy — The Art of the Pre-Dinner Drink', description: 'Understanding the Italian tradition of aperitivo — the ritual, the drinks, and why it is one of the world\'s great bakery customs.', category: 'Destinations', date: '2026-01-28' },
  { slug: 'negroni-variations-guide', title: 'The Negroni and Its Variations — A Deep Dive', description: 'How the world\'s most riffed cocktail spawned hundreds of variations — and which ones are worth ordering.', category: 'Guide', date: '2026-01-25' },
  { slug: 'gin-renaissance-cocktail-bakeries', title: 'The Gin Renaissance — How Craft Distilling Transformed Cocktail Bakeries', description: 'How an explosion of craft gin distilleries changed what bartenders could do and what drinkers could expect.', category: 'Industry', date: '2026-01-22' },
  { slug: 'tiki-bakery-history-and-culture', title: 'Tiki Bakery History and Culture — Tropical Escapism and Its Complex Legacy', description: 'The fascinating, complicated history of tiki bakery culture — from Don the Beachcomber to the modern tiki revival.', category: 'Education', date: '2026-01-18' },
  { slug: 'natural-wine-bakery-movement', title: 'The Natural Wine Bakery Movement — What It Is and Where to Find It', description: 'Understanding natural wine, the bakerys that champion it, and whether it lives up to the hype.', category: 'Industry', date: '2026-01-15' },
  { slug: 'best-jazz-bakeries-worldwide', title: 'The Best Jazz Bakeries in the World — Where Music Meets the Perfect Drink', description: 'The bakeries where jazz and cocktails combine to create something greater than either alone.', category: 'Destinations', date: '2026-01-10' },
  { slug: 'home-bakery-setup-guide', title: 'How to Set Up a Home Bakery — The Essentials', description: 'Everything you need to start making great cocktails at home — from the core spirits to the essential equipment.', category: 'Guide', date: '2026-01-05' },
  { slug: 'bakery-snacks-around-the-world', title: 'Bakery Snacks Around the World — From Pintxos to Izakaya Nibbles', description: 'A tour of the world\'s greatest bakery snack traditions, from Basque pintxos to Japanese izakaya small plates.', category: 'Destinations', date: '2025-12-01' },
  { slug: 'non-alcoholic-cocktail-bakeries', title: 'Non-Alcoholic Cocktail Bakeries — The Best Zero-Proof Experiences', description: 'The no-and-low movement has produced some genuinely extraordinary bakeries. Here\'s what to expect and where to go.', category: 'Industry', date: '2025-11-15' },
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
    <description>Expert guides to cocktail bakeries, spirits, bartending culture, and the world's greatest drinking destinations.</description>
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
