'use client';

import { useState, useRef, useEffect } from 'react';

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
  const str = name + city;
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  return BAR_STOCK_IMAGES[Math.abs(hash) % BAR_STOCK_IMAGES.length];
}

function getPhotoUrl(name, city, slug) {
  const s = slug || barSlug(name, city);
  const blobBase = process.env.NEXT_PUBLIC_BLOB_BASE_URL || '';
  const local = blobBase ? `${blobBase}/bakery-photos/${s}.jpg` : `/photos/${s}.jpg`;
  return { local, fallback: getFallbackUrl(name, city) };
}

// Individual card — uses pre-downloaded local/Blob photo, no API calls
function BarCard({ bakery }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const { local, fallback } = getPhotoUrl(bakery.name, bakery.city, bakery.slug);
  const src = error ? fallback : local;

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <a
      href={`/bakery/${bakery.slug}`}
      style={{
        textDecoration: 'none', display: 'block', borderRadius: 10,
        overflow: 'hidden', border: '1px solid rgba(212,148,76,0.06)',
        background: 'rgba(255,255,255,0.015)', transition: 'transform 0.3s',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', background: '#111' }}>
        <img
          ref={imgRef}
          src={src}
          alt={bakery.name}
          width={600}
          height={180}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => { if (!error) setError(true); }}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'brightness(0.82) saturate(0.9)',
            position: 'absolute', inset: 0,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4,
          height: '60%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* Bakery name */}
        <div style={{
          position: 'absolute', bottom: 10, left: 12, right: 12, zIndex: 5,
          fontFamily: "'Outfit', sans-serif",
          fontSize: 15, fontWeight: 600, color: '#fff',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          lineHeight: 1.3, pointerEvents: 'none',
        }}>
          {bakery.name}
        </div>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#d4944c' }}>
            #{bakery.rank}
          </span>
          <span style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 8, fontWeight: 600,
            letterSpacing: 0.5, textTransform: 'uppercase',
            padding: '2px 6px', borderRadius: 3,
            background: `${bakery.typeColor}20`, color: bakery.typeColor,
            border: `1px solid ${bakery.typeColor}40`,
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
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560' }}>
          {bakery.city}, {bakery.country} · {bakery.rating} ({bakery.reviews.toLocaleString()} reviews)
        </div>
      </div>
    </a>
  );
}

export default function LoadMoreBakeries({ country, city, total, initialCount }) {
  const [bakeries, setBars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialCount);

  const loaded = initialCount + bakeries.length;
  if (bakeries.length === 0 && loaded >= total) return null;
  const nextEnd = Math.min(offset + 50, total);

  const handleLoad = async () => {
    setLoading(true);
    const params = new URLSearchParams({ offset: String(offset), limit: '50' });
    if (country) params.set('country', country);
    if (city) params.set('city', city);

    try {
      const res = await fetch(`/api/bakeries?${params}`);
      const data = await res.json();
      setBars(prev => [...prev, ...data.bakeries]);
      setOffset(prev => prev + data.bakeries.length);
    } catch (e) {
      // ignore
    }
    setLoading(false);
  };

  return (
    <div>
      {bakeries.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
          marginTop: 16,
        }}>
          {bakeries.map(bakery => (
            <BarCard key={bakery.slug} bakery={bakery} />
          ))}
        </div>
      )}

      {loaded < total && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            onClick={handleLoad}
            disabled={loading}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13, fontWeight: 500,
              padding: '12px 32px', borderRadius: 8,
              background: loading ? 'rgba(212,148,76,0.1)' : 'rgba(212,148,76,0.15)',
              border: '1px solid rgba(212,148,76,0.2)',
              color: '#d4944c', cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading
              ? 'Loading...'
              : `Show next 50 (${offset + 1}\u2013${nextEnd} of ${total.toLocaleString()})`
            }
          </button>
        </div>
      )}
    </div>
  );
}
