'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function UserNav() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (status === 'loading') return null;

  if (!session) {
    return (
      <a href="/login" style={{
        fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500,
        color: '#c4a87c', textDecoration: 'none',
        padding: '6px 14px', borderRadius: 6,
        border: '1px solid rgba(196,168,124,0.25)',
        flexShrink: 0, whiteSpace: 'nowrap',
      }}>
        Sign In
      </a>
    );
  }

  const initials = (session.user.name || session.user.email || '?')
    .split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(196,168,124,0.15)', border: '1px solid rgba(196,168,124,0.3)',
          color: '#c4a87c', fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {initials}
      </button>
      {showMenu && (
        <div style={{
          position: 'absolute', right: 0, top: 40, minWidth: 180,
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: 8, zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            padding: '8px 12px', fontFamily: "'Outfit', sans-serif", fontSize: 12,
            color: '#e8e4de', borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 4,
          }}>
            {session.user.name}
          </div>
          <a
            href="/profile"
            style={{
              display: 'block', padding: '8px 12px', background: 'none', border: 'none',
              fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#c4a87c',
              textDecoration: 'none', borderRadius: 6,
            }}
          >
            My Profile
          </a>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              width: '100%', padding: '8px 12px', background: 'none', border: 'none',
              fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#8a8278',
              cursor: 'pointer', textAlign: 'left', borderRadius: 6,
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
