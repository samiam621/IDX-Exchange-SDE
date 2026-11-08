// Live check against the real DB: run with backend (5000) and frontend (3000) started.
// Skips itself if the servers aren't running.
import { describe, expect, it } from 'vitest';

// Fetch JSON from a URL, or null if the server isn't running
const tryGet = (url) => fetch(url).then((r) => r.json()).catch(() => null);

const direct = await tryGet('http://localhost:5000/api/properties?limit=20');
const viaProxy = await tryGet('http://localhost:3000/api/properties?limit=1');

describe.skipIf(!direct)('live backend (real data)', () => {
  it('returns 20 real properties and a total count', () => {
    expect(direct.error, 'backend is up but the DB query failed - is MySQL reachable?').toBeUndefined();
    expect(direct.results).toHaveLength(20);
    expect(direct.total).toBeGreaterThan(20);
  });

  it('returns every field the card needs', () => {
    for (const key of ['L_Photos', 'L_SystemPrice', 'L_Address', 'L_City', 'L_State', 'L_Keyword2', 'LM_Dec_3', 'LM_Int2_3']) {
      expect(direct.results[0]).toHaveProperty(key);
    }
  });

  it('L_Photos is a JSON array of URLs (or empty) for every row', () => {
    for (const { L_Photos } of direct.results) {
      if (!L_Photos) continue; // empty rows are handled by the card
      const photos = JSON.parse(L_Photos);
      expect(Array.isArray(photos)).toBe(true);
      expect(photos[0]).toMatch(/^https?:\/\//);
    }
  });
});

describe.skipIf(!viaProxy)('live proxy', () => {
  it('localhost:3000/api reaches the Express server', () => {
    expect(viaProxy.results).toHaveLength(1);
  });
});
