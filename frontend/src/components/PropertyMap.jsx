// Google Maps Embed API (just an iframe, no npm package)
const API_KEY = import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export default function PropertyMap({ lat, lng }) {
  // only render when both coordinates exist
  if (!lat || !lng) return null;

  const spot = `${Number(lat)},${Number(lng)}`;

  return (
    <div className="map">
      <iframe
        title="Property location"
        src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${spot}&zoom=15`}
        loading="lazy"
        allowFullScreen
      />
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${spot}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get Directions
      </a>
    </div>
  );
}
