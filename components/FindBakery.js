'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';

const BakeryMap = dynamic(() => import('./BakeryMap'), { ssr: false });

const BAR_TYPES = [
  'Cocktail Bakery', 'Speakeasy', 'Wine Bakery', 'Dive Bakery',
  'Rooftop Bakery', 'Tiki Bakery', 'Pub', 'Beer Garden',
  'Lounge', 'Nightclub', 'Hotel Bakery', 'Gastropub', 'Jazz Bakery',
];

const RADIUS_OPTIONS = [10, 25, 50, 100, 200];

export default function FindBar() {
  const [location, setLocation] = useState('');
  const [center, setCenter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [bakeries, setBars] = useState([]);
  const [total, setTotal] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [radius, setRadius] = useState(50);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const listRef = useRef(null);
  const suggestTimer = useRef(null);
  const searchWrapperRef = useRef(null);

  const blobBase = process.env.NEXT_PUBLIC_BLOB_BASE_URL || '';

  function getBarPhotoUrl(slug) {
    if (blobBase) return `${blobBase}/bakery-photos/${slug}.jpg`;
    return `/photos/${slug}.jpg`;
  }

  // Detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(loc);
          setUserLocation(loc);
          setDetectingLocation(false);
        },
        () => {
          fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(data => {
              if (data.latitude && data.longitude) {
                const loc = { lat: data.latitude, lng: data.longitude };
                setCenter(loc);
                setUserLocation(loc);
                setLocation(data.city || '');
              }
            })
            .catch(() => {
              setCenter({ lat: 51.5, lng: -0.12 });
            })
            .finally(() => setDetectingLocation(false));
        },
        { timeout: 5000 }
      );
    } else {
      setCenter({ lat: 51.5, lng: -0.12 });
      setDetectingLocation(false);
    }
  }, []);

  // Fetch bakeries when center/type/radius changes
  const fetchBars = useCallback(async () => {
    if (!center) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: center.lat,
        lng: center.lng,
        radius: radius,
        limit: 60,
      });
      if (type) params.set('type', type);

      const res = await fetch(`/api/find-bakeries?${params}`);
      const data = await res.json();
      setBars(data.results || []);
      setTotal(data.total || 0);
      setCityCount(data.cities || 0);
    } catch {
      setBars([]);
    }
    setLoading(false);
  }, [center, type, radius]);

  useEffect(() => {
    fetchBars();
  }, [fetchBars]);

  // Autocomplete suggestions
  function handleLocationChange(e) {
    const val = e.target.value;
    setLocation(val);

    clearTimeout(suggestTimer.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestTimer.current = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5&addressdetails=1`, {
        headers: { 'User-Agent': '50BestBar/1.0' },
      })
        .then(r => r.json())
        .then(data => {
          setSuggestions(data.map(d => ({
            label: d.display_name.split(',').slice(0, 3).join(','),
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
          })));
          setShowSuggestions(true);
        })
        .catch(() => {});
    }, 350);
  }

  function selectSuggestion(s) {
    setLocation(s.label);
    setCenter({ lat: s.lat, lng: s.lng });
    setSuggestions([]);
    setShowSuggestions(false);
  }

  useEffect(() => {
    function handler(e) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLocationSearch(e) {
    e.preventDefault();
    if (!location.trim()) return;
    setShowSuggestions(false);

    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`, {
      headers: { 'User-Agent': '50BestBar/1.0' },
    })
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) {
          setCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  // Scroll to bakery card when selected
  useEffect(() => {
    if (selectedSlug && listRef.current) {
      const el = listRef.current.querySelector(`[data-slug="${selectedSlug}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedSlug]);

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(212,148,76,0.2)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e8e4de',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div>
      {/* Search & Filters */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20,
        alignItems: 'center',
      }}>
        <div ref={searchWrapperRef} style={{ position: 'relative', flex: '1 1 300px' }}>
          <form onSubmit={handleLocationSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Search location (city, address...)"
              value={location}
              onChange={handleLocationChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" style={{
              padding: '10px 18px', borderRadius: 8,
              background: '#d4944c', color: '#080808', border: 'none',
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Search
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              marginTop: 4, borderRadius: 10,
              background: '#1a1815',
              border: '1px solid rgba(212,148,76,0.12)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              zIndex: 100, overflow: 'hidden',
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  style={{
                    display: 'block', width: '100%', padding: '10px 14px',
                    textAlign: 'left', background: 'transparent', border: 'none',
                    borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b0a898',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(212,148,76,0.1)'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{ ...inputStyle, minWidth: 140, cursor: 'pointer' }}
        >
          <option value="">All Types</option>
          {BAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={radius}
          onChange={e => setRadius(parseInt(e.target.value))}
          style={{ ...inputStyle, minWidth: 100, cursor: 'pointer' }}
        >
          {RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r} km</option>)}
        </select>

        <button
          onClick={() => setShowMap(!showMap)}
          style={{
            display: 'none',
            padding: '10px 14px', borderRadius: 8,
            background: showMap ? '#d4944c' : 'rgba(255,255,255,0.06)',
            color: showMap ? '#080808' : '#d4944c',
            border: '1px solid rgba(212,148,76,0.2)',
            fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
          }}
          className="mobile-map-toggle"
        >
          {showMap ? 'Show List' : 'Show Map'}
        </button>
      </div>

      {/* Stats bakery */}
      {!loading && bakeries.length > 0 && (
        <div style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560',
          marginBottom: 16,
        }}>
          {total.toLocaleString()} bakeries found in {cityCount} cities within {radius} km
          {type && <> &middot; Filtered: {type}</>}
        </div>
      )}

      {/* Main content: list + map */}
      <div style={{ display: 'flex', gap: 20, minHeight: 600 }} className="find-bakery-main">
        {/* Bakery list */}
        <div
          ref={listRef}
          style={{
            flex: '1 1 400px',
            maxHeight: 700,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
          className="find-bakery-list"
        >
          {detectingLocation && (
            <div style={{
              padding: 40, textAlign: 'center',
              fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560',
            }}>
              Detecting your location...
            </div>
          )}

          {!detectingLocation && loading && (
            <div style={{
              padding: 40, textAlign: 'center',
              fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560',
            }}>
              Finding bakeries near you...
            </div>
          )}

          {!detectingLocation && !loading && bakeries.length === 0 && (
            <div style={{
              padding: 40, textAlign: 'center',
              fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#6a6560',
              lineHeight: 1.8,
            }}>
              No bakeries found within {radius} km.<br />
              Try increasing the radius or searching a different location.
            </div>
          )}

          {bakeries.map(bakery => (
            <a
              key={bakery.slug}
              href={`/bakery/${bakery.slug}`}
              data-slug={bakery.slug}
              onMouseEnter={() => setSelectedSlug(bakery.slug)}
              style={{
                display: 'flex', gap: 14, padding: 12, borderRadius: 10,
                background: selectedSlug === bakery.slug ? 'rgba(212,148,76,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedSlug === bakery.slug ? 'rgba(212,148,76,0.2)' : 'rgba(255,255,255,0.04)'}`,
                textDecoration: 'none', transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              {/* Rank badge */}
              <div style={{
                width: 32, minWidth: 32, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontFamily: "'Outfit', sans-serif",
                fontSize: bakery.rank <= 10 ? 14 : 12, fontWeight: 700,
                color: bakery.rank <= 10 ? '#d4944c' : '#6a6560',
              }}>
                #{bakery.rank}
              </div>
              {/* Photo */}
              <div style={{
                width: 80, height: 80, borderRadius: 8, overflow: 'hidden',
                background: '#111', flexShrink: 0,
              }}>
                <img
                  src={getBarPhotoUrl(bakery.slug)}
                  alt={bakery.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.target.style.display = 'none'; }}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    filter: 'brightness(0.85) saturate(0.85)',
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
                  color: '#f5f0e8', marginBottom: 4,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {bakery.name}
                </div>
                <div style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560',
                  marginBottom: 6,
                }}>
                  {bakery.city}, {bakery.country} &middot; {bakery.distance} km away
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
                    color: '#f5f0e8',
                  }}>
                    {bakery.rating}
                  </span>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 10, color: '#4a4540',
                  }}>
                    ({bakery.reviews.toLocaleString()} reviews)
                  </span>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 600,
                    padding: '2px 6px', borderRadius: 3,
                    background: 'rgba(212,148,76,0.1)', color: '#d4944c',
                    border: '1px solid rgba(212,148,76,0.2)',
                  }}>
                    {bakery.type}
                  </span>
                </div>
              </div>
            </a>
          ))}

          {!loading && bakeries.length > 0 && bakeries.length < total && (
            <div style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#4a4540',
              textAlign: 'center', padding: '12px 0',
            }}>
              Showing {bakeries.length} of {total.toLocaleString()} bakeries
            </div>
          )}
        </div>

        {/* Map — desktop */}
        <div style={{
          flex: '1 1 400px',
          minHeight: 500,
          borderRadius: 12,
          overflow: 'hidden',
          position: 'sticky',
          top: 80,
          alignSelf: 'flex-start',
        }} className="find-bakery-map-desktop">
          {center && (
            <BakeryMap
              bakeries={bakeries}
              center={center}
              userLocation={userLocation}
              selectedSlug={selectedSlug}
              onSelectBar={setSelectedSlug}
            />
          )}
        </div>

        {/* Mobile map */}
        {showMap && (
          <div style={{
            height: 450,
            borderRadius: 12,
            overflow: 'hidden',
          }} className="find-bakery-map-mobile">
            {center && (
              <BakeryMap
                bakeries={bakeries}
                center={center}
                userLocation={userLocation}
                selectedSlug={selectedSlug}
                onSelectBar={setSelectedSlug}
              />
            )}
          </div>
        )}
      </div>

      <style>{`
        .find-bakery-map-mobile { display: none; }
        @media (max-width: 768px) {
          .mobile-map-toggle { display: block !important; }
          .find-bakery-main { flex-direction: column !important; }
          .find-bakery-list { ${showMap ? 'display: none !important;' : 'display: flex !important; max-height: none !important;'} }
          .find-bakery-map-desktop { display: none !important; }
          .find-bakery-map-mobile { display: ${showMap ? 'block' : 'none'} !important; }
        }
      `}</style>
    </div>
  );
}
