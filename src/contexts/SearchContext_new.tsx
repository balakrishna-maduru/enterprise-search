// src/contexts/SearchContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { config } from '../config';
import { useUnifiedUser } from '../hooks/useUnifiedUser';
import { useElasticsearch } from '../hooks/useElasticsearch';
import { useOpenAI } from '../hooks/useOpenAI';
import { useApiSearch } from '../hooks/useApiSearch';
import { useApiLLM } from '../hooks/useApiLLM';
import { SearchContextType, SearchResult, SearchFilters, ConnectionStatus, SearchMode, Employee, PaginationInfo } from '../types';
import { EmployeeService } from '../services/employee_service';
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

  // Use useMemo with empty dependency array to create service only once
  const employeeService = useMemo(() => new EmployeeService(), []);

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
      // Fallback to regular search
      setIsDualSearchMode(false);
      await handleSearch(searchTerm || '');
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

  // Simple handleSearch function for fallback
  const handleSearch = async (query: string): Promise<void> => {
    console.log('🔍 Fallback search for:', query);
    
    if (!query.trim()) {
      // If query is empty, load default documents
      await loadDefaultDocuments();
      return;
    }
    
    setIsLoading(true);
    
    const conversationalIndicators = ['what', 'how', 'why', 'when', 'who', 'tell me', 'explain', 'summarize', 'find me', 'show me', 'help me'];
    const isConversational = conversationalIndicators.some(indicator => 
      query.toLowerCase().includes(indicator)
    );
    
    setIsConversationalMode(isConversational);
    
    try {
      let documentResults: SearchResult[] = [];
      let employeeResults: SearchResult[] = [];
      let totalDocuments = 0;

      // Search documents using API with fallback to mock data
      if (searchType === 'documents' || searchType === 'all') {
        try {
          if (config.api.useApiLayer && searchWithTotal) {
            // Use the efficient searchWithTotal function
            const searchResponse = await searchWithTotal(query, selectedFilters, currentUser, 1, pagination.pageSize);
            documentResults = searchResponse.results;
            totalDocuments = searchResponse.total;
          } else {
            // Fallback to regular search
            documentResults = await searchElastic(query, selectedFilters, currentUser, 1, pagination.pageSize);
            totalDocuments = documentResults.length * 10; // Estimate
          }
        } catch (searchError) {
          console.error('Search failed, using mock results:', searchError);
          // Fallback to filtered mock data
          const allMockResults: SearchResult[] = [
            {
              id: 'search-1',
              title: `Search Results for "${query}"`,
              content: `This is a mock search result for your query: ${query}. In a real implementation, this would be actual search results from your index.`,
              summary: `Mock search result demonstrating search for: ${query}`,
              source: 'mock-search',
              author: 'Search System',
              department: 'System',
              content_type: 'result',
              tags: ['search', 'mock', query.toLowerCase()],
              timestamp: new Date().toISOString(),
              url: '#',
              score: 100
            }
          ];
          documentResults = allMockResults;
          totalDocuments = allMockResults.length;
        }
      }

      // Search using the main search API for employees
      if (searchType === 'employees' || searchType === 'all') {
        try {
          // Use the main search API for employees
          const employeeResponse = await apiService.searchWithApi(query, 10, currentUser, ['employee']);
          employeeResults = employeeResponse.results;
          console.log('✅ Search API results:', employeeResults.length);
        } catch (error) {
          console.warn('⚠️ Search API failed, trying employee API:', error);
          try {
            // Fallback to employee-specific API
            employeeResults = await apiService.searchEmployees(query, 10, 1);
            console.log('✅ Employee API fallback results:', employeeResults.length);
          } catch (employeeError) {
            console.warn('⚠️ Employee API also failed, using local service:', employeeError);
            // Final fallback to existing employee service
            const employees = await employeeService.searchEmployees(query, 10);
            employeeResults = employees.map((emp: Employee) => ({
              id: `employee_${emp.id}`,
              title: emp.name,
              content: `${emp.title} in ${emp.department}`,
              summary: `${emp.name} - ${emp.title} in ${emp.department}, located in ${emp.location}`,
              source: 'employees',
              author: 'HR System',
              department: emp.department,
              content_type: 'employee',
              tags: [emp.department.toLowerCase(), emp.title.toLowerCase()],
              timestamp: emp.start_date,
              url: `mailto:${emp.email}`,
              score: 100,
              employee_data: emp
            }));
          }
        }
      }

      // Combine results based on search type
      let combinedResults: SearchResult[] = [];
      if (searchType === 'all') {
        combinedResults = [...employeeResults, ...documentResults];
      } else if (searchType === 'employees') {
        combinedResults = employeeResults;
      } else {
        combinedResults = documentResults;
      }

      setSearchResults(combinedResults);

      const newPagination: PaginationInfo = {
        currentPage: 1,
        totalPages: Math.ceil(combinedResults.length / pagination.pageSize),
        totalResults: combinedResults.length,
        pageSize: pagination.pageSize,
        hasNextPage: combinedResults.length > pagination.pageSize,
        hasPreviousPage: false
      };

      setPagination(newPagination);

      console.log('✅ Search completed:', {
        query,
        searchType,
        employees: employeeResults.length,
        documents: documentResults.length,
        total: combinedResults.length,
        isConversational
      });

    } catch (error) {
      console.error('❌ Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load default documents using dual API approach
  const loadDefaultDocuments = useCallback(async (): Promise<void> => {
    console.log('🔍 Loading default documents using dual API approach...');
    console.log('🔍 Current user in loadDefaultDocuments:', currentUser);
    
    // Use the new dual search approach for landing page
    await executeDualSearch();
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
      // If we're on page 1 and have a search query, or if we're in dual search mode
      if (searchQuery && searchQuery.trim() !== '') {
        console.log(`🔍 Getting page ${page} for search query: "${searchQuery}"`);
        
        // For search queries in dual mode, we need to implement pagination
        if (isDualSearchMode) {
          // TODO: Implement dual search pagination
          console.log('Dual search pagination not yet implemented');
        } else {
          // Use regular search pagination
          const paginatedResponse = await apiService.searchWithApi(
            searchQuery,
            pagination.pageSize,
            currentUser,
            [], // no content type filter
            (page - 1) * pagination.pageSize
          );

          const newPagination: PaginationInfo = {
            currentPage: page,
            totalPages: pagination.totalPages,
            totalResults: pagination.totalResults,
            pageSize: pagination.pageSize,
            hasNextPage: page < pagination.totalPages,
            hasPreviousPage: page > 1
          };

          setSearchResults(paginatedResponse.results);
          setPagination(newPagination);
        }
      } else {
        // For default/landing view, handle page navigation
        if (page === 1) {
          // Page 1: Show logged-in user or default employees
          await loadDefaultDocuments();
        } else {
          // Page 2+: Show documents only
          const from = (page - 2) * pagination.pageSize; // page 2 starts from 0
          const documentsResponse = await apiService.getNonEmployeeDocuments(currentUser, from, pagination.pageSize);
          
          const newPagination: PaginationInfo = {
            currentPage: page,
            totalPages: pagination.totalPages, // Keep total pages from initial calculation
            totalResults: pagination.totalResults, // Keep total results from initial calculation
            pageSize: pagination.pageSize,
            hasNextPage: page < pagination.totalPages,
            hasPreviousPage: page > 1
          };

          setSearchResults(documentsResponse.results);
          setPagination(newPagination);
        }
      }

      console.log(`✅ Successfully navigated to page ${page}`);
    } catch (error) {
      console.error(`❌ Failed to navigate to page ${page}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, pagination, currentUser, isDualSearchMode, loadDefaultDocuments]);

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
    setSelectedResults(prev => {
      const isSelected = prev.some(r => r.id === result.id);
      if (isSelected) {
        return prev.filter(r => r.id !== result.id);
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
