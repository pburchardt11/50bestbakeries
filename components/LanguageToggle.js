'use client';

import { useState, useEffect, useRef } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
];

export default function LanguageToggle() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const ref = useRef(null);

  // Load Google Translate script
  useEffect(() => {
    if (document.getElementById('google-translate-script')) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src =
      '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Restore saved language
    const saved = localStorage.getItem('preferred-lang');
    if (saved && saved !== 'en') {
      setCurrentLang(saved);
      // Wait for Google Translate to initialize, then apply
      const interval = setInterval(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = saved;
          select.dispatchEvent(new Event('change'));
          clearInterval(interval);
        }
      }, 500);
      // Stop trying after 10 seconds
      setTimeout(() => clearInterval(interval), 10000);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const switchLanguage = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('preferred-lang', langCode);
    setOpen(false);

    if (langCode === 'en') {
      // Clear all possible googtrans cookie variations
      const hostname = window.location.hostname;
      const domainParts = hostname.split('.');
      const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';

      // Clear on all domain levels and paths
      const domains = ['', hostname];
      // Add parent domains (e.g., .50bestbakeries.com, .com)
      for (let i = 0; i < domainParts.length; i++) {
        domains.push('.' + domainParts.slice(i).join('.'));
      }
      for (const domain of domains) {
        const domainStr = domain ? `; domain=${domain}` : '';
        document.cookie = `googtrans=; ${expiry}; path=/${domainStr}`;
        document.cookie = `googtrans=; ${expiry}; path=${domainStr}`;
      }

      // Also try the select dropdown approach before reloading
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change'));
      }

      // Force a clean reload to restore original content
      window.location.reload();
      return;
    }

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
  };

  const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div ref={ref} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 10000 }}>
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            right: 0,
            width: 220,
            maxHeight: 380,
            overflowY: 'auto',
            background: 'rgba(18, 16, 14, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(212, 148, 76, 0.25)',
            borderRadius: 12,
            padding: '6px 0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                background:
                  lang.code === currentLang
                    ? 'rgba(212, 148, 76, 0.15)'
                    : 'transparent',
                color: lang.code === currentLang ? '#d4944c' : '#e8e4de',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(212, 148, 76, 0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  lang.code === currentLang
                    ? 'rgba(212, 148, 76, 0.15)'
                    : 'transparent')
              }
            >
              <span style={{ fontSize: 18 }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'rgba(18, 16, 14, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 148, 76, 0.3)',
          borderRadius: 50,
          color: '#d4944c',
          cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif",
          fontSize: 14,
          fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(212, 148, 76, 0.6)';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(212, 148, 76, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(212, 148, 76, 0.3)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{current.flag} {current.code.toUpperCase()}</span>
      </button>
    </div>
  );
}
