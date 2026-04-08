// app/api/blob-photo/route.js
// Proxy for private Vercel Blob photos.
// Usage: /api/blob-photo?path=bakery-photos/{slug}/{idx}.jpg
//
// The bakery-photos store is private, so direct URLs return 403.
// This route fetches the blob server-side using the read-write token
// and streams it back with long cache headers.

import { get } from '@vercel/blob';

const BLOB_TOKEN = process.env.Bakeries_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  if (!path || path.includes('..')) {
    return new Response('Bad path', { status: 400 });
  }
  if (!BLOB_TOKEN) {
    return new Response('Blob not configured', { status: 503 });
  }

  try {
    // Read the private blob directly via the server-side SDK
    const blob = await get(path, { token: BLOB_TOKEN, access: 'private' });
    if (!blob || blob.statusCode >= 400) {
      return new Response('Photo not found', { status: 404 });
    }
    return new Response(blob.stream, {
      headers: {
        'Content-Type': blob.headers?.['content-type'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      },
    });
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 });
  }
}
