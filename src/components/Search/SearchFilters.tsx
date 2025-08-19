// src/components/Search/SearchFilters.tsx


import React, { useRef, useEffect } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../../types';

interface FilterDef {
  name: string;
  values: { [value: string]: number };
}

interface SearchFiltersProps {
  filters: FilterDef[];
  selectedFilters: SearchFiltersType;
  onFiltersChange: (selected: SearchFiltersType) => void;
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



  const toggleArrayFilter = (filterName: keyof SearchFiltersType, value: string) => {
    // Only handle array fields
    const currentArray = Array.isArray(selectedFilters[filterName]) ? (selectedFilters[filterName] as string[]) : [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    onFiltersChange({
      ...selectedFilters,
      [filterName]: newArray
    });
  };


  const clearAllFilters = () => {
    const cleared: SearchFiltersType = {
      ...selectedFilters,
      source: [],
      contentType: [],
      author: [],
      tags: [],
      // dateRange: keep as is or reset to 'all'
      dateRange: 'all',
    };
    onFiltersChange(cleared);
  };


  const hasActiveFilters = filters.some(f => Array.isArray(selectedFilters[f.name as keyof SearchFiltersType]) && (selectedFilters[f.name as keyof SearchFiltersType] as string[]).length > 0);
  const activeFiltersCount = filters.reduce((acc, f) => acc + (Array.isArray(selectedFilters[f.name as keyof SearchFiltersType]) ? (selectedFilters[f.name as keyof SearchFiltersType] as string[]).length : 0), 0);

  if (!isOpen) return null;

  // Sidebar layout: no absolute/fixed width, always visible, full width
  return (
    <div ref={dropdownRef} className={`bg-white rounded-lg border border-gray-200 shadow w-full ${className}`}>
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
      {/* Dynamic Filter Content: stack all filter groups */}
      <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
        {filters.map(filter => (
          <div key={filter.name} className="mb-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {filter.name.charAt(0).toUpperCase() + filter.name.slice(1)} {(Array.isArray(selectedFilters[filter.name as keyof SearchFiltersType]) ? `(${(selectedFilters[filter.name as keyof SearchFiltersType] as string[]).length} selected)` : '')}
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-100 rounded p-2 bg-gray-50">
              {Object.entries(filter.values).map(([value, count]) => (
                <label key={value} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={Array.isArray(selectedFilters[filter.name as keyof SearchFiltersType]) ? (selectedFilters[filter.name as keyof SearchFiltersType] as string[]).includes(value) : false}
                    onChange={() => toggleArrayFilter(filter.name as keyof SearchFiltersType, value)}
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
