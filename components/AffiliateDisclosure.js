// components/AffiliateDisclosure.js
// Legally required affiliate disclosure, shown on pages with affiliate links.

export default function AffiliateDisclosure() {
  return (
    <p style={{
      fontSize: 11,
      fontFamily: "'Outfit', sans-serif",
      color: '#4a4540',
      marginTop: 12,
      lineHeight: 1.5,
    }}>
      Some links may earn us a commission at no extra cost to you.{' '}
      <a href="/terms#affiliate-disclosure" style={{ color: '#6a6258', textDecoration: 'underline' }}>
        Learn more
      </a>
    </p>
  );
}
