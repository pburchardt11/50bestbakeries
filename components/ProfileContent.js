'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

function BarCard({ slug, label, icon, accent }) {
  // Derive a display name from the slug
  const displayName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <a href={`/bakery/${slug}`} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderRadius: 10,
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
      textDecoration: 'none', transition: 'border-color 0.2s',
    }}>
      {icon && <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500,
          color: '#e8e4de', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {displayName}
        </div>
        {label && (
          <div style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 11, color: accent || '#6a6560', marginTop: 2,
          }}>
            {label}
          </div>
        )}
      </div>
      <span style={{ color: '#4a4540', fontSize: 14, flexShrink: 0 }}>→</span>
    </a>
  );
}

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(x => (
        <svg key={x} width="10" height="10" viewBox="0 0 24 24">
          <path
            d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z"
            fill={x <= rating ? '#FBBC04' : '#3a3530'}
          />
        </svg>
      ))}
    </span>
  );
}

function Section({ title, icon, count, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <h2 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
          letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c',
          margin: 0,
        }}>
          {title}
        </h2>
        {count > 0 && (
          <span style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 10, color: '#4a4540',
            background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 10,
          }}>
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

export default function ProfileContent() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login?callbackUrl=/profile';
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/user/lists')
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div style={{
        textAlign: 'center', padding: '80px 0',
        fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#6a6560',
      }}>
        Loading...
      </div>
    );
  }

  if (!session) return null;

  const empty = !data || (
    data.reviewed.length === 0 && data.wantgo.length === 0 && data.favorites.length === 0
  );

  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 400, color: '#f5f0e8', margin: '0 0 6px' }}>
          {session.user.name}
        </h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560', margin: 0 }}>
          {session.user.email}
        </p>
      </div>

      {empty ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(255,255,255,0.02)', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: '#8a8278', margin: '0 0 8px' }}>
            No activity yet
          </p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560', margin: 0 }}>
            Start exploring bakeries to rate, review, and save your favorites.
          </p>
          <a href="/" style={{
            display: 'inline-block', marginTop: 20, padding: '10px 24px',
            borderRadius: 8, background: '#d4944c', color: '#080808',
            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
          }}>
            Explore Bakeries
          </a>
        </div>
      ) : (
        <>
          {data.reviewed.length > 0 && (
            <Section title="My Reviews" icon="✍️" count={data.reviewed.length}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.reviewed.map(item => (
                  <BarCard
                    key={item.slug}
                    slug={item.slug}
                    label={item.rating ? <StarRating rating={item.rating} /> : 'Reviewed'}
                    accent="#FBBC04"
                  />
                ))}
              </div>
            </Section>
          )}

          {data.wantgo.length > 0 && (
            <Section title="Want to Visit" icon="🔖" count={data.wantgo.length}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.wantgo.map(slug => (
                  <BarCard key={slug} slug={slug} label="Bookmarked" accent="#d4944c" />
                ))}
              </div>
            </Section>
          )}

          {data.favorites.length > 0 && (
            <Section title="Favorites" icon="❤️" count={data.favorites.length}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.favorites.map(slug => (
                  <BarCard key={slug} slug={slug} label="Favorite" accent="#e06080" />
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </>
  );
}
