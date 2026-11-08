import { getPageNumbers } from './pageNumbers';

// Prev / page numbers / Next. Hidden when there is only one page.
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      {/* Previous: off on page 1 */}
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      {/* page buttons, '...' shown as plain text; current page is highlighted */}
      {getPageNumbers(currentPage, totalPages).map((n, i) =>
        n === '...' ? (
          <span key={`gap${i}`}>...</span>
        ) : (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            aria-current={n === currentPage ? 'page' : undefined}
          >
            {n}
          </button>
        )
      )}
      {/* Next: off on the last page */}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </nav>
  );
}
