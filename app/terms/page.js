// app/terms/page.js
// Terms of Service

export const metadata = {
  title: 'Terms of Service - 50 Best Bakeries',
  description: 'Terms of Service for 50bestbakeries.com. Please read these terms carefully before using our website.',
  alternates: { canonical: 'https://www.50bestbakeries.com/terms' },
};

export default function TermsPage() {
  const sn = { marginBottom: 32 };
  const h2s = { fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500, color: '#f5f0e8', marginBottom: 12, marginTop: 0 };
  const ps = { fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#8a8278', lineHeight: 1.8, marginBottom: 12 };
  return (
    <article style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
      <nav aria-label="Breadcrumb" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginBottom: 24 }}>
        <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>Terms of Service</span>
      </nav>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 300, color: '#f5f0e8', lineHeight: 1.1, margin: 0 }}>
          Terms of <span style={{ color: '#d4944c', fontWeight: 600, fontStyle: 'italic' }}>Service</span>
        </h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginTop: 12 }}>Last updated: March 2026</p>
      </header>
      <div style={sn}>
        <p style={ps}>Welcome to 50 Best Bakeries. By accessing or using our website at 50bestbakeries.com, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Use of Our Website</h2>
        <p style={ps}>50 Best Bakeries provides bakery reviews, ratings, and directory information for informational purposes only. You may use our website for your personal, non-commercial reference. You agree not to use the site for any unlawful purpose, not to attempt to gain unauthorized access to our systems, not to scrape or harvest data in an automated manner without our written consent, and not to reproduce or create derivative works from our content without permission.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Content and Accuracy</h2>
        <p style={ps}>We strive to keep information on 50 Best Bakeries accurate and up to date. Bakery ratings, review counts, and business details are sourced from Google Places and other third-party providers. We do not guarantee the accuracy, completeness, or timeliness of any information on our site.</p>
        <p style={ps}>Our editorial content, including the Global Top 50 rankings, represents the opinions of the 50 Best Bakeries editorial team and should not be taken as a guarantee of quality or suitability for any individual.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Third-Party Links and Services</h2>
        <p style={ps}>Our website may contain links to third-party websites, including bakery reservation platforms, Google Maps, and other external resources. We are not responsible for the content, privacy practices, or availability of these third-party sites. Visiting linked sites is at your own risk.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Intellectual Property</h2>
        <p style={ps}>All content on 50 Best Bakeries, including text, graphics, logos, page layout, and design, is owned by 50 Best Bakeries or its content suppliers and protected by copyright and intellectual property laws. Bakery photos displayed on our site are sourced from Google Places and remain the property of their respective owners. The 50 Best Bakeries name, logo, and branding are our trademarks.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Advertising</h2>
        <p style={ps}>50 Best Bakeries displays advertisements provided by third-party advertising networks, including Google AdSense. The presence of advertisements does not constitute an endorsement of the advertised products or services.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Disclaimer of Warranties</h2>
        <p style={ps}>50 Best Bakeries is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express or implied. We do not warrant that the site will be uninterrupted, error-free, or free of harmful components.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Limitation of Liability</h2>
        <p style={ps}>To the fullest extent permitted by law, 50 Best Bakeries and its affiliates, officers, directors, employees, and agents (collectively, the &quot;50 Best Bakeries Parties&quot;) shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the website, reliance on information provided, any errors or omissions in the content, or any interaction with a bakery or merchant listed on the site. If the foregoing disclaimer of direct damages is not enforceable at law, you agree that the total liability of the 50 Best Bakeries Parties to you for any and all claims arising from or related to the use of the Services shall not exceed fifty US dollars (US $50).</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Indemnification</h2>
        <p style={ps}>You agree to indemnify, hold harmless, and, at 50 Best Bakeries{"'"}s request, defend the 50 Best Bakeries Parties from and against all claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising from (1) your use of the Services, (2) your violation of these Terms, or (3) your violation of any rights of a third party.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Release</h2>
        <p style={ps}>Bakeries and other businesses listed on 50 Best Bakeries are solely responsible for their services, products, and interactions with you. You acknowledge that 50 Best Bakeries is a directory and informational service only, and you hereby release the 50 Best Bakeries Parties from any and all claims, injuries, damages, liabilities, and costs arising from your interaction with or visit to any listed business.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Arbitration Agreement and Class Action Waiver</h2>
        <p style={ps}>You agree that any and all disputes, claims, or causes of action arising out of or relating to these Terms or your use of the Services shall be resolved exclusively through final and binding arbitration, rather than in court, except that you may assert claims in small claims court if your claims qualify. Arbitration shall be administered by the Hong Kong International Arbitration Centre (HKIAC) in accordance with its applicable rules. The arbitration shall be conducted before one arbitrator, in Hong Kong, and in the English language.</p>
        <p style={ps}>You and 50 Best Bakeries agree that any arbitration shall be conducted in your individual capacity only and not as a class action or other representative proceeding. You expressly waive your right to file a class action or seek relief on a class basis. The arbitrator may not consolidate more than one person{"'"}s claims and may not preside over any form of class or representative proceeding.</p>
        <p style={ps}>By agreeing to arbitration, you understand that you are waiving your right to a trial by jury or to participate in a class action. This arbitration provision shall survive termination of these Terms and your use of the Services.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Governing Law</h2>
        <p style={ps}>These Terms shall be governed by and construed in accordance with the laws of the Hong Kong Special Administrative Region, without regard to its conflict of law provisions. To the extent that any lawsuit or court proceeding is permitted hereunder, you agree to submit to the exclusive personal jurisdiction of the courts of Hong Kong.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Severability</h2>
        <p style={ps}>If any provision of these Terms is found to be invalid or unenforceable under applicable law, the invalid or unenforceable provision shall be deemed modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions of these Terms shall continue in full force and effect.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Changes to These Terms</h2>
        <p style={ps}>We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated revision date. Your continued use of the site constitutes acceptance of the new terms.</p>
      </div>
      <div style={sn}>
        <h2 style={h2s}>Contact Us</h2>
        <p style={ps}>If you have questions about these Terms of Service, please contact us at legal@50bestbakeries.com or visit our <a href="/contact" style={{ color: '#d4944c', textDecoration: 'none' }}>Contact page</a>.</p>
      </div>
      <nav style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href="/privacy-policy" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/about" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>About Us</a>
          <a href="/contact" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none' }}>Contact</a>
        </div>
      </nav>
    </article>
  );
}
