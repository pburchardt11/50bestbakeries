'use client';
// components/Top50Grid.js
// Renders the Global Top 50 bakery cards with real Google photos

import { useState, useRef, useEffect } from 'react';

const TYPE_COLORS = {
  'Cocktail Bakery': '#d4944c', 'Speakeasy': '#9b59b6', 'Wine Bakery': '#c0392b',
  'Dive Bakery': '#2980b9', 'Rooftop Bakery': '#16a34a', 'Tiki Bakery': '#e67e22',
  'Pub': '#7f8c8d', 'Beer Garden': '#27ae60', 'Lounge': '#8e44ad',
  'Hotel Bakery': '#ca8a04', 'Gastropub': '#d35400', 'Jazz Bakery': '#2c3e50',
  'Nightclub': '#e74c3c',
};

function barHash(name, location) {
  let h = 0;
  const s = name + location;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function barSlug(name, city) {
  const nameSlug = toSlug(name);
  const citySlug = toSlug(city);
  if (nameSlug.endsWith(citySlug)) return nameSlug;
  return nameSlug + '-' + citySlug;
}

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
function getFallbackUrl(name, city) {
  const seed = barHash(name, city);
  return BAR_STOCK_IMAGES[Math.abs(seed) % BAR_STOCK_IMAGES.length];
}

function BarCard({ bakery }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const slug = bakery.slug || barSlug(bakery.name, bakery.city);
  const blobBase = process.env.NEXT_PUBLIC_BLOB_BASE_URL || '';
  const localUrl = blobBase ? `${blobBase}/bakery-photos/${slug}.jpg` : `/photos/${slug}.jpg`;
  const fallbackUrl = getFallbackUrl(bakery.name, bakery.city);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);
  const src = error ? fallbackUrl : localUrl;
  const col = TYPE_COLORS[bakery.type] || '#d4944c';
  return (
    <a href={`/bakery/${slug}`} style={{
      textDecoration: 'none', display: 'block', borderRadius: 10, overflow: 'hidden',
      border: '1px solid rgba(212,148,76,0.06)', background: 'rgba(255,255,255,0.015)',
      transition: 'transform 0.3s, border-color 0.3s',
    }}>
      <div style={{ position: 'relative', height: 210, overflow: 'hidden', background: '#111' }}>
        <img
          ref={imgRef}
          src={src}
          alt={`${bakery.name} \u2014 ${bakery.type} in ${bakery.city}, ${bakery.country}`}
          width={640} height={210}
          loading={bakery.rank <= 6 ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => { if (!error) setError(true); }}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'brightness(0.78) saturate(0.8) contrast(1.05)',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />
        <div style={{
          position: 'absolute', top: 10, left: 10,
          fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
          color: bakery.rank <= 10 ? '#080808' : '#fff',
          background: bakery.rank <= 10 ? 'rgba(212,148,76,0.9)' : 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(6px)', padding: '3px 8px', borderRadius: 3,
        }}>
          #{bakery.rank}
        </div>
        <div style={{
          position: 'absolute', top: 10, right: 10,
          fontFamily: "'Outfit', sans-serif", fontSize: 8, fontWeight: 600,
          letterSpacing: 0.5, textTransform: 'uppercase',
          padding: '3px 6px', borderRadius: 3, backdropFilter: 'blur(6px)',
          background: `${col}20`, color: col, border: `1px solid ${col}40`,
        }}>
          {bakery.type}
        </div>
        {/* Gradient overlay for name readability */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
          height: '50%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* Bakery name on photo */}
        <div style={{
          position: 'absolute', bottom: 8, left: 10, right: 10, zIndex: 4,
          fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
          color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          lineHeight: 1.3, pointerEvents: 'none',
        }}>
          {bakery.name}
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560', fontWeight: 300, marginBottom: 6 }}>
          {bakery.city}, {bakery.country}
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#8a8278', fontStyle: 'italic', marginBottom: 8, lineHeight: 1.4 }}>
          {bakery.tag}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, color: '#f5f0e8' }}>
            {"\u2B50"} {bakery.rating}
          </span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: '#6a6560' }}>
            ({bakery.reviews.toLocaleString()} reviews)
          </span>
          {bakery.aw && bakery.aw.map((a, j) => (
            <span key={j} style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 8, fontWeight: 600,
              padding: '3px 7px', borderRadius: 4,
              background: 'rgba(212,148,76,0.18)', border: '1px solid rgba(212,148,76,0.35)',
              color: '#e8d5a8',
            }}>
              {"\uD83C\uDFC6"} {a}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

export default function Top50Grid({ bakeries }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
      {bakeries.map(bakery => (
        <BarCard key={bakery.rank} bakery={bakery} />
      ))}
    </div>
  );
}
