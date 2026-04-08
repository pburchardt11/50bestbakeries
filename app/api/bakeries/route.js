import {
  getBarsForCountry, getBarsForCity, getGlobalBars, getAllCountries,
  getCitiesForCountry, getTotalBarsInCountry, getTotalBarsInCity, getTotalGlobalBars,
  getBarsOfType, getBarsOfTypeInCountry, getTotalBarsOfTypeInCountry, getTypeStats,
  toSlug, getBarPhotoUrl,
} from '../../../lib/bakery-db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const countrySlug = searchParams.get('country') || '';
  const citySlug = searchParams.get('city') || '';
  const typeSlug = searchParams.get('type') || '';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  let bakeries, total;

  // Type-based queries
  if (typeSlug) {
    const allTypes = getTypeStats();
    const typeInfo = allTypes.find(t => t.slug === typeSlug);
    if (!typeInfo) {
      return Response.json({ bakeries: [], total: 0 }, { status: 404 });
    }
    if (countrySlug) {
      const countries = getAllCountries();
      const country = countries.find(c => toSlug(c) === countrySlug);
      if (!country) return Response.json({ bakeries: [], total: 0 }, { status: 404 });
      bakeries = getBarsOfTypeInCountry(typeInfo.type, country, limit, offset);
      total = getTotalBarsOfTypeInCountry(typeInfo.type, country);
    } else {
      bakeries = getBarsOfType(typeInfo.type, limit, offset);
      total = typeInfo.count;
    }
  } else if (!countrySlug) {
    // Global query — all bakeries worldwide
    bakeries = getGlobalBars(limit, offset);
    total = getTotalGlobalBars();
  } else {
    // Resolve country name from slug
    const countries = getAllCountries();
    const country = countries.find(c => toSlug(c) === countrySlug);
    if (!country) {
      return Response.json({ bakeries: [], total: 0 }, { status: 404 });
    }

    if (citySlug) {
      const cities = getCitiesForCountry(country);
      const city = cities.find(c => toSlug(c) === citySlug);
      if (!city) {
        return Response.json({ bakeries: [], total: 0 }, { status: 404 });
      }
      bakeries = getBarsForCity(country, city, limit, offset);
      total = getTotalBarsInCity(country, city);
    } else {
      bakeries = getBarsForCountry(country, limit, offset);
      total = getTotalBarsInCountry(country);
    }
  }

  return Response.json({
    bakeries: bakeries.map(b => ({
      name: b.name,
      slug: b.slug,
      city: b.city,
      country: b.country,
      type: b.type,
      typeColor: b.typeColor,
      rating: b.rating,
      reviews: b.reviews,
      rank: b.rank,
      photo: b.photo || getBarPhotoUrl(b.name, b.city),
      isEditorial: b.isEditorial || false,
      sourceRank: b.sourceRank || null,
      badges: b.badges || null,
      sources: b.sources || null,
      wikipediaUrl: b.wikipediaUrl || null,
    })),
    total,
  });
}
