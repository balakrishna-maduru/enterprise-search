// src/components/Search/SearchSection.tsx
import React from 'react';
import SearchBar from './SearchBar';
import SearchFilters from './SearchFilters';
import SearchIndicators from './SearchIndicators';
import SavedSearchesDropdown from './SavedSearchesDropdown';
import SearchTypeSelector from './SearchTypeSelector';

const SearchSection: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="flex items-end space-x-3 mb-2">
        <div className="flex-1">
          <SearchBar />
        </div>
        <SearchTypeSelector />
        <SavedSearchesDropdown />
      </div>
      <SearchIndicators />
      <SearchFilters />
    </div>
  );
};

export default SearchSection;