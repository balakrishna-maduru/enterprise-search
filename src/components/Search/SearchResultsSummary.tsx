// src/components/Search/SearchResultsSummary.tsx
import React from 'react';
import { useSearch } from '../../contexts/SearchContext';

interface SearchResultsSummaryProps {
  totalResults: number;
  employeeCount: number;
  documentCount: number;
  isSearchActive: boolean;
}

export const SearchResultsSummary: React.FC<SearchResultsSummaryProps> = ({
  totalResults,
  employeeCount,
  documentCount,
  isSearchActive
}) => {
  const { selectedFilters, setSelectedFilters, searchQuery } = useSearch();

  if (!isSearchActive || !searchQuery) {
    return null; // Don't show anything if no search is active
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Search Results for "{searchQuery}"
            </h3>
            <p className="text-sm text-gray-600">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} across all content types
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">All</span>
              <span className="text-sm font-bold text-blue-600">{totalResults}</span>
            </div>
            
            {employeeCount > 0 && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">People</span>
                <span className="text-sm font-bold text-green-600">{employeeCount}</span>
              </div>
            )}
            
            {documentCount > 0 && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Content</span>
                <span className="text-sm font-bold text-purple-600">{documentCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
