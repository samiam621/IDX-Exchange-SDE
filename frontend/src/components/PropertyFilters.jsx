import { useState } from 'react';

// Keys match the backend's query params
const EMPTY = { city: '', zipcode: '', minPrice: '', maxPrice: '', beds: '', baths: '' };
const COUNTS = [1, 2, 3, 4, 5]; // beds/baths dropdown options ("1+" ... "5+")

// Filter form: calls onSearch(filters) on submit, onClear() on Clear
export default function PropertyFilters({ onSearch, onClear }) {
  const [filters, setFilters] = useState(EMPTY); // all six inputs live in one object

  // one handler for every input: the input's name is the key in filters
  const update = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  // Search: stop the page reload and hand the filters to the parent
  const submit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  // Clear: empty every input and tell the parent to reload everything
  const clear = () => {
    setFilters(EMPTY);
    onClear();
  };

  return (
    <form className="filters" onSubmit={submit}>
      <label>City <input name="city" value={filters.city} onChange={update} /></label>
      <label>ZIP code <input name="zipcode" value={filters.zipcode} onChange={update} inputMode="numeric" /></label>
      <label>Min price <input name="minPrice" type="number" min="0" value={filters.minPrice} onChange={update} /></label>
      <label>Max price <input name="maxPrice" type="number" min="0" value={filters.maxPrice} onChange={update} /></label>
      <label>Beds
        <select name="beds" value={filters.beds} onChange={update}>
          <option value="">Any</option>
          {COUNTS.map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </label>
      <label>Baths
        <select name="baths" value={filters.baths} onChange={update}>
          <option value="">Any</option>
          {COUNTS.map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </label>
      <button type="submit">Search</button>
      <button type="button" onClick={clear}>Clear Filters</button>
    </form>
  );
}
