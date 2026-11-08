// @vitest-environment jsdom
// Req 28/29 + debug challenge: filters drive the list, Clear reloads, no stale flash
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import ListingsPage from '../../src/pages/ListingsPage';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const page = (...addresses) =>
  Response.json({ total: addresses.length, results: addresses.map((L_Address, id) => ({ id, L_Address, L_Photos: '' })) });

const search = (city) => {
  fireEvent.change(screen.getByLabelText('City'), { target: { value: city } });
  fireEvent.click(screen.getByText('Search'));
};

describe('ListingsPage filters', () => {
  it('Search refetches with the filters (empty ones left out) and shows new results', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => Promise.resolve(url.includes('Irvine') ? page('Irvine home') : page('Any home'))));
    render(<ListingsPage />);
    await screen.findByText('Any home');
    search('Irvine');
    await screen.findByText('Irvine home');
    expect(fetch).toHaveBeenLastCalledWith('/api/properties?city=Irvine&limit=20&offset=0');
  });

  it('shows a helpful message when nothing matches', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(page()));
    render(<ListingsPage />);
    await screen.findByText(/No properties found/);
  });

  it('Clear Filters reloads all properties', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => Promise.resolve(url.includes('Irvine') ? page('Irvine home') : page('Any home'))));
    render(<ListingsPage />);
    search('Irvine');
    await screen.findByText('Irvine home');
    fireEvent.click(screen.getByText('Clear Filters'));
    await screen.findByText('Any home');
    expect(fetch).toHaveBeenLastCalledWith('/api/properties?limit=20&offset=0');
  });

  it('debug challenge: a slow first search never flashes over a newer search', async () => {
    let finishIrvine;
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('Irvine')) return new Promise((r) => { finishIrvine = () => r(page('Irvine home')); });
      if (url.includes('Tustin')) return Promise.resolve(page('Tustin home'));
      return Promise.resolve(page('Any home'));
    }));
    render(<ListingsPage />);
    search('Irvine');                                  // slow request
    fireEvent.click(screen.getByText('Clear Filters'));
    search('Tustin');
    await screen.findByText('Tustin home');
    await act(async () => finishIrvine());             // stale response lands late
    expect(screen.queryByText('Irvine home')).toBeNull();
    screen.getByText('Tustin home');
  });
});
