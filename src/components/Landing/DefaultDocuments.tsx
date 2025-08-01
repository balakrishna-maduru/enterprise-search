// src/components/Landing/DefaultDocuments.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api_service';
import { useUnifiedUser } from '../../hooks/useUnifiedUser';
import { SearchResult } from '../../types';

interface DefaultDocumentsProps {
  className?: string;
}

const DocumentCard: React.FC<{ document: SearchResult }> = ({ document }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {document.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {document.summary || document.content}
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {document.content_type}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {document.source}
            </span>
            {document.score && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Score: {Math.round(document.score)}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>By {document.author}</span>
              <span>{document.department}</span>
            </div>
            <span>{new Date(document.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DefaultDocuments: React.FC<DefaultDocumentsProps> = ({ className = '' }) => {
  const { currentUser } = useUnifiedUser();
  const [documents, setDocuments] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const resultsPerPage = 10;

  useEffect(() => {
    const loadDefaultDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get documents only (excluding employees) with pagination
        const response = await apiService.searchDocumentsOnly('', resultsPerPage, currentUser, (currentPage - 1) * resultsPerPage);
        setDocuments(response.results);
        setTotalResults(response.total || response.results.length);
        
        console.log('✅ Default documents loaded:', response.results.length);
      } catch (err) {
        console.error('❌ Failed to load default documents:', err);
        setError('Failed to load documents');
        
        // Fallback to mock data with pagination simulation
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
            tags: ['policy', 'procedures', 'hr'],
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            url: '#',
            score: 95
          },
          {
            id: 'doc-3',
            title: 'Q4 Financial Report',
            content: 'Quarterly financial performance report including revenue, expenses, and growth metrics.',
            summary: 'Q4 financial results showing strong performance across all business units.',
            source: 'Finance Portal',
            author: 'Finance Team',
            department: 'Finance',
            content_type: 'report',
            tags: ['finance', 'quarterly', 'report'],
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            url: '#',
            score: 90
          },
          {
            id: 'doc-4',
            title: 'Product Roadmap 2025',
            content: 'Strategic product roadmap outlining key features and milestones for the upcoming year.',
            summary: 'Product development roadmap with planned features and release timeline.',
            source: 'Product Portal',
            author: 'Product Team',
            department: 'Product',
            content_type: 'roadmap',
            tags: ['product', 'roadmap', '2025'],
            timestamp: new Date(Date.now() - 345600000).toISOString(),
            url: '#',
            score: 88
          },
          {
            id: 'doc-5',
            title: 'Security Best Practices',
            content: 'Essential security guidelines and best practices for protecting company data and systems.',
            summary: 'Security protocols and best practices for maintaining data integrity.',
            source: 'Security Portal',
            author: 'Security Team',
            department: 'Security',
            content_type: 'guide',
            tags: ['security', 'best-practices', 'data'],
            timestamp: new Date(Date.now() - 432000000).toISOString(),
            url: '#',
            score: 85
          },
          {
            id: 'doc-6',
            title: 'Remote Work Guidelines',
            content: 'Guidelines and tools for effective remote work, including communication protocols and productivity tips.',
            summary: 'Comprehensive guide for remote work success and team collaboration.',
            source: 'HR Portal',
            author: 'HR Team',
            department: 'Human Resources',
            content_type: 'guide',
            tags: ['remote-work', 'guidelines', 'productivity'],
            timestamp: new Date(Date.now() - 518400000).toISOString(),
            url: '#',
            score: 82
          },
          {
            id: 'doc-7',
            title: 'Marketing Campaign Q4',
            content: 'Comprehensive marketing strategy and campaign plans for the fourth quarter.',
            summary: 'Q4 marketing initiatives and promotional strategies.',
            source: 'Marketing Portal',
            author: 'Marketing Team',
            department: 'Marketing',
            content_type: 'campaign',
            tags: ['marketing', 'campaign', 'q4'],
            timestamp: new Date(Date.now() - 604800000).toISOString(),
            url: '#',
            score: 80
          },
          {
            id: 'doc-8', 
            title: 'Employee Handbook 2025',
            content: 'Updated employee handbook with new policies and procedures for 2025.',
            summary: 'Complete guide for employee policies and company culture.',
            source: 'HR Portal',
            author: 'HR Team',
            department: 'Human Resources',
            content_type: 'handbook',
            tags: ['handbook', 'policies', '2025'],
            timestamp: new Date(Date.now() - 691200000).toISOString(),
            url: '#',
            score: 78
          },
          {
            id: 'doc-9',
            title: 'Technical Architecture Overview',
            content: 'System architecture documentation and technical specifications for the platform.',
            summary: 'Technical overview of system architecture and infrastructure.',
            source: 'Engineering Portal',
            author: 'Engineering Team',
            department: 'Engineering',
            content_type: 'technical',
            tags: ['architecture', 'technical', 'system'],
            timestamp: new Date(Date.now() - 777600000).toISOString(),
            url: '#',
            score: 75
          },
          {
            id: 'doc-10',
            title: 'Budget Planning 2025',
            content: 'Annual budget planning and financial forecasting for the upcoming fiscal year.',
            summary: 'Financial planning and budget allocation for 2025.',
            source: 'Finance Portal',
            author: 'Finance Team',
            department: 'Finance',
            content_type: 'budget',
            tags: ['budget', 'planning', '2025'],
            timestamp: new Date(Date.now() - 864000000).toISOString(),
            url: '#',
            score: 72
          }
        ];
        
        // Simulate pagination with mock data
        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = startIndex + resultsPerPage;
        const paginatedResults = mockDocuments.slice(startIndex, endIndex);
        
        setDocuments(paginatedResults);
        setTotalResults(mockDocuments.length);
      } finally {
        setIsLoading(false);
      }
    };

    loadDefaultDocuments();
  }, [currentUser, currentPage]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">📄 Recent Documents</h2>
          <div className="animate-pulse h-4 bg-gray-300 rounded w-24"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && documents.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load documents</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📄 Recent Documents
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Showing {Math.min((currentPage - 1) * resultsPerPage + 1, totalResults)}-{Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults}
          </span>
        </div>
      </div>
      
      {documents.length > 0 ? (
        <>
          {/* Documents List - Simple List Layout */}
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
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
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {document.score && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Score: {Math.round(document.score)}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      document.content_type === 'guide' ? 'bg-blue-100 text-blue-800' :
                      document.content_type === 'policy' ? 'bg-purple-100 text-purple-800' :
                      document.content_type === 'report' ? 'bg-orange-100 text-orange-800' :
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
          {totalResults > resultsPerPage && (
            <div className="flex items-center justify-between mt-8 py-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.ceil(totalResults / resultsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      const distance = Math.abs(page - currentPage);
                      return distance === 0 || distance <= 2 || page === 1 || page === Math.ceil(totalResults / resultsPerPage);
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
                            onClick={() => setCurrentPage(page)}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalResults / resultsPerPage)))}
                  disabled={currentPage === Math.ceil(totalResults / resultsPerPage)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                Page {currentPage} of {Math.ceil(totalResults / resultsPerPage)}
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
