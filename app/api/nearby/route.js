// app/api/nearby/route.js
// Returns top bakeries for a given country (used by NearbyBakeries client component)

import { NextResponse } from 'next/server';
import { getBarsForCountry, getAllCountries } from '../../../lib/bakery-db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!country) {
    return NextResponse.json({ error: 'Missing country param' }, { status: 400 });
  }

  // Verify country exists in our database
  const countries = getAllCountries();
  if (!countries.includes(country)) {
    return NextResponse.json({ bakeries: [], country: null });
  }

  const bakeries = getBarsForCountry(country, 6);
  return NextResponse.json({ bakeries, country }, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, max-age=604800',
    },
  });
}
