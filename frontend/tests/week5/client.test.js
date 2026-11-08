// Req 23 + "API client handles HTTP errors and throws meaningful error messages"
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchProperties, fetchPropertyDetail } from '../../src/api/client';

// Fake fetch that answers with the given status and JSON body
const mockFetch = (status, body) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));

afterEach(() => vi.unstubAllGlobals());

describe('API client', () => {
  it('fetchProperties calls /api/properties with query params and returns JSON', async () => {
    mockFetch(200, { total: 1, results: [] });
    await expect(fetchProperties({ city: 'Irvine', limit: 20 })).resolves.toEqual({ total: 1, results: [] });
    expect(fetch).toHaveBeenCalledWith('/api/properties?city=Irvine&limit=20');
  });

  it('fetchPropertyDetail calls /api/properties/:id', async () => {
    mockFetch(200, { id: 53 });
    await fetchPropertyDetail(53);
    expect(fetch).toHaveBeenCalledWith('/api/properties/53');
  });

  it('throws the server error message on 400/404', async () => {
    mockFetch(404, { error: 'Property with ID 9 was not found' });
    await expect(fetchPropertyDetail(9)).rejects.toThrow('Property with ID 9 was not found');
  });

  it('throws "Server unavailable" on a 500 with no JSON body (backend down behind proxy)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));
    await expect(fetchProperties()).rejects.toThrow('Server unavailable');
  });

  it('throws a readable message when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(fetchProperties()).rejects.toThrow('Cannot reach the server');
  });
});
