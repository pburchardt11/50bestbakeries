// app/find-a-bakery/page.js
// Find a Bakery page — location-based bakery discovery with map

import { getTotalBars, getCountryStats } from '../../lib/bakery-db';
import FindBakery from '../../components/FindBakery';

export const metadata = {
  title: 'Find a Bakery Near You — Map & Locations',
  description: 'Discover bakeries near you. Browse by location, bakery type, and ratings. Interactive map with 460,000+ bakeries worldwide.',
  alternates: { canonical: 'https://www.50bestbakeries.com/find-a-bakery' },
};

export default function FindABarPage() {
  const totalBars = getTotalBars();
  const countries = getCountryStats();

  return (
    <main style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      background: '#080808', color: '#e8e4de', minHeight: '100vh',
    }}>
      {/* Hero */}
      <section style={{
        maxWidth: 1280, margin: '0 auto', padding: '40px 24px 24px',
      }}>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 300,
          color: '#f5f0e8', letterSpacing: -1, marginBottom: 6,
        }}>
          Find a <span style={{ color: '#d4944c', fontWeight: 500, fontStyle: 'italic' }}>Bakery</span> Near You
        </h1>
        <p style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560',
          marginBottom: 28,
        }}>
          {totalBars.toLocaleString()} bakeries across {countries.length} countries
        </p>
      </section>

      {/* Main content */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 60px' }}>
        <FindBakery />
      </section>
    </main>
  );
}
