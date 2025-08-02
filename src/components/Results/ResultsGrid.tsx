// src/components/Results/ResultsGrid.tsx
import React from 'react';
import { SearchResult } from '../../types';
import ResultCard from './ResultCard';

interface ResultsGridProps {
  results: SearchResult[];
  selectedResults: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
  isLoading?: boolean;
  className?: string;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({
  results,
  selectedResults,
  onResultSelect,
  isLoading = false,
  className = ''
}) => {
  const isSelected = (result: SearchResult) => {
    return selectedResults.some(selected => selected.id === result.id);
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500">Try adjusting your search query or filters.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {results.map((result) => (
        <ResultCard
          key={result.id}
          result={result}
          isSelected={isSelected(result)}
          onSelect={onResultSelect}
        />
      ))}
    </div>
  );
};

export default ResultsGrid;
