// Req 30: API client unit tests (fetch is mocked, so no backend is needed)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchProperties } from '../../src/api/client';

afterEach(() => vi.unstubAllGlobals());

const mockOk = () =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ total: 0, results: [] })));

describe('fetchProperties with filters', () => {
  it('drops empty filter values so the backend never gets ?city=&beds=', async () => {
    mockOk();
    await fetchProperties({ city: '', zipcode: '', minPrice: '', maxPrice: '', beds: '', baths: '', limit: 20 });
    expect(fetch).toHaveBeenCalledWith('/api/properties?limit=20');
  });

  it('combines multiple filters into one query string', async () => {
    mockOk();
    await fetchProperties({ city: 'Irvine', zipcode: '92618', minPrice: '500000', maxPrice: '', beds: '3', baths: '2' });
    expect(fetch).toHaveBeenCalledWith('/api/properties?city=Irvine&zipcode=92618&minPrice=500000&beds=3&baths=2');
  });

  it('keeps 0 (a real value) but drops null/undefined', async () => {
    mockOk();
    await fetchProperties({ minPrice: 0, maxPrice: null, city: undefined });
    expect(fetch).toHaveBeenCalledWith('/api/properties?minPrice=0');
  });

  it('error path: rejects with the backend message on a 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({ error: 'minPrice cannot be greater than maxPrice' }, { status: 400 })));
    await expect(fetchProperties({ minPrice: 9, maxPrice: 1 })).rejects.toThrow('minPrice cannot be greater than maxPrice');
  });
});
