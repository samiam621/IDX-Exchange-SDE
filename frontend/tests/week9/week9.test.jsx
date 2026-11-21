// @vitest-environment jsdom
// Week 9: sorting, favorites (useFavorites hook), error boundary
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ListingsPage from '../../src/pages/ListingsPage';
import FavoritesPage from '../../src/pages/FavoritesPage';
import PropertyCard from '../../src/components/PropertyCard';
import ErrorBoundary from '../../src/components/ErrorBoundary';

const HOME = { id: 7, L_Address: '1 Main St', L_City: 'Irvine', L_SystemPrice: 900000, L_Photos: '' };

beforeEach(() => {
  window.scrollTo = vi.fn();
  vi.stubGlobal('fetch', vi.fn((url) => {
    const offset = Number(new URL(url, 'http://x').searchParams.get('offset'));
    return Promise.resolve(Response.json({
      total: 100,
      results: Array.from({ length: 20 }, (_, i) => ({ id: offset + i, L_Address: `Home ${offset + i + 1}`, L_Photos: '' })),
    }));
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Sorting', () => {
  it('sends sortBy/sortOrder, keeps them across pages, resets on new filters', async () => {
    render(<MemoryRouter><ListingsPage /></MemoryRouter>);
    await screen.findByText('Showing 1-20 of 100 properties');

    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'L_SystemPrice:desc' } });
    await screen.findByText('Showing 1-20 of 100 properties');
    expect(fetch).toHaveBeenLastCalledWith('/api/properties?sortBy=L_SystemPrice&sortOrder=desc&limit=20&offset=0');

    fireEvent.click(screen.getByText('Next'));
    await screen.findByText('Showing 21-40 of 100 properties');
    expect(fetch).toHaveBeenLastCalledWith('/api/properties?sortBy=L_SystemPrice&sortOrder=desc&limit=20&offset=20');

    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Irvine' } });
    fireEvent.click(screen.getByText('Search'));
    await screen.findByText('Showing 1-20 of 100 properties');
    expect(fetch).toHaveBeenLastCalledWith('/api/properties?city=Irvine&limit=20&offset=0');
    expect(screen.getByLabelText('Sort by').value).toBe('');
  });
});

describe('Favorites', () => {
  // Node 25 ships its own broken localStorage global, so use a tiny in-memory one.
  // Each test un-favorites what it favorites, so the hook's shared list starts empty.
  beforeEach(() => {
    const store = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, String(v)),
    });
  });

  it('heart toggles filled/empty, saves to localStorage, and does not open the card', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<PropertyCard property={HOME} />} />
          <Route path="/property/:id" element={<p>detail page</p>} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByLabelText('Add to favorites'));
    expect(screen.getByLabelText('Remove from favorites').textContent).toBe('♥');
    expect(JSON.parse(localStorage.getItem('favorites'))).toEqual([HOME]);
    expect(screen.queryByText('detail page')).toBeNull();

    fireEvent.click(screen.getByLabelText('Remove from favorites'));
    expect(screen.getByLabelText('Add to favorites').textContent).toBe('♡');
    expect(JSON.parse(localStorage.getItem('favorites'))).toEqual([]);
  });

  it('Favorites page shows count and removes an unfavorited home immediately', () => {
    render(<MemoryRouter><PropertyCard property={HOME} /><FavoritesPage /></MemoryRouter>);
    fireEvent.click(screen.getByLabelText('Add to favorites'));
    screen.getByText('Favorites (1)');
    expect(screen.getAllByText('1 Main St')).toHaveLength(2); // card + favorites grid

    fireEvent.click(screen.getAllByLabelText('Remove from favorites')[1]);
    screen.getByText('Favorites (0)');
    expect(screen.getAllByText('1 Main St')).toHaveLength(1);
  });
});

describe('ErrorBoundary', () => {
  it('shows a recovery UI on render errors and Try again re-renders', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {}); // React logs the caught error
    let fail = true;
    function Bomb() {
      if (fail) throw new Error('kaboom');
      return <p>recovered</p>;
    }
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    screen.getByRole('alert');
    screen.getByText('kaboom');

    fail = false;
    fireEvent.click(screen.getByText('Try again'));
    screen.getByText('recovered');
    console.error.mockRestore();
  });
});

