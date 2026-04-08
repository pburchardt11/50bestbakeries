// components/SimilarBakeries.js
// Server component — displays a grid of similar bakery cards for internal linking

import Link from 'next/link';
import BakeryCardPhoto from './BakeryCardPhoto';

export default function SimilarBakeries({ bakeries }) {
  if (!bakeries || bakeries.length === 0) return null;

  // Group: bakeries in the same city as the first bakery vs other cities
  const mainCity = bakeries[0]?.city;
  const sameCityBars = bakeries.filter(b => b.city === mainCity);
  const otherBars = bakeries.filter(b => b.city !== mainCity);

  return (
    <div style={{ marginTop: 40 }}>
      {sameCityBars.length > 0 && (
        <section>
          <h3 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: '#d4944c',
            marginBottom: 14,
          }}>
            Other bakeries in {mainCity}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {sameCityBars.map(bakery => (
              <BarCard key={bakery.slug} bakery={bakery} />
            ))}
          </div>
        </section>
      )}

      {otherBars.length > 0 && (
        <section style={{ marginTop: sameCityBars.length > 0 ? 32 : 0 }}>
          <h3 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: '#d4944c',
            marginBottom: 14,
          }}>
            Similar Bakeries
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {otherBars.map(bakery => (
              <BarCard key={bakery.slug} bakery={bakery} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BarCard({ bakery }) {
  return (
    <Link
      href={`/bakery/${bakery.slug}`}
      style={{
        display: 'block',
        background: '#181818',
        borderRadius: 10,
        overflow: 'hidden',
        textDecoration: 'none',
        color: '#fff',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
    >
      <BakeryCardPhoto
        name={bakery.name}
        city={bakery.city}
        country={bakery.country}
        photoUrl={bakery.photo}
        alt={`${bakery.name} in ${bakery.city}`}
        height={140}
      />
      <div style={{ padding: '10px 12px 12px' }}>
        <span style={{
          display: 'inline-block',
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "'Outfit', sans-serif",
          background: bakery.typeColor || '#d4944c',
          color: '#fff',
          borderRadius: 4,
          padding: '2px 7px',
          marginBottom: 6,
        }}>
          {bakery.type}
        </span>
        <div style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.3,
          marginBottom: 4,
          color: '#fff',
        }}>
          {bakery.name}
        </div>
        <div style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 12,
          color: '#999',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{bakery.city}</span>
          {bakery.rating > 0 && (
            <span style={{ color: '#d4944c', fontWeight: 600 }}>
              {'★'} {bakery.rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
