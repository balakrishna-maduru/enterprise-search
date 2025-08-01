// src/components/Common/Pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { PaginationInfo } from '../../types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onPrevious,
  onNext,
  className = ''
}) => {
  const { currentPage, totalPages, totalResults, pageSize, hasNextPage, hasPreviousPage } = pagination;

  // Calculate the range of results being shown
  const startResult = (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if we have 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 4) {
        // Show first pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show last pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Results info */}
      <div className="flex items-center space-x-2 text-sm text-gray-700">
        <span>
          Showing <span className="font-medium">{startResult}</span> to{' '}
          <span className="font-medium">{endResult}</span> of{' '}
          <span className="font-medium">{totalResults}</span> results
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <button
          onClick={onPrevious}
          disabled={!hasPreviousPage}
          className={`
            inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${hasPreviousPage
              ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-300'
              : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }
          `}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1 mx-2">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500">
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`
                    inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${page === currentPage
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-300'
                    }
                  `}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={!hasNextPage}
          className={`
            inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${hasNextPage
              ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-300'
              : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }
          `}
          title="Next page"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
