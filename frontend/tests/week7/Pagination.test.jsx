// @vitest-environment jsdom
// Req 33 + 36 + debug challenge: Pagination component and page-number logic
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Pagination from '../../src/components/Pagination';
import { getPageNumbers } from '../../src/components/pageNumbers';

afterEach(cleanup);

// What the nav shows, e.g. "Previous 1 ... 4 5 6 ... 24 Next"
const shown = () => [...screen.getByRole('navigation').children].map((el) => el.textContent).join(' ');
const renderAt = (currentPage, totalPages, onPageChange = vi.fn()) =>
  render(<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />);

describe('getPageNumbers', () => {
  it.each([
    [1, 5, [1, 2, 3, 4, 5]],
    [1, 24, [1, 2, 3, 4, 5, '...', 24]],
    [5, 24, [1, '...', 4, 5, 6, '...', 24]],
    [22, 24, [1, '...', 20, 21, 22, 23, 24]],
    [24, 24, [1, '...', 20, 21, 22, 23, 24]],
  ])('page %i of %i', (current, total, expected) => {
    expect(getPageNumbers(current, total)).toEqual(expected);
  });

  // Debug challenge: "1 ... 2 3 4 ... 1" came from building the end range off the
  // current page without checking it against the total. This sweeps every page of
  // every small total: no repeats, always starts at 1, always ends at total, ascending.
  it('never repeats a page or misplaces the last page, for any page near the end', () => {
    for (let total = 1; total <= 30; total++) {
      for (let current = 1; current <= total; current++) {
        const nums = getPageNumbers(current, total).filter((n) => n !== '...');
        expect(nums[0]).toBe(1);
        expect(nums.at(-1)).toBe(total);
        expect(nums).toContain(current);
        expect([...nums].sort((a, b) => a - b)).toEqual(nums);
        expect(new Set(nums).size).toBe(nums.length);
      }
    }
  });
});

describe('Pagination', () => {
  it('first page: Previous disabled, Next enabled', () => {
    renderAt(1, 24);
    expect(screen.getByText('Previous').disabled).toBe(true);
    expect(screen.getByText('Next').disabled).toBe(false);
  });

  it('last page: Next disabled, Previous enabled', () => {
    renderAt(24, 24);
    expect(screen.getByText('Next').disabled).toBe(true);
    expect(screen.getByText('Previous').disabled).toBe(false);
  });

  it('middle page renders ellipsis on both sides', () => {
    renderAt(5, 24);
    expect(shown()).toBe('Previous 1 ... 4 5 6 ... 24 Next');
    expect(screen.getByText('5').getAttribute('aria-current')).toBe('page');
  });

  it('clicking a page number, Previous and Next calls onPageChange', () => {
    const onPageChange = vi.fn();
    renderAt(5, 24, onPageChange);
    fireEvent.click(screen.getByText('24'));
    fireEvent.click(screen.getByText('Previous'));
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange.mock.calls).toEqual([[24], [4], [6]]);
  });

  it('is hidden when there is only one page', () => {
    const { container } = renderAt(1, 1);
    expect(container.innerHTML).toBe('');
  });
});
