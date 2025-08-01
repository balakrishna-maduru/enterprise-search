// src/components/Search/SearchSection.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useDBSTheme } from '../../hooks/useDBSTheme';
import SearchFilters from './SearchFilters';

const SearchSection: React.FC = () => {
  const { searchQuery, setSearchQuery, isLoading, executeSearch, selectedFilters, setSelectedFilters } = useSearch();
  const { company, classes, getInputClass, getButtonClass } = useDBSTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState<boolean>(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch(searchQuery);
    }
  };

  const handleSearchClick = () => {
    executeSearch(searchQuery);
  };

  // Ensure input stays focused after re-renders
  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      const cursorPosition = inputRef.current.selectionStart;
      inputRef.current.focus();
      if (cursorPosition !== null) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
  });

  return (
    <div className="mb-8 space-y-6">
      {/* Enhanced Search Input */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                placeholder="Search employees, documents, or content... (Press Enter to search)"
                className={`${getInputClass('search')} dbs-input-focus`}
                disabled={isLoading}
                autoComplete="off"
              />
              {/* Search Icon */}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`h-6 w-6 text-gray-400 group-focus-within:${classes.text.primary} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* Search Button */}
              <button
                onClick={handleSearchClick}
                disabled={isLoading || !searchQuery.trim()}
                className={`absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 ${classes.hover.text} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110`}
              >
                {isLoading ? (
                  <svg className={`h-6 w-6 ${classes.loading.spinner}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <div className={`${getButtonClass('primary')} p-2 rounded-xl shadow-md hover:shadow-lg`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
              </button>
              
              {/* DBS Gradient Border Effect */}
              <div className="absolute inset-0 rounded-2xl dbs-gradient-border opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-xl"></div>
            </div>
          </div>

          {/* Filters Button */}
          <div className="relative">
            <button
              onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
              className="flex items-center gap-2 px-4 py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:bg-gray-50/90 transition-all duration-300 text-gray-700 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span className="font-medium">Filters</span>
              {(selectedFilters.source.length > 0 || selectedFilters.contentType.length > 0 || selectedFilters.dateRange !== 'all') && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Active
                </span>
              )}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Filters Dropdown */}
            <SearchFilters
              filters={selectedFilters}
              onFiltersChange={(newFilters) => setSelectedFilters(newFilters)}
              isOpen={showFiltersDropdown}
              onToggle={() => setShowFiltersDropdown(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;