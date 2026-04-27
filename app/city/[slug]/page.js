// app/city/[slug]/page.js
// City bakery guide page — SSR for SEO with editorial content and FAQs

import { notFound } from 'next/navigation';
import {
  getAllCountries, getCitiesForCountry, getBarsForCity,
  getCityMetaTitle, getCityMetaDescription, toSlug,
  getTotalBarsInCity,
} from '../../../lib/bakery-db';
import { JsonLd, barListSchema, breadcrumbSchema, faqSchema } from '../../../lib/schema';
import { getCityIntro, getCityFAQs } from '../../../lib/content';
import BakeryCardPhoto from '../../../components/BakeryCardPhoto';
import LoadMoreBakeries from '../../../components/LoadMoreBakeries';
import { getExperienceUrl, getViatorUrl } from '../../../lib/affiliate';
import AdUnit from '../../../components/AdUnit';

// Build city → country lookup
function findCityCountry(slug) {
  for (const country of getAllCountries()) {
    for (const city of getCitiesForCountry(country)) {
      if (toSlug(city) === slug) return { city, country };
    }
  }
  return null;
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  // Generate on-demand for all cities
  return [];
}

export async function generateMetadata(props) {
  const params = await props.params;
  const match = findCityCountry(params.slug);
  if (!match) return { title: 'City Not Found' };
  const bakeries = getBarsForCity(match.country, match.city);
  return {
    title: getCityMetaTitle(match.city, match.country),
    description: getCityMetaDescription(match.city, match.country, bakeries.length),
    alternates: { canonical: `https://www.50bestbakeries.com/city/${params.slug}` },
    openGraph: {
      title: getCityMetaTitle(match.city, match.country),
      description: getCityMetaDescription(match.city, match.country, bakeries.length),
      url: `https://www.50bestbakeries.com/city/${params.slug}`,
    },
  };
}

export default async function CityPage(props) {
  const params = await props.params;
  const match = findCityCountry(params.slug);
  if (!match) notFound();

  const { city, country } = match;
  const bakeries = getBarsForCity(country, city, 50);
  const uniqueTotal = getTotalBarsInCity(country, city);
  const intro = getCityIntro(city, country, bakeries.length);
  const faqs = getCityFAQs(city, country, bakeries);

  return (
    <>
      <JsonLd data={barListSchema(bakeries, `Best Bakeries in ${city}`, `https://www.50bestbakeries.com/city/${params.slug}`)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: country, url: `/country/${toSlug(country)}` },
        { name: city },
      ])} />
      <JsonLd data={faqSchema(faqs)} />

      <article style={{ maxWidth: 1080, margin: '0 auto', padding: '24px' }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginBottom: 24 }}>
          <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <a href={`/country/${toSlug(country)}`} style={{ color: '#d4944c', textDecoration: 'none' }}>{country}</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{city}</span>
        </nav>

        {/* Header */}
        <header style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#d4944c', marginBottom: 8 }}>
            {bakeries.length}+ Bakeries · {country}
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontFamily: "'Playfair Display', serif", fontWeight: 300, color: '#f5f0e8', lineHeight: 1.05, margin: 0 }}>
            Best Bakeries in <span style={{ color: '#d4944c', fontWeight: 700, fontStyle: 'italic' }}>{city}</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: '#8a8278', maxWidth: 720, marginTop: 16, fontFamily: "'Playfair Display', serif" }}>
            {intro}
          </p>
        </header>

        {/* Bakery Grid */}
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {bakeries.map(bakery => (
              <a key={bakery.slug} href={`/bakery/${bakery.slug}`} style={{ textDecoration: 'none', display: 'block', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(212,148,76,0.06)', background: 'rgba(255,255,255,0.015)', transition: 'transform 0.3s' }}>
                <BakeryCardPhoto name={bakery.name} city={bakery.city} country={bakery.country} photoUrl={bakery.photo} alt={`${bakery.name} - ${bakery.type} in ${city}`} height={180} />
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#d4944c' }}>#{bakery.rank}</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3, background: `${bakery.typeColor}20`, color: bakery.typeColor, border: `1px solid ${bakery.typeColor}40` }}>{bakery.type}</span>
                  </div>
                  {bakery.isTop50 && bakery.aw && bakery.aw.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                      {bakery.aw.slice(0, 2).map((award, i) => (
                        <span key={i} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 7, fontWeight: 600, padding: '2px 5px', borderRadius: 3, background: 'rgba(212,148,76,0.12)', color: '#d4944c' }}>
                          {award}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560' }}>⭐ {bakery.rating} ({bakery.reviews.toLocaleString()} reviews)</div>
                </div>
              </a>
            ))}
          </div>
          <LoadMoreBakeries country={toSlug(country)} city={toSlug(city)} total={uniqueTotal} initialCount={bakeries.length} />
        </section>

        <AdUnit slot="7399778448" format="auto" />

        {/* Booking CTAs */}
        <section style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          <a
            href={getExperienceUrl(city, country)}
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
            🍸 Find Bakery Experiences in {city}
          </a>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent('best bakery ' + city + ' reservations')}`}
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
            📅 Reserve a Table in {city}
          </a>
          <a
            href={getViatorUrl(city, country)}
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
            🌴 Cocktail Tours &amp; Tastings in {city}
          </a>
        </section>

        {/* FAQ Section */}
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 20 }}>
            Frequently Asked Questions about Bakeries in {city}
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

        {/* Nearby Cities */}
        <nav style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#4a4540', marginBottom: 12 }}>
            More Cities in {country}
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {getCitiesForCountry(country).filter(c => c !== city).slice(0, 12).map(c => (
              <a key={c} href={`/city/${toSlug(c)}`} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(212,148,76,0.12)' }}>{c}</a>
            ))}
          </div>
        </nav>
      </article>
    </>
  );
}
