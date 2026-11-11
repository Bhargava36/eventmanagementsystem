import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

// Clean, spacious, and native pagination component without badge/pill styling
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = null,
  pageSize = 10,
  onPageChange,
  onPageSizeChange = null,
  pageSizeOptions = [5, 10, 20, 50],
  itemName = 'records',
  className = ''
}) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = Math.min(Math.max(1, currentPage || 1), safeTotalPages);

  // Generate page numbers with clean ellipsis
  const getPageNumbers = () => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }
    const pages = [];
    const leftBound = Math.max(2, safeCurrentPage - 1);
    const rightBound = Math.min(safeTotalPages - 1, safeCurrentPage + 1);

    pages.push(1);
    if (leftBound > 2) {
      pages.push('ellipsis-left');
    }
    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(i);
    }
    if (rightBound < safeTotalPages - 1) {
      pages.push('ellipsis-right');
    }
    pages.push(safeTotalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = totalItems !== null && totalItems > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems !== null ? Math.min(safeCurrentPage * pageSize, totalItems) : 0;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-sm ${className}`}
    >
      {/* Informational range label using natural font */}
      <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
        {totalItems !== null ? (
          <span>
            Showing <span className="font-semibold text-gray-900 dark:text-white">{startItem}</span> to{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{endItem}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> {itemName}
          </span>
        ) : (
          <span>
            Page <span className="font-semibold text-gray-900 dark:text-white">{safeCurrentPage}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{safeTotalPages}</span>
          </span>
        )}

        {/* Optional Page Size Selector */}
        {onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-4 border-l border-gray-200 dark:border-zinc-800">
            <span className="text-xs text-gray-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                if (onPageChange) onPageChange(1);
              }}
              className="py-1 px-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Button Group */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(1)}
          disabled={safeCurrentPage <= 1}
          className="w-9 h-9 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(Math.max(1, safeCurrentPage - 1))}
          disabled={safeCurrentPage <= 1}
          className="w-9 h-9 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbered Page Buttons - Spacious, rectangular, no pills */}
        <div className="flex items-center gap-1.5 px-1">
          {pageNumbers.map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span
                  key={`${p}-${idx}`}
                  className="px-2 text-sm text-gray-400 dark:text-gray-600 select-none"
                >
                  ...
                </span>
              );
            }
            const isActive = safeCurrentPage === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange && onPageChange(p)}
                className={`min-w-9 h-9 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))}
          disabled={safeCurrentPage >= safeTotalPages}
          className="w-9 h-9 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(safeTotalPages)}
          disabled={safeCurrentPage >= safeTotalPages}
          className="w-9 h-9 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
