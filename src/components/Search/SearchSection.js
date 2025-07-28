// src/components/Search/SearchSection.js
import React from 'react';
import SearchBar from './SearchBar';
import SearchFilters from './SearchFilters';
import SearchIndicators from './SearchIndicators';
import SavedSearchesDropdown from './SavedSearchesDropdown';

const SearchSection = () => {
  return (
    <div className="mb-6">
      <div className="flex items-end space-x-3 mb-2">
        <div className="flex-1">
          <SearchBar />
        </div>
        <SavedSearchesDropdown />
      </div>
      <SearchIndicators />
      <SearchFilters />
    </div>
  );
};

export default SearchSection;