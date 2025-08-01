// src/components/Documents/UnifiedDocumentsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useUnifiedUser } from '../../hooks/useUnifiedUser';
import { apiService } from '../../services/api_service';
import { SearchResult, User } from '../../types';
import LoadingSpinner from '../Common/LoadingSpinner';
import SummaryDisplay from '../Results/SummaryDisplay';
import { EmployeeSearchResults } from '../Employee/EmployeeSearchResults';
import { SearchResultsSummary } from '../Search/SearchResultsSummary';

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
    generateComprehensiveSummary,
    generatedSummary,
    showSummary,
    setShowSummary,
    selectedFilters,
    setSelectedFilters
  } = useSearch();
  
  const { currentUser } = useUnifiedUser();
  
  // Local state for unified component
  const [documents, setDocuments] = useState<SearchResult[]>([]);
  const [employeeResults, setEmployeeResults] = useState<SearchResult[]>([]);
  const [documentSummaries, setDocumentSummaries] = useState<{[key: string]: string}>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const resultsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  // Load documents and employees based on search query
  const loadDocuments = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * resultsPerPage;
      let response;
      
      if (searchQuery && searchQuery.trim() !== '') {
        // Search mode - search with query and filters
        
        // Search employees first using API
        try {
          const employeeSearchResults = await apiService.searchEmployees(searchQuery, 10, 1);
          setEmployeeResults(employeeSearchResults);
        } catch (employeeError) {
          console.warn('⚠️ Employee search failed:', employeeError);
          setEmployeeResults([]);
        }
        
        // Then search documents
        response = await apiService.searchDocumentsWithFilters(
          searchQuery, 
          resultsPerPage, 
          currentUser, 
          offset,
          {
            source: selectedFilters.source,
            contentType: selectedFilters.contentType,
            dateRange: selectedFilters.dateRange,
            author: selectedFilters.author,
            tags: selectedFilters.tags
          }
        );
      } else {
        // Landing mode - no employee results and load default documents with filters if any are applied
        setEmployeeResults([]);
        
        const hasActiveFilters = 
          selectedFilters.source.length > 0 || 
          selectedFilters.contentType.length > 0 || 
          selectedFilters.dateRange !== 'all' ||
          (selectedFilters.author && selectedFilters.author.length > 0) ||
          (selectedFilters.tags && selectedFilters.tags.length > 0);
          
        if (hasActiveFilters) {
          // Apply filters to default documents
          response = await apiService.searchDocumentsWithFilters(
            '', 
            resultsPerPage, 
            currentUser, 
            offset,
            {
              source: selectedFilters.source,
              contentType: selectedFilters.contentType,
              dateRange: selectedFilters.dateRange,
              author: selectedFilters.author,
              tags: selectedFilters.tags
            }
          );
        } else {
          // No filters, use original method
          response = await apiService.searchDocumentsOnly('', resultsPerPage, currentUser, offset);
        }
      }
      
      setDocuments(response.results);
      setTotalResults(response.total || response.results.length);
      
      console.log('✅ Documents loaded:', response.results.length, 'Query:', searchQuery || '(empty - landing mode)', 'Filters:', selectedFilters);
    } catch (err) {
      console.error('❌ Failed to load documents:', err);
      setError('Failed to load documents');
      
      // Fallback to mock data
      const mockDocuments: SearchResult[] = [
        {
          id: 'doc-1',
          title: 'Welcome to Enterprise Search',
          content: 'Learn how to effectively use our enterprise search platform to find information across your organization.',
          summary: 'Introduction guide to the enterprise search platform and its features.',
          source: 'Knowledge Base',
          author: 'System Admin',
          department: 'IT',
          content_type: 'guide',
          tags: ['guide', 'welcome', 'search'],
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          url: '#',
          score: 100
        },
        {
          id: 'doc-2',
          title: 'Company Policies and Procedures',
          content: 'Comprehensive guide to company policies, procedures, and best practices for all employees.',
          summary: 'Essential company policies and procedures that every employee should know.',
          source: 'HR Portal',
          author: 'HR Team',
          department: 'Human Resources',
          content_type: 'policy',
          tags: ['policy', 'hr', 'procedures'],
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          url: '#',
          score: 95
        }
      ];
      
      // Simulate pagination for mock data
      const startIndex = (page - 1) * resultsPerPage;
      const endIndex = startIndex + resultsPerPage;
      setDocuments(mockDocuments.slice(startIndex, endIndex));
      setTotalResults(mockDocuments.length);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentUser, selectedFilters]);

  // Load documents when search query changes, page changes, or filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search query or filters change
    loadDocuments(1);
  }, [searchQuery, selectedFilters, loadDocuments]);

  // Load documents when page changes
  useEffect(() => {
    loadDocuments(currentPage);
  }, [currentPage, loadDocuments]);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSelectAll = () => {
    // Selection functionality removed
  };

  const handleContactEmployee = (employee: SearchResult) => {
    // Extract email from employee_data or use url field
    const email = employee.employee_data?.email || employee.url?.replace('mailto:', '') || '';
    if (email) {
      window.location.href = `mailto:${email}?subject=Hello from Enterprise Search`;
    }
  };

    // Document summarization
  const handleSummarizeDocument = async (documentId: string) => {
    if (documentSummaries[documentId]) {
      // Toggle off - remove summary
      const newSummaries = { ...documentSummaries };
      delete newSummaries[documentId];
      setDocumentSummaries(newSummaries);
      return;
    }

    // Start loading
    const newLoadingSet = new Set(loadingSummaries);
    newLoadingSet.add(documentId);
    setLoadingSummaries(newLoadingSet);

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock summary generation
      const summaryTemplates = [
        "This document provides comprehensive guidelines and best practices for the specified topic, including key recommendations and implementation strategies.",
        "A detailed analysis covering the main aspects of the subject matter, with actionable insights and practical considerations for stakeholders.",
        "This resource outlines essential procedures and requirements, featuring step-by-step instructions and important compliance information.",
        "An informative document that presents key findings, methodologies, and conclusions relevant to the topic area.",
        "This guide contains important policy information, standards, and procedures that should be followed by all relevant personnel."
      ];
      
      const randomSummary = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];
      
      // Add summary to the object
      setDocumentSummaries({
        ...documentSummaries,
        [documentId]: randomSummary
      });
      
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      // Stop loading
      const newLoadingSet = new Set(loadingSummaries);
      newLoadingSet.delete(documentId);
      setLoadingSummaries(newLoadingSet);
    }
  };

  // Document chat
  const handleStartChat = (document: SearchResult) => {
    if (onNavigateToChat) {
      onNavigateToChat(document);
    }
  };

  const generateMockSummary = (document: SearchResult): string => {
    // Generate a mock summary based on the document
    const content = document.content || document.summary || document.title;
    const type = document.content_type || 'document';
    const author = document.author || 'Unknown';
    
    const summaries = [
      `This ${type} by ${author} discusses key concepts and provides important insights. The main topics covered include strategic planning, implementation guidelines, and best practices. Key takeaways focus on process optimization and team collaboration.`,
      `A comprehensive ${type} that outlines essential procedures and methodologies. The document covers fundamental principles, practical applications, and detailed examples. It serves as a valuable resource for understanding current practices and future developments.`,
      `This ${type} presents detailed analysis and recommendations based on current research. It addresses critical challenges and proposes effective solutions. The content emphasizes data-driven decision making and strategic implementation approaches.`,
      `An informative ${type} that provides in-depth coverage of important topics. The material includes theoretical foundations, practical examples, and actionable recommendations. It's designed to help readers understand complex concepts and apply them effectively.`
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={className}>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {searchQuery && searchQuery.trim() !== '' ? (
                  <>
                    🔍 Search Results
                  </>
                ) : (
                  <>
                    📋 Available Documents
                  </>
                )}
              </h2>
              {(totalResults > 0 || employeeResults.length > 0) && (
                <p className="text-sm text-gray-600 mt-1">
                  {searchQuery && searchQuery.trim() !== '' ? (
                    <>
                      {employeeResults.length > 0 && `${employeeResults.length} employee${employeeResults.length === 1 ? '' : 's'}`}
                      {employeeResults.length > 0 && totalResults > 0 && ', '}
                      {totalResults > 0 && `${totalResults} document${totalResults === 1 ? '' : 's'}`}
                      {totalResults > 0 && ` (showing ${startResult}-${endResult})`}
                    </>
                  ) : (
                    `Showing ${startResult}-${endResult} of ${totalResults} documents`
                  )}
                </p>
              )}
            </div>
          </div>

        {/* Summary Display */}
        {showSummary && generatedSummary && (
          <div className="mb-6">
            <SummaryDisplay
              summary={generatedSummary}
              metadata={{
                type: 'detailed',
                documentsCount: documents.length,
                generatedAt: new Date(),
                sources: documents.map(r => r.source).filter((s, i, arr) => arr.indexOf(s) === i)
              }}
              onClose={() => setShowSummary(false)}
            />
          </div>
        )}
      </div>

      {/* Employee Results Section - Show at top when searching */}
      {searchQuery && searchQuery.trim() !== '' && employeeResults.length > 0 && (
        <EmployeeSearchResults 
          employeeResults={employeeResults}
          maxInitialDisplay={2}
          onContactEmployee={handleContactEmployee}
        />
      )}

      {/* Document Results List */}
      {documents.length > 0 ? (
        <>
          <div className="space-y-4">
            {documents.map((document: SearchResult, index: number) => (
              <div key={`${document.id}-${index}`} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Document Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer mb-2">
                        {document.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {document.summary || document.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {document.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {document.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(document.timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
                          </svg>
                          {document.source}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => handleSummarizeDocument(document.id)}
                        disabled={loadingSummaries.has(document.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingSummaries.has(document.id) ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Summarizing...
                          </>
                        ) : (
                          <>
                            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {documentSummaries[document.id] ? 'Hide Summary' : 'Generate Summary'}
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleStartChat(document)}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Start Chat
                      </button>
                    </div>

                    {/* Document Summary Display */}
                    {documentSummaries[document.id] && (
                      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <h4 className="text-sm font-medium text-blue-800">
                              Document Summary
                            </h4>
                            <p className="mt-2 text-sm text-blue-700">
                              {documentSummaries[document.id]}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score and Type Badges */}
                  <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                    {document.score && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Score: {Math.round(document.score)}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      document.content_type === 'guide' ? 'bg-blue-100 text-blue-800' :
                      document.content_type === 'policy' ? 'bg-purple-100 text-purple-800' :
                      document.content_type === 'report' ? 'bg-orange-100 text-orange-800' :
                      document.content_type === 'employee' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {document.content_type || 'document'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 py-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={previousPage}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const distance = Math.abs(page - currentPage);
                      return distance === 0 || distance <= 2 || page === 1 || page === totalPages;
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
                              currentPage === page
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
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery && searchQuery.trim() !== '' ? 
              (employeeResults.length > 0 ? 'No documents found' : 'No results found') 
              : 'No documents available'
            }
          </h3>
          <p className="text-gray-500">
            {searchQuery && searchQuery.trim() !== '' 
              ? (employeeResults.length > 0 ? 
                  'Found employees but no matching documents. Try adjusting your search terms.' :
                  'Try adjusting your search terms or check back later.'
                )
              : 'No documents found to display. Check back later.'}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      </div>
  );
};

export default UnifiedDocumentsPage;
