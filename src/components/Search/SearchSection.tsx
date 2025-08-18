// src/components/Search/SearchSection.tsx
import React from 'react';
import { useSearch } from '../../contexts/SearchContext';


import { useDBSTheme } from '../../hooks/useDBSTheme';
import { useToggle } from '../../hooks/useToggle';
import { useUser } from '../../hooks/useUser';
import SearchInput from './SearchInput';
import SearchFilters from './SearchFilters';
import { Button, Icon } from '../UI';

// FilterDef type for clarity
interface FilterDef {
  name: string;
  values: { [value: string]: number };
}

const filtersData: FilterDef[] = [
  {
    name: 'container',
    values: {
      'Mega Policies Global RMG': 109,
      'Mega Policies Global LCS': 93,
      'Mega Policies SG CBG': 97,
      'Mega Policies Global CBG': 357,
      'Mega Policies IN FIN': 132,
      'ekb-uat-usecase-testing': 1324,
      'Mega Policies HK RMG': 114,
      'Mega Policies Indonesia(ID) RMG': 67,
      'DEAA': 963,
      'Mega Policies TW RMG': 105
    }
  },
  {
    name: 'author',
    values: {
      'shudong': 732,
      'uladzimir': 26,
      'daoyongl': 18,
      'DBS': 1356,
      'prathimapawar': 20,
      'shiyansu': 13,
      'davidhenningson': 15,
      'amitthakur': 11,
      'leonlee': 12,
      'keerthanap': 14
    }
  },
  {
    name: 'objectType',
    values: {
      'Article': 1356,
      'page': 963,
      'drive': 1324
    }
  }
];

export const SearchSection: React.FC = () => {
  const { searchQuery, setSearchQuery, isLoading, executeSearch, hasSearched } = useSearch();
  useDBSTheme();
  const { value: showFiltersDropdown, toggle: toggleFiltersDropdown, setFalse: hideFilters } = useToggle(false);
  const { user } = useUser();

  // Local state for selected filters (object: { [filterName]: string[] })
  const [selectedFilters, setSelectedFilters] = React.useState<{ [filterName: string]: string[] }>({});

  const handleSearchSubmit = () => {
    executeSearch(searchQuery);
  };

  // Helper function to get active filter labels
  const getActiveFilterLabels = () => {
    const labels: string[] = [];
    Object.entries(selectedFilters).forEach(([filterName, values]) => {
      if (values && values.length > 0) {
        labels.push(...values.map(v => `${filterName.charAt(0).toUpperCase() + filterName.slice(1)}: ${v}`));
      }
    });
    return labels;
  };

  const activeFilterLabels = getActiveFilterLabels();

  // Landing page greeting when no search performed
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (!hasSearched) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center h-[40vh] mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow mb-6 text-center">
          {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <div className="w-[60vw] max-w-5xl">
          <div className="bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/30 px-4 py-3 flex items-center gap-3 transition-all">
            <Icon name="search" size="md" className="text-blue-600" />
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                isLoading={isLoading}
                placeholder="Search about what your teammates have been working on"
                className="!bg-transparent border-0 shadow-none focus:ring-0 focus:outline-none"
              />
            </div>
            <Button
              onClick={handleSearchSubmit}
              disabled={isLoading || !searchQuery.trim()}
              className="rounded-full px-5"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Post-search (results) layout with filters etc.
  return (
    <div className={`relative z-20 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-3 mb-4 transition-all duration-300 max-w-5xl mx-auto mt-2`}>
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
                    const [filterType, filterValue] = label.split(': ');
                    const key = filterType.charAt(0).toLowerCase() + filterType.slice(1);
                    const newFilters = { ...selectedFilters };
                    if (Array.isArray(newFilters[key])) {
                      newFilters[key] = newFilters[key].filter((v: string) => v !== filterValue);
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
        {showFiltersDropdown && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
            <SearchFilters
              filters={filtersData}
              selectedFilters={selectedFilters}
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