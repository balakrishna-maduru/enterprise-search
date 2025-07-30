// src/contexts/SearchContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { config } from '../config';
import { useUnifiedUser } from '../hooks/useUnifiedUser';
import { useElasticsearch } from '../hooks/useElasticsearch';
import { useOpenAI } from '../hooks/useOpenAI';
import { useApiSearch } from '../hooks/useApiSearch';
import { useApiLLM } from '../hooks/useApiLLM';
import { SearchContextType, SearchResult, SearchFilters, ConnectionStatus, SearchMode, Employee } from '../types';
import { EmployeeService } from '../services/employee_service';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConversationalMode, setIsConversationalMode] = useState<boolean>(false);
  const [conversationalSummary, setConversationalSummary] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({
    source: [],
    dateRange: 'all',
    contentType: []
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'documents' | 'employees' | 'all'>('all');

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
  const { generateSummary, generateComprehensiveSummary, generateChatResponse } = llmHooks;

  // Memoize setSearchQuery to prevent unnecessary re-renders
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  // Clear selections when user changes
  useEffect(() => {
    setSelectedResults([]);
    setSearchQueryState('');
    setSearchResults([]);
    setConversationalSummary('');
  }, [currentUser]);

  // Debounced search - simplified to prevent focus issues
  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
      setConversationalSummary('');
    }
  }, [searchQuery, selectedFilters]); // Removed handleSearch dependency

  // Simple handleSearch function without useCallback
  const handleSearch = async (query: string): Promise<void> => {
    console.log('🔍 Searching for:', query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setConversationalSummary('');
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

      // Search documents (existing functionality)
      if (searchType === 'documents' || searchType === 'all') {
        documentResults = await searchElastic(query, selectedFilters, currentUser);
      }

      // Search employees
      if (searchType === 'employees' || searchType === 'all') {
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
          tags: [emp.department, emp.title, `level-${emp.level}`],
          timestamp: emp.start_date,
          url: `mailto:${emp.email}`,
          score: 100,
          employee_data: emp
        } as SearchResult));
      }

      // Combine results
      const allResults = [...documentResults, ...employeeResults];
      setSearchResults(allResults);
      
      if (isConversational && allResults.length > 0) {
        const summary = await generateSummary(query, allResults, currentUser);
        setConversationalSummary(summary);
      } else {
        setConversationalSummary('');
      }
      
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setConversationalSummary('');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear selections when user changes
  useEffect(() => {
    setSelectedResults([]);
    setSearchQueryState('');
    setSearchResults([]);
    setConversationalSummary('');
  }, [currentUser]);

  // Debounced search - simplified to prevent focus issues
  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
      setConversationalSummary('');
    }
  }, [searchQuery, selectedFilters]); // Removed handleSearch dependency

  // Execute a saved search - this function can be called by saved searches
  const executeSearch = useCallback(async (query: string, filters: Partial<SearchFilters> = {}): Promise<void> => {
    setSearchQuery(query);
    setSelectedFilters({
      source: filters.source || [],
      dateRange: filters.dateRange || 'all',
      contentType: filters.contentType || []
    });
    
    // The useEffect will trigger the search automatically when searchQuery changes
  }, [setSearchQuery]);

  const toggleResultSelection = useCallback((result: SearchResult): void => {
    setSelectedResults((prev: SearchResult[]) => {
      const isSelected = prev.some((r: SearchResult) => r.id === result.id);
      if (isSelected) {
        return prev.filter((r: SearchResult) => r.id !== result.id);
      } else {
        return [...prev, result];
      }
    });
  }, []);

  const selectAllResults = useCallback((): void => {
    setSelectedResults((prev: SearchResult[]) => {
      if (prev.length === searchResults.length) {
        return [];
      } else {
        return [...searchResults];
      }
    });
  }, [searchResults]);

  const value: SearchContextType = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    selectedResults,
    setSelectedResults,
    isLoading,
    setIsLoading,
    isConversationalMode,
    setIsConversationalMode,
    conversationalSummary,
    setConversationalSummary,
    selectedFilters,
    setSelectedFilters,
    showFilters,
    setShowFilters,
    connectionStatus,
    searchMode,
    testConnection,
    setSearchMode,
    setConnectionStatus,
    executeSearch,
    searchType,
    setSearchType,
    toggleResultSelection,
    selectAllResults,
    generateComprehensiveSummary
  }), [
    searchQuery,
    searchResults,
    selectedResults,
    isLoading,
    isConversationalMode,
    conversationalSummary,
    selectedFilters,
    showFilters,
    connectionStatus,
    searchMode,
    searchType,
    testConnection,
    setSearchMode,
    setConnectionStatus,
    executeSearch,
    setSearchType,
    toggleResultSelection,
    selectAllResults,
    generateComprehensiveSummary
  ]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
