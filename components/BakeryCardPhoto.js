'use client';
// components/BakeryCardPhoto.js
// Used in country/city listing pages
// Shows pre-downloaded local photo with fallback to stock bakery images
// No API calls — photos served from Vercel Blob or local public/photos/

import { useState, useRef, useEffect } from 'react';

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

function getStockFallback(name, city) {
  let h = 0;
  const s = (name || '') + (city || '');
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return BAR_STOCK_IMAGES[Math.abs(h) % BAR_STOCK_IMAGES.length];
}

export default function BakeryCardPhoto({ name, city, country, fallbackUrl, photoUrl, alt, height = 180 }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  const stockUrl = fallbackUrl || getStockFallback(name, city);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

  const src = error ? stockUrl : (photoUrl || stockUrl);

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', background: '#111' }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={600}
        height={height}
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

      {/* Gradient overlay for text readability */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4,
        height: '60%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Bakery name overlay */}
      <div style={{
        position: 'absolute', bottom: 10, left: 12, right: 12, zIndex: 5,
        fontFamily: "'Outfit', sans-serif",
        fontSize: 15, fontWeight: 600, color: '#fff',
        textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        lineHeight: 1.3,
        pointerEvents: 'none',
      }}>
        {name}
      </div>
    </div>
  );
}
