// src/components/Search/SearchFilters.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  filters: {
    source: string[];
    dateRange: string;
    contentType: string[];
    author?: string[];
    tags?: string[];
  };
  onFiltersChange: (filters: any) => void;
  availableOptions?: {
    sources?: string[];
    contentTypes?: string[];
    authors?: string[];
    tags?: string[];
  };
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  availableOptions = {},
  className = '',
  isOpen,
  onToggle
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    sources = ['Knowledge Base', 'HR Portal', 'Engineering', 'Sales', 'Marketing', 'Legal', 'Finance'],
    contentTypes = ['guide', 'policy', 'report', 'document', 'ticket'],
    authors = ['System Admin', 'HR Team', 'Engineering Team', 'Sales Team'],
    tags = ['important', 'urgent', 'guide', 'policy', 'procedure']
  } = availableOptions;

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

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

  const updateFilter = (filterType: string, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const toggleArrayFilter = (filterType: string, value: string) => {
    const currentArray = filters[filterType as keyof typeof filters] as string[] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(filterType, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      source: [],
      dateRange: 'all',
      contentType: [],
      author: [],
      tags: []
    });
  };

  const hasActiveFilters = 
    filters.source.length > 0 || 
    filters.contentType.length > 0 || 
    filters.dateRange !== 'all' || 
    (filters.author && filters.author.length > 0) ||
    (filters.tags && filters.tags.length > 0);

  const activeFiltersCount = 
    filters.source.length + 
    filters.contentType.length + 
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.author?.length || 0) +
    (filters.tags?.length || 0);

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

      {/* Filter Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">{/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter('dateRange', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source ({filters.source.length} selected)
          </label>
          <div className="space-y-1 max-h-24 overflow-y-auto border border-gray-200 rounded p-2">
            {sources.map(source => (
              <label key={source} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.source.includes(source)}
                  onChange={() => toggleArrayFilter('source', source)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-gray-700">{source}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Content Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type ({filters.contentType.length} selected)
          </label>
          <div className="space-y-1">
            {contentTypes.map(type => (
              <label key={type} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.contentType.includes(type)}
                  onChange={() => toggleArrayFilter('contentType', type)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-gray-700 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Author Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author ({filters.author?.length || 0} selected)
          </label>
          <div className="space-y-1 max-h-20 overflow-y-auto border border-gray-200 rounded p-2">
            {authors.map(author => (
              <label key={author} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.author?.includes(author) || false}
                  onChange={() => toggleArrayFilter('author', author)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-gray-700">{author}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags ({filters.tags?.length || 0} selected)
          </label>
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleArrayFilter('tags', tag)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  filters.tags?.includes(tag)
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
