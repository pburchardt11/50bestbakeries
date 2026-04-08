// app/type/[typeSlug]/[countrySlug]/page.js
// Type x Country page — e.g. "best cocktail bakeries in Japan"

import { notFound } from 'next/navigation';
import {
  getBarsOfTypeInCountry, getTotalBarsOfTypeInCountry, getTypeStats,
  getCountriesForType, getAllCountries, toSlug,
  TYPE_ICONS, TYPE_COLORS,
} from '../../../../lib/bakery-db';
import { JsonLd, barListSchema, breadcrumbSchema, faqSchema } from '../../../../lib/schema';
import { getTypeCountryIntro, getTypeCountryFAQs } from '../../../../lib/content';
import BakeryCardPhoto from '../../../../components/BakeryCardPhoto';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const allTypes = getTypeStats();
  const typeInfo = allTypes.find(t => t.slug === params.typeSlug);
  if (!typeInfo) return { title: 'Not Found' };
  const countries = getAllCountries();
  const country = countries.find(c => toSlug(c) === params.countrySlug);
  if (!country) return { title: 'Not Found' };
  const total = getTotalBarsOfTypeInCountry(typeInfo.type, country);
  if (total < 3) return { title: 'Not Found' };
  const title = `Best ${typeInfo.type}s in ${country} (2026) — Top-Rated & Reviewed`;
  const description = `Discover ${total}+ ${typeInfo.type.toLowerCase()}s in ${country}. Expert ratings, verified Google reviews & booking for the best ${typeInfo.type.toLowerCase()} experiences.`;
  return {
    title,
    description,
    alternates: { canonical: `https://www.50bestbakeries.com/type/${params.typeSlug}/${params.countrySlug}` },
    openGraph: { title, description, url: `https://www.50bestbakeries.com/type/${params.typeSlug}/${params.countrySlug}` },
  };
}

export default function TypeCountryPage({ params }) {
  const allTypes = getTypeStats();
  const typeInfo = allTypes.find(t => t.slug === params.typeSlug);
  if (!typeInfo) notFound();

  const countries = getAllCountries();
  const country = countries.find(c => toSlug(c) === params.countrySlug);
  if (!country) notFound();

  const total = getTotalBarsOfTypeInCountry(typeInfo.type, country);
  if (total < 3) notFound();

  const typeName = typeInfo.type;
  const topBars = getBarsOfTypeInCountry(typeName, country, 12);
  const intro = getTypeCountryIntro(typeName, country, total);
  const faqs = getTypeCountryFAQs(typeName, country, topBars);
  const icon = TYPE_ICONS[typeName] || '🍸';
  const color = TYPE_COLORS[typeName] || '#d4944c';
  const pageUrl = `https://www.50bestbakeries.com/type/${params.typeSlug}/${params.countrySlug}`;

  // Cross-links: other types in same country
  const otherTypesInCountry = allTypes
    .filter(t => t.slug !== params.typeSlug && getTotalBarsOfTypeInCountry(t.type, country) >= 3)
    .slice(0, 6);

  // Cross-links: same type in other countries — build from full bakeries of type
  const allBarsOfType = getBarsOfTypeInCountry(typeName, null, 500);
  const countryCountsForType = {};
  for (const bakery of getBarsOfType ? [] : []) {
    countryCountsForType[bakery.country] = (countryCountsForType[bakery.country] || 0) + 1;
  }
  // Use getCountriesForType for the list
  const sameTypeOtherCountries = getCountriesForType(typeName)
    .filter(c => c !== country)
    .slice(0, 8)
    .map(c => ({ country: c, slug: toSlug(c), count: getTotalBarsOfTypeInCountry(typeName, c) }))
    .filter(c => c.count >= 3);

  return (
    <>
      <JsonLd data={barListSchema(topBars, `Best ${typeName}s in ${country}`, pageUrl)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: typeName, url: `/type/${params.typeSlug}` },
        { name: country },
      ])} />
      <JsonLd data={faqSchema(faqs)} />

      <article style={{ maxWidth: 1080, margin: '0 auto', padding: '24px' }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginBottom: 24 }}>
          <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <a href={`/type/${params.typeSlug}`} style={{ color: '#d4944c', textDecoration: 'none' }}>{typeName}</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{country}</span>
        </nav>

        {/* Hero */}
        <header style={{ marginBottom: 36 }}>
          <div style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
            letterSpacing: 2, textTransform: 'uppercase', color: '#d4944c',
            marginBottom: 8, display: 'flex', gap: 16,
          }}>
            <span>{total} {typeName}s</span>
            <span>{country}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontFamily: "'Playfair Display', serif", fontWeight: 300, color: '#f5f0e8', lineHeight: 1.05, margin: 0 }}>
            {icon} Best <span style={{ color, fontWeight: 700, fontStyle: 'italic' }}>{typeName}s</span> in {country}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: '#8a8278', maxWidth: 720, marginTop: 16, fontFamily: "'Playfair Display', serif" }}>
            {intro}
          </p>
        </header>

        {/* Top Bakeries */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 16 }}>
            Top {topBars.length} {typeName}s in {country}
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
                      background: `${color}20`, color, border: `1px solid ${color}40`,
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

        {/* Cross-link to full country directory */}
        <div style={{
          marginBottom: 48, padding: '20px 24px', borderRadius: 10,
          background: 'rgba(212,148,76,0.06)', border: '1px solid rgba(212,148,76,0.12)',
          textAlign: 'center',
        }}>
          <a href={`/country/${params.countrySlug}`} style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500,
            color: '#d4944c', textDecoration: 'none',
          }}>
            Browse all bakeries in {country} →
          </a>
        </div>

        {/* FAQ Section */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 20 }}>
            Frequently Asked Questions
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

        {/* Cross-links */}
        <nav style={{ paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
          {otherTypesInCountry.length > 0 && (
            <>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#4a4540', marginBottom: 12, marginTop: 0 }}>
                Other Bakery Types in {country}
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {otherTypesInCountry.map(t => (
                  <a key={t.slug} href={`/type/${t.slug}/${params.countrySlug}`} style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c',
                    textDecoration: 'none', padding: '4px 10px', borderRadius: 4,
                    border: '1px solid rgba(212,148,76,0.12)',
                  }}>{TYPE_ICONS[t.type] || '🍸'} {t.type}</a>
                ))}
              </div>
            </>
          )}
          {sameTypeOtherCountries.length > 0 && (
            <>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#4a4540', marginBottom: 12 }}>
                {typeName}s in Other Countries
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sameTypeOtherCountries.map(c => (
                  <a key={c.slug} href={`/type/${params.typeSlug}/${c.slug}`} style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c',
                    textDecoration: 'none', padding: '4px 10px', borderRadius: 4,
                    border: '1px solid rgba(212,148,76,0.12)',
                  }}>{c.country} ({c.count})</a>
                ))}
              </div>
            </>
          )}
        </nav>
      </article>
    </>
  );
}
