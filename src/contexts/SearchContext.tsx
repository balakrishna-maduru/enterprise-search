// src/contexts/SearchContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { config } from '../config';
import { useUnifiedUser } from '../hooks/useUnifiedUser';
import { useElasticsearch } from '../hooks/useElasticsearch';
import { useOpenAI } from '../hooks/useOpenAI';
import { useApiSearch } from '../hooks/useApiSearch';
import { useApiLLM } from '../hooks/useApiLLM';
import { SearchContextType, SearchResult, SearchFilters, Employee, PaginationInfo } from '../types';
import { employeeService } from '../services/employee_service';
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
  const { currentUser } = useUnifiedUser();
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
  const executeDualSearch = useCallback(async (query?: string): Promise<void> => {
    const searchTerm = query || searchQuery;
    console.log('🔍 Dual search triggered for:', searchTerm);
    
    setIsLoading(true);
    setIsDualSearchMode(true);
    
    try {
      if (!searchTerm.trim()) {
        // For empty search, load landing page data
        const landingData = await apiService.loadLandingPageData(currentUser, 5, 5);
        
        setEmployeeResults(landingData.employees.results);
        setDocumentResults(landingData.documents.results);
        setEmployeeTotal(landingData.employees.total);
        setDocumentTotal(landingData.documents.total);
        
        // Combine results for backward compatibility
        const combinedResults = [...landingData.employees.results, ...landingData.documents.results];
        setSearchResults(combinedResults);
        
        // Update pagination based on combined totals
        const totalResults = landingData.employees.total + landingData.documents.total;
        const newPagination: PaginationInfo = {
          currentPage: 1,
          totalPages: Math.ceil(totalResults / (pagination.pageSize || 10)),
          totalResults: totalResults,
          pageSize: pagination.pageSize || 10,
          hasNextPage: totalResults > (pagination.pageSize || 10),
          hasPreviousPage: false
        };
        setPagination(newPagination);
        
        console.log('✅ Landing page dual data loaded:', {
          employees: landingData.employees.results.length,
          employeesTotal: landingData.employees.total,
          documents: landingData.documents.results.length,
          documentsTotal: landingData.documents.total,
          totalCombined: totalResults
        });
      } else {
        // For search queries, execute dual search
        const dualSearchData = await apiService.dualSearch(
          searchTerm, 
          5, // employee results
          5, // document results
          currentUser
        );
        
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
          currentPage: 1,
          totalPages: Math.ceil(totalResults / (pagination.pageSize || 10)),
          totalResults: totalResults,
          pageSize: pagination.pageSize || 10,
          hasNextPage: totalResults > (pagination.pageSize || 10),
          hasPreviousPage: false
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
      console.error('❌ Dual search failed:', error);
      
      // Provide fallback mock data even when there's an error
      const mockEmployees = [
        {
          id: 'mock-emp-1',
          title: 'Sarah Chen',
          content: 'Senior Product Manager in Digital Banking at DBS Bank',
          summary: 'Sarah Chen - Senior Product Manager specializing in digital banking solutions',
          source: 'employee-directory',
          author: 'System',
          department: 'Digital Banking', 
          content_type: 'employee',
          tags: ['product-management', 'digital-banking'],
          timestamp: new Date().toISOString(),
          url: 'mailto:sarah.chen@dbs.com',
          score: 95,
          employee_data: {
            id: 1,
            name: 'Sarah Chen',
            title: 'Senior Product Manager',
            email: 'sarah.chen@dbs.com',
            department: 'Digital Banking',
            location: 'Singapore',
            phone: '+65 6000 0001',
            start_date: '2020-01-01',
            level: 3,
            has_reports: true,
            report_count: 3,
            document_type: 'employee',
            indexed_at: new Date().toISOString(),
            search_text: 'Sarah Chen Senior Product Manager Digital Banking'
          }
        }
      ];
      
      const mockDocuments = [
        {
          id: 'mock-doc-1',
          title: 'Welcome to Enterprise Search',
          content: 'Search through company documents, employee directory, and more. The system is running in demo mode with sample data.',
          summary: 'Enterprise search system demo with sample data',
          source: 'welcome-guide',
          author: 'System',
          department: 'IT',
          content_type: 'document',
          tags: ['welcome', 'guide', 'demo'],
          timestamp: new Date().toISOString(),
          url: '#',
          score: 100
        }
      ];
      
      setEmployeeResults(mockEmployees);
      setDocumentResults(mockDocuments);
      setSearchResults([...mockEmployees, ...mockDocuments]);
      setEmployeeResults([]);
      setDocumentResults([]);
      setIsDualSearchMode(false);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentUser, pagination.pageSize]);

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
  const executeManualSearch = useCallback(async (query?: string): Promise<void> => {
    const searchTerm = query || searchQuery;
    console.log('🔍 Manual search triggered for:', searchTerm);
    
    if (!searchTerm.trim()) {
      // For empty search, use dual search to load landing page
      await executeDualSearch();
      return;
    }
    
    // Use dual search for all searches
    await executeDualSearch(searchTerm);
  }, [searchQuery, executeDualSearch]);

  // Function to load default documents using dual API approach
  const loadDefaultDocuments = useCallback(async (): Promise<void> => {
    console.log('🔍 Loading default documents using dual search for landing page');
    console.log('🔍 Current user in loadDefaultDocuments:', currentUser);
    
    // Use dual search with empty query to load landing page data
    await executeDualSearch('');
  }, [currentUser, executeDualSearch]);

  // Load initial data when component mounts or user changes
  useEffect(() => {
    console.log('🔄 SearchProvider useEffect triggered:', {
      currentUser,
      hasInitiallyLoaded
    });
    if (!hasInitiallyLoaded) {
      console.log('🚀 Loading initial data...');
      loadDefaultDocuments();
      setHasInitiallyLoaded(true);
    }
  }, [currentUser, hasInitiallyLoaded, loadDefaultDocuments]);

  // Pagination function to handle page navigation
  const goToPage = useCallback(async (page: number): Promise<void> => {
    if (page < 1 || page > pagination.totalPages || page === pagination.currentPage) {
      return;
    }
    
    console.log(`🔍 Navigating to page ${page}...`);
    setIsLoading(true);

    try {
      // TODO: Implement pagination for dual search mode
      console.log('Pagination in dual search mode not yet fully implemented');
      
      // For now, just update pagination state
      const newPagination: PaginationInfo = {
        currentPage: page,
        totalPages: pagination.totalPages,
        totalResults: pagination.totalResults,
        pageSize: pagination.pageSize,
        hasNextPage: page < pagination.totalPages,
        hasPreviousPage: page > 1
      };
      setPagination(newPagination);

      console.log(`✅ Successfully navigated to page ${page}`);
    } catch (error) {
      console.error(`❌ Failed to navigate to page ${page}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination]);

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
    executeSearch: executeManualSearch,
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
    previousPage
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};
