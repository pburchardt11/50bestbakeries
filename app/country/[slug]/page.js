// app/country/[slug]/page.js
// Country bakery guide page — SSR for SEO

import { notFound } from 'next/navigation';
import {
  getAllCountries, getCountryMetaTitle, getCountryMetaDescription, getCityStats,
  getBarsForCountry, getTotalBarsInCountry, toSlug,
} from '../../../lib/bakery-db';
import { JsonLd, barListSchema, breadcrumbSchema } from '../../../lib/schema';
import { getCountryIntro } from '../../../lib/content';
import BakeryCardPhoto from '../../../components/BakeryCardPhoto';
import LoadMoreBakeries from '../../../components/LoadMoreBakeries';
import { getExperienceUrl, getViatorUrl } from '../../../lib/affiliate';
import AdUnit from '../../../components/AdUnit';

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  // Generate on-demand for all countries
  return [];
}

export async function generateMetadata(props) {
  const params = await props.params;
  const countries = getAllCountries();
  const country = countries.find(c => toSlug(c) === params.slug);
  if (!country) return { title: 'Country Not Found' };
  const cities = getCityStats(country);
  const barCount = cities.reduce((a, c) => a + c.bakeries, 0);
  return {
    title: getCountryMetaTitle(country),
    description: getCountryMetaDescription(country, cities.length, barCount),
    alternates: { canonical: `https://www.50bestbakeries.com/country/${params.slug}` },
    openGraph: {
      title: getCountryMetaTitle(country),
      description: getCountryMetaDescription(country, cities.length, barCount),
      url: `https://www.50bestbakeries.com/country/${params.slug}`,
    },
  };
}

export default async function CountryPage(props) {
  const params = await props.params;
  const countries = getAllCountries();
  const country = countries.find(c => toSlug(c) === params.slug);
  if (!country) notFound();

  const cities = getCityStats(country);
  const topBars = getBarsForCountry(country, 50);
  const totalBars = cities.reduce((a, c) => a + c.bakeries, 0);
  const uniqueTotal = getTotalBarsInCountry(country);
  const intro = getCountryIntro(country, cities.length, totalBars);

  return (
    <>
      <JsonLd data={barListSchema(topBars, `Best Bakeries in ${country}`, `https://www.50bestbakeries.com/country/${params.slug}`)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: country },
      ])} />

      <article style={{ maxWidth: 1080, margin: '0 auto', padding: '24px' }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginBottom: 24 }}>
          <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{country}</span>
        </nav>

        {/* Header */}
        <header style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#d4944c', marginBottom: 8 }}>
            {totalBars.toLocaleString()} Bakeries · {cities.length} Cities
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontFamily: "'Playfair Display', serif", fontWeight: 300, color: '#f5f0e8', lineHeight: 1.05, margin: 0 }}>
            Best Bakeries in <span style={{ color: '#d4944c', fontWeight: 700, fontStyle: 'italic' }}>{country}</span>
          </h1>
          {/* Editorial Intro */}
          <p style={{ fontSize: 18, lineHeight: 1.8, color: '#8a8278', maxWidth: 720, marginTop: 16, fontFamily: "'Playfair Display', serif" }}>
            {intro}
          </p>
        </header>

        {/* Cross-link to SEO guide */}
        <div style={{
          marginBottom: 32, padding: '14px 20px', borderRadius: 8,
          background: 'rgba(212,148,76,0.06)', border: '1px solid rgba(212,148,76,0.10)',
        }}>
          <a href={`/best-bakeries-in/${params.slug}`} style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
            color: '#d4944c', textDecoration: 'none',
          }}>
            Looking for expert picks? Read our {country} Bakery Guide →
          </a>
        </div>

        {/* Top Bakeries */}
        <section>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 16 }}>
            Top-Rated Bakeries in {country}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {topBars.map(bakery => (
              <a key={bakery.slug} href={`/bakery/${bakery.slug}`} style={{ textDecoration: 'none', display: 'block', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(212,148,76,0.06)', background: 'rgba(255,255,255,0.015)', transition: 'transform 0.3s, border-color 0.3s' }}>
                <BakeryCardPhoto name={bakery.name} city={bakery.city} country={bakery.country} photoUrl={bakery.photo} alt={bakery.name} height={180} />
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#d4944c' }}>#{bakery.rank}</span>
                    <span style={{
                      fontFamily: "'Outfit', sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: 0.5,
                      textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3,
                      background: `${bakery.typeColor}20`, color: bakery.typeColor, border: `1px solid ${bakery.typeColor}40`,
                    }}>{bakery.type}</span>
                  </div>
                  {(bakery.isTop50 || bakery.isEditorial) && bakery.badges && bakery.badges.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                      {bakery.badges.slice(0, 2).map((badge, i) => (
                        <span key={i} style={{
                          fontFamily: "'Outfit', sans-serif", fontSize: 7, fontWeight: 600,
                          padding: '2px 5px', borderRadius: 3,
                          background: badge.bg || 'rgba(212,148,76,0.12)',
                          color: badge.color || '#d4944c',
                          border: badge.border ? `1px solid ${badge.border}` : 'none',
                        }}>
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560' }}>{bakery.city} · ⭐ {bakery.rating} ({bakery.reviews.toLocaleString()} reviews)</div>
                </div>
              </a>
            ))}
          </div>
          <LoadMoreBakeries country={params.slug} total={uniqueTotal} initialCount={topBars.length} />
        </section>

        {/* Booking CTAs */}
        <section style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          <a
            href={getExperienceUrl(cities[0]?.city || country, country)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{
              flex: 1, minWidth: 200, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, padding: '14px 24px',
              borderRadius: 8, background: '#d4944c', color: '#080808',
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            🍸 Find Bakery Experiences in {country}
          </a>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent('best bakery ' + country + ' reservations')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, minWidth: 200, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, padding: '14px 24px',
              borderRadius: 8, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,148,76,0.2)', color: '#d4944c',
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            📅 Reserve a Table in {country}
          </a>
          <a
            href={getViatorUrl(cities[0]?.city || country, country)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{
              flex: 1, minWidth: 200, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, padding: '14px 24px',
              borderRadius: 8, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#e8e4de',
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            🌴 Cocktail Tours &amp; Tastings in {country}
          </a>
        </section>

        <AdUnit slot="7180645385" format="auto" />

        {/* City List */}
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 16 }}>
            Explore by City
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[...cities].sort((a, b) => a.city.localeCompare(b.city)).map(c => (
              <a key={c.city} href={`/city/${c.slug}`} style={{
                padding: '5px 12px', borderRadius: 4,
                border: '1px solid rgba(212,148,76,0.12)',
                textDecoration: 'none', fontFamily: "'Outfit', sans-serif",
                fontSize: 12, color: '#d4944c', whiteSpace: 'nowrap',
              }}>
                {c.city} <span style={{ color: '#4a4540', fontSize: 10 }}>({c.bakeries})</span>
              </a>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <nav style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#4a4540', marginBottom: 12 }}>
            More Countries
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {countries.filter(c => c !== country).slice(0, 12).map(c => (
              <a key={c} href={`/country/${toSlug(c)}`} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(212,148,76,0.12)' }}>{c}</a>
            ))}
          </div>
        </nav>
      </article>
    </>
  );
}
