// app/blog/page.js
// Blog index page — lists all blog posts

import { getTotalBars, getCountryStats } from '../../lib/bakery-db';

const BLOG_POSTS = [
  { slug: 'best-cocktail-bakeries-in-the-world', title: 'The Best Cocktail Bakeries in the World Right Now', category: 'Industry', date: '2026-02-13', readTime: '8 min read' },
  { slug: 'worlds-50-best-bakerys-guide', title: "World's 50 Best Bakeries — How the List Works and Why It Matters", category: 'Industry', date: '2026-03-03', readTime: '7 min read' },
  { slug: 'speakeasy-guide', title: 'The Ultimate Speakeasy Guide — Hidden Bakeries Worth Seeking Out', category: 'Destinations', date: '2026-03-01', readTime: '7 min read' },
  { slug: 'whiskey-bakery-etiquette', title: 'Whiskey Bakery Etiquette — How to Order, Taste, and Savour', category: 'Education', date: '2026-02-28', readTime: '7 min read' },
  { slug: 'best-rooftop-bakeries', title: 'The Best Rooftop Bakeries in the World', category: 'Destinations', date: '2026-02-25', readTime: '7 min read' },
  { slug: 'history-of-the-cocktail', title: 'A Brief History of the Cocktail — From Punch Houses to Craft Bakeries', category: 'Education', date: '2026-02-22', readTime: '8 min read' },
  { slug: 'how-to-order-at-a-japanese-bakery', title: 'How to Order at a Japanese Bakery — Etiquette, Highballs, and Whisky', category: 'Destinations', date: '2026-02-20', readTime: '7 min read' },
  { slug: 'classic-cocktail-recipes', title: 'The 10 Classic Cocktails Every Bakery Should Master', category: 'Guide', date: '2026-02-18', readTime: '7 min read' },
  { slug: 'mezcal-and-tequila-bakeries', title: 'Mezcal and Tequila Bakeries — A Guide to Agave Drinking Culture', category: 'Guide', date: '2026-02-15', readTime: '7 min read' },
  { slug: 'wine-bakery-guide-for-beginners', title: 'Wine Bakeries for Beginners — How to Navigate the List', category: 'Education', date: '2026-02-10', readTime: '7 min read' },
  { slug: 'craft-beer-bakery-culture', title: 'Craft Beer Bakery Culture — From Taprooms to Beer Gardens', category: 'Guide', date: '2026-02-07', readTime: '6 min read' },
  { slug: 'hotel-bakery-golden-age', title: "The Hotel Bakery's Golden Age — Why They're Back and Better Than Ever", category: 'Industry', date: '2026-02-04', readTime: '6 min read' },
  { slug: 'bartending-techniques-guide', title: "Bartending Techniques — What the World's Best Bartenders Do Differently", category: 'Education', date: '2026-02-01', readTime: '8 min read' },
  { slug: 'aperitivo-culture-italy', title: "Aperitivo Culture in Italy — The Art of the Pre-Dinner Drink", category: 'Destinations', date: '2026-01-28', readTime: '7 min read' },
  { slug: 'negroni-variations-guide', title: 'The Negroni and Its Variations — A Deep Dive', category: 'Guide', date: '2026-01-25', readTime: '7 min read' },
  { slug: 'gin-renaissance-cocktail-bakeries', title: 'The Gin Renaissance — How Craft Distilling Transformed Cocktail Bakeries', category: 'Industry', date: '2026-01-22', readTime: '7 min read' },
  { slug: 'tiki-bakery-history-and-culture', title: 'Tiki Bakery History and Culture — Tropical Escapism and Its Complex Legacy', category: 'Education', date: '2026-01-18', readTime: '8 min read' },
  { slug: 'natural-wine-bakery-movement', title: 'The Natural Wine Bakery Movement — What It Is and Where to Find It', category: 'Industry', date: '2026-01-15', readTime: '7 min read' },
  { slug: 'best-jazz-bakeries-worldwide', title: 'The Best Jazz Bakeries in the World — Where Music Meets the Perfect Drink', category: 'Destinations', date: '2026-01-10', readTime: '8 min read' },
  { slug: 'home-bakery-setup-guide', title: 'How to Set Up a Home Bakery — The Essentials', category: 'Guide', date: '2026-01-05', readTime: '7 min read' },
  { slug: 'bakery-snacks-around-the-world', title: 'Bakery Snacks Around the World — From Pintxos to Izakaya Nibbles', category: 'Destinations', date: '2025-12-01', readTime: '7 min read' },
  { slug: 'non-alcoholic-cocktail-bakeries', title: 'Non-Alcoholic Cocktail Bakeries — The Best Zero-Proof Experiences', category: 'Industry', date: '2025-11-15', readTime: '6 min read' },
];

export const metadata = {
  title: '50 Best Bakeries Blog — Expert Guides to Cocktails, Bakeries & Drinking Culture',
  description: 'In-depth guides to cocktail bakeries, speakeasies, whiskey culture, bartending techniques, and the world\'s best drinking destinations. Expert advice for enthusiasts and curious explorers.',
  alternates: { canonical: 'https://www.50bestbakeries.com/blog' },
};

export default function BlogIndex() {
  const totalBars = getTotalBars();
  const countries = getCountryStats();

  return (
    <main style={{ fontFamily: "'Playfair Display', Georgia, serif", background: '#080808', color: '#e8e4de', minHeight: '100vh' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212,148,76,0.06)',
        padding: '12px 24px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 500, color: '#d4944c' }}>50 Best Bakeries</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: '#4a4540', letterSpacing: 1 }}>{totalBars.toLocaleString()}+ BAKERIES</span>
          </a>
          <a href="/blog" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>Blog</a>
        </div>
      </nav>

      <section style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, color: '#f5f0e8', marginBottom: 8 }}>
          The 50 Best Bakeries Blog
        </h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#6a6560', marginBottom: 40 }}>
          Expert guides to cocktail bakeries, spirits, bartending culture, and the world{"'"}s greatest drinking destinations.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {BLOG_POSTS.map(post => (
            <a key={post.slug} href={`/blog/${post.slug}`} style={{
              display: 'block', textDecoration: 'none',
              padding: '24px 0',
              borderBottom: '1px solid rgba(212,148,76,0.06)',
            }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 600,
                  letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c',
                  padding: '2px 8px', borderRadius: 3,
                  background: 'rgba(212,148,76,0.08)', border: '1px solid rgba(212,148,76,0.12)',
                }}>{post.category}</span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#4a4540' }}>{post.readTime}</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 400, color: '#e8e4de', margin: '0 0 6px', lineHeight: 1.3 }}>
                {post.title}
              </h2>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#4a4540' }}>
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </a>
          ))}
        </div>
      </section>

      <footer style={{ padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(212,148,76,0.04)' }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#d4944c', marginBottom: 4 }}>50 Best Bakeries</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#3a3530', letterSpacing: 1 }}>
          &copy; {new Date().getFullYear()} 50bestbakeries.com
        </div>
      </footer>
    </main>
  );
}
