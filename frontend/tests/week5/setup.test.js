// Req 21 + 22 + hover criterion: port 3000, /api proxy, card hover style
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from '../../vite.config.js';

describe('project setup', () => {
  it('dev server runs on port 3000', () => {
    expect(config.server.port).toBe(3000);
  });

  it('proxies /api/* to the Express server on port 5000', () => {
    expect(config.server.proxy['/api']).toBe('http://localhost:5000');
  });

  it('property cards have a :hover style', () => {
    const css = readFileSync(new URL('../../src/App.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.card:hover\s*\{[^}]*transform/);
  });
});
