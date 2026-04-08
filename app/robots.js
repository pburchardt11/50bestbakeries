// app/robots.js
// robots.txt generation

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      // Allow AI search crawlers — they drive citation traffic from
      // ChatGPT, Bing AI, Perplexity, etc.
    ],
    sitemap: 'https://www.50bestbakeries.com/sitemap-index.xml',
    host: 'https://www.50bestbakeries.com',
  };
}
