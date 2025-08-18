// src/components/Search/SearchFilters.tsx

import React, { useRef, useEffect } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';

interface FilterDef {
  name: string;
  values: { [value: string]: number };
}

interface SearchFiltersProps {
  filters: FilterDef[];
  selectedFilters: { [filterName: string]: string[] };
  onFiltersChange: (selected: { [filterName: string]: string[] }) => void;
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
}


const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  selectedFilters,
  onFiltersChange,
  className = '',
  isOpen,
  onToggle
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);


  const toggleArrayFilter = (filterName: string, value: string) => {
    const currentArray = selectedFilters[filterName] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    onFiltersChange({
      ...selectedFilters,
      [filterName]: newArray
    });
  };

  const clearAllFilters = () => {
    const cleared: { [filterName: string]: string[] } = {};
    filters.forEach(f => { cleared[f.name] = []; });
    onFiltersChange(cleared);
  };

  const hasActiveFilters = filters.some(f => (selectedFilters[f.name]?.length ?? 0) > 0);
  const activeFiltersCount = filters.reduce((acc, f) => acc + (selectedFilters[f.name]?.length ?? 0), 0);

  if (!isOpen) return null;


  return (
    <div ref={dropdownRef} className={`absolute top-12 right-0 bg-white rounded-lg border border-gray-200 shadow-lg z-50 w-80 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <span className="font-medium text-gray-700">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>
      {/* Dynamic Filter Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {filters.map(filter => (
          <div key={filter.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.name.charAt(0).toUpperCase() + filter.name.slice(1)} ({selectedFilters[filter.name]?.length || 0} selected)
            </label>
            <div className="space-y-1 max-h-24 overflow-y-auto border border-gray-200 rounded p-2">
              {Object.entries(filter.values).map(([value, count]) => (
                <label key={value} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFilters[filter.name]?.includes(value) || false}
                    onChange={() => toggleArrayFilter(filter.name, value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-gray-700">{value} <span className="text-gray-400">({count})</span></span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchFilters;
