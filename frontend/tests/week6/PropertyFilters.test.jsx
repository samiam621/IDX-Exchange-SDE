// @vitest-environment jsdom
// Req 31: PropertyFilters component unit tests
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import PropertyFilters from '../../src/components/PropertyFilters';

afterEach(cleanup);

const LABELS = ['City', 'ZIP code', 'Min price', 'Max price', 'Beds', 'Baths'];
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('PropertyFilters', () => {
  it('displays all six inputs, beds/baths as dropdowns', () => {
    render(<PropertyFilters onSearch={vi.fn()} onClear={vi.fn()} />);
    for (const label of LABELS) screen.getByLabelText(label);
    expect(screen.getByLabelText('Beds').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Baths').tagName).toBe('SELECT');
  });

  it('Search calls onSearch with every typed value combined', () => {
    const onSearch = vi.fn();
    render(<PropertyFilters onSearch={onSearch} onClear={vi.fn()} />);
    type('City', 'Irvine');
    type('ZIP code', '92618');
    type('Min price', '500000');
    type('Beds', '3');
    fireEvent.click(screen.getByText('Search'));
    expect(onSearch).toHaveBeenCalledWith({
      city: 'Irvine', zipcode: '92618', minPrice: '500000', maxPrice: '', beds: '3', baths: '',
    });
  });

  it('Clear Filters empties every input and calls onClear', () => {
    const onClear = vi.fn();
    render(<PropertyFilters onSearch={vi.fn()} onClear={onClear} />);
    type('City', 'Irvine');
    type('Baths', '2');
    fireEvent.click(screen.getByText('Clear Filters'));
    expect(onClear).toHaveBeenCalledOnce();
    for (const label of LABELS) expect(screen.getByLabelText(label).value).toBe('');
  });
});
