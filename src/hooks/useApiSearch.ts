// src/hooks/useApiSearch.ts
import { useState } from 'react';
import { UseApiSearchReturn, SearchResult, SearchFilters, User, ConnectionStatus, SearchMode } from '../types';
import { config } from '../config';

export const useApiSearch = (): UseApiSearchReturn => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('testing');
  const [searchMode, setSearchMode] = useState<SearchMode>('api');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Function to get access token - simplified (no authentication)
  const getAccessToken = async (): Promise<string> => {
    // No authentication needed - return empty string
    return '';
  };

  const testConnection = async (): Promise<void> => {
    setConnectionStatus('testing');
    
    try {
      console.log('Testing API connection...');
      
      const token = await getAccessToken();
      
      const response = await fetch(`${config.api.baseUrl}/search/test-connection`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: AbortSignal.timeout(config.api.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`API test failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ API connection successful:', result);
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('❌ API connection failed:', error);
      setConnectionStatus('error');
    }
  };

  const searchElastic = async (
    query: string, 
    filters: SearchFilters, 
    user: User,
    page: number = 1,
    pageSize: number = 10
  ): Promise<SearchResult[]> => {
    try {
      const result = await searchWithTotal(query, filters, user, page, pageSize);
      return result.results;
    } catch (error) {
      console.error('API search failed:', error);
      return [];
    }
  };

  const searchWithTotal = async (
    query: string, 
    filters: SearchFilters, 
    user: User,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ results: SearchResult[], total: number }> => {
    console.log('Performing API search with total for query:', query, 'page:', page, 'pageSize:', pageSize);
    
    try {
      // Convert our filters to the API format
      const apiFilters = {
        source: filters.source || [],
        content_type: filters.contentType || [],
        date_range: filters.dateRange || 'all',
        author: [],
        tags: []
      };

      // Calculate the 'from' parameter for pagination (API uses 0-based indexing)
      const from = (page - 1) * pageSize;

      const requestBody = {
        query: query === '*' ? '' : query, // API expects empty string for "all" queries
        filters: apiFilters,
        size: pageSize,
        from: from,
        semantic_enabled: true,
        hybrid_weight: 0.7
      };

      console.log('API Request:', requestBody);

      const response = await fetch(`${config.api.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(config.api.timeout)
      });

      if (!response.ok) {
        throw new Error(`Search API failed: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);

      // Convert API response to our SearchResult format
      const results: SearchResult[] = apiResponse.results.map((result: any) => ({
        id: result.id,
        title: result.title,
        content: result.content,
        summary: result.summary,
        source: result.source,
        author: result.author,
        department: '', // May need to extract from content or add to API
        content_type: result.content_type,
        tags: result.tags || [],
        timestamp: result.date,
        url: result.url,
        score: result.relevance_score,
        highlights: result.highlights
      }));

      return {
        results,
        total: apiResponse.total
      };
      
    } catch (error) {
      console.error('API search with total failed:', error);
      return {
        results: [],
        total: 0
      };
    }
  };

  return {
    searchElastic,
    searchWithTotal, // Add the new function to the return object
    connectionStatus,
    searchMode,
    testConnection,
    setSearchMode: (mode: SearchMode) => setSearchMode(mode),
    setConnectionStatus: (status: ConnectionStatus) => setConnectionStatus(status)
  };
};
