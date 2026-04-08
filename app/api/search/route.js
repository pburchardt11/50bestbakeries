import { searchBars, searchCountriesAndCities } from '../../../lib/bakery-db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (q.length < 2) {
    return Response.json({ countries: [], cities: [], bakeries: [] });
  }

  const { countries, cities } = searchCountriesAndCities(q);
  const bakeries = searchBars(q, 8);

  return Response.json({
    countries,
    cities,
    bakeries: bakeries.map(b => ({
      name: b.name,
      slug: b.slug,
      city: b.city,
      country: b.country,
      type: b.type,
      rating: b.rating,
    })),
  });
}
