'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    } else {
      // Re-apply saved consent signals
      updateConsentMode(consent === 'granted');
    }
  }, []);

  function updateConsentMode(granted) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied',
        analytics_storage: granted ? 'granted' : 'denied',
      });
    }
  }

  function handleAccept() {
    localStorage.setItem('cookie_consent', 'granted');
    updateConsentMode(true);
    setVisible(false);
  }

  function handleReject() {
    localStorage.setItem('cookie_consent', 'denied');
    updateConsentMode(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(18,18,18,0.97)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(212,148,76,0.15)',
      padding: '16px 24px',
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
      }}>
        <p style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b0a898',
          margin: 0, lineHeight: 1.6, flex: '1 1 400px',
        }}>
          We use cookies for analytics and to serve relevant ads via Google AdSense.
          See our <a href="/privacy-policy" style={{ color: '#d4944c', textDecoration: 'underline' }}>Privacy Policy</a> for details.
        </p>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={handleReject}
            style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500,
              padding: '8px 20px', borderRadius: 6, cursor: 'pointer',
              background: 'transparent', color: '#8a8278',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
              padding: '8px 20px', borderRadius: 6, cursor: 'pointer',
              background: '#d4944c', color: '#080808',
              border: 'none',
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
