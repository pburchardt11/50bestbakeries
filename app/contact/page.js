// app/contact/page.js
export const metadata = {
  title: 'Contact Us - 50 Best Bakeries',
  description: 'Get in touch with the 50 Best Bakeries team.',
  alternates: { canonical: 'https://www.50bestbakeries.com/contact' },
};

export default function ContactPage() {
  const ps = { fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#8a8278', lineHeight: 1.8, marginBottom: 12 };
  const card = { padding: '24px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 16 };
  const label = { fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', marginBottom: 8 };
  const val = { fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#e8e4de' };
  const detailBox = { marginBottom: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)' };
  const sumStyle = { padding: '14px 18px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500, color: '#e8e4de', listStyle: 'none' };
  const ansStyle = { padding: '0 18px 14px', margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#8a8278', lineHeight: 1.7 };

  return (
    <article style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
      <nav aria-label="Breadcrumb" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginBottom: 24 }}>
        <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>Contact</span>
      </nav>

      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 300, color: '#f5f0e8', lineHeight: 1.1, margin: 0 }}>
          Contact <span style={{ color: '#d4944c', fontWeight: 600, fontStyle: 'italic' }}>Us</span>
        </h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: '#8a8278', marginTop: 16, lineHeight: 1.7 }}>
          {"We'd love to hear from you. Whether you have a question about a bakery listing, want to suggest a correction, or are interested in partnerships, reach out below."}
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
        <div style={card}>
          <div style={label}>General Inquiries</div>
          <div style={val}><a href="mailto:info@50bestbakeries.com" style={{ color: '#d4944c', textDecoration: 'none' }}>info@50bestbakeries.com</a></div>
          <p style={{ ...ps, marginTop: 8, marginBottom: 0 }}>Questions about bakery listings, suggestions, corrections, or general feedback.</p>
        </div>
        <div style={card}>
          <div style={label}>Advertising and Partnerships</div>
          <div style={val}><a href="mailto:partners@50bestbakeries.com" style={{ color: '#d4944c', textDecoration: 'none' }}>partners@50bestbakeries.com</a></div>
          <p style={{ ...ps, marginTop: 8, marginBottom: 0 }}>Interested in advertising on 50 Best Bakeries or exploring partnership opportunities.</p>
        </div>
        <div style={card}>
          <div style={label}>Privacy and Legal</div>
          <div style={val}><a href="mailto:legal@50bestbakeries.com" style={{ color: '#d4944c', textDecoration: 'none' }}>legal@50bestbakeries.com</a></div>
          <p style={{ ...ps, marginTop: 8, marginBottom: 0 }}>Privacy concerns, data requests, or legal matters.</p>
        </div>
        <div style={card}>
          <div style={label}>Bakery Owners</div>
          <div style={val}><a href="mailto:owners@50bestbakeries.com" style={{ color: '#d4944c', textDecoration: 'none' }}>owners@50bestbakeries.com</a></div>
          <p style={{ ...ps, marginTop: 8, marginBottom: 0 }}>Own a bakery? Claim or update your listing, report inaccuracies, or request removal.</p>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500, color: '#f5f0e8', marginBottom: 12, marginTop: 0 }}>Frequently Asked Questions</h2>
        <details style={detailBox}>
          <summary style={sumStyle}>How do you get bakery data and ratings?</summary>
          <p style={ansStyle}>Our bakery data, including ratings, review counts, and photos, is sourced from Google Places. This ensures the information reflects real guest reviews rather than paid placements or self-reported figures.</p>
        </details>
        <details style={detailBox}>
          <summary style={sumStyle}>How is the Global Top 50 selected?</summary>
          <p style={ansStyle}>{"The Global Top 50 is curated annually by our editorial team, drawing on critical acclaim from the World\u2019s 50 Best Bakeries awards, leading drinks publications, guest satisfaction data, and our own quality assessments covering cocktail craft, service, atmosphere, and innovation."}</p>
        </details>
        <details style={detailBox}>
          <summary style={sumStyle}>Can I get my bakery listed or removed?</summary>
          <p style={ansStyle}>{"Yes. Email owners@50bestbakeries.com to update your listing or request removal. We\u2019ll process removal requests within 48 hours."}</p>
        </details>
        <details style={detailBox}>
          <summary style={sumStyle}>Do you accept paid listings or sponsored rankings?</summary>
          <p style={ansStyle}>No. Our rankings and ratings are editorially independent and never influenced by paid placements or advertising relationships.</p>
        </details>
        <details style={detailBox}>
          <summary style={sumStyle}>How often is the bakery data updated?</summary>
          <p style={ansStyle}>We refresh bakery data regularly, pulling updated ratings and review counts from Google Places. The Global Top 50 list is reviewed and updated annually to reflect the latest developments in the global bakery scene.</p>
        </details>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500, color: '#f5f0e8', marginBottom: 12, marginTop: 0 }}>Response Time</h2>
        <p style={ps}>We aim to respond to all inquiries within 48 hours. For urgent matters, please include URGENT in your subject line.</p>
      </div>

      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginTop: 40 }}>
        50 Best Bakeries is operated by 50 Best Limited, Hong Kong.
      </p>
      <nav style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href="/privacy-policy" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/about" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>About Us</a>
        </div>
      </nav>
    </article>
  );
}
