// components/Footer.js
// Shared footer with internal linking for SEO

import { getTypeStats, getCountryStats, getTopCities, getTotalBars, TYPE_ICONS } from '../lib/bakery-db';

export default function Footer() {
  const types = getTypeStats();
  const countries = getCountryStats().sort((a, b) => b.bakeries - a.bakeries).slice(0, 12);
  const topCities = getTopCities(8);
  const totalBars = getTotalBars();
  const totalCountries = getCountryStats().length;

  return (
    <footer style={{
      borderTop: '1px solid rgba(212,148,76,0.06)',
      padding: '48px 24px 28px',
      maxWidth: 1280,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 36,
        marginBottom: 36,
      }}>
        {/* Bakery Types */}
        <div>
          <h4 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
            letterSpacing: 1.5, textTransform: 'uppercase', color: '#d4944c',
            marginTop: 0, marginBottom: 12,
          }}>
            Bakery Types
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {types.map(t => (
              <a key={t.slug} href={`/type/${t.slug}`} style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560',
                textDecoration: 'none', transition: 'color 0.2s',
              }}>
                {TYPE_ICONS[t.type] || '🍸'} {t.type} <span style={{ fontSize: 11, color: '#3a3530' }}>({t.count.toLocaleString()})</span>
              </a>
            ))}
          </div>
        </div>

        {/* Popular Destinations */}
        <div>
          <h4 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
            letterSpacing: 1.5, textTransform: 'uppercase', color: '#d4944c',
            marginTop: 0, marginBottom: 12,
          }}>
            Popular Destinations
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {countries.map(c => (
              <a key={c.slug} href={`/country/${c.slug}`} style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560',
                textDecoration: 'none', transition: 'color 0.2s',
              }}>
                {c.country} <span style={{ fontSize: 11, color: '#3a3530' }}>({c.bakeries.toLocaleString()})</span>
              </a>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div>
          <h4 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
            letterSpacing: 1.5, textTransform: 'uppercase', color: '#d4944c',
            marginTop: 0, marginBottom: 12,
          }}>
            Top Cities
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {topCities.map(c => (
              <a key={c.slug} href={`/city/${c.slug}`} style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560',
                textDecoration: 'none', transition: 'color 0.2s',
              }}>
                {c.city} <span style={{ fontSize: 11, color: '#3a3530' }}>({c.count})</span>
              </a>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
            letterSpacing: 1.5, textTransform: 'uppercase', color: '#d4944c',
            marginTop: 0, marginBottom: 12,
          }}>
            Resources
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a href="/blog" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560', textDecoration: 'none' }}>Blog</a>
            <a href="/blog/best-cocktail-bakeries-in-the-world" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560', textDecoration: 'none' }}>Best Cocktail Bakeries in the World</a>
            <a href="/blog/how-to-find-a-speakeasy" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560', textDecoration: 'none' }}>How to Find a Speakeasy</a>
            <a href="/about" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560', textDecoration: 'none' }}>About</a>
            <a href="/contact" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560', textDecoration: 'none' }}>Contact</a>
            <a href="/privacy-policy" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/terms" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Stats + Copyright */}
      <div style={{
        paddingTop: 20,
        borderTop: '1px solid rgba(212,148,76,0.04)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#d4944c', marginBottom: 4 }}>50 Best Bakeries</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#3a3530', letterSpacing: 1 }}>
          © {new Date().getFullYear()} 50bestbakeries.com · {totalBars.toLocaleString()} Bakeries · {totalCountries} Countries
        </div>
      </div>
    </footer>
  );
}
