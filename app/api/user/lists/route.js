import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getKV } from '../../../../lib/kv';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const store = await getKV();
  if (!store) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const uid = session.user.id;

  // Fetch all three lists in parallel
  const [wantgoSlugs, coeurSlugs, reviewSlugs] = await Promise.all([
    store.smembers(`wantgo:user:${uid}`).then(r => r || []),
    store.smembers(`coeur:user:${uid}`).then(r => r || []),
    store.smembers(`reviews:user:${uid}`).then(r => r || []),
  ]);

  // Fetch ratings for reviewed bakeries
  const reviewedBars = [];
  for (const slug of reviewSlugs) {
    const ratingRaw = await store.get(`rating:${slug}:${uid}`);
    let rating = null;
    if (ratingRaw) {
      const r = typeof ratingRaw === 'string' ? JSON.parse(ratingRaw) : ratingRaw;
      rating = r.rating;
    }
    reviewedBars.push({ slug, rating });
  }

  return NextResponse.json({
    wantgo: wantgoSlugs,
    favorites: coeurSlugs,
    reviewed: reviewedBars,
  });
}
