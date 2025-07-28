// src/components/Search/SearchFilters.js
import React from 'react';
import { useSearch } from '../../contexts/SearchContext';

const SearchFilters = () => {
  const { selectedFilters, setSelectedFilters, showFilters } = useSearch();

  if (!showFilters) return null;

  const handleSourceChange = (source, checked) => {
    setSelectedFilters(prev => ({
      ...prev,
      source: checked 
        ? [...prev.source, source]
        : prev.source.filter(s => s !== source)
    }));
  };

  const handleContentTypeChange = (type, checked) => {
    setSelectedFilters(prev => ({
      ...prev,
      contentType: checked 
        ? [...prev.contentType, type]
        : prev.contentType.filter(t => t !== type)
    }));
  };

  const handleDateRangeChange = (range) => {
    setSelectedFilters(prev => ({ ...prev, dateRange: range }));
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
          <div className="space-y-2">
            {['jira', 'confluence', 'sharepoint'].map(source => (
              <label key={source} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={selectedFilters.source.includes(source)}
                  onChange={(e) => handleSourceChange(source, e.target.checked)}
                />
                <span className="ml-2 text-sm capitalize">{source}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            value={selectedFilters.dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="week">Last week</option>
            <option value="month">Last month</option>
            <option value="quarter">Last quarter</option>
          </select>
        </div>

        {/* Content Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
          <div className="space-y-2">
            {['document', 'ticket', 'task', 'policy'].map(type => (
              <label key={type} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={selectedFilters.contentType.includes(type)}
                  onChange={(e) => handleContentTypeChange(type, e.target.checked)}
                />
                <span className="ml-2 text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;