// app/type/[typeSlug]/page.js
// Bakery type landing page — e.g. "best cocktail bakeries worldwide"

import { notFound } from 'next/navigation';
import {
  getBarsOfType, getTypeStats, getCountriesForType, toSlug,
  TYPE_ICONS, TYPE_COLORS,
} from '../../../lib/bakery-db';
import { JsonLd, barListSchema, breadcrumbSchema, faqSchema } from '../../../lib/schema';
import { getTypeIntro, getTypeFAQs } from '../../../lib/content';
import BakeryCardPhoto from '../../../components/BakeryCardPhoto';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata(props) {
  const params = await props.params;
  const allTypes = getTypeStats();
  const typeInfo = allTypes.find(t => t.slug === params.typeSlug);
  if (!typeInfo) return { title: 'Type Not Found' };
  const title = `Best ${typeInfo.type}s in the World (2026) — Top-Rated & Reviewed`;
  const description = `Discover the best ${typeInfo.type.toLowerCase()}s worldwide: ${typeInfo.count.toLocaleString()}+ venues across dozens of countries. Expert ratings, reviews & booking.`;
  return {
    title,
    description,
    alternates: { canonical: `https://www.50bestbakeries.com/type/${params.typeSlug}` },
    openGraph: { title, description, url: `https://www.50bestbakeries.com/type/${params.typeSlug}` },
  };
}

export default async function TypePage(props) {
  const params = await props.params;
  const allTypes = getTypeStats();
  const typeInfo = allTypes.find(t => t.slug === params.typeSlug);
  if (!typeInfo) notFound();

  const typeName = typeInfo.type;
  const topBars = getBarsOfType(typeName, 12);
  const countries = getCountriesForType(typeName);
  const intro = getTypeIntro(typeName);
  const faqs = getTypeFAQs(typeName, typeInfo.count);
  const icon = TYPE_ICONS[typeName] || '🍸';
  const color = TYPE_COLORS[typeName] || '#d4944c';
  const otherTypes = allTypes.filter(t => t.slug !== params.typeSlug).slice(0, 7);
  const pageUrl = `https://www.50bestbakeries.com/type/${params.typeSlug}`;

  // Build country list with count
  const countryCounts = {};
  for (const bakery of getBarsOfType(typeName, 500)) {
    countryCounts[bakery.country] = (countryCounts[bakery.country] || 0) + 1;
  }
  const topCountries = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count, slug: toSlug(country) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <>
      <JsonLd data={barListSchema(topBars, `Best ${typeName}s Worldwide`, pageUrl)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: typeName },
      ])} />
      <JsonLd data={faqSchema(faqs)} />

      <article style={{ maxWidth: 1080, margin: '0 auto', padding: '24px' }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginBottom: 24 }}>
          <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{typeName}</span>
        </nav>

        {/* Hero */}
        <header style={{ marginBottom: 36 }}>
          <div style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
            letterSpacing: 2, textTransform: 'uppercase', color: '#d4944c',
            marginBottom: 8, display: 'flex', gap: 16,
          }}>
            <span>{typeInfo.count.toLocaleString()} {typeName}s</span>
            <span>{topCountries.length} Countries</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontFamily: "'Playfair Display', serif", fontWeight: 300, color: '#f5f0e8', lineHeight: 1.05, margin: 0 }}>
            {icon} Best <span style={{ color, fontWeight: 700, fontStyle: 'italic' }}>{typeName}s</span> in the World
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: '#8a8278', maxWidth: 720, marginTop: 16, fontFamily: "'Playfair Display', serif" }}>
            {intro}
          </p>
        </header>

        {/* Top Bakeries */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 16 }}>
            Top {topBars.length} {typeName}s Worldwide
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
                    {bakery.city}, {bakery.country} · ⭐ {bakery.rating} ({bakery.reviews.toLocaleString()} reviews)
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

        {/* Top Countries for This Type */}
        {topCountries.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 16 }}>
              Top Countries for {typeName}s
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {topCountries.map(c => (
                <a key={c.slug} href={`/type/${params.typeSlug}/${c.slug}`} style={{
                  padding: '16px 20px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  textDecoration: 'none', display: 'block', transition: 'border-color 0.2s',
                }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 500, color: '#f5f0e8' }}>{c.country}</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560', marginTop: 4 }}>{c.count} {typeName.toLowerCase()}s</div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 20 }}>
            Frequently Asked Questions about {typeName}s
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

        {/* Related Types */}
        <nav style={{ paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#4a4540', marginBottom: 12 }}>
            Explore Other Bakery Types
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {otherTypes.map(t => (
              <a key={t.slug} href={`/type/${t.slug}`} style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c',
                textDecoration: 'none', padding: '4px 10px', borderRadius: 4,
                border: '1px solid rgba(212,148,76,0.12)',
              }}>{TYPE_ICONS[t.type] || '🍸'} {t.type}</a>
            ))}
          </div>
        </nav>
      </article>
    </>
  );
}
