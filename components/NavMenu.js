'use client';

import { useState, useRef, useEffect } from 'react';
import { TYPE_ICONS } from '../lib/bakery-db';

const TYPES = [
  { name: 'Bakery', slug: 'bakery' },
  { name: 'Patisserie', slug: 'patisserie' },
  { name: 'Boulangerie', slug: 'boulangerie' },
  { name: 'Cafe Bakery', slug: 'cafe-bakery' },
  { name: 'Artisan Bakery', slug: 'artisan-bakery' },
  { name: 'Pastry Shop', slug: 'pastry-shop' },
  { name: 'Viennoiserie', slug: 'viennoiserie' },
  { name: 'Bagel Shop', slug: 'bagel-shop' },
  { name: 'Bread Bakery', slug: 'bread-bakery' },
  { name: 'Macaron Shop', slug: 'macaron-shop' },
  { name: 'Cake Shop', slug: 'cake-shop' },
  { name: 'Donut Shop', slug: 'donut-shop' },
  { name: 'Croissanterie', slug: 'croissanterie' },
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '6px 8px', display: 'flex', flexDirection: 'column',
          gap: 4, alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ display: 'block', width: 20, height: 1.5, background: '#8a8278', borderRadius: 1 }} />
        <span style={{ display: 'block', width: 20, height: 1.5, background: '#8a8278', borderRadius: 1 }} />
        <span style={{ display: 'block', width: 20, height: 1.5, background: '#8a8278', borderRadius: 1 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          width: 220, borderRadius: 10,
          background: '#1a1815', border: '1px solid rgba(212,148,76,0.12)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)', zIndex: 100,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '8px 14px 4px', fontFamily: "'Outfit', sans-serif",
            fontSize: 9, fontWeight: 600, color: '#d4944c',
            textTransform: 'uppercase', letterSpacing: 1.5,
          }}>
            Bakery Types
          </div>
          {TYPES.map(t => (
            <a key={t.slug} href={`/type/${t.slug}`} style={{
              display: 'block', padding: '8px 14px', textDecoration: 'none',
              fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b0a898',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              transition: 'background 0.15s',
            }}>
              {TYPE_ICONS[t.name] || '🥐'} {t.name}
            </a>
          ))}
          <div style={{
            padding: '8px 14px 4px', fontFamily: "'Outfit', sans-serif",
            fontSize: 9, fontWeight: 600, color: '#d4944c',
            textTransform: 'uppercase', letterSpacing: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            More
          </div>
          <a href="/find-a-bakery" style={{ display: 'block', padding: '8px 14px', textDecoration: 'none', fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#d4944c', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>Find a Bakery Near You</a>
          <a href="/blog" style={{ display: 'block', padding: '8px 14px', textDecoration: 'none', fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b0a898', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>Blog</a>
          <a href="/about" style={{ display: 'block', padding: '8px 14px', textDecoration: 'none', fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b0a898', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>About</a>
          <a href="/contact" style={{ display: 'block', padding: '8px 14px', textDecoration: 'none', fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b0a898', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>Contact</a>
          <a href="/privacy-policy" style={{ display: 'block', padding: '8px 14px', textDecoration: 'none', fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b0a898', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>Privacy Policy</a>
          <a href="/terms" style={{ display: 'block', padding: '8px 14px 10px', textDecoration: 'none', fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b0a898' }}>Terms of Service</a>
        </div>
      )}
    </div>
  );
}
