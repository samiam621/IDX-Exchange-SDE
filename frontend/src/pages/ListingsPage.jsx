import { useEffect, useState } from 'react';
import { fetchProperties } from '../api/client';
import PropertyCard from '../components/PropertyCard';

// Fetches the first 20 properties and shows them as a card grid
export default function ListingsPage() {
  const [data, setData] = useState(null);   // { total, results }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // runs once when the page loads
  useEffect(() => {
    fetchProperties({ limit: 20 })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="status">Loading properties...</p>;
  if (error) return <p className="status error">Error: {error}</p>;

  return (
    <div className="page">
      <p>Showing {data.results.length} of {data.total} properties</p>
      <div className="grid">
        {data.results.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}