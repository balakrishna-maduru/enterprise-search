// src/components/Search/SearchTypeSelector.tsx
import React from 'react';
import { useSearch } from '../../contexts/SearchContext';

const SearchTypeSelector: React.FC = () => {
  const { searchType, setSearchType } = useSearch();

  const searchTypes = [
    {
      id: 'all' as const,
      label: 'All',
      icon: '🔍',
      description: 'Documents & Employees'
    },
    {
      id: 'documents' as const,
      label: 'Documents',
      icon: '📄',
      description: 'Reports, Policies, etc.'
    },
    {
      id: 'employees' as const,
      label: 'Employees',
      icon: '👥',
      description: 'Staff Directory'
    }
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      {searchTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => setSearchType(type.id)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            searchType === type.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          title={type.description}
        >
          <span className="text-lg">{type.icon}</span>
          <span>{type.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SearchTypeSelector;
