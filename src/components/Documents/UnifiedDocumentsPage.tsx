// src/components/Documents/UnifiedDocumentsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useUser } from '../../hooks/useUser';
import { usePagination } from '../../hooks/usePagination';
import { apiService } from '../../services/api_service';
import { SearchResult } from '../../types';
import DocumentGrid from './DocumentGrid';
import SearchHeader from './SearchHeader';
import { EmployeeSearchResults } from '../Employee/EmployeeSearchResults';
import { SearchResultsSummary } from '../Search/SearchResultsSummary';
import { Button } from '../UI';
import Pagination from '../Common/Pagination';
import LoadingSpinner from '../Common/LoadingSpinner';

interface UnifiedDocumentsPageProps {
  className?: string;
  onNavigateToChat?: (document?: any) => void;
  onNavigateToSummary?: (document?: any) => void;
}

export const UnifiedDocumentsPage: React.FC<UnifiedDocumentsPageProps> = ({ 
  className = '', 
  onNavigateToChat,
  onNavigateToSummary 
}) => {
  const { 
    searchQuery, 
    selectedFilters
  } = useSearch();
  
  const { user: currentUser } = useUser();
  
  // Local state
  const [documents, setDocuments] = useState<SearchResult[]>([]);
  const [employees, setEmployees] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const resultsPerPage = 10;
  const pagination = usePagination(totalResults, resultsPerPage);

  // Add immediate visual feedback
  console.log('🏗️ UnifiedDocumentsPage rendered with:', {
    searchQuery,
    currentUser: currentUser?.name,
    documents: documents.length,
    employees: employees.length,
    isLoading
  });

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const offset = (pagination.currentPage - 1) * resultsPerPage;
      
      if (searchQuery.trim()) {
        // Search mode - get both documents and employees
        const [docsResponse, empsResponse] = await Promise.all([
          apiService.searchDocumentsOnly(searchQuery, resultsPerPage, currentUser, offset),
          apiService.searchEmployeesOnly(searchQuery, resultsPerPage, currentUser, 0)
        ]);
        
        setDocuments(docsResponse.results);
        setEmployees(empsResponse.results);
        setTotalResults(docsResponse.total + empsResponse.total);
            } else {
        // Browse mode - get documents only
        const response = await apiService.searchDocumentsOnly('', resultsPerPage, currentUser, offset);
        setDocuments(response.results);
        setEmployees([]);
        setTotalResults(response.total);
      }
    } catch (err) {
      console.error('❌ Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentUser, selectedFilters, pagination.currentPage, resultsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset pagination when search changes
  useEffect(() => {
    pagination.reset();
  }, [searchQuery, selectedFilters]);

  const handleDocumentClick = useCallback((document: SearchResult) => {
    if (onNavigateToChat) {
      onNavigateToChat(document);
    }
  }, [onNavigateToChat]);

  const handleChatWithDocument = useCallback((document: SearchResult) => {
    if (onNavigateToChat) {
      onNavigateToChat(document);
    }
  }, [onNavigateToChat]);

  const handleSummarize = useCallback(async (document: SearchResult) => {
    setIsSummarizing(true);
    try {
      // TODO: Call actual summarization API
      console.log('Summarizing document:', document.title);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just navigate to summary with document context
      if (onNavigateToSummary) {
        onNavigateToSummary({
          type: 'summary',
          document: document,
          title: `Summary of ${document.title}`
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsSummarizing(false);
    }
  }, [onNavigateToSummary]);

  const getHeaderTitle = () => {
    if (searchQuery.trim()) {
      return `Search Results for "${searchQuery}"`;
    }
    return 'Available Content';
  };


  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={loadData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      
      {/* Header */}
      <SearchHeader
        title={getHeaderTitle()}
        totalResults={totalResults}
      />

      {/* Search Summary */}
      {searchQuery.trim() && (
        <SearchResultsSummary
          totalResults={totalResults}
          documentCount={documents.length}
          employeeCount={employees.length}
          isSearchActive={!!searchQuery.trim()}
        />
      )}

      {/* Employee Results */}
      {employees.length > 0 && (
        <div className="mb-8">
                  {employees.length > 0 && (
          <EmployeeSearchResults 
            employeeResults={employees}
          />
        )}
        </div>
      )}

      {/* Documents Grid */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <DocumentGrid
            documents={documents}
            onDocumentClick={handleDocumentClick}
            onSummarizeDocument={handleSummarize}
            onChatWithDocument={handleChatWithDocument}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Pagination */}
      {totalResults > resultsPerPage && (
        <div className="flex justify-center">
          <Pagination
            pagination={{
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              totalResults: totalResults,
              pageSize: resultsPerPage,
              hasNextPage: pagination.hasNextPage,
              hasPreviousPage: pagination.hasPreviousPage
            }}
            onPageChange={pagination.goToPage}
            onNext={pagination.nextPage}
            onPrevious={pagination.previousPage}
          />
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};
