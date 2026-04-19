// lib/editorial-sources.js
// Tiered editorial source registry — mirrors spa-review.com's approach.
// Each source has a tier (1–3) with a weight that influences the editorial
// score. Higher-tier sources produce a larger ranking boost.

export const SOURCES = {
  // ─── Tier 1 — Highest authority (weight 1.0) ───
  'michelin-guide':          { id: 'michelin-guide',          name: 'Michelin Guide',           tier: 1, weight: 1.0, color: '#dc2626', bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.25)' },
  'james-beard':             { id: 'james-beard',             name: 'James Beard Awards',       tier: 1, weight: 1.0, color: '#b45309', bg: 'rgba(180,83,9,0.12)',  border: 'rgba(180,83,9,0.25)' },
  'meilleur-baguette':       { id: 'meilleur-baguette',       name: 'Grand Prix Baguette',      tier: 1, weight: 1.0, color: '#d4af37', bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.3)' },
  'meilleur-croissant':      { id: 'meilleur-croissant',      name: 'Meilleur Croissant',       tier: 1, weight: 1.0, color: '#d4af37', bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.3)' },
  'worlds-best-pastry':      { id: 'worlds-best-pastry',      name: "World's Best Pastry Chef", tier: 1, weight: 1.0, color: '#d4af37', bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.3)' },
  'gault-millau':            { id: 'gault-millau',            name: 'Gault & Millau',           tier: 1, weight: 1.0, color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.25)' },

  // ─── Tier 2 — Strong authority (weight 0.7) ───
  'eater':                   { id: 'eater',                   name: 'Eater',                    tier: 2, weight: 0.7, color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.20)' },
  'time-out':                { id: 'time-out',                name: 'Time Out',                 tier: 2, weight: 0.7, color: '#f97316', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.20)' },
  'conde-nast':              { id: 'conde-nast',              name: 'Condé Nast Traveler',      tier: 2, weight: 0.7, color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.20)' },
  'food-and-wine':           { id: 'food-and-wine',           name: 'Food & Wine',              tier: 2, weight: 0.7, color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.20)' },
  'bon-appetit':             { id: 'bon-appetit',             name: 'Bon Appétit',              tier: 2, weight: 0.7, color: '#fb923c', bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.20)' },
  'guardian-observer':       { id: 'guardian-observer',        name: 'The Guardian',             tier: 2, weight: 0.7, color: '#1d4ed8', bg: 'rgba(29,78,216,0.10)', border: 'rgba(29,78,216,0.20)' },
  'nyt':                     { id: 'nyt',                     name: 'New York Times',           tier: 2, weight: 0.7, color: '#111827', bg: 'rgba(17,24,39,0.15)', border: 'rgba(17,24,39,0.25)' },
  'tripadvisor':             { id: 'tripadvisor',             name: 'TripAdvisor',              tier: 2, weight: 0.7, color: '#059669', bg: 'rgba(5,150,105,0.10)', border: 'rgba(5,150,105,0.20)' },
  'google-top-rated':        { id: 'google-top-rated',        name: 'Google Top Rated',         tier: 2, weight: 0.7, color: '#4285f4', bg: 'rgba(66,133,244,0.10)', border: 'rgba(66,133,244,0.20)' },

  // ─── Tier 3 — Supporting authority (weight 0.4) ───
  'lonely-planet':           { id: 'lonely-planet',           name: 'Lonely Planet',            tier: 3, weight: 0.4, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.15)' },
  'culture-trip':            { id: 'culture-trip',            name: 'Culture Trip',             tier: 3, weight: 0.4, color: '#14b8a6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.15)' },
  'atlas-obscura':           { id: 'atlas-obscura',           name: 'Atlas Obscura',            tier: 3, weight: 0.4, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.15)' },
  'wikidata':                { id: 'wikidata',                name: 'Wikidata',                 tier: 3, weight: 0.4, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.15)' },
  'wikipedia':               { id: 'wikipedia',               name: 'Wikipedia',                tier: 3, weight: 0.4, color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.15)' },
  'curated':                 { id: 'curated',                 name: '50 Best Bakeries Pick',    tier: 2, weight: 0.7, color: '#d4944c', bg: 'rgba(212,148,76,0.12)', border: 'rgba(212,148,76,0.25)' },
  'local-press':             { id: 'local-press',             name: 'Local Food Press',         tier: 3, weight: 0.4, color: '#78716c', bg: 'rgba(120,113,108,0.08)', border: 'rgba(120,113,108,0.15)' },
};

// ─── Mention type weights (same as spa-review) ───
export const MENTION_TYPE_WEIGHT = {
  AWARD_WINNER: 1.0,     // Won a competition (Meilleur Baguette, James Beard Outstanding Bakery)
  STAR_RATING: 0.9,      // Starred/rated by a guide (Michelin, Gault Millau)
  RANKED_LIST: 0.8,      // Appears in a numbered ranking (#1 Best Bakery in Paris)
  UNRANKED_LIST: 0.5,    // Appears in an unranked "best of" list
};

// ─── Scope multipliers ───
export const SCOPE_MULTIPLIER = {
  global: 1.2,
  country: 1.0,
  city: 0.8,
};

// ─── Recency multipliers ───
export function getRecencyMultiplier(year) {
  const age = new Date().getFullYear() - (year || 2024);
  if (age <= 0) return 1.1;
  if (age === 1) return 1.0;
  if (age === 2) return 0.9;
  if (age === 3) return 0.85;
  return Math.max(0.7, 1.0 - age * 0.05);
}
