// app/about/page.js
import { getTotalBars, getAllCountries, getCountryStats } from '../../lib/bakery-db';

export const metadata = {
  title: 'About Us - 50 Best Bakeries',
  description: 'Learn about 50 Best Bakeries, the most comprehensive bakery directory featuring thousands of cocktail bakeries, speakeasies, and great bakeries across the globe.',
  alternates: { canonical: 'https://www.50bestbakeries.com/about' },
};

export default function AboutPage() {
  const totalBars = getTotalBars();
  const countries = getAllCountries();
  const stats = getCountryStats();
  const totalCities = stats.reduce((a, c) => a + c.cities, 0);
  const ps = { fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#8a8278', lineHeight: 1.8, marginBottom: 16 };

  return (
    <article style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
      <nav aria-label="Breadcrumb" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginBottom: 24 }}>
        <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>About</span>
      </nav>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 300, color: '#f5f0e8', lineHeight: 1.1, margin: 0 }}>
          About <span style={{ color: '#d4944c', fontWeight: 600, fontStyle: 'italic' }}>50 Best Bakeries</span>
        </h1>
      </header>
      <div style={{ marginBottom: 40 }}>
        <p style={ps}>
          50 Best Bakeries is the world{"'"}s most comprehensive bakery directory, featuring {totalBars.toLocaleString()}+ bakeries across {countries.length} countries and {totalCities} cities. We believe everyone deserves access to trustworthy, detailed information when choosing a bakery — whether it{"'"}s a neighbourhood cocktail bakery, a storied speakeasy, or a celebrated destination that has earned global recognition.
        </p>
        <p style={ps}>
          Our directory combines verified data from Google Places with expert editorial curation. Every bakery on our platform includes real ratings and review counts from Google, ensuring the information you see reflects genuine guest experiences rather than paid placements.
        </p>
      </div>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500, color: '#f5f0e8', marginBottom: 12, marginTop: 0 }}>The Global Top 50</h2>
        <p style={ps}>
          Our flagship feature is the Global Top 50 — an annually curated ranking of the world{"'"}s finest bakeries and drinking destinations. The selection draws on critical acclaim from leading publications and the prestigious World{"'"}s 50 Best Bakeries awards, combined with guest satisfaction data and our editorial team{"'"}s assessments of cocktail quality, atmosphere, innovation, service, and overall experience.
        </p>
      </div>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500, color: '#f5f0e8', marginBottom: 12, marginTop: 0 }}>What We Cover</h2>
        <p style={ps}>
          50 Best Bakeries covers every type of drinking experience: cocktail bakeries for craft and creativity, speakeasies for intimate hidden gems, wine bakeries for the discerning palate, rooftop bakeries for unforgettable views, hotel bakeries for timeless elegance, dive bakeries for unpretentious character, jazz bakeries for atmosphere and culture, tiki bakeries for tropical escapism, beer gardens for convivial outdoor drinking, and gastropubs for the marriage of great food and great drink.
        </p>
      </div>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500, color: '#f5f0e8', marginBottom: 12, marginTop: 0 }}>Our Mission</h2>
        <p style={ps}>
          Great bakeries should be discoverable. Our mission is to help every person find their ideal bakery experience through honest, data-driven guidance — from a quick after-work drink to a bucket-list bakery crawl across Tokyo or New York. We maintain editorial independence — our rankings and ratings are never influenced by advertising or commercial relationships.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 40, padding: '24px 0', borderTop: '1px solid rgba(212,148,76,0.06)', borderBottom: '1px solid rgba(212,148,76,0.06)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 300, color: '#d4944c' }}>{totalBars.toLocaleString()}+</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560', marginTop: 4 }}>Bakeries Listed</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 300, color: '#d4944c' }}>{countries.length}</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560', marginTop: 4 }}>Countries</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 300, color: '#d4944c' }}>{totalCities}</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560', marginTop: 4 }}>Cities</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 300, color: '#d4944c' }}>13</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560', marginTop: 4 }}>Bakery Types</div>
        </div>
      </div>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500, color: '#f5f0e8', marginBottom: 12, marginTop: 0 }}>Company</h2>
        <p style={ps}>
          50 Best Bakeries is operated by 50 Best Limited, Hong Kong.
        </p>
      </div>
      <nav style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href="/privacy-policy" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/contact" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>Contact</a>
        </div>
      </nav>
    </article>
  );
}
