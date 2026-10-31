// DB column names for state and living-area sqft
const STATE_COL = 'L_State';
const SQFT_COL = 'LM_Int2_3';

// Safely get the first photo URL, or null.
// L_Photos is usually a JSON array string, but some rows are '' / null / bad JSON.
function getFirstPhoto(raw) {
  try {
    const photos = Array.isArray(raw) ? raw : JSON.parse(raw); // may already be parsed
    if (Array.isArray(photos) && typeof photos[0] === 'string' && photos[0]) {
      return photos[0];
    }
  } catch {
    // null, empty, or bad JSON: fall through
  }
  return null;
}

// Format a price as $1,234,567 (or a fallback if missing)
function formatPrice(value) {
  const n = Number(value);
  if (!n) return 'Price unavailable';
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

// One listing card: photo, price, address, city/state, beds/baths/sqft
export default function PropertyCard({ property }) {
  const photo = getFirstPhoto(property.L_Photos);

  return (
    <div className="card">
      {photo ? (
        <img
          src={photo}
          alt={property.L_Address}
          onError={(e) => (e.currentTarget.style.display = 'none')} // hide broken image
        />
      ) : (
        <div className="no-photo">No photo</div>
      )}
      <div className="card-body">
        <h3>{formatPrice(property.L_SystemPrice)}</h3>
        <p>{property.L_Address}</p>
        <p>{property.L_City}, {property[STATE_COL]}</p>
        <p>
          {property.L_Keyword2 ?? '-'} bd · {property.LM_Dec_3 ?? '-'} ba ·{' '}
          {property[SQFT_COL]?.toLocaleString() ?? '-'} sqft
        </p>
      </div>
    </div>
  );
}