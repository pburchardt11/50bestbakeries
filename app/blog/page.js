// app/blog/page.js
// Blog index page — lists all blog posts

import { getTotalBars, getCountryStats } from '../../lib/bakery-db';

const BLOG_POSTS = [
  { slug: 'best-sourdough-bakeries-world', title: 'The Best Sourdough Bakeries in the World', category: 'Destinations', date: '2026-03-01', readTime: '8 min read' },
  { slug: 'patisserie-vs-boulangerie', title: "Pâtisserie vs Boulangerie — What's the Difference?", category: 'Education', date: '2026-02-22', readTime: '6 min read' },
  { slug: 'best-croissants-world', title: 'Where to Find the Best Croissants in the World', category: 'Destinations', date: '2026-02-18', readTime: '7 min read' },
  { slug: 'what-is-a-viennoiserie', title: 'What Is a Viennoiserie? A Guide to Laminated Pastry', category: 'Education', date: '2026-02-12', readTime: '6 min read' },
  { slug: 'beginners-guide-to-sourdough', title: "A Beginner's Guide to Sourdough Bread", category: 'Education', date: '2026-02-04', readTime: '7 min read' },
  { slug: 'beginners-guide-to-macarons', title: "A Beginner's Guide to Macarons", category: 'Education', date: '2026-01-28', readTime: '6 min read' },
  { slug: 'beginners-guide-to-bagels', title: "A Beginner's Guide to Bagels — New York, Montreal and Beyond", category: 'Education', date: '2026-01-22', readTime: '6 min read' },
  { slug: 'beginners-guide-to-babka', title: "A Beginner's Guide to Babka", category: 'Education', date: '2026-01-15', readTime: '6 min read' },
  { slug: 'how-to-choose-bread', title: 'How to Choose a Great Loaf of Bread', category: 'Education', date: '2026-01-08', readTime: '6 min read' },
  { slug: 'classic-pastries-guide', title: 'Classic Pastries Every Bakery Traveller Should Know', category: 'Education', date: '2026-01-02', readTime: '7 min read' },
];

export const metadata = {
  title: '50 Best Bakeries Blog — Expert Guides to Bread, Pastry and Bakery Culture',
  description: 'In-depth guides to boulangeries, patisseries, sourdough, croissants, macarons, babka, and the world\'s best bakery destinations. Expert advice for bread and pastry lovers.',
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
          Expert guides to bread, pastry, baking traditions, and the world{"'"}s greatest bakery destinations.
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
