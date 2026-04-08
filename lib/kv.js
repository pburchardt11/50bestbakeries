// lib/kv.js
// Shared Redis client using @upstash/redis (replaces sunset @vercel/kv).
//
// Returns null when no credentials are configured so callers can
// gracefully degrade. Vercel's Upstash Marketplace integration provisions
// both UPSTASH_REDIS_REST_URL/TOKEN and KV_REST_API_URL/TOKEN; we accept
// either set.

let _client = null;
let _tried = false;

async function getKV() {
  if (_tried) return _client;
  _tried = true;

  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    null;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    null;

  if (!url || !token) {
    console.warn('[kv] No Upstash Redis credentials (UPSTASH_REDIS_REST_URL / _TOKEN). Running without persistence.');
    _client = null;
    return null;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    _client = new Redis({ url, token });
    return _client;
  } catch (e) {
    console.warn('[kv] Failed to load @upstash/redis:', e.message);
    _client = null;
    return null;
  }
}

module.exports = { getKV };
