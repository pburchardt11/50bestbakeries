// app/layout.js
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { JsonLd } from '../lib/schema';
import { organizationSchema, websiteSchema } from '../lib/schema';
import LanguageToggle from '../components/LanguageToggle';
import SearchBar from '../components/SearchBar';
import NavMenu from '../components/NavMenu';
import Footer from '../components/Footer';
import AuthProvider from '../components/SessionProvider';
import UserNav from '../components/UserNav';
import CookieConsent from '../components/CookieConsent';
// import { getTotalBars } from '../lib/bakery-db';

export const metadata = {
  metadataBase: new URL('https://www.50bestbakeries.com'),
  title: {
    default: '50 Best Bakeries — The World\'s Best Bakeries Reviewed',
    template: '%s | 50 Best Bakeries',
  },
  description: 'Discover the world\'s best bakeries plus hundreds of thousands of bakeries across 200+ countries. Boulangeries, patisseries, artisan bakeries, pastry shops & more. Ratings, reviews & insider guides.',
  keywords: ['best bakeries', 'bakery guide', 'patisserie', 'boulangerie', 'artisan bakery', 'bakery reviews', 'pastry shop', 'sourdough', 'croissants', 'macarons'],
  authors: [{ name: '50 Best Bakeries Editorial' }],
  creator: '50 Best Bakeries',
  publisher: '50 Best Bakeries',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.50bestbakeries.com',
    siteName: '50 Best Bakeries',
    title: '50 Best Bakeries — The World\'s Best Bakeries Reviewed',
    description: 'Discover the world\'s best bakeries plus hundreds of thousands of bakeries across 200+ countries. Ratings, reviews & insider guides.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '50 Best Bakeries - The World\'s Best Bakeries Reviewed',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@50bestbakeries',
    creator: '@50bestbakeries',
    title: '50 Best Bakeries — The World\'s Best Bakeries Reviewed',
    description: 'Discover hundreds of thousands of bakeries across 200+ countries. Ratings, reviews & insider guides.',
    images: ['/og-image.jpg'],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Alternate languages (for future i18n)
  alternates: {
    canonical: 'https://www.50bestbakeries.com',
    languages: {
      'en-US': 'https://www.50bestbakeries.com',
    },
  },

  // Verification
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION } : {}),
  },

  // Bing Webmaster Tools + other custom meta tags
  other: {
    'msvalidate.01': 'FE11F6C2CBFB1274A2697D0FA16F11F0',
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* RSS autodiscovery — helps feed readers and search engines find the blog feed */}
        <link rel="alternate" type="application/rss+xml" title="50 Best Bakeries Blog" href="/blog/feed.xml" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://picsum.photos" />
        <link rel="preconnect" href="https://translate.googleapis.com" />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,500&family=Outfit:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Site-wide structured data */}
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />

        {/* Google Consent Mode v2 — must load BEFORE AdSense/Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
                wait_for_update: 500,
              });
            `,
          }}
        />

        {/* Google AdSense — must be in <head> without data-nscript */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2057309335537732"
          crossOrigin="anonymous"
        />

        {/* Google Analytics (replace with your ID) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        background: '#080808',
        color: '#e8e4de',
        margin: 0,
        padding: 0,
      }}>
        <AuthProvider>
          <nav style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(212,148,76,0.06)',
            padding: '12px 24px',
          }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              }}>
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #d4af37, #c4a87c, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -1, lineHeight: 1 }}>50</span>
                  <span style={{ width: 1, height: 24, background: 'linear-gradient(to bottom, transparent, #c4a87c, transparent)', margin: '0 8px', opacity: 0.5 }}></span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 7, fontWeight: 600, letterSpacing: 3, color: '#c4a87c', opacity: 0.8, lineHeight: 1 }}>BEST</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 400, fontStyle: 'italic', color: '#f5f0e8', letterSpacing: 1, lineHeight: 1.1 }}>Bakery</span>
                  </span>
                </a>
                <div className="nav-search-desktop" style={{ flex: '1 1 340px', maxWidth: 540, margin: '0 16px' }}>
                  <SearchBar />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <UserNav />
                  <NavMenu />
                </div>
              </div>
              <style>{`
                @media (max-width: 640px) {
                  .nav-search-desktop { display: none !important; }
                  .nav-search-mobile { display: block !important; }
                }
                @media (min-width: 641px) {
                  .nav-search-mobile { display: none !important; }
                }
              `}</style>
              <div className="nav-search-mobile" style={{ display: 'none', marginTop: 8 }}>
                <SearchBar />
              </div>
            </div>
          </nav>
          {children}
        </AuthProvider>
        <Footer />
        <CookieConsent />
        <LanguageToggle />
        <Analytics />
      </body>
    </html>
  );
}
