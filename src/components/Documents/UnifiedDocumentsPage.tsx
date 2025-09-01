// src/components/Documents/UnifiedDocumentsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { SummaryService } from '../../services/summary_service';
import { useSearch } from '../../contexts/SearchContext';
import { useUser } from '../../hooks/useUser';
// import { usePagination } from '../../hooks/usePagination';
import { SearchResult } from '../../types';
import DocumentGrid from './DocumentGrid';
import { EmployeeSearchResults } from '../Employee/EmployeeSearchResults';
import { SearchResultsSummary } from '../Search/SearchResultsSummary';
import ResultsPerPage from '../Common/ResultsPerPage';
import { Button } from '../UI';
import Pagination from '../Common/Pagination';
import LoadingSpinner from '../Common/LoadingSpinner';
import SearchFilters from '../Search/SearchFilters';
import MessageRenderer from '../Chat/MessageRenderer'; // Import the new component

interface UnifiedDocumentsPageProps {
  className?: string;
  onNavigateToChat?: (document?: any) => void;
  onNavigateToSummary?: (document?: any) => void;
}

interface ChatResponseData {
  output: string;
  citation?: Array<{ title: string; content: string; url: string; text_used: string }>;
  session_id?: string;
  evaluation?: any;
}

// Helper to generate a simple session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export const UnifiedDocumentsPage: React.FC<UnifiedDocumentsPageProps> = ({ 
  className = '', 
  onNavigateToChat,
  onNavigateToSummary 
}) => {
  const { 
    searchQuery, 
    selectedFilters,
    setSelectedFilters,
    hasSearched,
    documentResults,
    employeeResults,
    isLoading,
    documentTotal,
    employeeTotal,
    pagination, setPageSize, goToPage, nextPage, previousPage
  } = useSearch();
  const { user: currentUser } = useUser();
  // Local state
  const [documents, setDocuments] = useState<SearchResult[]>([]);
  const [employees, setEmployees] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [isSummarizing, setIsSummarizing] = useState(false);
  // New state for chat response, now stores the data object
  const [chatResponseData, setChatResponseData] = useState<ChatResponseData | null>(null);

  // Example filtersData, ensure all values are numbers and no undefineds
  const filtersData = [
    {
      name: 'container',
      values: {
        'Mega Policies Global RMG': 109,
        'Mega Policies Global LCS': 93,
        'Mega Policies SG CBG': 97,
        'Mega Policies Global CBG': 357,
        'Mega Policies IN FIN': 132,
        'ekb-uat-usecase-testing': 1324,
        'Mega Policies HK RMG': 114,
        'Mega Policies Indonesia(ID) RMG': 67,
        'DEAA': 963,
        'Mega Policies TW RMG': 105
      } as { [value: string]: number }
    },
    {
      name: 'author',
      values: {
        'shudong': 732,
        'uladzimir': 26,
        'daoyongl': 18,
        'DBS': 1356,
        'prathimapawar': 20,
        'shiyansu': 13,
        'davidhenningson': 15,
        'amitthakur': 11,
        'leonlee': 12,
        'keerthanap': 14
      } as { [value: string]: number }
    },
    {
      name: 'objectType',
      values: {
        'Article': 1356,
        'page': 963,
        'drive': 1324
      } as { [value: string]: number }
    }
  ];

  // Add immediate visual feedback
  console.log('🏗️ UnifiedDocumentsPage rendered with:', {
    searchQuery,
    currentUser: currentUser?.name,
    documents: documents.length,
    employees: employees.length,
    isLoading
  });

  const loadData = useCallback(() => {
    if (!currentUser || !hasSearched || !searchQuery.trim()) {
      setDocuments([]);
      setEmployees([]);
      setTotalResults(0);
      setChatResponseData(null); // Clear chat response data on empty search
      return;
    }
    // Use context results populated by executeSearch/dual search
    setDocuments(documentResults);
    setEmployees(employeeResults);
    setTotalResults(documentTotal + employeeTotal);
  }, [currentUser, hasSearched, searchQuery, documentResults, employeeResults, documentTotal, employeeTotal]);

  // New function to call the chat API
  const callChatApi = useCallback(async (query: string) => {
    const words = query.trim().split(/\s+/);
    if (words.length > 2) {
      console.log(`Attempting to call chat API for query: "${query}"`);
      
      const requestBody = {
        "session_id": generateSessionId(),
        "input": query,
        "provider": "GCP_CLAUDE",
        "provider_id": "claude-3-5-sonnet@20240620",
        "knnField": "embeddings",
        "rankWindowSize": 50,
        "rankConstant": 20,
        "k": 5,
        "indexName": "datasets-datanaut.ekb.qodo.data-ada.sg.uat", // This might need to be dynamic
        "embeddingModelType": "DBS_QUDO_EMBEDDING_MODEL",
        "numberOfCandidates": 10,
        "temperature": 0.01,
        "embeddingModelHostType": "DBS_HOST_EMBEDDING_MODEL",
        "size": 20,
        "radius": 1,
        "collapseField": "docId",
        "rerank_topk": 5,
        "knowledge_scope": "world"
      };

      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

      try {
        const response = await fetch('http://localhost:8000/api/v1/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.code === 0 && result.data) {
            setChatResponseData(result.data); // Store the entire data object
          } else {
            setChatResponseData({ output: result.msg || 'Unknown error from chat API' });
            console.error('Chat API error:', result.msg);
          }
        } else {
          // Log the full response for debugging 422
          const errorText = await response.text();
          setChatResponseData({ output: `Error from chat API: ${response.status} ${response.statusText}. Details: ${errorText}` });
          console.error('Chat API error:', response.status, response.statusText, errorText);
        }
      } catch (error) {
        setChatResponseData({ output: `Failed to connect to chat API: ${error}` });
        console.error('Chat API connection error:', error);
      }
    } else {
      setChatResponseData(null); // Clear chat response if query is 2 words or less
    }
  }, []);

  useEffect(() => { 
    loadData(); 
    if (hasSearched && searchQuery.trim()) {
      callChatApi(searchQuery);
    }
  }, [loadData, hasSearched, searchQuery, callChatApi]);


  // No need to reset pagination here; handled by context

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

  const summaryService = new SummaryService();
  const handleSummarize = useCallback(async (document: SearchResult) => {
    setIsSummarizing(true);
    try {
      // Call the real summary API
  const result = await summaryService.summarizeById(document.index || '', document.id);
      if (result.success && onNavigateToSummary) {
        onNavigateToSummary({
          type: 'summary',
          document: document,
          title: `Summary of ${document.title}`,
          summary: result.data
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsSummarizing(false);
    }
  }, [onNavigateToSummary]);

  const getHeaderTitle = () => {
    if (searchQuery.trim()) return `Search Results for "${searchQuery}"`;
    return 'Results';
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
    <div className={`flex flex-row w-full max-w-7xl mx-auto ${className}`}>
      {/* Main content */}
      <div className="flex-1 pr-8 space-y-8">
        {/* Search Summary */}
        {hasSearched && searchQuery.trim() && (
          <div className="flex justify-between items-center">
            <SearchResultsSummary
              totalResults={documentTotal + employeeTotal}
              documentCount={documentResults.length}
              employeeCount={employeeResults.length}
              isSearchActive={!!searchQuery.trim()}
            />
            <ResultsPerPage />
          </div>
        )}

        {/* New: Display Chat Response using MessageRenderer */}
        {chatResponseData && chatResponseData.output && (
          <div className="bg-blue-50 p-4 rounded-lg shadow-md mb-4">
            <h4 className="text-blue-800 font-semibold mb-2">Chat Response:</h4>
            <MessageRenderer 
              output={chatResponseData.output} 
              citations={chatResponseData.citation} 
            />
          </div>
        )}

        {/* Landing Empty State */}
        {!hasSearched && !searchQuery.trim() && (
          <div className="text-center py-24 text-gray-500">
            <p className="text-lg mb-4">Type a search above to find documents and employees.</p>
            <p className="text-sm">Your results will appear here after you run your first search.</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <div className="flex justify-center">
            <div className="w-full max-w-4xl space-y-10">
              {employeeResults.length > 0 && (
                <EmployeeSearchResults employeeResults={employeeResults} />
              )}
              <DocumentGrid
                documents={documentResults}
                onDocumentClick={handleDocumentClick}
                onSummarizeDocument={handleSummarize}
                onChatWithDocument={handleChatWithDocument}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalResults > pagination.pageSize && (
          <div className="flex justify-center">
            <Pagination
              pagination={pagination}
              onPageChange={goToPage}
              onNext={nextPage}
              onPrevious={previousPage}
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
      {/* Right-side filters tab: only show after search or if query is not empty */}
      {(hasSearched || searchQuery.trim()) && (
        <aside className="w-80 min-w-[320px]">
          <div className="sticky top-24">
            <SearchFilters
              filters={filtersData}
              selectedFilters={selectedFilters}
              onFiltersChange={setSelectedFilters}
              isOpen={true}
              onToggle={() => {}}
            />
          </div>
        </aside>
      )}
    </div>
  );
};