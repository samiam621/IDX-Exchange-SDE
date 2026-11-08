// @vitest-environment jsdom
// Req 24 + 26: grid of cards, property count, loading and error states
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ListingsPage from '../../src/pages/ListingsPage';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// Two fake listings, as returned by GET /api/properties
const results = [
  { id: 1, L_Address: '1 Fake Ave', L_City: 'A', L_State: 'CA', L_SystemPrice: 100000, L_Photos: '[]' },
  { id: 2, L_Address: '2 Fake Ave', L_City: 'B', L_State: 'CA', L_SystemPrice: 200000, L_Photos: '' },
];

describe('ListingsPage', () => {
  it('shows a loading message while data is fetching', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {}))); // never resolves
    render(<ListingsPage />);
    screen.getByText('Loading properties...');
  });

  it('renders one card per property and the "Showing X-Y of Z" count', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ total: 487, results })));
    render(<ListingsPage />);
    await screen.findByText('Showing 1-2 of 487 properties');
    screen.getByText('1 Fake Ave');
    screen.getByText('2 Fake Ave');
    expect(screen.queryByText('Loading properties...')).toBeNull();
  });

  it('shows an error message when the backend is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<ListingsPage />);
    await screen.findByText(/Error: Cannot reach the server/);
  });

  it('shows the server error message on an HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'Server error' }, { status: 500 })));
    render(<ListingsPage />);
    await screen.findByText('Error: Server error');
  });
});
