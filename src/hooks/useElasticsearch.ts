// src/hooks/useElasticsearch.ts
import { useState } from 'react';
import { UseElasticsearchReturn, SearchResult, SearchFilters, User, ConnectionStatus, SearchMode } from '../types';
import { config, getRoleBoosts } from '../config';
import { mockResults } from '../data/mockData';

export const useElasticsearch = (): UseElasticsearchReturn => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('testing');
  const [searchMode, setSearchMode] = useState<SearchMode>('live');

  const testConnection = async (): Promise<void> => {
    setConnectionStatus('testing');
    
    try {
      console.log('Testing Elasticsearch connection...');
      
      const headers: Record<string, string> = {};
      if (config.elasticsearch.apiKey) {
        headers['Authorization'] = `ApiKey ${config.elasticsearch.apiKey}`;
      }
      
      const healthResponse = await fetch(`${config.elasticsearch.endpoint}/_cluster/health`, {
        headers
      });
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      setConnectionStatus('connected');
      console.log('✅ Elasticsearch connection successful');
      
    } catch (error) {
      console.error('❌ Elasticsearch connection failed:', error);
      setConnectionStatus('error');
    }
  };

  const searchElastic = async (
    query: string, 
    filters: SearchFilters, 
    user: User
  ): Promise<SearchResult[]> => {
    // For now, return mock results in TypeScript mode
    // This can be expanded with the full Elasticsearch implementation
    console.log('Performing search with query:', query, 'filters:', filters, 'user:', user);
    
    if (searchMode === 'demo') {
      return mockResults.filter((result: SearchResult) => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.content.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Return empty array for live mode until full implementation
    return [];
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
