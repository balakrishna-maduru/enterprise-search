// src/components/Documents/SearchHeader.tsx
import React from 'react';
import { Button, Icon } from '../UI';

interface SearchHeaderProps {
  title: string;
  subtitle?: string;
  totalResults?: number;
  className?: string;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  title,
  subtitle,
  totalResults,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {totalResults !== undefined && (
            <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
              {totalResults.toLocaleString()} results
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default SearchHeader;
