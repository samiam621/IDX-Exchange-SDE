import { useEffect, useRef, useState } from 'react';
import { parsePhotos } from '../utils';

// Photo gallery for the detail page: big main image, thumbnail strip, full-screen lightbox
export default function PropertyImageGallery({ photos: raw, alt }) {
  // some photo URLs in the DB are dead (404), so drop any that fail to load
  const [broken, setBroken] = useState([]);
  const markBroken = (url) => setBroken((list) => [...list, url]);
  const photos = parsePhotos(raw).filter((url) => !broken.includes(url));
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const lightboxRef = useRef(null);

  // Debug challenge fix: a div can't receive key events unless it is focusable AND focused.
  // tabIndex={-1} (below) makes it focusable, and this focuses it when the lightbox opens.
  useEffect(() => {
    if (open) lightboxRef.current.focus();
  }, [open]);

  if (photos.length === 0) return <div className="no-photo gallery-empty">No photos</div>;

  const current = Math.min(index, photos.length - 1); // the list can shrink when a photo breaks
  const move = (step) => setIndex((current + step + photos.length) % photos.length);

  const handleKey = (e) => {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
  };

  return (
    <div className="gallery">
      <button className="gallery-main" onClick={() => setOpen(true)} aria-label="Open photo full screen">
        <img src={photos[current]} alt={alt} onError={() => markBroken(photos[current])} />
      </button>

      {photos.length > 1 && (
        <div className="thumbs">
          {photos.map((url, i) => (
            <button
              key={url}
              className={i === current ? 'thumb active' : 'thumb'}
              onClick={() => setIndex(i)}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={url} alt="" loading="lazy" onError={() => markBroken(url)} />
            </button>
          ))}
        </div>
      )}

      {open && (
        // clicking the dark background closes; clicks on the image/buttons are stopped below
        <div
          className="lightbox"
          ref={lightboxRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Photo viewer"
          onKeyDown={handleKey}
          onClick={() => setOpen(false)}
        >
          <button className="lightbox-close" aria-label="Close">×</button>
          <img src={photos[current]} alt={alt} onClick={(e) => e.stopPropagation()} />
          {photos.length > 1 && (
            <div className="lightbox-nav" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => move(-1)} aria-label="Previous photo">‹</button>
              <span>{current + 1} / {photos.length}</span>
              <button onClick={() => move(1)} aria-label="Next photo">›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
