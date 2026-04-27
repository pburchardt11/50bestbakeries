// app/best-bakeries-in/[slug]/page.js
// SEO landing page — editorial "best bakeries in [country]" guide

import { notFound } from 'next/navigation';
import {
  getAllCountries, getBarsForCountry, getCityStats,
  toSlug,
} from '../../../lib/bakery-db';
import { JsonLd, barListSchema, breadcrumbSchema, faqSchema } from '../../../lib/schema';
import { getCountryIntro, getCountryWhyVisit, getCountryFAQs } from '../../../lib/content';
import BakeryCardPhoto from '../../../components/BakeryCardPhoto';

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata(props) {
  const params = await props.params;
  const countries = getAllCountries();
  const country = countries.find(c => toSlug(c) === params.slug);
  if (!country) return { title: 'Country Not Found' };
  const cities = getCityStats(country);
  const totalBars = cities.reduce((a, c) => a + c.bakeries, 0);
  const title = `Best Bakeries in ${country} (2026) — Top Picks & Insider Guide`;
  const description = `Discover the best bakeries in ${country}: expert-ranked picks across ${cities.length} cities. Reviews, photos, insider tips & FAQ for ${totalBars}+ bakeries.`;
  return {
    title,
    description,
    alternates: { canonical: `https://www.50bestbakeries.com/best-bakeries-in/${params.slug}` },
    openGraph: { title, description, url: `https://www.50bestbakeries.com/best-bakeries-in/${params.slug}` },
  };
}

