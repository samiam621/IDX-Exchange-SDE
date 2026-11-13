// @vitest-environment jsdom
// Req 25 + Debug Challenge: card fields and defensive L_Photos parsing
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen } from '@testing-library/react';
import PropertyCard from '../../src/components/PropertyCard';

afterEach(cleanup);

// Fake listing shaped like a row from /api/properties
const makeProperty = (overrides = {}) => ({
  id: 1,
  L_Address: '123 Test St',
  L_City: 'Testville',
  L_State: 'CA',
  L_SystemPrice: 3950000,
  L_Keyword2: 4,
  LM_Dec_3: '5.0',
  LM_Int2_3: 3677,
  L_Photos: '["https://example.com/a.jpg","https://example.com/b.jpg"]',
  ...overrides,
});

describe('PropertyCard', () => {
  it('shows price, address, city/state, beds, baths and sqft', () => {
    render(<MemoryRouter><PropertyCard property={makeProperty()} /></MemoryRouter>);
    screen.getByText('$3,950,000');
    screen.getByText('123 Test St');
    screen.getByText('Testville, CA');
    screen.getByText('4 bd · 5.0 ba · 3,677 sqft');
  });

  it('shows the FIRST photo from the L_Photos JSON array', () => {
    render(<MemoryRouter><PropertyCard property={makeProperty()} /></MemoryRouter>);
    expect(screen.getByRole('img').getAttribute('src')).toBe('https://example.com/a.jpg');
  });

  // Every bad L_Photos value seen (or possible) in the DB must render a placeholder, not crash
  it.each([
    ['empty string (211 rows in DB)', ''],
    ['null', null],
    ['undefined', undefined],
    ['malformed JSON', '["https://broken'],
    ['empty array', '[]'],
    ['JSON object, not array', '{"url":"x"}'],
    ['array with non-string first item', '[null]'],
  ])('shows "No photo" when L_Photos is %s', (_label, L_Photos) => {
    render(<MemoryRouter><PropertyCard property={makeProperty({ L_Photos })} /></MemoryRouter>);
    screen.getByText('No photo');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows fallbacks when price and stats are missing', () => {
    render(<MemoryRouter><PropertyCard property={makeProperty({ L_SystemPrice: null, L_Keyword2: null, LM_Dec_3: null, LM_Int2_3: null })} /></MemoryRouter>);
    screen.getByText('Price unavailable');
    screen.getByText('- bd · - ba · - sqft');
  });
});
