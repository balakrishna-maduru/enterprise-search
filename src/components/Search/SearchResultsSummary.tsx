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

  // Simple test - always show something
  return (
    <div className="bg-red-100 border border-red-300 px-6 py-4 z-50" style={{ position: 'relative', zIndex: 9999 }}>
      <div className="max-w-7xl mx-auto">
        <h3 className="text-lg font-bold text-red-800">🔍 SEARCH RESULTS SUMMARY TEST</h3>
        <p className="text-sm text-gray-700">
          Search: "{searchQuery}" | Active: {isSearchActive ? 'Yes' : 'No'} | Total: {totalResults} | Employees: {employeeCount} | Content: {documentCount}
        </p>
        <div className="flex gap-2 mt-2">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">All {totalResults}</span>
          <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">People {employeeCount}</span>
          <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Content {documentCount}</span>
        </div>
      </div>
    </div>
  );
};
