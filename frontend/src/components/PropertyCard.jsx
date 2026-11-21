import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils';
import PropertyImageCarousel from './PropertyImageCarousel';
import useFavorites from '../hooks/useFavorites';

// DB column names for state and living-area sqft
const STATE_COL = 'L_State';
const SQFT_COL = 'LM_Int2_3';

// One listing card: photos, price, address, city/state, beds/baths/sqft.
// Clicking anywhere on the card opens the detail page.
export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const open = () => navigate(`/property/${property.id}`);
  // favorites: is this card saved, and a function to save/unsave it
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(property.id);

  // heart click must not bubble up to the card and open the detail page
  const toggle = (e) => {
    e.stopPropagation();
    toggleFavorite(property);
  };

  return (
    <div
      className="card"
      role="link"
      tabIndex={0}
      onClick={open}
      // Enter opens the card too (but not when focus is on an arrow button inside it)
      onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && open()}
    >
      <PropertyImageCarousel photos={property.L_Photos} alt={property.L_Address} />
      {/* heart button: filled ♥ when saved, empty ♡ when not */}
      <button
        type="button"
        className={saved ? 'heart saved' : 'heart'}
        aria-label={saved ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={saved}
        onClick={toggle}
      >
        {saved ? '♥' : '♡'}
      </button>
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
