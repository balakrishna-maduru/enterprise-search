// src/hooks/useElasticsearch.js
import { useState, useEffect } from 'react';
import { config, getRoleBoosts } from '../config';
import { mockResults } from '../data/mockData';

export const useElasticsearch = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [searchMode, setSearchMode] = useState('live');

  const testConnection = async () => {
    setConnectionStatus('testing');
    
    try {
      console.log('Testing Elasticsearch connection...');
      
      const healthResponse = await fetch(`${config.elasticsearch.endpoint}/_cluster/health`, {
        headers: {
          ...(config.elasticsearch.apiKey && { 'Authorization': `ApiKey ${config.elasticsearch.apiKey}` })
        }
      });
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      if (config.elasticsearch.useSearchApplication && config.elasticsearch.searchApplicationName) {
        console.log('Testing Search Application...');
        
        const searchAppResponse = await fetch(`${config.elasticsearch.endpoint}/_application/search_application/${config.elasticsearch.searchApplicationName}`, {
          method: 'GET',
          headers: {
            ...(config.elasticsearch.apiKey && { 'Authorization': `ApiKey ${config.elasticsearch.apiKey}` })
          }
        });
        
        if (searchAppResponse.status === 404) {
          console.warn(`Search Application '${config.elasticsearch.searchApplicationName}' not found. Will use direct search as fallback.`);
          config.elasticsearch.useSearchApplication = false;
        } else if (!searchAppResponse.ok) {
          const errorText = await searchAppResponse.text();
          console.warn(`Search Application check failed: ${searchAppResponse.status} - ${errorText}`);
          config.elasticsearch.useSearchApplication = false;
        } else {
          console.log('Search Application available');
        }
      }
      
      if (!config.elasticsearch.useSearchApplication && config.elasticsearch.index) {
        const indexResponse = await fetch(`${config.elasticsearch.endpoint}/${config.elasticsearch.index}`, {
          method: 'HEAD',
          headers: {
            ...(config.elasticsearch.apiKey && { 'Authorization': `ApiKey ${config.elasticsearch.apiKey}` })
          }
        });
        
        if (indexResponse.status === 404) {
          console.warn(`Index '${config.elasticsearch.index}' not found`);
          setConnectionStatus('disconnected');
          setSearchMode('demo');
          return;
        } else if (!indexResponse.ok) {
          throw new Error(`Index check failed: ${indexResponse.status}`);
        }
      }
      
      console.log('Elasticsearch connection successful');
      setConnectionStatus('connected');
      setSearchMode('live');
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      setSearchMode('demo');
    }
  };

  const searchElastic = async (query, filters = {}, currentUser) => {
    if (searchMode === 'demo') {
      console.log('Using demo mode for search');
      return mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.summary.toLowerCase().includes(query.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    try {
      if (!config.elasticsearch.endpoint) {
        throw new Error('Elastic configuration incomplete');
      }

      if (config.elasticsearch.useSearchApplication && config.elasticsearch.searchApplicationName) {
        return await searchWithSearchApplication(query, filters, currentUser);
      } else {
        return await searchWithDirectQuery(query, filters, currentUser);
      }
      
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      
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

  const searchWithSearchApplication = async (query, filters, currentUser) => {
    console.log('Using Elasticsearch Search Applications API');
    
    const searchParams = {
      query: query,
      size: 20,
      from: 0,
      user_context: {
        user_id: currentUser.id,
        department: currentUser.department,
        position: currentUser.position,
        email: currentUser.email
      },
      // Add semantic search parameters
      semantic_enabled: config.elasticsearch.semanticEnabled,
      semantic_model: config.elasticsearch.semanticModel,
      semantic_field_prefix: config.elasticsearch.semanticFieldPrefix,
      hybrid_weight: config.elasticsearch.hybridSearchWeight
    };

    if (filters.source && filters.source.length > 0) {
      searchParams.source_filter = filters.source;
    }

    if (filters.contentType && filters.contentType.length > 0) {
      searchParams.content_type_filter = filters.contentType;
    }

    if (filters.dateRange && filters.dateRange !== 'all') {
      searchParams.date_range = filters.dateRange;
    }

    searchParams.boost_config = getRoleBoosts(currentUser);

    const searchUrl = `${config.elasticsearch.endpoint}/_application/search_application/${config.elasticsearch.searchApplicationName}/_search`;
    
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.elasticsearch.apiKey && { 'Authorization': `ApiKey ${config.elasticsearch.apiKey}` })
      },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search Application error response:', response.status, errorText);
      throw new Error(`Search Application failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.hits || !data.hits.hits) {
      throw new Error('Invalid response format from Search Application');
    }

    setConnectionStatus('connected');
    return processElasticResults(data);
  };

  const searchWithDirectQuery = async (query, filters, currentUser) => {
    console.log('Using direct Elasticsearch query');
    
    if (!config.elasticsearch.index) {
      throw new Error('Elastic index configuration missing');
    }

    // Build the search body with semantic_text if enabled
    let searchBody;
    
    if (config.elasticsearch.semanticEnabled) {
      console.log('Using hybrid semantic + lexical search');
      
      // Hybrid search: combine semantic_text and traditional multi_match
      searchBody = {
        query: {
          bool: {
            should: [
              // Semantic search using semantic_text
              {
                semantic: {
                  field: `${config.elasticsearch.semanticFieldPrefix}content`,
                  query: query,
                  boost: config.elasticsearch.hybridSearchWeight
                }
              },
              {
                semantic: {
                  field: `${config.elasticsearch.semanticFieldPrefix}title`,
                  query: query,
                  boost: config.elasticsearch.hybridSearchWeight * 1.5
                }
              },
              {
                semantic: {
                  field: `${config.elasticsearch.semanticFieldPrefix}summary`,
                  query: query,
                  boost: config.elasticsearch.hybridSearchWeight * 1.2
                }
              },
              // Traditional lexical search
              {
                multi_match: {
                  query: query,
                  fields: [
                    "title^3",
                    "content^2", 
                    "summary^2",
                    "tags^1.5",
                    "name",
                    "description"
                  ],
                  type: "best_fields",
                  fuzziness: "AUTO",
                  boost: 1 - config.elasticsearch.hybridSearchWeight
                }
              }
            ],
            minimum_should_match: 1,
            filter: []
          }
        },
        highlight: {
          fields: {
            title: {},
            content: {},
            summary: {},
            [`${config.elasticsearch.semanticFieldPrefix}content`]: {},
            [`${config.elasticsearch.semanticFieldPrefix}title`]: {},
            [`${config.elasticsearch.semanticFieldPrefix}summary`]: {}
          },
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"]
        },
        size: 20
      };
    } else {
      console.log('Using traditional lexical search');
      
      // Traditional search fallback
      searchBody = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query,
                  fields: [
                    "title^3",
                    "content^2", 
                    "summary^2",
                    "tags^1.5",
                    "name",
                    "description"
                  ],
                  type: "best_fields",
                  fuzziness: "AUTO"
                }
              }
            ],
            filter: []
          }
        },
        highlight: {
          fields: {
            title: {},
            content: {},
            summary: {}
          },
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"]
        },
        size: 20
      };
    }

    // Add filters and boosting logic here...

    const response = await fetch(`${config.elasticsearch.endpoint}/${config.elasticsearch.index}/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.elasticsearch.apiKey && { 'Authorization': `ApiKey ${config.elasticsearch.apiKey}` })
      },
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Direct Elasticsearch error response:', response.status, errorText);
      throw new Error(`Elasticsearch search failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.hits || !data.hits.hits) {
      throw new Error('Invalid response format from Elasticsearch');
    }

    setConnectionStatus('connected');
    return processElasticResults(data);
  };

  const processElasticResults = (elasticResponse) => {
    return elasticResponse.hits.hits.map((hit) => ({
      id: hit._id,
      title: hit._source.title || 'Untitled',
      summary: hit._source.summary || hit._source.content?.substring(0, 200) + '...' || '',
      source: hit._source.source || 'unknown',
      url: hit._source.url || '#',
      author: hit._source.author || 'Unknown',
      date: hit._source.timestamp ? new Date(hit._source.timestamp).toLocaleDateString() : 'Unknown',
      contentType: hit._source.content_type || 'document',
      tags: hit._source.tags || [],
      relevanceScore: Math.round(hit._score * 10),
      highlights: hit.highlight || {},
      content: hit._source.content || hit._source.summary || ''
    }));
  };

  useEffect(() => {
    testConnection();
  }, []);

  return {
    searchElastic,
    connectionStatus,
    searchMode,
    testConnection,
    setSearchMode,
    setConnectionStatus
  };
};