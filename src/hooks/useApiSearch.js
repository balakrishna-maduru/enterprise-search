import { useState, useEffect } from 'react';
import { config } from '../config';
import { useAuth } from './useAuth';
import { mockResults } from '../data/mockData';

export const useApiSearch = () => {
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [searchMode, setSearchMode] = useState('api');

  const testConnection = async () => {
    if (!isAuthenticated) {
      setConnectionStatus('unauthenticated');
      setSearchMode('demo');
      return;
    }

    setConnectionStatus('testing');
    
    try {
      console.log('Testing API connection...');
      
      const response = await fetch(`${config.api.baseUrl}/search/test-connection`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`API test failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API connection successful:', data);
      setConnectionStatus('connected');
      setSearchMode('api');
      
    } catch (error) {
      console.error('API connection test failed:', error);
      setConnectionStatus('error');
      setSearchMode('demo');
    }
  };

  const searchDocuments = async (query, filters = {}, currentUser = null) => {
    if (!isAuthenticated) {
      console.log('User not authenticated, using demo mode');
      return mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.summary.toLowerCase().includes(query.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (searchMode === 'demo') {
      console.log('Using demo mode for search');
      return mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.summary.toLowerCase().includes(query.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    try {
      const searchRequest = {
        query,
        filters: {
          source: filters.source || [],
          content_type: filters.contentType || [],
          date_range: filters.dateRange || 'all',
          author: filters.author || [],
          tags: filters.tags || []
        },
        size: 20,
        from: 0
      };

      console.log('Making API search request:', searchRequest);

      const response = await fetch(`${config.api.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(searchRequest)
      });

      if (!response.ok) {
        if (response.status === 401) {
          setConnectionStatus('unauthenticated');
          setSearchMode('demo');
        } else {
          throw new Error(`Search API failed: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('API search successful:', data);
      
      setConnectionStatus('connected');
      return data.results;
      
    } catch (error) {
      console.error('API search error:', error);
      
      setConnectionStatus('error');
      setSearchMode('demo');
      
      console.log('Falling back to demo mode');
      return mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.summary.toLowerCase().includes(query.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      testConnection();
    } else {
      setConnectionStatus('unauthenticated');
      setSearchMode('demo');
    }
  }, [isAuthenticated]);

  return {
    searchElastic: searchDocuments, // Keep same interface as original hook
    connectionStatus,
    searchMode,
    testConnection,
    setSearchMode,
    setConnectionStatus
  };
};