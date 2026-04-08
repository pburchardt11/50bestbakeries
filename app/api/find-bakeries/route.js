import { DB } from '../../../lib/bakery-data';
import cityCoords from '../../../lib/city-coords.json';
import barCoords from '../../../lib/bakery-coords.json';

const TYPE_MAP = {
  C: 'Cocktail Bakery', S: 'Speakeasy', W: 'Wine Bakery', D: 'Dive Bakery',
  R: 'Rooftop Bakery', T: 'Tiki Bakery', P: 'Pub', B: 'Beer Garden',
  L: 'Lounge', N: 'Nightclub', H: 'Hotel Bakery', G: 'Gastropub', J: 'Jazz Bakery',
};

function toSlug(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function barSlug(name, city) {
  const n = toSlug(name);
  const c = toSlug(city);
  return n.endsWith(c) ? n : n + '-' + c;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));
  const radius = parseInt(searchParams.get('radius') || '50', 10);
  const type = searchParams.get('type') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '60', 10), 100);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (isNaN(lat) || isNaN(lng)) {
    return Response.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  // Find cities within radius
  const nearbyCities = [];
  for (const [key, coords] of Object.entries(cityCoords)) {
    if (!coords) continue;
    const dist = haversine(lat, lng, coords[0], coords[1]);
    if (dist <= radius) {
      const [city, country] = key.split('|');
      nearbyCities.push({ city, country, coords, distance: dist });
    }
  }

  nearbyCities.sort((a, b) => a.distance - b.distance);

  // Collect bakeries from matching cities
  const allBars = [];
  for (const { city, country, coords } of nearbyCities) {
    const bakeries = DB[country]?.[city];
    if (!bakeries) continue;

    for (const b of bakeries) {
      const barType = TYPE_MAP[b[3]] || b[3];
      if (type && barType !== type) continue;

      const slug = barSlug(b[0], city);
      // Use exact bakery coordinates if available, otherwise city center
      const bc = barCoords[slug];
      const barLat = bc ? bc[0] : coords[0];
      const barLng = bc ? bc[1] : coords[1];

      allBars.push({
        name: b[0],
        slug,
        rating: b[1] / 10,
        reviews: b[2] * 10,
        type: barType,
        city,
        country,
        lat: barLat,
        lng: barLng,
        exact: !!bc,
        distance: Math.round(haversine(lat, lng, barLat, barLng) * 10) / 10,
      });
    }
  }

  // Sort by rating descending, then reviews
  allBars.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

  const total = allBars.length;
  const results = allBars.slice(offset, offset + limit).map((b, i) => ({ ...b, rank: offset + i + 1 }));

  return Response.json({
    results,
    total,
    radius,
    center: { lat, lng },
    cities: nearbyCities.length,
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
