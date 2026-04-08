import { ImageResponse } from 'next/og';
import { getBarBySlug } from '../../../lib/bakery-db';

export const alt = 'Bakery details';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { slug } = await params;
  const bakery = getBarBySlug(slug);

  if (!bakery) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a2e',
            color: '#ffffff',
            fontSize: 48,
            fontFamily: 'serif',
          }}
        >
          Bakery Not Found
        </div>
      ),
      { ...size }
    );
  }

  const photoUrl = `${process.env.NEXT_PUBLIC_BLOB_BASE_URL}/bakery-photos/${slug}.jpg`;
  const stars = '★'.repeat(Math.floor(bakery.rating)) + (bakery.rating % 1 >= 0.5 ? '½' : '');
  const reviewCount = bakery.reviews >= 1000
    ? `${(bakery.reviews / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : `${bakery.reviews}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* Background photo */}
        <img
          src={photoUrl}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 56px',
          }}
        >
          {/* Type badge */}
          <div
            style={{
              display: 'flex',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                backgroundColor: bakery.typeColor || '#d4944c',
                color: '#ffffff',
                fontSize: 20,
                fontFamily: 'sans-serif',
                fontWeight: 700,
                padding: '6px 18px',
                borderRadius: 24,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              {bakery.type}
            </div>
          </div>

          {/* Bakery name */}
          <div
            style={{
              fontSize: 64,
              fontFamily: 'serif',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: 12,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {bakery.name}
          </div>

          {/* City, Country */}
          <div
            style={{
              fontSize: 28,
              fontFamily: 'sans-serif',
              color: '#e0e0e0',
              marginBottom: 16,
            }}
          >
            {bakery.city}, {bakery.country}
          </div>

          {/* Rating + Reviews */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 26,
              fontFamily: 'sans-serif',
              color: '#fbbf24',
            }}
          >
            <span>{stars}</span>
            <span style={{ color: '#ffffff', marginLeft: 12 }}>
              {bakery.rating}
            </span>
            <span style={{ color: '#a0a0a0', marginLeft: 12 }}>
              ({reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            right: 40,
            display: 'flex',
            alignItems: 'center',
            fontSize: 22,
            fontFamily: 'sans-serif',
            fontWeight: 700,
            color: '#ffffff',
            opacity: 0.85,
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          }}
        >
          50bestbakeries.com
        </div>
      </div>
    ),
    { ...size }
  );
}
