// Page numbers to show, with '...' for gaps, e.g. (5, 24) -> [1, '...', 4, 5, 6, '...', 24]
// Always 7 slots once total > 7, so no number can repeat and the last page appears once.
export function getPageNumbers(current, total) {
  // range(3, 6) -> [3, 4, 5, 6]
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (total <= 7) return range(1, total);                              // fits, no ellipsis
  if (current <= 4) return [...range(1, 5), '...', total];             // near the start
  if (current >= total - 3) return [1, '...', ...range(total - 4, total)]; // near the end
  return [1, '...', current - 1, current, current + 1, '...', total];  // middle
}
