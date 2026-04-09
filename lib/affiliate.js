// lib/affiliate.js
// Constructs affiliate deep links for booking and experience platforms.
// Falls back to Google search if affiliate IDs are not configured.

const OPENTABLE_RID = process.env.OPENTABLE_RID || '';
const VIATOR_PID = process.env.VIATOR_PID || '';
const GYG_PARTNER_ID = process.env.GYG_PARTNER_ID || '';

// Bakery reservations — OpenTable
export function getReservationUrl(barName, city, country) {
  const query = `${barName} ${city}`;
  if (OPENTABLE_RID) {
    return `https://www.opentable.com/s/?covers=2&term=${encodeURIComponent(query)}&rid=${OPENTABLE_RID}`;
  }
  return `https://www.opentable.com/s/?covers=2&term=${encodeURIComponent(query)}`;
}

// Bakery tours & baking classes — Viator
export function getViatorUrl(city, country) {
  const query = `bakery tour baking class ${city}`;
  if (VIATOR_PID) {
    return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(query)}&pid=${VIATOR_PID}&mcid=42383&medium=link`;
  }
  return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(query)}`;
}

// Bakery tours & baking experiences — GetYourGuide
export function getGetYourGuideUrl(city, country) {
  const query = `bakery tour pastry class ${city}`;
  if (GYG_PARTNER_ID) {
    return `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}&partner_id=${GYG_PARTNER_ID}`;
  }
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}`;
}

// Returns the best booking URL based on bakery type
// All bakery types use OpenTable reservation links
export function getBookNowUrl(barName, city, country, barType) {
  return getReservationUrl(barName, city, country);
}

// Returns experience search URL (GYG preferred, Viator fallback)
export function getExperienceUrl(city, country) {
  if (GYG_PARTNER_ID) return getGetYourGuideUrl(city, country);
  if (VIATOR_PID) return getViatorUrl(city, country);
  return getGetYourGuideUrl(city, country);
}

// Google search link for a bakery — useful as a universal fallback
export function getGoogleSearchUrl(name, city) {
  const query = `${name} ${city} bakery`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

// Google Maps link for a bakery
export function getGoogleMapsUrl(name, city, country) {
  const query = `${name} ${city} ${country}`;
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}
