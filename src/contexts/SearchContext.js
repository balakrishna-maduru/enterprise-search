// src/contexts/SearchContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { config } from '../config';
import { useUnifiedUser } from '../hooks/useUnifiedUser';
import { useElasticsearch } from '../hooks/useElasticsearch';
import { useOpenAI } from '../hooks/useOpenAI';
import { useApiSearch } from '../hooks/useApiSearch';
import { useApiLLM } from '../hooks/useApiLLM';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const { currentUser } = useUnifiedUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationalMode, setIsConversationalMode] = useState(false);
  const [conversationalSummary, setConversationalSummary] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    source: [],
    dateRange: 'all',
    contentType: []
  });
  const [showFilters, setShowFilters] = useState(false);

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

  // Clear selections when user changes
  useEffect(() => {
    setSelectedResults([]);
    setSearchQuery('');
    setSearchResults([]);
    setConversationalSummary('');
  }, [currentUser]);

  // Debounced search
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
  }, [searchQuery, selectedFilters]);

  const handleSearch = async (query) => {
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
      const results = await searchElastic(query, selectedFilters, currentUser);
      setSearchResults(results);
      
      if (isConversational && results.length > 0) {
        const summary = await generateSummary(query, results, currentUser);
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

  // Execute a saved search - this function can be called by saved searches
  const executeSearch = async (query, filters = {}) => {
    setSearchQuery(query);
    setSelectedFilters({
      source: filters.source || [],
      dateRange: filters.dateRange || 'all',
      contentType: filters.contentType || []
    });
    
    // The useEffect will trigger the search automatically when searchQuery changes
  };

  const toggleResultSelection = (resultId) => {
    setSelectedResults(prev => {
      if (prev.includes(resultId)) {
        return prev.filter(id => id !== resultId);
      } else {
        return [...prev, resultId];
      }
    });
  };

  const selectAllResults = () => {
    if (selectedResults.length === searchResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(searchResults.map(result => result.id));
    }
  };

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    selectedResults,
    setSelectedResults,
    isLoading,
    isConversationalMode,
    conversationalSummary,
    selectedFilters,
    setSelectedFilters,
    showFilters,
    setShowFilters,
    connectionStatus,
    searchMode,
    testConnection,
    setSearchMode,
    setConnectionStatus,
    handleSearch,
    executeSearch, // New function for saved searches
    toggleResultSelection,
    selectAllResults,
    generateSummary,
    generateComprehensiveSummary,
    generateChatResponse
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};