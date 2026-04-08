'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const timerRef = useRef(null);

  const fetchResults = useCallback((q) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => {
        // Flatten into a single list with _type and _href
        const items = [];
        if (data.countries?.length) {
          for (const c of data.countries) {
            items.push({ ...c, _type: 'country', _href: `/country/${c.slug}` });
          }
        }
        if (data.cities?.length) {
          for (const c of data.cities) {
            items.push({ ...c, _type: 'city', _href: `/city/${c.slug}` });
          }
        }
        if (data.bakeries?.length) {
          for (const s of data.bakeries) {
            items.push({ ...s, _type: 'bakery', _href: `/bakery/${s.slug}` });
          }
        }
        setResults(items);
        setOpen(items.length > 0);
        setActiveIndex(-1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchResults(val), 300);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      window.location.href = results[activeIndex]._href;
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 15, color: '#6a6560', pointerEvents: 'none',
        }}>
          {'\u{1F50D}'}
        </span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search bakeries, cities, countries..."
          style={{
            width: '100%', padding: '10px 14px 10px 36px',
            borderRadius: 10,
            border: '1px solid rgba(212,148,76,0.15)',
            background: 'rgba(255,255,255,0.04)',
            color: '#e8e4de',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 15,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          marginTop: 4, borderRadius: 10,
          background: '#1a1815',
          border: '1px solid rgba(212,148,76,0.12)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          zIndex: 100, overflow: 'hidden',
          maxHeight: 420, overflowY: 'auto',
        }}>
          {results.map((item, i) => {
            // Section header when type changes
            const prevType = i > 0 ? results[i - 1]._type : null;
            const showHeader = item._type !== prevType;
            const headerLabel = item._type === 'country' ? 'Countries' : item._type === 'city' ? 'Cities' : 'Bakeries';

            return (
              <div key={`${item._type}-${item.slug || item.name}`}>
                {showHeader && (
                  <div style={{
                    padding: '6px 14px 4px',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#d4944c',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    {headerLabel}
                  </div>
                )}
                <a
                  href={item._href}
                  style={{
                    display: 'block', padding: '10px 14px',
                    textDecoration: 'none',
                    background: i === activeIndex ? 'rgba(212,148,76,0.1)' : 'transparent',
                    borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  {item._type === 'country' && (
                    <>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, color: '#f5f0e8' }}>
                        {item.name}
                      </div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560', marginTop: 2 }}>
                        {item.barCount} bakeries in {item.cityCount} cities
                      </div>
                    </>
                  )}
                  {item._type === 'city' && (
                    <>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, color: '#f5f0e8' }}>
                        {item.name}
                      </div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560', marginTop: 2 }}>
                        {item.country} &middot; {item.barCount} bakeries
                      </div>
                    </>
                  )}
                  {item._type === 'bakery' && (
                    <>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, color: '#f5f0e8' }}>
                        {item.name}
                      </div>
                      <div style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: 11,
                        color: '#6a6560', marginTop: 2,
                        display: 'flex', gap: 8, alignItems: 'center',
                      }}>
                        <span>{item.city}, {item.country}</span>
                        <span style={{
                          fontSize: 9, padding: '1px 5px', borderRadius: 3,
                          background: 'rgba(212,148,76,0.1)',
                          color: '#d4944c',
                        }}>
                          {item.type}
                        </span>
                        <span>{item.rating}</span>
                      </div>
                    </>
                  )}
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
