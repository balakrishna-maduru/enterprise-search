// src/components/Search/DualSearchResults.tsx
import React from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { SearchResult } from '../../types';

interface DualSearchResultsProps {
  className?: string;
}

const ResultCard: React.FC<{ result: SearchResult, section: 'employees' | 'documents' }> = ({ result, section }) => {
  const isEmployee = result.content_type === 'employee' || section === 'employees';
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
      isEmployee ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {result.title}
          </h3>
          
          {isEmployee && result.employee_data && (
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {result.employee_data.title}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {result.employee_data.department}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Level {result.employee_data.level}
              </span>
            </div>
          )}
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {result.summary || result.content}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>{result.source}</span>
              <span>{result.author}</span>
              {result.score && (
                <span className="font-medium">Score: {Math.round(result.score)}</span>
              )}
            </div>
            {isEmployee && result.employee_data?.email && (
              <a 
                href={`mailto:${result.employee_data.email}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DualSearchResults: React.FC<DualSearchResultsProps> = ({ className = '' }) => {
  const {
    employeeResults,
    documentResults,
    employeeTotal,
    documentTotal,
    isDualSearchMode,
    isLoading,
    searchQuery
  } = useSearch();

  if (!isDualSearchMode) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasResults = employeeResults.length > 0 || documentResults.length > 0;
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Query Info */}
      {searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Search results for:</span> "{searchQuery}"
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Found {employeeTotal} employees and {documentTotal} documents
          </p>
        </div>
      )}

      {!hasResults ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500">Try adjusting your search terms or check your connection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employees Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                People
              </h2>
              <span className="text-sm text-gray-500">
                {employeeResults.length} of {employeeTotal}
              </span>
            </div>
            
            <div className="space-y-3">
              {employeeResults.length > 0 ? (
                employeeResults.map((result: SearchResult) => (
                  <ResultCard key={result.id} result={result} section="employees" />
                ))
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500">No employees found</p>
                </div>
              )}
            </div>
            
            {employeeTotal > employeeResults.length && (
              <div className="text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View all {employeeTotal} employees →
                </button>
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents
              </h2>
              <span className="text-sm text-gray-500">
                {documentResults.length} of {documentTotal}
              </span>
            </div>
            
            <div className="space-y-3">
              {documentResults.length > 0 ? (
                documentResults.map((result: SearchResult) => (
                  <ResultCard key={result.id} result={result} section="documents" />
                ))
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500">No documents found</p>
                </div>
              )}
            </div>
            
            {documentTotal > documentResults.length && (
              <div className="text-center">
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View all {documentTotal} documents →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
