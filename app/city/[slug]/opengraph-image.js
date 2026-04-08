import { ImageResponse } from 'next/og';
import { getAllCountries, getCitiesForCountry, getBarsForCity, toSlug } from '../../../lib/bakery-db';

export const alt = 'City bakery guide';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function findCityCountry(slug) {
  for (const country of getAllCountries()) {
    for (const city of getCitiesForCountry(country)) {
      if (toSlug(city) === slug) return { city, country };
    }
  }
  return null;
}

export default async function Image({ params }) {
  const { slug } = await params;
  const match = findCityCountry(slug);

  if (!match) {
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
          City Not Found
        </div>
      ),
      { ...size }
    );
  }

  const { city, country } = match;
  const bakeries = getBarsForCity(country, city);
  const barCount = bakeries.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
          padding: '48px 64px',
        }}
      >
        {/* Decorative top accent */}
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            fontFamily: 'sans-serif',
            fontWeight: 700,
            color: '#d4944c',
            textTransform: 'uppercase',
            letterSpacing: 4,
            marginBottom: 24,
          }}
        >
          City Bakery Guide
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontFamily: 'serif',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Best Bakeries in {city}
        </div>

        {/* Country */}
        <div
          style={{
            fontSize: 32,
            fontFamily: 'sans-serif',
            color: '#e0e0e0',
            marginBottom: 32,
          }}
        >
          {country}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 3,
            backgroundColor: '#d4944c',
            marginBottom: 32,
            display: 'flex',
          }}
        />

        {/* Bakery count badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(212,148,76,0.15)',
            border: '2px solid #d4944c',
            borderRadius: 40,
            padding: '12px 32px',
          }}
        >
          <span
            style={{
              fontSize: 42,
              fontFamily: 'serif',
              fontWeight: 700,
              color: '#d4944c',
              marginRight: 12,
            }}
          >
            {barCount}
          </span>
          <span
            style={{
              fontSize: 26,
              fontFamily: 'sans-serif',
              color: '#ffffff',
            }}
          >
            {barCount === 1 ? 'bakery reviewed' : 'bakeries reviewed'}
          </span>
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 40,
            display: 'flex',
            fontSize: 22,
            fontFamily: 'sans-serif',
            fontWeight: 700,
            color: '#ffffff',
            opacity: 0.7,
          }}
        >
          50bestbakeries.com
        </div>
      </div>
    ),
    { ...size }
  );
}
