// app/privacy-policy/page.js
// Privacy Policy — required for Google AdSense

export const metadata = {
  title: 'Privacy Policy — 50 Best Bakeries',
  description: 'Privacy Policy for 50bestbakeries.com. Learn how we collect, use, and protect your personal information.',
  alternates: { canonical: 'https://www.50bestbakeries.com/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  const sectionStyle = { marginBottom: 32 };
  const h2Style = { fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500, color: '#f5f0e8', marginBottom: 12, marginTop: 0 };
  const h3Style = { fontSize: 17, fontWeight: 500, color: '#e8e4de', marginBottom: 8, marginTop: 0 };
  const pStyle = { fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#8a8278', lineHeight: 1.8, marginBottom: 12 };

  return (
    <article style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
      <nav aria-label="Breadcrumb" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginBottom: 24 }}>
        <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>Privacy Policy</span>
      </nav>

      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 300, color: '#f5f0e8', lineHeight: 1.1, margin: 0 }}>
          Privacy <span style={{ color: '#d4944c', fontWeight: 600, fontStyle: 'italic' }}>Policy</span>
        </h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginTop: 12 }}>
          Last updated: March 2026
        </p>
      </header>

      <div style={sectionStyle}>
        <p style={pStyle}>
          50 Best Bakeries (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website 50bestbakeries.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this policy carefully. By using our site, you consent to the practices described herein.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Information We Collect</h2>
        <h3 style={h3Style}>Automatically Collected Information</h3>
        <p style={pStyle}>
          When you visit 50 Best Bakeries, certain information is collected automatically, including your IP address, browser type, operating system, referring URLs, pages viewed, time spent on pages, and other usage data. This information is collected through cookies, web beacons, and similar tracking technologies.
        </p>
        <h3 style={h3Style}>Information from Third-Party Services</h3>
        <p style={pStyle}>
          We use third-party services such as Google Analytics and Google AdSense that may collect information about your browsing behavior. These services use their own cookies and tracking technologies as described below.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Cookies and Tracking Technologies</h2>
        <p style={pStyle}>
          Our website uses cookies — small text files placed on your device — to improve your experience and deliver relevant content and advertising. The types of cookies we use include:
        </p>
        <p style={pStyle}>
          <strong style={{ color: '#e8e4de' }}>Essential cookies:</strong> Required for the website to function properly, including session management and security.
        </p>
        <p style={pStyle}>
          <strong style={{ color: '#e8e4de' }}>Analytics cookies:</strong> We use Google Analytics to understand how visitors interact with our site. Google Analytics collects information such as pages visited, time on site, and demographic data. You can opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on.
        </p>
        <p style={pStyle}>
          <strong style={{ color: '#e8e4de' }}>Advertising cookies:</strong> We use Google AdSense to display advertisements. Google and its partners use cookies to serve ads based on your prior visits to this and other websites. You may opt out of personalized advertising by visiting Google&apos;s Ads Settings at ads.google.com/settings or by visiting aboutads.info.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Google AdSense and Advertising</h2>
        <p style={pStyle}>
          We use Google AdSense, a third-party advertising service provided by Google LLC, to serve advertisements on our website. Google AdSense uses cookies, including the DoubleClick cookie, to serve ads based on your visit to this site and other sites on the Internet. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.
        </p>
        <p style={pStyle}>
          Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website or other websites. You may opt out of the use of the DoubleClick cookie for interest-based advertising by visiting the Google Ads Settings page. Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting aboutads.info.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Google Places API</h2>
        <p style={pStyle}>
          We use the Google Places API to display photos, ratings, and business information for bakeries listed on our site. When you view a bakery page, your browser may make requests to Google servers to load this content. Google&apos;s Privacy Policy applies to data collected through these services. We do not store Google Places photos on our servers.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>How We Use Your Information</h2>
        <p style={pStyle}>
          We use information collected to operate and maintain our website, improve user experience, analyze usage patterns and trends, serve relevant advertisements, monitor and prevent fraud, and comply with legal obligations. We do not sell your personal information to third parties.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Data Sharing</h2>
        <p style={pStyle}>
          We may share non-personally identifiable information with our advertising partners, analytics providers, and service providers who assist us in operating the website. We may also disclose information if required by law, regulation, or legal process.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Data Retention</h2>
        <p style={pStyle}>
          We retain automatically collected data for as long as necessary to fulfill the purposes outlined in this policy. Analytics data is retained in accordance with Google Analytics data retention settings.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Your Rights</h2>
        <p style={pStyle}>
          Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data, and to opt out of certain data processing activities. If you are a resident of the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR). If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA). To exercise any of these rights, please contact us at legal@50bestbakeries.com.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Children&apos;s Privacy</h2>
        <p style={pStyle}>
          Our website is intended for adults of legal drinking age. We do not knowingly collect personal information from persons under the age of 18. If we learn that we have collected personal information from a minor, we will take steps to delete that information promptly.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Changes to This Policy</h2>
        <p style={pStyle}>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this page periodically.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Contact Us</h2>
        <p style={pStyle}>
          If you have questions about this Privacy Policy or our data practices, please contact us at legal@50bestbakeries.com or visit our <a href="/contact" style={{ color: '#d4944c', textDecoration: 'none' }}>Contact page</a>.
        </p>
      </div>

      <nav style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href="/terms" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/about" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>About Us</a>
          <a href="/contact" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>Contact</a>
        </div>
      </nav>
    </article>
  );
}
