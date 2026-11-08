import { useEffect, useState } from 'react';
import { fetchProperties } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters from '../components/PropertyFilters';
import Pagination from '../components/Pagination';

// Filter form + card grid + pagination
export default function ListingsPage() {
  // active filters and current page (20 listings per page)
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  // result of the latest finished request, tagged with the query it answered
  const [result, setResult] = useState({ key: null, data: null, error: null });

  // one string per distinct query; loading = no answer yet for the CURRENT query
  const key = JSON.stringify({ ...filters, limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage });
  const loading = result.key !== key;
  const { data, error } = result;

  useEffect(() => {
    // Debug challenge fix: if the query changes before this request finishes, cleanup marks
    // it stale so its late response can't overwrite (flash over) the newer results.
    let stale = false;
    fetchProperties(JSON.parse(key))
      .then((d) => !stale && setResult({ key, data: d, error: null }))
      .catch((err) => !stale && setResult({ key, data: null, error: err.message }));
    return () => { stale = true; };
  }, [key]);

  // new filters (or clearing them) always start at page 1
  const search = (f) => { setFilters(f); setCurrentPage(1); };

  // go to another page (filters stay the same) and jump back to the top
  const changePage = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // pick what to show under the filters: loading, error, empty, or results
  let content;
  if (loading) content = <p className="status">Loading properties...</p>;
  else if (error) content = <p className="status error">Error: {error}</p>;
  else if (data.results.length === 0) content = <p className="status">No properties found. Try widening or clearing your filters.</p>;
  else {
    const first = (currentPage - 1) * itemsPerPage + 1; // number of the first listing on this page
    content = (
      <>
        <p>Showing {first}-{first + data.results.length - 1} of {data.total} properties</p>
        <div className="grid">
          {data.results.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(data.total / itemsPerPage)}
          onPageChange={changePage}
        />
      </>
    );
  }

  // filters always stay on screen; Clear = search with no filters
  return (
    <div className="page">
      <PropertyFilters onSearch={search} onClear={() => search({})} />
      {content}
    </div>
  );
}
