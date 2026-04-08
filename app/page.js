// app/page.js
// Homepage — Global Top 50 + country/city browsing

import { getAllCountries, getCountryStats, getTotalBars, getTotalGlobalBars, getGlobalTop, toSlug } from '../lib/bakery-db';
import Top50Grid from '../components/Top50Grid';
import LoadMoreBakeries from '../components/LoadMoreBakeries';
import NearbyBakeries from '../components/NearbyBakeries';
import AdUnit from '../components/AdUnit';

export const metadata = {
  title: "50 Best Bakeries — The World's Best Bakeries Reviewed",
  description: "Discover the 50 best bakeries in the world plus thousands of bakeries and cocktail lounges across 100+ countries. Expert ratings, Google reviews, cocktail menus & more.",
  alternates: { canonical: 'https://www.50bestbakeries.com' },
};

export default function HomePage() {
  const countries = getCountryStats();
  const totalBars = getTotalBars();
  const totalCountries = countries.length;
  const totalCities = countries.reduce((a, c) => a + c.cities, 0);
  const topBars = getGlobalTop();

  return (
    <main style={{ fontFamily: "'Playfair Display', Georgia, serif", background: '#080808', color: '#e8e4de', minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{
        position: 'relative', minHeight: '75vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 40%, rgba(212,148,76,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(60,80,120,0.06) 0%, transparent 50%), #080808',
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.02,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 119px, rgba(212,148,76,0.5) 119px, rgba(212,148,76,0.5) 120px)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 860, padding: '0 24px' }}>
          <div style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 500,
            letterSpacing: 5, textTransform: 'uppercase', color: '#d4944c', marginBottom: 28,
          }}>
            {totalBars.toLocaleString()} Bakeries · {totalCountries} Countries · {totalCities} Cities
          </div>
          <h1 style={{
            fontSize: 'clamp(44px, 8vw, 100px)', fontWeight: 300,
            lineHeight: 0.95, letterSpacing: -2, color: '#f5f0e8', margin: 0,
          }}>
            The World{"'"}s Best<br />
            <span style={{ color: '#d4944c', fontWeight: 600, fontStyle: 'italic' }}>Bakeries</span> Reviewed
          </h1>
          <div style={{
            width: 50, height: 1,
            background: 'linear-gradient(90deg, transparent, #d4944c, transparent)',
            margin: '18px auto',
          }} />
          <p style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(12px, 1.6vw, 15px)',
            fontWeight: 300, color: '#6a6560', lineHeight: 1.7, maxWidth: 520, margin: '20px auto 0',
          }}>
            The definitive guide to {totalBars.toLocaleString()}+ bakeries and cocktail lounges across {totalCountries} countries.
            Expert ratings, verified Google reviews, and curated cocktail guides.
          </p>
        </div>
      </section>

      {/* ═══ GLOBAL TOP 50 ═══ */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 24, paddingBottom: 12,
          borderBottom: '1px solid rgba(212,148,76,0.06)',
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 300, color: '#f5f0e8', letterSpacing: -1, margin: 0 }}>
            The World{"'"}s <span style={{ color: '#d4944c', fontWeight: 500 }}>Best</span>
          </h2>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#4a4540' }}>
            {totalBars.toLocaleString()}+ bakeries curated by our experts
          </span>
        </div>

        <Top50Grid bakeries={topBars.slice(0, 50)} />
        <LoadMoreBakeries total={getTotalGlobalBars()} initialCount={50} />
      </section>

      {/* ═══ BEST BAKERIES NEAR YOU ═══ */}
      <NearbyBakeries />

      {/* ═══ BROWSE BY COUNTRY ═══ */}
      <section id="countries" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px' }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 500,
          letterSpacing: 3, textTransform: 'uppercase', color: '#6a6560',
          marginBottom: 16,
        }}>
          Browse by Country <span style={{ color: '#4a4540', fontWeight: 400 }}>· {totalCountries} countries</span>
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px' }}>
          {countries.map(c => (
            <a key={c.country} href={`/country/${c.slug}`} style={{
              padding: '5px 12px', borderRadius: 4,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
              textDecoration: 'none', display: 'inline-block', transition: 'border-color 0.2s',
              fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#c8c0b4',
            }}>
              {c.country} <span style={{ color: '#4a4540', fontSize: 10 }}>{c.bakeries.toLocaleString()}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ═══ ABOUT / SEO TEXT ═══ */}
      <section style={{
        maxWidth: 760, margin: '0 auto', padding: '40px 24px 60px',
        borderTop: '1px solid rgba(212,148,76,0.06)',
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 400, color: '#f5f0e8', marginBottom: 16, margin: '0 0 16px' }}>
          About 50 Best Bakeries
        </h2>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#8a8278', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 16 }}>
            50 Best Bakeries is the world{"'"}s most comprehensive bakery directory, featuring {totalBars.toLocaleString()}+ bakeries
            and cocktail lounges across {totalCountries} countries and {totalCities} cities. We combine expert editorial
            curation with verified Google review data to help you find the perfect bakery experience anywhere in the world.
          </p>
          <p style={{ marginBottom: 16 }}>
            Every bakery in our directory is curated by our editorial team based on cocktail quality, atmosphere, service,
            and innovation. Our top-ranked bakeries are selected for consistent excellence across these criteria.
          </p>
          <p>
            Whether you{"'"}re looking for a world-class cocktail bakery, a hidden speakeasy, a sophisticated wine bakery,
            a lively rooftop bakery, or a neighbourhood pub near you — 50 Best Bakeries helps you compare ratings, explore menus,
            and discover with confidence.
          </p>
        </div>
      </section>

      <AdUnit slot="7399778448" format="auto" />

    </main>
  );
}
