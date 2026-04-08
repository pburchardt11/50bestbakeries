// app/bakery/[slug]/page.js
// Individual bakery detail page — fully server-rendered for SEO

import { notFound } from 'next/navigation';
import {
  getBarBySlug, getAllSlugs, getSpecialties, getBarPhotoUrl,
  getBarMetaTitle, getBarMetaDescription, toSlug, getBarRankings,
  getFallbackPhotoUrl, getBarDataUrl, getSimilarBakeries,
} from '../../../lib/bakery-db';
import { JsonLd } from '../../../lib/schema';
import { barSchema, breadcrumbSchema, faqSchema } from '../../../lib/schema';
import { getBarDescription } from '../../../lib/content';
import BakeryPhotos from '../../../components/BakeryPhotos';
import BakeryGoogleData from '../../../components/BakeryGoogleData';
import ShareButton from '../../../components/ShareButton';
import AffiliateDisclosure from '../../../components/AffiliateDisclosure';
import AdUnit from '../../../components/AdUnit';
import BakeryUserActions from '../../../components/BakeryUserActions';
import SimilarBakeries from '../../../components/SimilarBakeries';
import { getExperienceUrl, getViatorUrl } from '../../../lib/affiliate';

// ─── Static Generation ───
// Only pre-render a few key pages at build time
// All other pages render on first visit (fast, cached automatically)
export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-render only the Global Top 50 bakery slugs
  // All other pages generate on-demand (still fully SEO-friendly)
  return [];
}

// ─── Dynamic Metadata ───
export async function generateMetadata(props) {
  const params = await props.params;
  const bakery = getBarBySlug(params.slug);
  if (!bakery) return { title: 'Bakery Not Found' };

  return {
    title: getBarMetaTitle(bakery),
    description: getBarMetaDescription(bakery),
    openGraph: {
      title: bakery.name,
      description: getBarMetaDescription(bakery),
      url: `https://www.50bestbakeries.com/bakery/${bakery.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: bakery.name,
      description: getBarMetaDescription(bakery),
    },
    alternates: {
      canonical: `https://www.50bestbakeries.com/bakery/${bakery.slug}`,
    },
  };
}

