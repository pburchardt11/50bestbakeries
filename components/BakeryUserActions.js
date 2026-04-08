'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

function Star({ filled, hovered, onClick, onHover, onLeave, size = 20 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <path
        d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z"
        fill={filled || hovered ? '#FBBC04' : '#3a3530'}
      />
    </svg>
  );
}

export default function BakeryUserActions({ slug, barName }) {
  const { data: session, status } = useSession();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [wantgo, setWantgo] = useState(false);
  const [coeur, setCoeur] = useState(false);
  const [wantgoCount, setWantgoCount] = useState(0);
  const [coeurCount, setCoeurCount] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/bakery-actions?action=status&slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        setUserRating(data.userRating || 0);
        setWantgo(data.userWantgo || false);
        setCoeur(data.userCoeur || false);
        setWantgoCount(data.wantgoCount || 0);
        setCoeurCount(data.coeurCount || 0);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));

    fetch(`/api/bakery-actions?action=reviews&slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => setReviews(data.reviews || []))
      .catch(() => {});
  }, [slug]);

  function requireAuth() {
    if (!session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(`/bakery/${slug}`)}`;
      return false;
    }
    return true;
  }

  async function handleRate(rating) {
    if (!requireAuth()) return;
    setUserRating(rating);
    await fetch('/api/bakery-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rate', slug, rating }),
    });
  }

  async function handleToggle(type) {
    if (!requireAuth()) return;
    const res = await fetch('/api/bakery-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: type, slug }),
    });
    const data = await res.json();
    if (type === 'wantgo') {
      setWantgo(data.active);
      setWantgoCount(c => c + (data.active ? 1 : -1));
    } else {
      setCoeur(data.active);
      setCoeurCount(c => c + (data.active ? 1 : -1));
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/bakery-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'review', slug, text: reviewText, rating: userRating || null }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSubmitted(true);
        setShowReview(false);
        setReviewText('');
        setReviews(prev => [data.review, ...prev]);
      }
    } catch {}
    setSubmitting(false);
  }

  const cardStyle = {
    marginTop: 32, padding: 24, borderRadius: 12,
    background: 'rgba(212,148,76,0.04)',
    border: '1px solid rgba(212,148,76,0.08)',
  };

  const labelStyle = {
    fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
    letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c',
    marginBottom: 12, marginTop: 0,
  };

  const btnBase = {
    flex: 1, minWidth: 140, display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, padding: '12px 16px',
    borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
    fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s',
  };

  return (
    <>
      <div style={cardStyle}>
        <h3 style={labelStyle}>Your Rating</h3>
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              size={28}
              filled={i <= userRating}
              hovered={i <= hoverRating}
              onClick={() => handleRate(i)}
              onHover={() => setHoverRating(i)}
              onLeave={() => setHoverRating(0)}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (!requireAuth()) return;
              setShowReview(!showReview);
            }}
            style={{
              ...btnBase,
              background: showReview ? 'rgba(212,148,76,0.12)' : 'rgba(255,255,255,0.03)',
              color: '#e8e4de',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Write a Review
          </button>

          <button
            onClick={() => handleToggle('wantgo')}
            style={{
              ...btnBase,
              background: wantgo ? 'rgba(212,148,76,0.15)' : 'rgba(255,255,255,0.03)',
              color: wantgo ? '#d4944c' : '#e8e4de',
              borderColor: wantgo ? 'rgba(212,148,76,0.3)' : 'rgba(255,255,255,0.08)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={wantgo ? '#d4944c' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Want to Visit{wantgoCount > 0 ? ` (${wantgoCount})` : ''}
          </button>

          <button
            onClick={() => handleToggle('coeur')}
            style={{
              ...btnBase,
              background: coeur ? 'rgba(220,50,80,0.12)' : 'rgba(255,255,255,0.03)',
              color: coeur ? '#e06080' : '#e8e4de',
              borderColor: coeur ? 'rgba(220,50,80,0.25)' : 'rgba(255,255,255,0.08)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={coeur ? '#e06080' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Favorite{coeurCount > 0 ? ` (${coeurCount})` : ''}
          </button>
        </div>

        {reviewSubmitted && !showReview && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(80,180,80,0.1)', border: '1px solid rgba(80,180,80,0.2)',
            fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#80c080',
          }}>
            Thank you for your review!
          </div>
        )}

        {showReview && (
          <form onSubmit={handleReviewSubmit} style={{ marginTop: 16 }}>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder={`Share your experience at ${barName}...`}
              maxLength={2000}
              rows={4}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8,
                border: '1px solid rgba(212,148,76,0.2)',
                background: 'rgba(255,255,255,0.03)', color: '#e8e4de',
                fontFamily: "'Outfit', sans-serif", fontSize: 14,
                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowReview(false)}
                style={{
                  padding: '8px 18px', borderRadius: 6,
                  background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#8a8278', fontFamily: "'Outfit', sans-serif", fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !reviewText.trim()}
                style={{
                  padding: '8px 18px', borderRadius: 6,
                  background: '#d4944c', border: 'none', color: '#080808',
                  fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: !reviewText.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* User Reviews */}
      {reviews.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={labelStyle}>Community Reviews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((review, i) => (
              <div key={review.id || i} style={{
                padding: 16, borderRadius: 10,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(212,148,76,0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#d4944c',
                  }}>
                    {(review.userName || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500, color: '#e8e4de' }}>
                      {review.userName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {review.rating && (
                        <div style={{ display: 'flex', gap: 1 }}>
                          {[1, 2, 3, 4, 5].map(x => (
                            <svg key={x} width="10" height="10" viewBox="0 0 24 24">
                              <path
                                d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z"
                                fill={x <= review.rating ? '#FBBC04' : '#3a3530'}
                              />
                            </svg>
                          ))}
                        </div>
                      )}
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: '#6a6560' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#8a8278',
                  lineHeight: 1.6, margin: 0,
                }}>
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
