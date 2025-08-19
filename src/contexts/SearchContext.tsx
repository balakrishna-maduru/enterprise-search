// src/contexts/SearchContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { config } from '../config';
import { useElasticsearch } from '../hooks/useElasticsearch';
import { useOpenAI } from '../hooks/useOpenAI';
import { useApiSearch } from '../hooks/useApiSearch';
import { useApiLLM } from '../hooks/useApiLLM';
import { SearchContextType, SearchResult, SearchFilters, Employee, PaginationInfo } from '../types';
import { employeeService } from '../services/employee_service';
import { useUser } from '../hooks/useUser';
import { apiService } from '../services/api_service';

interface SearchProviderProps {
  children: ReactNode;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const { user: currentUser } = useUser();
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([]);
  
  // New state for dual API approach
  const [employeeResults, setEmployeeResults] = useState<SearchResult[]>([]);
  const [documentResults, setDocumentResults] = useState<SearchResult[]>([]);
  const [employeeTotal, setEmployeeTotal] = useState<number>(0);
  const [documentTotal, setDocumentTotal] = useState<number>(0);
  const [isDualSearchMode, setIsDualSearchMode] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConversationalMode, setIsConversationalMode] = useState<boolean>(false);
  const [conversationalSummary, setConversationalSummary] = useState<string>('');
  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({
    source: [],
    dateRange: 'all',
    contentType: []
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'documents' | 'employees' | 'all'>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    pageSize: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false); // new flag

  // Use API hooks or legacy hooks based on configuration
  const legacySearch = useElasticsearch();
  const apiSearch = useApiSearch();
  const legacyLLM = useOpenAI();
  const apiLLM = useApiLLM();
  
  // Choose which hooks to use based on configuration
  const searchHooks = config.api.useApiLayer ? apiSearch : legacySearch;
  const llmHooks = config.api.useApiLayer ? apiLLM : legacyLLM;
  
  const { searchElastic, connectionStatus, searchMode, testConnection, setSearchMode, setConnectionStatus } = searchHooks;
  // Only get searchWithTotal if using API layer
  const searchWithTotal = config.api.useApiLayer ? (searchHooks as any).searchWithTotal : null;
  const { generateSummary, generateComprehensiveSummary, generateChatResponse } = llmHooks;

  // Memoize setSearchQuery to prevent unnecessary re-renders
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  // New dual search function

  const executeDualSearch = useCallback(async (query?: string, page?: number, filtersOverride?: any): Promise<void> => {
    const searchTerm = query || searchQuery;
    // Use all dynamic filters as-is
    const filters = filtersOverride || selectedFilters;
    console.log('🔍 Dual search triggered for:', searchTerm, 'filters:', filters);
    console.log('🔍 Current user:', currentUser);
    console.log('🔍 API Service available:', !!apiService);
    setIsLoading(true);
    setIsDualSearchMode(true);
    try {
      const pageNum = page || 1;
      if (!searchTerm.trim()) {
        // Empty search: do NOT auto-load content; keep landing empty
        setEmployeeResults([]);
        setDocumentResults([]);
        setEmployeeTotal(0);
        setDocumentTotal(0);
        setSearchResults([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalResults: 0,
          pageSize: pagination.pageSize || 10,
          hasNextPage: false,
          hasPreviousPage: false
        });
        return;
      } else {
        console.log('🔍 Executing dual search for:', searchTerm, 'page:', pageNum, 'filters:', filters);
        // For search queries, execute dual search
        const dualSearchData = await apiService.dualSearch(
          searchTerm,
          pagination.pageSize || 10,
          pagination.pageSize || 10,
          currentUser,
          pageNum - 1, // backend may expect 0-based page
          pageNum - 1
        );
        console.log('✅ Dual search data received:', dualSearchData);
        setEmployeeResults(dualSearchData.employees.results);
        setDocumentResults(dualSearchData.documents.results);
        setEmployeeTotal(dualSearchData.employees.total);
        setDocumentTotal(dualSearchData.documents.total);
        // Combine results for backward compatibility
        const combinedResults = [...dualSearchData.employees.results, ...dualSearchData.documents.results];
        setSearchResults(combinedResults);
        // Update pagination based on combined totals
        const totalResults = dualSearchData.employees.total + dualSearchData.documents.total;
        const newPagination: PaginationInfo = {
          currentPage: pageNum,
          totalPages: Math.ceil(totalResults / (pagination.pageSize || 10)),
          totalResults: totalResults,
          pageSize: pagination.pageSize || 10,
          hasNextPage: pageNum < Math.ceil(totalResults / (pagination.pageSize || 10)),
          hasPreviousPage: pageNum > 1
        };
        setPagination(newPagination);
        console.log('✅ Dual search completed:', {
          employees: dualSearchData.employees.results.length,
          employeesTotal: dualSearchData.employees.total,
          documents: dualSearchData.documents.results.length,
          documentsTotal: dualSearchData.documents.total,
          totalCombined: totalResults
        });
      }
    } catch (error) {
      console.error('❌ Dual search failed, clearing results (no mocks):', error);
      // On error, clear results and totals; do not use any mock data
      setEmployeeResults([]);
      setDocumentResults([]);
      setEmployeeTotal(0);
      setDocumentTotal(0);
      setSearchResults([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        pageSize: pagination.pageSize || 10,
        hasNextPage: false,
        hasPreviousPage: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentUser, pagination.pageSize, selectedFilters]);
  // Trigger search when filters change
  useEffect(() => {
    if (hasSearched) {
      executeDualSearch(undefined, 1, selectedFilters);
    }
  }, [selectedFilters]);

  // Clear selections when user changes
  useEffect(() => {
    setSelectedResults([]);
    setSearchQueryState('');
    setSearchResults([]);
    setEmployeeResults([]);
    setDocumentResults([]);
    setConversationalSummary('');
    setIsDualSearchMode(false);
  }, [currentUser]);

  // Clear results when search query is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setEmployeeResults([]);
      setDocumentResults([]);
      setConversationalSummary('');
    }
  }, [searchQuery]);

  // Manual search function - now uses dual search by default
  const executeManualSearch = useCallback(async (query?: string, page?: number): Promise<void> => {
    const searchTerm = query || searchQuery;
    console.log('🔍 Manual search triggered for:', searchTerm, 'page:', page);
    if (searchTerm.trim()) {
      await executeDualSearch(searchTerm, page);
      setHasSearched(true);
    } else {
      // clearing search resets state
      await executeDualSearch('', 1);
      setHasSearched(false);
    }
  }, [searchQuery, executeDualSearch]);

  // Function to load default documents using dual API approach
  const loadDefaultDocuments = useCallback(async (): Promise<void> => {
    console.log('🔍 Loading default documents using dual search for landing page');
    console.log('🔍 Current user in loadDefaultDocuments:', currentUser);
    
    // Wait for user to be available before making API calls
    if (!currentUser) {
      console.log('⏳ Waiting for user authentication before loading data...');
      return;
    }
    
    // Use dual search with empty query to load landing page data
    await executeDualSearch('');
  }, [currentUser, executeDualSearch]);

  // Load initial data when component mounts or user changes
  // Initial effect: do not auto-load documents; just mark provider ready
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [hasInitiallyLoaded]);

  // Pagination function to handle page navigation
  const goToPage = useCallback(async (page: number): Promise<void> => {
    if (page < 1 || page > pagination.totalPages || page === pagination.currentPage) {
      return;
    }
    console.log(`🔍 Navigating to page ${page} and triggering search...`);
    setIsLoading(true);
    try {
      // Call the search function with the new page number
      // You may need to update executeDualSearch/executeManualSearch to accept a page param
      await executeManualSearch(undefined, page); // undefined = use current query
      // Pagination will be updated by the search function
      console.log(`✅ Successfully navigated to page ${page} and triggered search`);
    } catch (error) {
      console.error(`❌ Failed to navigate to page ${page}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, executeManualSearch]);

  const nextPage = useCallback(async () => {
    if (pagination.hasNextPage) {
      await goToPage(pagination.currentPage + 1);
    }
  }, [pagination.hasNextPage, pagination.currentPage, goToPage]);

  const previousPage = useCallback(async () => {
    if (pagination.hasPreviousPage) {
      await goToPage(pagination.currentPage - 1);
    }
  }, [pagination.hasPreviousPage, pagination.currentPage, goToPage]);

  // Helper function to toggle result selection
  const toggleResultSelection = useCallback((result: SearchResult) => {
    setSelectedResults((prev: SearchResult[]) => {
      const isSelected = prev.some((r: SearchResult) => r.id === result.id);
      if (isSelected) {
        return prev.filter((r: SearchResult) => r.id !== result.id);
      } else {
        return [...prev, result];
      }
    });
  }, []);

  // Helper function to select all results
  const selectAllResults = useCallback(() => {
    setSelectedResults(searchResults);
  }, [searchResults]);

  const contextValue: SearchContextType = {
  searchQuery,
  setSearchQuery,
  hasSearched, // Indicates if a search has been performed (used to trigger effects)
  setHasSearched,
    searchResults,
    setSearchResults,
    selectedResults,
    setSelectedResults,
    // New dual API state
    employeeResults,
    setEmployeeResults,
    documentResults,
    setDocumentResults,
    employeeTotal,
    setEmployeeTotal,
    documentTotal,
    setDocumentTotal,
    isDualSearchMode,
    setIsDualSearchMode,
    isLoading,
    setIsLoading,
    isConversationalMode,
    setIsConversationalMode,
    conversationalSummary,
    setConversationalSummary,
    generatedSummary,
    showSummary,
    setShowSummary,
    selectedFilters,
    setSelectedFilters,
    showFilters,
    setShowFilters,
    connectionStatus,
    searchMode,
    testConnection,
    setSearchMode,
    setConnectionStatus,
    executeSearch: (query: string, _filters?: Partial<SearchFilters>) => executeManualSearch(query),
    searchType,
    setSearchType,
    toggleResultSelection,
    selectAllResults,
    generateComprehensiveSummary,
    // New dual search method
    executeDualSearch,
    // Pagination
    pagination,
    loadDefaultDocuments,
    goToPage,
    nextPage,
    previousPage,
    // Add a right-side filter tab (for layout integration, not a function)
    // You will use the context's selectedFilters and setSelectedFilters in your layout to render the filter tab
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};
