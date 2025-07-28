// src/components/Search/SearchBar.js
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';

const SearchBar = () => {
  const { searchQuery, setSearchQuery, showFilters, setShowFilters } = useSearch();

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <svg 
          className="w-6 h-6 text-red-500" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          style={{ minWidth: '24px', minHeight: '24px' }}
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search or ask: 'What bugs are affecting payments?' or 'Show me Q3 roadmap items'"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
      />
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
          showFilters ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SearchBar;