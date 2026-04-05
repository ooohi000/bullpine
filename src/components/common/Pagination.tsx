'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  const currentGroup = Math.floor((currentPage - 1) / pageSize);
  const startPage = currentGroup * pageSize + 1;
  const endPage = Math.min(startPage + pageSize - 1, totalPages);
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const buttonBase =
    'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-40 disabled:pointer-events-none';
  const pageButton =
    'text-muted-foreground hover:text-foreground hover:bg-muted';
  const activeButton = 'bg-primary text-primary-foreground hover:bg-primary/90';

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={isFirstPage}
        className={`${buttonBase} ${pageButton}`}
        onClick={() => !isFirstPage && onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {pages.map((page) => (
        <button
          key={`page-${page}-button`}
          type="button"
          className={`${buttonBase} ${
            page === currentPage ? activeButton : pageButton
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        aria-label="다음 페이지"
        disabled={isLastPage}
        className={`${buttonBase} ${pageButton}`}
        onClick={() => !isLastPage && onPageChange(currentPage + 1)}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