export default async function BestBarsInCountryPage(props) {
  const params = await props.params;
  const countries = getAllCountries();
  const country = countries.find(c => toSlug(c) === params.slug);
  if (!country) notFound();

  const cities = getCityStats(country);
  const topBars = getBarsForCountry(country, 10);
  const totalBars = cities.reduce((a, c) => a + c.bakeries, 0);
  const g50Bars = topBars.filter(b => b.isTop50);
  const intro = getCountryIntro(country, cities.length, totalBars);
  const whyVisit = getCountryWhyVisit(country, cities.length, totalBars);
  const faqs = getCountryFAQs(country, cities.length, totalBars, topBars);
  const topCities = cities.slice(0, 6);

  // Related countries: pick 6 neighbours alphabetically from full list
  const allSlugs = countries.map(c => ({ name: c, slug: toSlug(c) }));
  const idx = allSlugs.findIndex(c => c.name === country);
  const related = [];
  for (let i = 1; related.length < 6 && i < allSlugs.length; i++) {
    const candidate = allSlugs[(idx + i) % allSlugs.length];
    if (candidate.name !== country) related.push(candidate);
  }

  const pageUrl = `https://www.50bestbakeries.com/best-bakeries-in/${params.slug}`;

  return (
    <>
      <JsonLd data={barListSchema(topBars, `Best Bakeries in ${country}`, pageUrl)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: `Best Bakeries in ${country}` },
      ])} />
      <JsonLd data={faqSchema(faqs)} />

      <article style={{ maxWidth: 1080, margin: '0 auto', padding: '24px' }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginBottom: 24 }}>
          <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>Best Bakeries in {country}</span>
        </nav>

        {/* Hero */}
        <header style={{ marginBottom: 36 }}>
          {g50Bars.length > 0 && (
            <div style={{
              display: 'inline-block', fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700,
              letterSpacing: 1.5, textTransform: 'uppercase', color: '#1a1816',
              background: 'linear-gradient(135deg, #d4944c, #f0c080)', padding: '4px 10px',
              borderRadius: 4, marginBottom: 12,
            }}>
              {g50Bars.length} World Top 50 Bakery{g50Bars.length > 1 ? 's' : ''}
            </div>
          )}
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#d4944c', marginBottom: 8, display: 'flex', gap: 16 }}>
            <span>{totalBars.toLocaleString()} Bakeries</span>
            <span>{cities.length} Cities</span>
            {g50Bars.length > 0 && <span>{g50Bars.length} Top 50</span>}
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontFamily: "'Playfair Display', serif", fontWeight: 300, color: '#f5f0e8', lineHeight: 1.05, margin: 0 }}>
            Best Bakeries in <span style={{ color: '#d4944c', fontWeight: 700, fontStyle: 'italic' }}>{country}</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: '#8a8278', maxWidth: 720, marginTop: 16, fontFamily: "'Playfair Display', serif" }}>
            {intro}
          </p>
        </header>

        {/* Why Visit */}
        <section style={{
          marginBottom: 48, paddingLeft: 24,
          borderLeft: '3px solid #d4944c',
        }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 16 }}>
            Why {country} for Bakery &amp; Cocktail Culture
          </h2>
          {whyVisit.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: '#a09888', maxWidth: 720, margin: '0 0 12px', fontFamily: "'Playfair Display', serif" }}>
              {para}
            </p>
          ))}
        </section>

        {/* Featured Bakeries */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 16 }}>
            Top {topBars.length} Bakeries in {country}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {topBars.map(bakery => (
              <a key={bakery.slug} href={`/bakery/${bakery.slug}`} style={{
                textDecoration: 'none', display: 'block', borderRadius: 12, overflow: 'hidden',
                border: bakery.isTop50 ? '1px solid rgba(212,148,76,0.25)' : '1px solid rgba(212,148,76,0.06)',
                background: 'rgba(255,255,255,0.015)', transition: 'transform 0.3s, border-color 0.3s',
              }}>
                <BakeryCardPhoto name={bakery.name} city={bakery.city} country={bakery.country} photoUrl={bakery.photo} alt={`${bakery.name} - ${bakery.type} in ${bakery.city}`} height={200} />
                <div style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: '#d4944c' }}>#{bakery.rank}</span>
                    <span style={{
                      fontFamily: "'Outfit', sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: 0.5,
                      textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3,
                      background: `${bakery.typeColor}20`, color: bakery.typeColor, border: `1px solid ${bakery.typeColor}40`,
                    }}>{bakery.type}</span>
                  </div>
                  {bakery.tag && (
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontStyle: 'italic', color: '#8a8278', marginBottom: 6, lineHeight: 1.4 }}>
                      {bakery.tag}
                    </div>
                  )}
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560' }}>
                    {bakery.city} · ⭐ {bakery.rating} ({bakery.reviews.toLocaleString()} reviews)
                  </div>
                  {bakery.isTop50 && bakery.aw && (
                    <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {bakery.aw.map((award, i) => (
                        <span key={i} style={{
                          fontFamily: "'Outfit', sans-serif", fontSize: 7, fontWeight: 600, letterSpacing: 0.3,
                          textTransform: 'uppercase', padding: '2px 5px', borderRadius: 3,
                          background: 'rgba(212,148,76,0.12)', color: '#d4944c',
                        }}>{award}</span>
                      ))}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Top Bakery Cities */}
        {topCities.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 16 }}>
              Top Bakery Cities in {country}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {topCities.map(c => (
                <a key={c.city} href={`/city/${c.slug}`} style={{
                  padding: '16px 20px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  textDecoration: 'none', display: 'block', transition: 'border-color 0.2s',
                }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 500, color: '#f5f0e8' }}>{c.city}</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560', marginTop: 4 }}>{c.bakeries} bakeries</div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Cross-link to full directory */}
        <div style={{
          marginBottom: 48, padding: '20px 24px', borderRadius: 10,
          background: 'rgba(212,148,76,0.06)', border: '1px solid rgba(212,148,76,0.12)',
          textAlign: 'center',
        }}>
          <a href={`/country/${params.slug}`} style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500,
            color: '#d4944c', textDecoration: 'none',
          }}>
            Browse all {totalBars.toLocaleString()} bakeries in {country} →
          </a>
        </div>

        {/* FAQ Section */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 20 }}>
            Frequently Asked Questions about Bakeries in {country}
          </h2>
          {faqs.map((faq, i) => (
            <details key={i} style={{ marginBottom: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)' }}>
              <summary style={{ padding: '14px 18px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500, color: '#e8e4de', listStyle: 'none' }}>
                {faq.question}
              </summary>
              <p style={{ padding: '0 18px 14px', margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#8a8278', lineHeight: 1.7 }}>
                {faq.answer}
              </p>
            </details>
          ))}
        </section>

        {/* Related Countries */}
        <nav style={{ paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#4a4540', marginBottom: 12 }}>
            More Country Bakery Guides
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {related.map(c => (
              <a key={c.slug} href={`/best-bakeries-in/${c.slug}`} style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c',
                textDecoration: 'none', padding: '4px 10px', borderRadius: 4,
                border: '1px solid rgba(212,148,76,0.12)',
              }}>{c.name}</a>
            ))}
          </div>
        </nav>
      </article>
    </>
  );
}
