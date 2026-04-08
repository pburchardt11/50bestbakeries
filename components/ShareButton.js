'use client';

import { useState } from 'react';

export default function ShareButton({ title, url }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (e) {
        // User cancelled or error — ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback: select from a temporary input
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        flex: 1, minWidth: 160, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 8, padding: '14px 24px',
        borderRadius: 8, background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)', color: '#e8e4de',
        fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
        cursor: 'pointer', transition: 'background 0.2s',
      }}
    >
      {copied ? '✓ Link Copied' : '↗ Share'}
    </button>
  );
}
