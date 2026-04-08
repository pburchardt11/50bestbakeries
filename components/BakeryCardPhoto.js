'use client';
// components/BakeryCardPhoto.js
// Used in country/city listing pages
// Shows pre-downloaded local photo with fallback to stock bakery images
// No API calls — photos served from Vercel Blob or local public/photos/

import { useState, useRef, useEffect } from 'react';

const BAKERY_STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=500&fit=crop', // croissants
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=500&fit=crop', // pastry display
  'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=500&fit=crop', // bread loaves
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=500&fit=crop', // artisan bread
  'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&h=500&fit=crop', // baker at work
  'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&h=500&fit=crop', // french patisserie
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=500&fit=crop', // bakery counter
  'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&h=500&fit=crop', // sourdough
  'https://images.unsplash.com/photo-1546538490-0fe0a8eba4e6?w=800&h=500&fit=crop', // macarons
  'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=800&h=500&fit=crop', // cupcakes and cakes
];

function getStockFallback(name, city) {
  let h = 0;
  const s = (name || '') + (city || '');
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return BAKERY_STOCK_IMAGES[Math.abs(h) % BAKERY_STOCK_IMAGES.length];
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
