import PropertyCard from '../components/PropertyCard';
import useFavorites from '../hooks/useFavorites';

// Saved properties only. Unfavoriting a card removes it right away (same shared hook state).
export default function FavoritesPage() {
  const { favorites, count } = useFavorites();

  return (
    <div className="page">
      <h1>Favorites ({count})</h1>
      {count === 0 ? (
        <p className="status">No favorites yet. Tap the ♡ on a listing to save it.</p>
      ) : (
        <div className="grid">
          {favorites.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}
