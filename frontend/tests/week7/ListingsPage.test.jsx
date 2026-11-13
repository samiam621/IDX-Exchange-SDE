// @vitest-environment jsdom
// Req 32/34/35: pagination wired into ListingsPage
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ListingsPage from '../../src/pages/ListingsPage';

beforeEach(() => {
  window.scrollTo = vi.fn(); // jsdom doesn't implement scrolling
  // 487 properties total; each page returns 20 rows labelled with its offset
  vi.stubGlobal('fetch', vi.fn((url) => {
    const offset = Number(new URL(url, 'http://x').searchParams.get('offset'));
    const n = Math.min(20, 487 - offset);
    return Promise.resolve(Response.json({
      total: 487,
      results: Array.from({ length: n }, (_, i) => ({ id: offset + i, L_Address: `Home ${offset + i + 1}`, L_Photos: '' })),
    }));
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ListingsPage pagination', () => {
  it('shows "Showing X-Y of Z" and pagination below the grid', async () => {
    render(<MemoryRouter><ListingsPage /></MemoryRouter>);
    await screen.findByText('Showing 1-20 of 487 properties');
    const grid = document.querySelector('.grid');
    expect(grid.compareDocumentPosition(screen.getByRole('navigation')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('changing page fetches that offset, keeps filters, and scrolls to top', async () => {
    render(<MemoryRouter><ListingsPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Beds'), { target: { value: '3' } });
    fireEvent.click(screen.getByText('Search'));
    await screen.findByText('Showing 1-20 of 487 properties');
    fireEvent.click(screen.getByText('25'));
    await screen.findByText('Showing 481-487 of 487 properties');
    expect(fetch).toHaveBeenLastCalledWith('/api/properties?beds=3&limit=20&offset=480');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('applying new filters resets to page 1', async () => {
    render(<MemoryRouter><ListingsPage /></MemoryRouter>);
    fireEvent.click(await screen.findByText('Next'));
    await screen.findByText('Showing 21-40 of 487 properties');
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Irvine' } });
    fireEvent.click(screen.getByText('Search'));
    await screen.findByText('Showing 1-20 of 487 properties');
    expect(fetch).toHaveBeenLastCalledWith('/api/properties?city=Irvine&limit=20&offset=0');
  });
});
