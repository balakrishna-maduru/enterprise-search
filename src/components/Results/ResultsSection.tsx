// src/components/Results/ResultsSection.tsx
import React from 'react';
import { Search, CheckSquare, Square } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { useUser } from "../../hooks/useUser";
import { useBranding } from '../../contexts/BrandingContext';
import EnhancedResultCard from './EnhancedResultCard';
import EnhancedSummaryButton from './EnhancedSummaryButton';
import SummaryDisplay from './SummaryDisplay';
import LoadingSpinner from '../Common/LoadingSpinner';
import Pagination from '../Common/Pagination';
import type { SearchResult, User as UserType } from '../../types';

interface SummaryOptions {
  type: 'quick' | 'detailed' | 'executive';
  format: 'text' | 'markdown' | 'pdf';
  includeMetadata: boolean;
  includeSources: boolean;
  maxLength?: number;
}

const ResultsSection: React.FC = () => {
  const {
    searchQuery,
    searchResults,
    isLoading,
    selectedResults,
    toggleResultSelection,
    selectAllResults,
    generateComprehensiveSummary,
    generatedSummary,
    showSummary,
    setShowSummary,
    searchType,
    pagination,
    goToPage,
    nextPage,
    previousPage
  } = useSearch();
  
  const { user: currentUser } = useUser();
  const { getColor } = useBranding();

  const isAllSelected = searchResults.length > 0 && selectedResults.length === searchResults.length;
  const hasSelection = selectedResults.length > 0;

  const handleSelectAll = () => {
    selectAllResults();
  };

  const handleGenerateSummary = async (
    results: SearchResult[], 
    user: UserType, 
    options: SummaryOptions
  ): Promise<string> => {
    if (results.length > 0 && user) {
      try {
        // Enhanced summary generation with options
        console.log('Generating enhanced summary with options:', options);
        const summary = await generateComprehensiveSummary(results, user);
        
        // You could extend this to use the options for different summary types
        return summary;
      } catch (error) {
        console.error('Failed to generate summary:', error);
        throw error;
      }
    }
    return '';
  };

  const getResultTypeLabel = () => {
    switch (searchType) {
      case 'employees': return 'employee';
      case 'documents': return 'document';
      default: return 'result';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (searchResults.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {searchQuery ? 'No results found' : 'No documents found'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery 
            ? 'Try adjusting your search terms or filters.' 
            : 'No documents available to display. Try adding some content to your search index.'
          }
        </p>
      </div>
    );
  }

  // Show results if we have any (including default documents when no search query)
  return (
    <div className="space-y-6">
      {/* Enhanced Summary Display with better positioning */}
      {showSummary && generatedSummary && (
        <div className="relative z-10">
          {/* Backdrop for emphasis */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl blur-xl opacity-50 -z-10 transform scale-105" />
          
          <SummaryDisplay
            summary={generatedSummary}
            metadata={{
              type: 'detailed',
              documentsCount: selectedResults.length,
              generatedAt: new Date(),
              userLn: currentUser?.name || 'Unknown User',
              sources: selectedResults.map((r: SearchResult) => r.title)
            }}
            onClose={() => setShowSummary(false)}
            className="relative z-20 mb-8 mx-auto max-w-5xl"
          />
          
          {/* Visual separator */}
          <div className="mt-8 mb-6 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <div className="px-4 text-sm text-gray-500 bg-gray-50 rounded-full border">
              Search Results Below
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Results Header - Match Landing Page Style */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🔍 Search Results
        </h2>
        <div className="flex items-center gap-4">
          {pagination.totalResults ? (
            <span className="text-sm text-gray-500">
              Showing {Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalResults)}-{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalResults)} of {pagination.totalResults}
            </span>
          ) : (
            <span className="text-sm text-gray-500">
              {searchResults.length} results
            </span>
          )}
        </div>
      </div>

      {/* Selection Controls */}
      {searchResults.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 mr-2" />
              ) : (
                <Square className="w-4 h-4 mr-2" />
              )}
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
            
            {hasSelection && (
              <span className="text-sm text-blue-700">
                {selectedResults.length} {selectedResults.length === 1 ? 'document' : 'documents'} selected
              </span>
            )}
          </div>

          {hasSelection && currentUser && (
            <div className="flex items-center space-x-2">
              <EnhancedSummaryButton
                selectedResults={selectedResults}
                currentUser={currentUser}
                onGenerateSummary={handleGenerateSummary}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      )}

      {searchResults.length > 0 ? (
        <>
          {/* Results List - Exact Same Style as Landing Page */}
          <div className="space-y-4">
            {searchResults.map((result: SearchResult, index: number) => (
              <div key={`${result.id}-${index}`} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Selection Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <button
                        onClick={() => toggleResultSelection(result)}
                        className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
                          selectedResults.some((selected: SearchResult) => selected.id === result.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {selectedResults.some((selected: SearchResult) => selected.id === result.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Document Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer mb-2">
                        {result.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {result.summary || result.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {result.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {result.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(result.timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
                          </svg>
                          {result.source}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score and Type Badges */}
                  <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                    {result.score && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Score: {Math.round(result.score)}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      result.content_type === 'guide' ? 'bg-blue-100 text-blue-800' :
                      result.content_type === 'policy' ? 'bg-purple-100 text-purple-800' :
                      result.content_type === 'report' ? 'bg-orange-100 text-orange-800' :
                      result.content_type === 'employee' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {result.content_type || 'document'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls - Exact Same Style as Landing Page */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 py-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={previousPage}
                  disabled={pagination.currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const distance = Math.abs(page - pagination.currentPage);
                      return distance === 0 || distance <= 2 || page === 1 || page === pagination.totalPages;
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 py-1 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => goToPage(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              pagination.currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={nextPage}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500">Try adjusting your search or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;
