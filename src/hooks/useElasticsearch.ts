// src/hooks/useElasticsearch.ts
import { useState } from 'react';
import { UseElasticsearchReturn, SearchResult, SearchFilters, User, ConnectionStatus, SearchMode } from '../types';
import { config, getRoleBoosts } from '../config';

export const useElasticsearch = (): UseElasticsearchReturn => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('testing');
  const [searchMode, setSearchMode] = useState<SearchMode>('demo'); // Default to demo mode

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
    user: User,
    page: number = 1,
    pageSize: number = 10
  ): Promise<SearchResult[]> => {
    console.log('Performing Elasticsearch search with query:', query, 'filters:', filters, 'user:', user, 'page:', page, 'pageSize:', pageSize);
    
    // Since we're using API mode, this function shouldn't be called
    // But if it is, return empty array and log a warning
    console.warn('useElasticsearch.searchElastic called - this should use useApiSearch instead');
    return [];
    
    // Actual Elasticsearch implementation for live mode
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (config.elasticsearch.apiKey) {
        headers['Authorization'] = `ApiKey ${config.elasticsearch.apiKey}`;
      }

      // Calculate the 'from' parameter for pagination
      const from = (page - 1) * pageSize;

      // Build the Elasticsearch query
      let searchBody: any;
      
      if (query === '*' || !query.trim()) {
        // Get all documents when query is wildcard or empty
        searchBody = {
          query: {
            match_all: {}
          },
          sort: [
            { "timestamp": { "order": "desc" } },
            { "_score": { "order": "desc" } }
          ],
          from: from,
          size: pageSize,
          _source: ["title", "content", "summary", "author", "department", "content_type", "source", "timestamp", "tags", "url"]
        };
      } else {
        // Search with the provided query
        searchBody = {
          query: {
            bool: {
              should: [
                {
                  multi_match: {
                    query: query,
                    fields: ["title^3", "content^2", "summary^2", "author", "tags"],
                    type: "best_fields",
                    fuzziness: "AUTO"
                  }
                },
                {
                  wildcard: {
                    title: `*${query.toLowerCase()}*`
                  }
                },
                {
                  wildcard: {
                    content: `*${query.toLowerCase()}*`
                  }
                }
              ],
              minimum_should_match: 1
            }
          },
          sort: [
            { "_score": { "order": "desc" } },
            { "timestamp": { "order": "desc" } }
          ],
          from: from,
          size: pageSize,
          _source: ["title", "content", "summary", "author", "department", "content_type", "source", "timestamp", "tags", "url"]
        };
      }

      // Apply filters if they exist
      if (filters.source && filters.source.length > 0) {
        if (!searchBody.query.bool) {
          searchBody.query = {
            bool: {
              must: [searchBody.query]
            }
          };
        }
        searchBody.query.bool.filter = searchBody.query.bool.filter || [];
        searchBody.query.bool.filter.push({
          terms: { "source": filters.source }
        });
      }

      if (filters.contentType && filters.contentType.length > 0) {
        if (!searchBody.query.bool) {
          searchBody.query = {
            bool: {
              must: [searchBody.query]
            }
          };
        }
        searchBody.query.bool.filter = searchBody.query.bool.filter || [];
        searchBody.query.bool.filter.push({
          terms: { "content_type": filters.contentType }
        });
      }

      // Add date range filter if specified
      if (filters.dateRange && filters.dateRange !== 'all') {
        if (!searchBody.query.bool) {
          searchBody.query = {
            bool: {
              must: [searchBody.query]
            }
          };
        }
        searchBody.query.bool.filter = searchBody.query.bool.filter || [];
        
        let dateFilter: any;
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            dateFilter = {
              range: {
                timestamp: {
                  gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
                }
              }
            };
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = {
              range: {
                timestamp: {
                  gte: weekAgo.toISOString()
                }
              }
            };
            break;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            dateFilter = {
              range: {
                timestamp: {
                  gte: monthAgo.toISOString()
                }
              }
            };
            break;
        }
        
        if (dateFilter) {
          searchBody.query.bool.filter.push(dateFilter);
        }
      }

      console.log('Elasticsearch query body:', JSON.stringify(searchBody, null, 2));

      const response = await fetch(`${config.elasticsearch.endpoint}/${config.elasticsearch.index}/_search`, {
        method: 'POST',
        headers,
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        throw new Error(`Elasticsearch search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Elasticsearch response:', data);

      // Transform Elasticsearch hits to SearchResult format
      const results: SearchResult[] = data.hits.hits.map((hit: any) => ({
        id: hit._id,
        title: hit._source.title || 'Untitled',
        summary: hit._source.summary || hit._source.content?.substring(0, 200) + '...' || '',
        content: hit._source.content || '',
        source: hit._source.source || 'unknown',
        url: hit._source.url || '#',
        author: hit._source.author || 'Unknown',
        timestamp: hit._source.timestamp || hit._source.created_at || new Date().toISOString(),
        department: hit._source.department || 'General',
        tags: hit._source.tags || [],
        content_type: hit._source.content_type || 'document',
        score: hit._score || 0
      }));

      console.log(`✅ Found ${results.length} results from Elasticsearch`);
      return results;

    } catch (error) {
      console.error('❌ Elasticsearch search failed:', error);
      
      // Fallback to empty results on error
      return [];
    }
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
