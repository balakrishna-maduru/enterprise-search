// src/components/Search/SearchSection.tsx
import React, { useRef, useEffect } from 'react';
import SearchTypeSelector from './SearchTypeSelector';
import { useSearch } from '../../contexts/SearchContext';

const SearchSection: React.FC = () => {
  const { searchQuery, setSearchQuery, isLoading } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
    <div className="mb-6 space-y-4">
      {/* Search Input */}
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search employees, documents, or content..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              autoComplete="off"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <SearchTypeSelector />
      </div>
    </div>
  );
};

export default SearchSection;