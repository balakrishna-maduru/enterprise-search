// src/components/Documents/UnifiedDocumentsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useUnifiedUser } from '../../hooks/useUnifiedUser';
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
}

export const UnifiedDocumentsPage: React.FC<UnifiedDocumentsPageProps> = ({ 
  className = '', 
  onNavigateToChat 
}) => {
  const { 
    searchQuery, 
    selectedFilters
  } = useSearch();
  
  const { currentUser } = useUnifiedUser();
  
  // Local state
  const [documents, setDocuments] = useState<SearchResult[]>([]);
  const [employees, setEmployees] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  
  const resultsPerPage = 20;
  const pagination = usePagination(totalResults, resultsPerPage);

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

  const handleDocumentClick = (document: SearchResult) => {
    if (onNavigateToChat) {
      onNavigateToChat(document);
    }
  };

  const getHeaderTitle = () => {
    if (searchQuery.trim()) {
      return `Search Results for "${searchQuery}"`;
    }
    return '📄 Recent Documents';
  };

  const getHeaderSubtitle = () => {
    if (searchQuery.trim()) {
      return 'Showing relevant documents and employees';
    }
    return 'Browse the latest documents from across your organization';
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
        subtitle={getHeaderSubtitle()}
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
      <DocumentGrid
        documents={documents}
        onDocumentClick={handleDocumentClick}
        isLoading={isLoading}
      />

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

export default UnifiedDocumentsPage;
