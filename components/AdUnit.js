'use client';

import { useEffect, useRef } from 'react';

export default function AdUnit({ slot = '', format = 'auto', style }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;

    // Retry until adsbygoogle is initialized by the external script
    let attempts = 0;
    const maxAttempts = 20; // 20 x 300ms = 6 seconds max wait

    const interval = setInterval(() => {
      attempts++;
      try {
        if (window.adsbygoogle && adRef.current) {
          pushed.current = true;
          clearInterval(interval);
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        // AdSense not loaded or ad blocked
        clearInterval(interval);
      }
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      margin: '32px auto',
      maxWidth: 728,
      textAlign: 'center',
      minHeight: 100,
      ...style,
    }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: '#4a4540', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' }}>Advertisement</div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2057309335537732"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
