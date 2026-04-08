'use client';
// components/BakeryPhotos.js
// Shows single local photo per bakery — no Google API calls
// Falls back to picsum gradient if no local photo available

import { useState, useRef, useEffect } from 'react';

export default function BakeryPhotos({ name, city, country, fallbackUrl, localPhotoUrl, height = 400 }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setImgLoaded(true);
  }, []);

  const src = error ? fallbackUrl : (localPhotoUrl || fallbackUrl);

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', background: '#111', borderRadius: 'inherit' }}>
      {/* Gradient fallback — always visible until image loads */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, #1a2a1a 0%, #2d3a2d 30%, #1a3040 60%, #2a2520 100%)',
        opacity: imgLoaded ? 0 : 1,
        transition: 'opacity 0.8s ease',
      }} />

      {/* Photo */}
      {src && (
        <img
          ref={imgRef}
          src={src}
          alt={`${name} photo`}
          loading="eager"
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (!error) setError(true);
          }}
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease',
            filter: 'brightness(0.82) contrast(1.02)',
          }}
        />
      )}
    </div>
  );
}