// ─── Page Component ───
export default async function BarPage(props) {
  const params = await props.params;
  const bakery = getBarBySlug(params.slug);
  if (!bakery) notFound();

  const specialties = getSpecialties(bakery.type);
  const description = getBarDescription({ ...bakery, specialties });
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(bakery.name + ' ' + bakery.city)}`;
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(bakery.name + ', ' + bakery.city + ', ' + bakery.country)}`;
  const bookUrl = `https://www.google.com/search?q=${encodeURIComponent(bakery.name + ' ' + bakery.city + ' reservations')}`;
  const experienceUrl = getExperienceUrl(bakery.city, bakery.country);
  const viatorUrl = getViatorUrl(bakery.city, bakery.country);
  const ourRating = Math.min(5, Math.round((bakery.rating * 1.05 + 0.2) * 10) / 10);
  const rankings = getBarRankings(bakery.slug, bakery.city, bakery.country);
  const editorial = bakery.editorial || [];
  const badges = bakery.badges || [];
  const similarBars = getSimilarBakeries(bakery.slug, 6);

  // FAQ data
  const faqs = [
    {
      question: `What drinks does ${bakery.name} specialise in?`,
      answer: `${bakery.name} offers a range of ${bakery.type.toLowerCase()} drinks and cocktails including ${specialties.slice(0, 6).join(', ')}, and more.`,
    },
    {
      question: `What is the rating of ${bakery.name}?`,
      answer: `${bakery.name} has a Google rating of ${bakery.rating}/5 based on ${bakery.reviews.toLocaleString()} reviews. Our editorial rating is ${ourRating}/5.`,
    },
    {
      question: `Where is ${bakery.name} located?`,
      answer: `${bakery.name} is located in ${bakery.city}, ${bakery.country}. You can find directions and the exact location on Google Maps.`,
    },
    {
      question: `How do I reserve a table at ${bakery.name}?`,
      answer: `You can reserve a table at ${bakery.name} by searching for their official website or contacting them directly. We recommend booking 1-2 weeks in advance for popular time slots.`,
    },
  ];

  return (
    <>
      {/* Structured Data */}
      <JsonLd data={barSchema(bakery)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: bakery.country, url: `/country/${toSlug(bakery.country)}` },
        { name: bakery.city, url: `/city/${toSlug(bakery.city)}` },
        { name: bakery.name },
      ])} />
      <JsonLd data={faqSchema(faqs)} />

      <article>
        {/* Breadcrumbs (visible + semantic) */}
        <nav aria-label="Breadcrumb" style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 12,
          color: '#6a6560',
          padding: '16px 24px',
          maxWidth: 960,
          margin: '0 auto',
        }}>
          <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <a href={`/country/${toSlug(bakery.country)}`} style={{ color: '#d4944c', textDecoration: 'none' }}>{bakery.country}</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <a href={`/city/${toSlug(bakery.city)}`} style={{ color: '#d4944c', textDecoration: 'none' }}>{bakery.city}</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{bakery.name}</span>
        </nav>

        {/* Hero */}
        <header style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
            <BakeryPhotos
              name={bakery.name}
              city={bakery.city}
              country={bakery.country}
              localPhotoUrl={getBarPhotoUrl(bakery.slug)}
              fallbackUrl={getFallbackPhotoUrl(bakery.slug, null, 1200, 500)}
              height={400}
            />
             <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
              padding: '60px 32px 24px',
              background: 'linear-gradient(transparent, rgba(8,8,8,0.95))',
            }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
                  letterSpacing: 1, textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: 4,
                  background: `${bakery.typeColor}25`, color: bakery.typeColor,
                  border: `1px solid ${bakery.typeColor}40`,
                }}>
                  {bakery.typeIcon} {bakery.type}
                </span>
                {rankings.worldRank && (
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 4,
                    background: rankings.worldRank <= 50 ? 'rgba(212,175,55,0.15)' : 'rgba(212,148,76,0.08)',
                    color: rankings.worldRank <= 50 ? '#d4af37' : '#a09080',
                    border: rankings.worldRank <= 50 ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(212,148,76,0.15)',
                  }}>
                    #{rankings.worldRank.toLocaleString()} of {rankings.globalTotal.toLocaleString()} in the World
                  </span>
                )}
                {rankings.countryRank && (
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 4,
                    background: 'rgba(212,148,76,0.1)', color: '#d4944c',
                    border: '1px solid rgba(212,148,76,0.2)',
                  }}>
                    #{rankings.countryRank} of {rankings.countryTotal} in {bakery.country}
                  </span>
                )}
                {rankings.cityRank && (
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)', color: '#8a8278',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    #{rankings.cityRank} of {rankings.cityTotal} in {bakery.city}
                  </span>
                )}
                {badges.map((b, i) => (
                  <span key={`ed-${i}`} style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 4,
                    background: b.bg, color: b.color,
                    border: `1px solid ${b.border}`,
                  }}>
                    {b.label}
                  </span>
                ))}
              </div>
              <h1 style={{
                fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 500,
                color: '#f5f0e8', lineHeight: 1.1, marginTop: 12,
                fontFamily: "'Playfair Display', serif",
              }}>
                {bakery.name}
              </h1>
              <p style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 14,
                color: '#8a8278', marginTop: 6,
              }}>
                📍 {bakery.city}, {bakery.country}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          {/* Description (unique content for SEO) */}
          <section>
            <p style={{
              fontSize: 18, lineHeight: 1.8, color: '#b0a898',
              fontFamily: "'Playfair Display', serif",
              maxWidth: 720,
            }}>
              {description}
            </p>
          </section>

          {/* Ratings Grid */}
          <section style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16, marginTop: 32,
          }}>
            <div style={{
              padding: 20, borderRadius: 12,
              background: 'rgba(212,148,76,0.04)',
              border: '1px solid rgba(212,148,76,0.08)',
            }}>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
                letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c',
                marginBottom: 8, marginTop: 0,
              }}>
                50 Best Bakeries Rating
              </h3>
              <div style={{ fontSize: 36, fontWeight: 300, color: '#f5f0e8' }}>
                {ourRating}<span style={{ fontSize: 14, color: '#6a6560' }}>/5.0</span>
              </div>
            </div>
            <div style={{
              padding: 20, borderRadius: 12,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
                letterSpacing: 1, textTransform: 'uppercase', color: '#6a6560',
                marginBottom: 8, marginTop: 0,
              }}>
                Google Rating
              </h3>
              <div style={{ fontSize: 36, fontWeight: 300, color: '#f5f0e8' }}>
                {bakery.rating}<span style={{ fontSize: 14, color: '#6a6560' }}>/5.0</span>
              </div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560', margin: 0 }}>
                Based on {bakery.reviews.toLocaleString()} reviews
              </p>
            </div>
          </section>

          {/* User Rating & Actions */}
          <BakeryUserActions slug={bakery.slug} barName={bakery.name} />

          {/* Specialties */}
          <section style={{ marginTop: 36 }}>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c',
              marginBottom: 16,
            }}>
              Drinks &amp; Specialties
            </h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {specialties.map((o, i) => (
                <span key={i} style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 12,
                  padding: '6px 14px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#b0a898',
                }}>
                  {o}
                </span>
              ))}
            </div>
          </section>

          {/* Editorial Recognition */}
          {(badges.length > 0 || rankings.worldRank <= 500) && (
            <section style={{ marginTop: 36 }}>
              <h2 style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
                letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c',
                marginBottom: 16,
              }}>
                Editorial Recognition
              </h2>
              <div style={{
                padding: 20, borderRadius: 12,
                background: 'rgba(212,148,76,0.04)',
                border: '1px solid rgba(212,148,76,0.08)',
              }}>
                <p style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#b0a898',
                  lineHeight: 1.7, margin: '0 0 12px',
                }}>
                  {bakery.name} has earned editorial recognition from 50 Best Bakeries{rankings.worldRank ? `, ranking #${rankings.worldRank.toLocaleString()} out of ${rankings.globalTotal.toLocaleString()} bakeries worldwide` : ''}{rankings.countryRank ? ` and #${rankings.countryRank} in ${bakery.country}` : ''}{rankings.cityRank ? ` (#${rankings.cityRank} in ${bakery.city})` : ''}.
                  {bakery.rating >= 4.5 ? ` With a ${bakery.rating}/5 Google rating from ${bakery.reviews.toLocaleString()} verified reviews, it is among the highest-rated ${bakery.type.toLowerCase()}s in its region.` : ` Based on ${bakery.reviews.toLocaleString()} verified Google reviews, it maintains a solid ${bakery.rating}/5 rating.`}
                </p>
                {badges.length > 0 && (
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#8a8278', lineHeight: 1.7 }}>
                    <strong style={{ color: '#b0a898' }}>Awards & Distinctions:</strong>{' '}
                    {badges.map(b => b.label).join(' · ')}
                  </div>
                )}
              </div>
            </section>
          )}

          <AdUnit slot="7399778448" format="auto" />

          {/* Map */}
          <section style={{ marginTop: 36 }}>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c',
              marginBottom: 16,
            }}>
              Location
            </h2>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <iframe
                title={`Map - ${bakery.name}`}
                width="100%"
                height="300"
                style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg) brightness(0.7) contrast(1.1)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(bakery.name + ', ' + bakery.city + ', ' + bakery.country)}&output=embed`}
              />
            </div>
          </section>

          {/* CTA Buttons */}
          <section style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <a
              href={bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, minWidth: 160, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, padding: '14px 24px',
                borderRadius: 8, background: '#d4944c', color: '#080808',
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
                textDecoration: 'none', transition: 'background 0.2s',
              }}
            >
              📅 Reserve a Table
            </a>
            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, minWidth: 160, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, padding: '14px 24px',
                borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', color: '#e8e4de',
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              🔍 View on Google
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, minWidth: 160, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, padding: '14px 24px',
                borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', color: '#e8e4de',
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              📍 Directions
            </a>
            <a
              href={experienceUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{
                flex: 1, minWidth: 160, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, padding: '14px 24px',
                borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,148,76,0.2)', color: '#d4944c',
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              🍸 Bakery Tours &amp; Tastings
            </a>
            <a
              href={viatorUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{
                flex: 1, minWidth: 160, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, padding: '14px 24px',
                borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', color: '#e8e4de',
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              🌴 Tours &amp; Activities
            </a>
            <ShareButton title={bakery.name} url={`https://www.50bestbakeries.com/bakery/${bakery.slug}`} />
          </section>
          <AffiliateDisclosure />

          {/* Real Google Data: Reviews, Contact, Website */}
          <BakeryGoogleData name={bakery.name} city={bakery.city} country={bakery.country} dataUrl={getBarDataUrl(bakery.slug)} />

          {/* FAQ Section (SEO gold) */}
          <section style={{ marginTop: 48 }}>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c',
              marginBottom: 20,
            }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, i) => (
              <details key={i} style={{
                marginBottom: 12, borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.04)',
                background: 'rgba(255,255,255,0.015)',
              }}>
                <summary style={{
                  padding: '14px 18px', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif", fontSize: 14,
                  fontWeight: 500, color: '#e8e4de',
                  listStyle: 'none',
                }}>
                  {faq.question}
                </summary>
                <p style={{
                  padding: '0 18px 14px', margin: 0,
                  fontFamily: "'Outfit', sans-serif", fontSize: 13,
                  color: '#8a8278', lineHeight: 1.7,
                }}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </section>

          {/* Similar Bakeries (SEO internal linking) */}
          <SimilarBakeries bakeries={similarBars} />

          {/* Internal Links (SEO) */}
          <nav style={{ marginTop: 40, padding: '20px 0', borderTop: '1px solid rgba(212,148,76,0.06)' }}>
            <h3 style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
              letterSpacing: 1, textTransform: 'uppercase', color: '#4a4540',
              marginBottom: 12, marginTop: 0,
            }}>
              Explore More
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href={`/city/${toSlug(bakery.city)}`} style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 12,
                color: '#d4944c', textDecoration: 'none',
                padding: '6px 12px', borderRadius: 6,
                border: '1px solid rgba(212,148,76,0.15)',
              }}>
                More bakeries in {bakery.city} →
              </a>
              <a href={`/country/${toSlug(bakery.country)}`} style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 12,
                color: '#d4944c', textDecoration: 'none',
                padding: '6px 12px', borderRadius: 6,
                border: '1px solid rgba(212,148,76,0.15)',
              }}>
                All bakeries in {bakery.country} →
              </a>
              <a href="/" style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 12,
                color: '#d4944c', textDecoration: 'none',
                padding: '6px 12px', borderRadius: 6,
                border: '1px solid rgba(212,148,76,0.15)',
              }}>
                Global Top 50 →
              </a>
            </div>
          </nav>
        </div>
      </article>
    </>
  );
}
