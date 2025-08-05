// src/services/elasticsearch_client.ts
// Browser-compatible Elasticsearch client using fetch API

export interface Employee {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  location?: string;
  level?: number;
  phone?: string;
  start_date?: string;
  manager_id?: string;
  skills?: string[];
  bio?: string;
  projects?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  company: string;
}

interface SearchResponse {
  hits: {
    total: {
      value: number;
    };
    hits: Array<{
      _id: string;
      _source: Employee;
    }>;
  };
}

class BrowserElasticsearchClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_ELASTICSEARCH_URL || 'http://localhost:9200';
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    console.log(`🔗 Making request to: ${url}`);
    console.log(`📝 Method: ${method}`);
    console.log(`📋 Body:`, body);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        mode: 'cors', // Explicitly set CORS mode
      });

      console.log(`📊 Response status: ${response.status}`);
      console.log(`📊 Response headers:`, [...response.headers.entries()]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Response data:`, result);
      return result;
    } catch (error) {
      console.error('❌ Elasticsearch request failed:', error);
      console.error('🔧 URL attempted:', url);
      console.error('🔧 Method:', method);
      console.error('🔧 Headers:', headers);
      
      // More specific error handling
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Cannot connect to Elasticsearch at ${this.baseUrl}. Check if Elasticsearch is running and CORS is configured.`);
      }
      
      throw error;
    }
  }

  async validateUserEmail(email: string): Promise<Employee | null> {
    try {
      console.log('🔍 Validating email in Elasticsearch:', email);
      console.log('🔗 Using base URL:', this.baseUrl);

      // First test the connection
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.error}`);
      }

      const searchBody = {
        query: {
          term: {
            'email': email // Use 'email' instead of 'email.keyword'
          }
        },
        size: 1
      };

      console.log('📤 Sending search request:', searchBody);

      const response: SearchResponse = await this.makeRequest(
        '/employees/_search',
        'POST',
        searchBody
      );

      console.log('📥 Search response:', response);

      if (response.hits?.total?.value > 0) {
        const employee = response.hits.hits[0]._source;
        console.log('✅ Employee found:', employee);
        return employee;
      }

      console.log('❌ No employee found with email:', email);
      return null;
    } catch (error) {
      console.error('🚨 Elasticsearch validation error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Network error')) {
          throw new Error('Cannot connect to Elasticsearch. Please check if the service is running and accessible.');
        } else if (error.message.includes('CORS')) {
          throw new Error('CORS error: Elasticsearch needs to allow requests from this domain.');
        } else {
          throw new Error(`Elasticsearch error: ${error.message}`);
        }
      }
      
      throw new Error('Failed to validate email against employee directory');
    }
  }

  async searchEmployees(query: string, size: number = 10): Promise<Employee[]> {
    try {
      const searchBody = {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: query,
                  fields: [
                    'name^3',
                    'title^2',
                    'department^2',
                    'email',
                    'location',
                    'skills',
                    'bio'
                  ],
                  type: 'best_fields',
                  fuzziness: 'AUTO'
                }
              },
              {
                wildcard: {
                  'name.keyword': `*${query}*`
                }
              }
            ]
          }
        },
        size,
        sort: [
          { '_score': { 'order': 'desc' } }
        ]
      };

      const response: SearchResponse = await this.makeRequest(
        '/employees/_search',
        'POST',
        searchBody
      );

      return response.hits.hits.map(hit => hit._source);
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      console.log('🏥 Performing Elasticsearch health check...');
      const result = await this.makeRequest('/_cluster/health');
      console.log('✅ Elasticsearch health check successful:', result);
      return true;
    } catch (error) {
      console.error('❌ Elasticsearch health check failed:', error);
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string; info?: any }> {
    try {
      console.log('🧪 Testing Elasticsearch connection...');
      console.log('🔗 Base URL:', this.baseUrl);
      
      // Test basic connectivity
      const healthResult = await this.makeRequest('/');
      console.log('✅ Basic connection successful:', healthResult);
      
      // Test cluster health
      const clusterHealth = await this.makeRequest('/_cluster/health');
      console.log('✅ Cluster health:', clusterHealth);
      
      // Test if employees index exists
      try {
        const indexInfo = await this.makeRequest('/employees');
        console.log('✅ Employees index exists:', indexInfo);
      } catch (indexError) {
        console.warn('⚠️ Employees index may not exist:', indexError);
      }
      
      return { 
        success: true, 
        info: { 
          elasticsearch: healthResult,
          cluster: clusterHealth 
        } 
      };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Create and export the client instance
const elasticsearchClient = new BrowserElasticsearchClient();

// Debug method for testing connection in browser console
(window as any).testElasticsearch = async () => {
  console.log('🧪 Testing Elasticsearch connection from browser...');
  
  try {
    const result = await elasticsearchClient.testConnection();
    console.log('🎯 Connection test result:', result);
    
    if (result.success) {
      console.log('✅ Connection successful! Testing employee search...');
      
      // Test with a sample email
      const testEmail = 'john.doe@company.com';
      console.log(`🔍 Testing with email: ${testEmail}`);
      
      const employee = await elasticsearchClient.validateUserEmail(testEmail);
      console.log('👤 Employee result:', employee);
      
    } else {
      console.error('❌ Connection failed:', result.error);
    }
  } catch (error) {
    console.error('🚨 Test failed:', error);
  }
};

console.log('🔧 Debug: Run testElasticsearch() in browser console to test connection');

export { elasticsearchClient };
export default elasticsearchClient;
