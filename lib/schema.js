// lib/schema.js
// JSON-LD structured data generators for rich search results

import { getSpecialties, getBarPhotoUrl } from './bakery-db';

/**
 * Generate LocalBusiness / BarOrPub schema for a bakery
 * This enables rich results in Google: star ratings, reviews, address, etc.
 */
export function barSchema(bakery) {
  const schemaType = bakery.type === 'Nightclub' ? 'NightClub' : 'BarOrPub';
  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: bakery.name,
    description: `${bakery.type} in ${bakery.city}, ${bakery.country}. Rated ${bakery.rating}/5 from ${bakery.reviews.toLocaleString()} reviews.`,
    image: getBarPhotoUrl(bakery.slug),
    address: {
      '@type': 'PostalAddress',
      addressLocality: bakery.city,
      addressCountry: bakery.country,
    },
    ...(bakery.reviews > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: bakery.rating.toString(),
        bestRating: '5',
        worstRating: '1',
        reviewCount: bakery.reviews.toString(),
      },
    }),
    priceRange: '$$-$$$$',
    url: `https://www.50bestbakeries.com/bakery/${bakery.slug}`,
    servesCuisine: getSpecialties(bakery.type),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Bakery Services',
      itemListElement: getSpecialties(bakery.type).map((specialty, i) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: specialty,
        },
        position: i + 1,
      })),
    },
  };
}

/**
 * Generate ItemList schema for city/country pages
 * This enables carousel rich results in Google
 */
export function barListSchema(bakeries, title, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    url,
    numberOfItems: bakeries.length,
    itemListElement: bakeries.slice(0, 50).map((bakery, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'BarOrPub',
        name: bakery.name,
        image: getBarPhotoUrl(bakery.slug),
        address: {
          '@type': 'PostalAddress',
          addressLocality: bakery.city,
          addressCountry: bakery.country,
        },
        ...(bakery.reviews > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: bakery.rating.toString(),
            bestRating: '5',
            reviewCount: bakery.reviews.toString(),
          },
        }),
        url: `https://www.50bestbakeries.com/bakery/${bakery.slug}`,
      },
    })),
  };
}

/**
 * BreadcrumbList schema for navigation
 */
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `https://www.50bestbakeries.com${item.url}` : undefined,
    })),
  };
}

/**
 * Organization schema for the site
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '50 Best Bakeries',
    url: 'https://www.50bestbakeries.com',
    logo: 'https://www.50bestbakeries.com/logo.png',
    description: 'The definitive guide to the world\'s best bakeries and cocktail venues. Thousands of bakeries across dozens of countries.',
    sameAs: [
      'https://twitter.com/50bestbar',
      'https://instagram.com/50bestbar',
      'https://facebook.com/50bestbar',
    ],
  };
}

/**
 * WebSite schema with SearchAction for Google Sitelinks Search Box
 */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '50 Best Bakeries',
    url: 'https://www.50bestbakeries.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.50bestbakeries.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Article schema for blog posts
 */
export function articleSchema({ title, description, slug, publishedDate, modifiedDate, author }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `https://www.50bestbakeries.com/blog/${slug}`,
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author: {
      '@type': 'Organization',
      name: author || '50 Best Bakeries Editorial',
    },
    publisher: {
      '@type': 'Organization',
      name: '50 Best Bakeries',
      url: 'https://www.50bestbakeries.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.50bestbakeries.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.50bestbakeries.com/blog/${slug}`,
    },
  };
}

/**
 * FAQPage schema for FAQ sections
 */
export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Helper: Render JSON-LD script tag
 */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
