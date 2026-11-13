// Small helpers shared by the card and the detail page

// L_Photos is usually a JSON array string, but some rows are '' / null / bad JSON.
// Always returns an array of photo URLs (empty if anything is wrong).
export function parsePhotos(raw) {
  try {
    const photos = Array.isArray(raw) ? raw : JSON.parse(raw); // may already be parsed
    return Array.isArray(photos) ? photos.filter((p) => typeof p === 'string' && p) : [];
  } catch {
    return []; // null, empty, or bad JSON
  }
}

// Format a price as $1,234,567 (or a fallback if missing)
export function formatPrice(value) {
  const n = Number(value);
  if (!n) return 'Price unavailable';
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

// "13:30:00" -> "1:30 PM"
export function formatTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
