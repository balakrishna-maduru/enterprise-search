// src/components/Results/ResultsSection.tsx
import React from 'react';
import { Search, CheckSquare, Square, Download } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { useUnifiedUser } from "../../hooks/useUnifiedUser";
import { useBranding } from '../../contexts/BrandingContext';
import EnhancedResultCard from './EnhancedResultCard';
import LoadingSpinner from '../Common/LoadingSpinner';

const ResultsSection: React.FC = () => {
  const {
    searchQuery,
    searchResults,
    isLoading,
    selectedResults,
    toggleResultSelection,
    selectAllResults,
    generateComprehensiveSummary,
    searchType
  } = useSearch();
  
  const { currentUser } = useUnifiedUser();
  const { getColor } = useBranding();

  const isAllSelected = searchResults.length > 0 && selectedResults.length === searchResults.length;
  const hasSelection = selectedResults.length > 0;

  const handleSelectAll = () => {
    selectAllResults();
  };

  const handleGenerateSummary = async () => {
    if (selectedResults.length > 0 && currentUser) {
      try {
        await generateComprehensiveSummary(selectedResults, currentUser);
      } catch (error) {
        console.error('Failed to generate summary:', error);
      }
    }
  };

  const getResultTypeLabel = () => {
    switch (searchType) {
      case 'employees': return 'employee';
      case 'documents': return 'document';
      default: return 'result';
    }
  };

  if (!searchQuery && searchResults.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No search yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start by entering a search query above.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (searchQuery && searchResults.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search terms or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchResults.length} {getResultTypeLabel()}{searchResults.length !== 1 ? 's' : ''} found
              </h2>
              
              <button
                onClick={handleSelectAll}
                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 mr-1" />
                ) : (
                  <Square className="w-4 h-4 mr-1" />
                )}
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {hasSelection && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedResults.length} selected
                </span>
                <button
                  onClick={handleGenerateSummary}
                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Generate Summary
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="space-y-4">
        {searchResults.map((result, index) => (
          <EnhancedResultCard
            key={`${result.id}-${index}`}
            result={result}
            isSelected={selectedResults.some(selected => selected.id === result.id)}
            onSelect={toggleResultSelection}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsSection;
