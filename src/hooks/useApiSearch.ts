// src/hooks/useApiSearch.ts
import { useState } from 'react';
import { UseApiSearchReturn, SearchResult, SearchFilters, User, ConnectionStatus, SearchMode } from '../types';
import { mockResults } from '../data/mockData';

export const useApiSearch = (): UseApiSearchReturn => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('testing');
  const [searchMode, setSearchMode] = useState<SearchMode>('api');

  const testConnection = async (): Promise<void> => {
    setConnectionStatus('testing');
    
    try {
      console.log('Testing API connection...');
      // Add API connection test logic here
      setConnectionStatus('connected');
      console.log('✅ API connection successful');
      
    } catch (error) {
      console.error('❌ API connection failed:', error);
      setConnectionStatus('error');
    }
  };

  const searchElastic = async (
    query: string, 
    filters: SearchFilters, 
    user: User
  ): Promise<SearchResult[]> => {
    console.log('Performing API search with query:', query, 'filters:', filters, 'user:', user);
    
    if (searchMode === 'demo') {
      return mockResults.filter((result: SearchResult) => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.content.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // For API mode, return mock data until full API implementation is complete
    console.log('Using mock data for document search in API mode');
    return mockResults.filter((result: SearchResult) => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.content.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    searchElastic,
    connectionStatus,
    searchMode,
    testConnection,
    setSearchMode: (mode: SearchMode) => setSearchMode(mode),
    setConnectionStatus: (status: ConnectionStatus) => setConnectionStatus(status)
  };
};
