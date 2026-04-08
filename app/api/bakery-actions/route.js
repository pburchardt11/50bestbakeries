import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

let kv = null;
async function getKV() {
  if (kv !== null) return kv;
  try {
    const mod = require('@vercel/kv');
    kv = mod.kv;
    return kv;
  } catch (e) {
    kv = false;
    return false;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const slug = searchParams.get('slug');

  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  const store = await getKV();
  if (!store) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  if (action === 'reviews') {
    const reviewIds = await store.lrange(`reviews:bakery:${slug}`, 0, 50) || [];
    const reviews = [];
    for (const rid of reviewIds) {
      const raw = await store.get(`review:${rid}`);
      if (raw) reviews.push(typeof raw === 'string' ? JSON.parse(raw) : raw);
    }
    return NextResponse.json({ reviews });
  }

  if (action === 'status') {
    const session = await getServerSession(authOptions);
    const wantgoCount = await store.scard(`wantgo:bakery:${slug}`) || 0;
    const coeurCount = await store.scard(`coeur:bakery:${slug}`) || 0;

    // Aggregate rating
    const raterIds = await store.smembers(`ratings:bakery:${slug}`) || [];
    let totalRating = 0;
    for (const uid of raterIds) {
      const raw = await store.get(`rating:${slug}:${uid}`);
      if (raw) {
        const r = typeof raw === 'string' ? JSON.parse(raw) : raw;
        totalRating += r.rating;
      }
    }
    const avgRating = raterIds.length > 0 ? totalRating / raterIds.length : 0;

    const result = {
      wantgoCount,
      coeurCount,
      ratingCount: raterIds.length,
      avgRating: Math.round(avgRating * 10) / 10,
      userRating: 0,
      userWantgo: false,
      userCoeur: false,
      userReview: null,
    };

    if (session?.user?.id) {
      const uid = session.user.id;
      const ratingRaw = await store.get(`rating:${slug}:${uid}`);
      if (ratingRaw) {
        const r = typeof ratingRaw === 'string' ? JSON.parse(ratingRaw) : ratingRaw;
        result.userRating = r.rating;
      }
      result.userWantgo = await store.sismember(`wantgo:bakery:${slug}`, uid) || false;
      result.userCoeur = await store.sismember(`coeur:bakery:${slug}`, uid) || false;
    }

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const store = await getKV();
  if (!store) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const body = await request.json();
  const { action, slug } = body;
  const uid = session.user.id;

  if (!slug || !action) {
    return NextResponse.json({ error: 'Missing slug or action' }, { status: 400 });
  }

  if (action === 'rate') {
    const rating = Math.min(5, Math.max(1, Math.round(body.rating)));
    await store.set(`rating:${slug}:${uid}`, JSON.stringify({ rating, createdAt: new Date().toISOString() }));
    await store.sadd(`ratings:bakery:${slug}`, uid);
    return NextResponse.json({ success: true, rating });
  }

  if (action === 'review') {
    const text = (body.text || '').trim().substring(0, 2000);
    if (!text) return NextResponse.json({ error: 'Review text is required' }, { status: 400 });

    const rating = body.rating ? Math.min(5, Math.max(1, Math.round(body.rating))) : null;
    const reviewId = `${slug}:${uid}:${Date.now()}`;

    const review = {
      id: reviewId,
      userId: uid,
      userName: session.user.name || 'Anonymous',
      barSlug: slug,
      text,
      rating,
      createdAt: new Date().toISOString(),
    };

    await store.set(`review:${reviewId}`, JSON.stringify(review));
    await store.lpush(`reviews:bakery:${slug}`, reviewId);
    await store.sadd(`reviews:user:${uid}`, slug);

    // Also save the rating if provided
    if (rating) {
      await store.set(`rating:${slug}:${uid}`, JSON.stringify({ rating, createdAt: review.createdAt }));
      await store.sadd(`ratings:bakery:${slug}`, uid);
    }

    return NextResponse.json({ success: true, review });
  }

  if (action === 'wantgo') {
    const isMember = await store.sismember(`wantgo:bakery:${slug}`, uid);
    if (isMember) {
      await store.srem(`wantgo:bakery:${slug}`, uid);
      await store.srem(`wantgo:user:${uid}`, slug);
      return NextResponse.json({ success: true, active: false });
    } else {
      await store.sadd(`wantgo:bakery:${slug}`, uid);
      await store.sadd(`wantgo:user:${uid}`, slug);
      return NextResponse.json({ success: true, active: true });
    }
  }

  if (action === 'coeur') {
    const isMember = await store.sismember(`coeur:bakery:${slug}`, uid);
    if (isMember) {
      await store.srem(`coeur:bakery:${slug}`, uid);
      await store.srem(`coeur:user:${uid}`, slug);
      return NextResponse.json({ success: true, active: false });
    } else {
      await store.sadd(`coeur:bakery:${slug}`, uid);
      await store.sadd(`coeur:user:${uid}`, slug);
      return NextResponse.json({ success: true, active: true });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
