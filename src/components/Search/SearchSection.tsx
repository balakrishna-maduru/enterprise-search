// src/components/Search/SearchSection.tsx
import React from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useDBSTheme } from '../../hooks/useDBSTheme';
import { useToggle } from '../../hooks/useToggle';
import SearchInput from './SearchInput';
import SearchFilters from './SearchFilters';
import { Button, Icon } from '../UI';

export const SearchSection: React.FC = () => {
  const { searchQuery, setSearchQuery, isLoading, executeSearch, selectedFilters, setSelectedFilters } = useSearch();
  const { company } = useDBSTheme();
  const { value: showFiltersDropdown, toggle: toggleFiltersDropdown, setFalse: hideFilters } = useToggle(false);

  const handleSearchSubmit = () => {
    executeSearch(searchQuery);
  };

  // Helper function to get active filter labels
  const getActiveFilterLabels = () => {
    const labels: string[] = [];
    
    if (selectedFilters.source?.length > 0) {
      labels.push(...selectedFilters.source.map(s => `Source: ${s}`));
    }
    
    if (selectedFilters.contentType?.length > 0) {
      labels.push(...selectedFilters.contentType.map(ct => `Type: ${ct}`));
    }
    
    if (selectedFilters.author && selectedFilters.author.length > 0) {
      labels.push(...selectedFilters.author.map(a => `Author: ${a}`));
    }
    
    if (selectedFilters.tags && selectedFilters.tags.length > 0) {
      labels.push(...selectedFilters.tags.map(t => `Tag: ${t}`));
    }
    
    if (selectedFilters.dateRange && selectedFilters.dateRange !== 'all') {
      labels.push(`Date: ${selectedFilters.dateRange}`);
    }
    
    return labels;
  };

  const activeFilterLabels = getActiveFilterLabels();

  return (
    <div className="relative z-20 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-3 mb-4">
      
      {/* Search Input Row with Filters Button */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              isLoading={isLoading}
              placeholder="Search content, people, or ask me anything..."
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFiltersDropdown}
            className="relative flex-shrink-0 px-3 py-2"
          >
            <Icon name="menu" size="sm" className="mr-1" />
            Filters
            {Object.keys(selectedFilters).some(key => {
              const filterValue = selectedFilters[key as keyof typeof selectedFilters];
              return Array.isArray(filterValue) ? filterValue.length > 0 : false;
            }) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Button>
        </div>

        {/* Active Filter Labels Row */}
        {activeFilterLabels.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-gray-100">
            {activeFilterLabels.map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
              >
                {label}
                <button
                  onClick={() => {
                    // Handle removing individual filters
                    const [filterType, filterValue] = label.split(': ');
                    const newFilters = { ...selectedFilters };
                    
                    switch (filterType) {
                      case 'Source':
                        newFilters.source = newFilters.source.filter(s => s !== filterValue);
                        break;
                      case 'Type':
                        newFilters.contentType = newFilters.contentType.filter(ct => ct !== filterValue);
                        break;
                      case 'Author':
                        if (newFilters.author) {
                          newFilters.author = newFilters.author.filter(a => a !== filterValue);
                        }
                        break;
                      case 'Tag':
                        if (newFilters.tags) {
                          newFilters.tags = newFilters.tags.filter(t => t !== filterValue);
                        }
                        break;
                      case 'Date':
                        newFilters.dateRange = 'all';
                        break;
                    }
                    
                    setSelectedFilters(newFilters);
                  }}
                  className="ml-1 hover:text-blue-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Filters Dropdown */}
        {showFiltersDropdown && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
            <SearchFilters
              filters={selectedFilters}
              onFiltersChange={setSelectedFilters}
              isOpen={showFiltersDropdown}
              onToggle={hideFilters}
            />
          </div>
        )}
      </div>
    </div>
  );
};