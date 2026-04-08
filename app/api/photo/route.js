// app/api/photo/route.js
// Photo proxy — fetches Google Places photos once, then Vercel CDN caches them.
// This prevents every browser <img> load from billing Google ($0.007 each).
// With CDN caching, Google is billed once per photo per 365 days.
//
// Supports Places API (New) format:
//   /api/photo?name=places/{id}/photos/{ref}&w=800
//
// Cache headers:
//   CDN (s-maxage): 365 days — Vercel edge serves cached image globally
//   Browser (max-age): 30 days — repeat visitors skip network entirely
// See CACHING.md for full architecture overview.

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const maxwidth = searchParams.get('w') || '800';

  if (!name) {
    return new Response('Missing name', { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return new Response('API key not configured', { status: 500 });
  }

  // Places API (New) media endpoint
  const googleUrl = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxwidth}&key=${apiKey}`;

  const res = await fetch(googleUrl, { redirect: 'follow' });

  if (!res.ok) {
    return new Response('Photo not found', { status: 404 });
  }

  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const body = await res.arrayBuffer();

  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      // Cache at Vercel CDN for 365 days, browser for 30 days
      'Cache-Control': 'public, max-age=2592000, s-maxage=31536000',
      'CDN-Cache-Control': 'public, max-age=31536000',
    },
  });
}
