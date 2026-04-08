'use client';
// components/NearbyBakeries.js
// Detects user's country via IP geolocation, shows top bakeries from that country

import { useState, useEffect } from 'react';
import BakeryCardPhoto from './BakeryCardPhoto';

// Map ipapi.co country names to our database country names
const COUNTRY_NAME_MAP = {
  'United States of America': 'United States',
  'US': 'United States',
  'USA': 'United States',
  'UK': 'United Kingdom',
  'Great Britain': 'United Kingdom',
  'Republic of Korea': 'South Korea',
  'Korea, Republic of': 'South Korea',
  'Viet Nam': 'Vietnam',
  'Russian Federation': 'Russia',
  'Czechia': 'Czech Republic',
  'Türkiye': 'Turkey',
  'Türkei': 'Turkey',
};

const BAR_STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1575444758702-4a6b9222c016?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&h=500&fit=crop',
];
function getBarFallbackUrl(name, city) {
  const str = name + city;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return BAR_STOCK_IMAGES[Math.abs(h) % BAR_STOCK_IMAGES.length];
}

function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function barSlug(name, city) {
  const nameSlug = toSlug(name);
  const citySlug = toSlug(city);
  if (nameSlug.endsWith(citySlug)) return nameSlug;
  return toSlug(name + '-' + city);
}

function getLocalPhotoUrl(name, city) {
  const blobBase = process.env.NEXT_PUBLIC_BLOB_BASE_URL || '';
  const slug = barSlug(name, city);
  if (blobBase) return `${blobBase}/bakery-photos/${slug}.jpg`;
  return `/photos/${slug}.jpg`;
}

export default function NearbyBakeries() {
  const [bakeries, setBars] = useState(null);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        if (!geoRes.ok) throw new Error('Geo failed');
        const geo = await geoRes.json();

        let countryName = geo.country_name;
        if (COUNTRY_NAME_MAP[countryName]) {
          countryName = COUNTRY_NAME_MAP[countryName];
        }

        const barRes = await fetch(`/api/nearby?country=${encodeURIComponent(countryName)}`);
        if (!barRes.ok) throw new Error('API failed');
        const data = await barRes.json();

        if (!cancelled && data.bakeries && data.bakeries.length > 0) {
          setBars(data.bakeries);
          setCountry(data.country);
        }
      } catch {
        // Silently hide section on any failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    detect();
    return () => { cancelled = true; };
  }, []);

  // Hide entirely if detection failed or no bakeries found
  if (!loading && !bakeries) return null;

  // Loading skeleton
  if (loading) {
    return (
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{
          marginBottom: 24, paddingBottom: 12,
          borderBottom: '1px solid rgba(212,148,76,0.06)',
        }}>
          <div style={{
            width: 280, height: 32, borderRadius: 6,
            background: 'rgba(255,255,255,0.04)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              borderRadius: 10, overflow: 'hidden',
              border: '1px solid rgba(212,148,76,0.06)',
              background: 'rgba(255,255,255,0.015)',
            }}>
              <div style={{
                height: 180, background: 'rgba(255,255,255,0.04)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{ padding: '12px 16px' }}>
                <div style={{
                  width: 60, height: 12, borderRadius: 4, marginBottom: 8,
                  background: 'rgba(255,255,255,0.04)',
                }} />
                <div style={{
                  width: 180, height: 12, borderRadius: 4,
                  background: 'rgba(255,255,255,0.04)',
                }} />
              </div>
            </div>
          ))}
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 60px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 24, paddingBottom: 12,
        borderBottom: '1px solid rgba(212,148,76,0.06)',
      }}>
        <h2 style={{
          fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 300,
          color: '#f5f0e8', letterSpacing: -1, margin: 0,
        }}>
          <span style={{ marginRight: 10, fontSize: '0.8em' }}>📍</span>
          Best Bakeries in <span style={{ color: '#d4944c', fontWeight: 500 }}>{country}</span>
        </h2>
        <a href={`/country/${toSlug(country)}`} style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          See all →
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {bakeries.map(bakery => (
          <a key={bakery.slug} href={`/bakery/${bakery.slug}`} style={{
            textDecoration: 'none', display: 'block', borderRadius: 10,
            overflow: 'hidden', border: '1px solid rgba(212,148,76,0.06)',
            background: 'rgba(255,255,255,0.015)', transition: 'transform 0.3s, border-color 0.3s',
          }}>
            <BakeryCardPhoto
              name={bakery.name}
              city={bakery.city}
              country={bakery.country}
              photoUrl={getLocalPhotoUrl(bakery.name, bakery.city)}
              fallbackUrl={getBarFallbackUrl(bakery.name, bakery.city)}
              alt={bakery.name}
              height={180}
            />
            <div style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
                  color: '#d4944c',
                }}>
                  #{bakery.rank}
                </span>
                <span style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 600,
                  color: bakery.typeColor || '#d4944c', background: 'rgba(212,148,76,0.08)',
                  padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5,
                }}>
                  {bakery.type}
                </span>
              </div>
              {bakery.badges && bakery.badges.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                  {bakery.badges.map((b, i) => (
                    <span key={i} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
                      {b.label}
                    </span>
                  ))}
                </div>
              )}
              <div style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560',
              }}>
                {bakery.city} · ⭐ {bakery.rating} ({bakery.reviews.toLocaleString()} reviews)
              </div>
            </div>
          </a>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <a href={`/country/${toSlug(country)}`} style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#d4944c',
          textDecoration: 'none', padding: '10px 24px',
          border: '1px solid rgba(212,148,76,0.2)', borderRadius: 8,
          display: 'inline-block', transition: 'border-color 0.2s',
        }}>
          See all bakeries in {country} →
        </a>
      </div>
    </section>
  );
}
