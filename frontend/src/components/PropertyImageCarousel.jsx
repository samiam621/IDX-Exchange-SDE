import { useState } from 'react';
import { parsePhotos } from '../utils';

// Photo carousel for a listing card: one photo at a time, arrows, "X / Y" counter
export default function PropertyImageCarousel({ photos: raw, alt }) {
  // some photo URLs in the DB are dead (404), so drop any that fail to load
  const [broken, setBroken] = useState([]);
  const photos = parsePhotos(raw).filter((url) => !broken.includes(url));
  const [index, setIndex] = useState(0);

  if (photos.length === 0) return <div className="no-photo">No photo</div>;

  const current = Math.min(index, photos.length - 1); // the list can shrink when a photo breaks

  // move forward/back and wrap around at the ends
  const move = (e, step) => {
    e.stopPropagation(); // the card is clickable, so don't let the arrow click open the detail page
    setIndex((current + step + photos.length) % photos.length);
  };

  return (
    <div className="carousel">
      <img src={photos[current]} alt={alt} onError={() => setBroken([...broken, photos[current]])} />
      {photos.length > 1 && (
        <>
          <button className="arrow left" onClick={(e) => move(e, -1)} aria-label="Previous photo">‹</button>
          <button className="arrow right" onClick={(e) => move(e, 1)} aria-label="Next photo">›</button>
          <span className="photo-count">{current + 1} / {photos.length}</span>
        </>
      )}
    </div>
  );
}
