// src/services/api_service.ts
import { SearchResult, Employee } from '../types';

export interface SearchRequest {
  query: string;
  filters: {
    source: string[];
    content_type: string[];
    date_range: string;
    author: string[];
    tags: string[];
    exclude_content_type?: string[];
  };
  size: number;
  from_: number;
  semantic_enabled: boolean;
  hybrid_weight: number;
}

export interface SearchApiResponse {
  success: boolean;
  data: {
    results: Array<{
      id: string;
      name: string;
      title: string;
      email: string;
      department: string;
      location: string;
      phone?: string;
      start_date: string;
      manager_id?: number;
      level: number;
      has_reports?: boolean;
      report_count?: number;
      document_type?: string;
      indexed_at?: string;
      search_text?: string;
      skills?: string[];
      bio?: string;
      score?: number;
      content?: string;
      summary?: string;
      source?: string;
      author?: string;
      content_type?: string;
      tags?: string[];
      timestamp?: string;
      url?: string;
    }>;
    total: number;
    max_score?: number;
    took: number;
  };
}

export interface ApiEmployeeResponse {
  success: boolean;
  data: {
    employees: Array<{
      id: number;
      name: string;
      title: string;
      email: string;
      department: string;
      location: string;
      phone?: string;
      start_date: string;
      manager_id?: number;
      level: number;
      has_reports?: boolean;
      report_count?: number;
      document_type?: string;
      indexed_at?: string;
      search_text?: string;
      skills?: string[];
      bio?: string;
    }>;
    total: number;
    max_score?: number;
  };
}

export class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = 'http://localhost:8000/api/v1') {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string> {
    if (this.authToken) {
      return this.authToken;
    }

    try {
      // Login to get a proper JWT token
      const loginResponse = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'balu@mymail.com',
          password: 'test' // Using mock user from the auth middleware
        })
      });

      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }

      const loginData = await loginResponse.json();
      this.authToken = loginData.access_token;
      console.log('✅ Successfully authenticated and got JWT token');
      return this.authToken!; // We know it's not null here
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw new Error('Failed to authenticate with API');
    }
  }

  private async getAuthHeaders(currentUser?: any): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    try {
      // Try to get token from currentUser first
      if (currentUser?.token) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
        console.log('🔑 Using currentUser token for auth');
      } else {
        // Get JWT token for API access
        const token = await this.getAuthToken();
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Using API service token for auth');
      }
    } catch (error) {
      console.warn('⚠️ Could not get auth token:', error);
      // Continue without auth - let the API return 401 if needed
    }

    return headers;
  }

  async searchWithApi(
    query: string = '', 
    size: number = 10, 
    currentUser?: any,
    contentTypes: string[] = [],
    from: number = 0,
    excludeContentTypes: string[] = []
  ): Promise<{results: SearchResult[], total: number}> {
    try {
      // For "*" query or empty query, we want all documents
      const isWildcardQuery = query === '*' || query.trim() === '';
      
      // Handle content type filtering - if we have exclusions, we need to be more careful
      let finalContentTypes = isWildcardQuery ? [] : contentTypes;
      
      // If we have excluded content types and no specific content types, we need all types except excluded ones
      if (excludeContentTypes.length > 0 && finalContentTypes.length === 0) {
        // For now, we'll handle this in the backend by using the filters
        finalContentTypes = [];
      }
      
      const searchRequest: SearchRequest = {
        query: isWildcardQuery ? '' : query, // Convert "*" to empty string for match_all
        filters: {
          source: [],
          content_type: finalContentTypes,
          date_range: 'all',
          author: [], // Don't filter by author for better results
          tags: [],
          // Add excluded content types to the request (we'll need to modify the backend to handle this)
          exclude_content_type: excludeContentTypes
        },
        size,
        from_: from,
        semantic_enabled: !isWildcardQuery, // Disable semantic search for wildcard queries
        hybrid_weight: isWildcardQuery ? 0 : 0.7
      };

      const url = `${this.baseUrl}/search`;
      console.log('🔍 Making search API request:', { 
        url, 
        query: query === '*' ? 'WILDCARD (*)' : query,
        searchRequest 
      });
      
      // Get authentication headers
      const headers = await this.getAuthHeaders(currentUser);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(searchRequest)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', { 
          status: response.status, 
          statusText: response.statusText,
          body: errorText 
        });
        
        if (response.status === 401) {
          throw new Error('Authentication failed - please login');
        }
        
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const apiResponse = await response.json();
      console.log('✅ Search API Response:', apiResponse);

      // Handle both direct response format and wrapped response format
      let results = [];
      let total = 0;
      
      if (apiResponse.results) {
        // Direct format from search API
        results = apiResponse.results;
        total = apiResponse.total || results.length;
        console.log(`✅ Found ${results.length} results in direct format, total: ${total}`);
      } else if (apiResponse.success && apiResponse.data && apiResponse.data.results) {
        // Wrapped format
        results = apiResponse.data.results;
        total = apiResponse.data.total || results.length;
        console.log(`✅ Found ${results.length} results in wrapped format, total: ${total}`);
      } else {
        console.warn('⚠️ API returned unexpected format:', apiResponse);
        return { results: [], total: 0 };
      }

      if (!results || results.length === 0) {
        console.warn('⚠️ API returned no search results');
        return { results: [], total: 0 };
      }

      // Transform API search results to SearchResult format
      const transformedResults = results.map((result: any) => {
        // If it's an employee record, create Employee object
        let employee_data: Employee | undefined;
        if (result.content_type === 'employee' || result.document_type === 'employee') {
          employee_data = {
            id: String(result.id),
            name: result.name || result.title,
            title: result.title || '',
            email: result.email || '',
            department: result.department || '',
            location: result.location || '',
            phone: result.phone || '',
            start_date: result.start_date || result.timestamp || '',
            manager_id: result.manager_id,
            level: result.level || 1,
            has_reports: result.has_reports || false,
            report_count: result.report_count || 0,
            document_type: result.document_type || 'employee',
            indexed_at: result.indexed_at || new Date().toISOString(),
            search_text: result.search_text || `${result.name} ${result.title} ${result.department}`
          };
        }

        return {
          id: result.id || `result_${Math.random()}`,
          title: result.name || result.title || 'Untitled',
          content: result.content || result.bio || `${result.title} in ${result.department}`,
          summary: result.summary || `${result.name || result.title} - ${result.title} in ${result.department}${result.location ? `, located in ${result.location}` : ''}`,
          source: result.source || 'search',
          author: result.author || 'System',
          department: result.department || 'Unknown',
          content_type: result.content_type || result.document_type || 'document',
          tags: result.tags || [
            result.department?.toLowerCase().replace(/\s+/g, '-'),
            result.title?.toLowerCase().replace(/\s+/g, '-'),
            ...(result.skills || []).map((skill: string) => skill.toLowerCase().replace(/\s+/g, '-'))
          ].filter(Boolean),
          timestamp: result.timestamp || result.start_date || new Date().toISOString(),
          url: result.url || (result.email ? `mailto:${result.email}` : '#'),
          score: result.score || 100,
          ...(employee_data && { employee_data })
        } as SearchResult;
      });
      
      return { results: transformedResults, total };
    } catch (error) {
      console.error('❌ Failed to fetch data from search API:', error);
      throw error;
    }
  }

  async getDefaultRecords(currentUser?: any, size: number = 10, from: number = 0): Promise<{results: SearchResult[], total: number}> {
    try {
      console.log('🔍 Getting ONLY logged-in user for page 1');
      console.log('🔍 Current user:', currentUser);
      
      const results: SearchResult[] = [];
      
      // ONLY add the logged-in user (balu) - no other employees on page 1
      if (currentUser) {
        const loggedInUserResult: SearchResult = {
          id: `user_${currentUser.id || 'current'}`,
          title: currentUser.name || 'Current User',
          content: `${currentUser.position || currentUser.title || 'Employee'} in ${currentUser.department || 'Unknown Department'}${currentUser.company ? ` at ${currentUser.company}` : ''}`,
          summary: `${currentUser.name} - ${currentUser.position || currentUser.title || 'Employee'} in ${currentUser.department || 'Unknown Department'}${currentUser.email ? `, Contact: ${currentUser.email}` : ''}`,
          source: 'user-profile',
          author: 'System',
          department: currentUser.department || 'Unknown',
          content_type: 'employee',
          tags: [
            currentUser.department?.toLowerCase().replace(/\s+/g, '-'),
            currentUser.role?.toLowerCase().replace(/\s+/g, '-'),
            'logged-in-user'
          ].filter(Boolean),
          timestamp: new Date().toISOString(),
          url: currentUser.email ? `mailto:${currentUser.email}` : '#',
          score: 100,
          employee_data: {
            id: String(currentUser.id || 999), // Ensure id is string
            employeeId: String(currentUser.employeeId || currentUser.id || 'unknown'), // Add employeeId
            name: currentUser.name || 'Current User',
            title: currentUser.position || currentUser.title || 'Employee',
            email: currentUser.email || '',
            department: currentUser.department || 'Unknown',
            location: currentUser.location || 'Unknown',
            phone: currentUser.phone || '',
            start_date: currentUser.start_date || new Date().toISOString(),
            manager_id: currentUser.manager_id,
            level: currentUser.level || 1,
            has_reports: currentUser.has_reports || false,
            report_count: currentUser.report_count || 0,
            document_type: 'employee',
            indexed_at: new Date().toISOString(),
            search_text: `${currentUser.name} ${currentUser.position || currentUser.title} ${currentUser.department}`
          }
        };
        
        results.push(loggedInUserResult);
        console.log('✅ Added ONLY logged-in user to page 1 results');
      }
      
      console.log(`✅ Page 1 results: ${results.length} (only logged-in user)`);
      // For page 1, we only return the logged-in user (total = 1)
      // The total pages will be calculated considering non-employee documents in loadDefaultDocuments
      return { results, total: 1 };
      
    } catch (error) {
      console.warn('⚠️ Error in getDefaultRecords:', error);
      return { results: [], total: 0 };
    }
  }

  async getNonEmployeeDocuments(currentUser?: any, size: number = 10, from: number = 0): Promise<{results: SearchResult[], total: number}> {
    try {
      console.log(`🔍 Getting non-employee documents (page 2+) starting from ${from}...`);
      
      // Get documents and tickets ONLY (positive filter instead of exclude)
      const documentsResponse = await this.searchWithApi('', size, currentUser, ['document', 'ticket'], from);
      
      if (documentsResponse && documentsResponse.results) {
        console.log(`✅ Got ${documentsResponse.results.length} non-employee documents, total available: ${documentsResponse.total}`);
        return documentsResponse;
      } else {
        console.warn('⚠️ No non-employee documents found');
        return { results: [], total: 0 };
      }
      
    } catch (error) {
      console.error('❌ Failed to get non-employee documents:', error);
      return { results: [], total: 0 };
    }
  }

  // Keep the existing employee search method as fallback

  async searchEmployees(query: string = '', size: number = 10, page: number = 1): Promise<SearchResult[]> {
    try {
      const url = `${this.baseUrl}/employees/search?q=${encodeURIComponent(query)}&size=${size}&page=${page}`;
      console.log('🔍 Fetching employees from API:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const apiResponse: ApiEmployeeResponse = await response.json();
      console.log('✅ API Response:', apiResponse);

      // Check if response is successful and has data
      if (!apiResponse.success || !apiResponse.data || !apiResponse.data.employees) {
        console.warn('⚠️ API returned no employee data');
        return [];
      }

      // Transform API employee data to SearchResult format
      return apiResponse.data.employees.map((apiEmployee: any) => {
        // Create proper Employee object
        const employee: Employee = {
          id: String(apiEmployee.id), // Ensure id is string
          employeeId: String(apiEmployee.employeeId || apiEmployee.id), // Add employeeId
          name: apiEmployee.name,
          title: apiEmployee.title,
          email: apiEmployee.email,
          department: apiEmployee.department,
          location: apiEmployee.location,
          phone: apiEmployee.phone || '',
          start_date: apiEmployee.start_date,
          manager_id: apiEmployee.manager_id,
          level: apiEmployee.level,
          has_reports: apiEmployee.has_reports || false,
          report_count: apiEmployee.report_count || 0,
          document_type: apiEmployee.document_type || 'employee',
          indexed_at: apiEmployee.indexed_at || new Date().toISOString(),
          search_text: apiEmployee.search_text || `${apiEmployee.name} ${apiEmployee.title} ${apiEmployee.department}`
        };

        return {
          id: `employee_${apiEmployee.id}`,
          title: apiEmployee.name,
          content: `${apiEmployee.title} in ${apiEmployee.department}${apiEmployee.bio ? `. ${apiEmployee.bio}` : ''}`,
          summary: `${apiEmployee.name} - ${apiEmployee.title} in ${apiEmployee.department}, located in ${apiEmployee.location}${apiEmployee.skills ? `. Skills: ${apiEmployee.skills.join(', ')}` : ''}`,
          source: 'employees',
          author: 'HR System',
          department: apiEmployee.department,
          content_type: 'employee',
          tags: [
            apiEmployee.department.toLowerCase().replace(/\s+/g, '-'),
            apiEmployee.title.toLowerCase().replace(/\s+/g, '-'),
            `level-${apiEmployee.level}`,
            apiEmployee.location.toLowerCase().replace(/\s+/g, '-'),
            ...(apiEmployee.skills || []).map((skill: string) => skill.toLowerCase().replace(/\s+/g, '-'))
          ],
          timestamp: apiEmployee.start_date,
          url: `mailto:${apiEmployee.email}`,
          score: 100,
          employee_data: employee
        } as SearchResult;
      });
    } catch (error) {
      console.error('❌ Failed to fetch employees from API:', error);
      // Return empty array on error - let the calling code handle fallbacks
      throw error;
    }
  }

  async getDefaultEmployees(size: number = 10): Promise<SearchResult[]> {
    // For default/landing page, get employees without specific query
    return this.searchEmployees('', size, 1);
  }

  // New method: Search only documents (excludes employees)
  async searchDocumentsOnly(
    query: string = '', 
    size: number = 10, 
    currentUser?: any,
    from: number = 0
  ): Promise<{results: SearchResult[], total: number}> {
    try {
      // Use the document search API endpoint: /api/v1/search
      const isWildcardQuery = query === '*' || query.trim() === '';
      
      const searchRequest: SearchRequest = {
        query: isWildcardQuery ? '' : query,
        filters: {
          source: [],
          content_type: [], // Let the backend filter out employees
          date_range: 'all',
          author: [],
          tags: [],
          exclude_content_type: ['employee'] // Explicitly exclude employees
        },
        size,
        from_: from,
        semantic_enabled: !isWildcardQuery,
        hybrid_weight: isWildcardQuery ? 0 : 0.7
      };

      const url = `${this.baseUrl}/search`; // Document search endpoint
      console.log('🔍 Making document search API request:', { url, query, searchRequest });
      
      const headers = await this.getAuthHeaders(currentUser);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(searchRequest)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Document API Response Error:', { 
          status: response.status, 
          statusText: response.statusText,
          body: errorText 
        });
        throw new Error(`Document API Error: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      console.log('✅ Document Search API Response:', apiResponse);

      let results = [];
      let total = 0;
      
      if (apiResponse.results) {
        results = apiResponse.results;
        total = apiResponse.total || results.length;
      } else if (apiResponse.success && apiResponse.data && apiResponse.data.results) {
        results = apiResponse.data.results;
        total = apiResponse.data.total || results.length;
      }

      // Transform to SearchResult format
      const transformedResults = results.map((result: any) => ({
        id: result.id || `doc_${Math.random()}`,
        title: result.title || 'Untitled Document',
        content: result.content || '',
        summary: result.summary || '',
        source: result.source || 'search',
        author: result.author || 'System',
        department: result.department || 'Unknown',
        content_type: result.content_type || 'document',
        tags: result.tags || [],
        timestamp: result.timestamp || result.date || new Date().toISOString(),
        url: result.url || '#',
        score: result.score || result.relevance_score || 100,
        highlights: result.highlights
      }));
      
      return { results: transformedResults, total };
    } catch (error) {
      console.error('❌ Failed to search documents:', error);
      return { results: [], total: 0 };
    }
  }

  // New method: Search documents with filters
  async searchDocumentsWithFilters(
    query: string = '', 
    size: number = 10, 
    currentUser?: any,
    employeeFrom: number = 0,
    documentFrom: number = 0,
    filters?: any
  ): Promise<{results: SearchResult[], total: number}> {
    const isWildcardQuery = query === '*' || query.trim() === '';
    const from = documentFrom || 0;
    const searchRequest: SearchRequest = {
      query: isWildcardQuery ? '' : query,
      filters: filters || {},
      size,
      from_: from,
      semantic_enabled: !isWildcardQuery,
      hybrid_weight: isWildcardQuery ? 0 : 0.7
    };

    const url = `${this.baseUrl}/search`;
    console.log('🔍 Making filtered documents search:', { 
      url, 
      query: query === '*' ? 'WILDCARD (*)' : query,
      filters: searchRequest.filters
    });

    const headers = await this.getAuthHeaders(currentUser);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(searchRequest)
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const apiResponse = await response.json();
    console.log('📥 Filtered documents search API response:', apiResponse);

    // Handle both direct response format and wrapped response format
    let results = [];
    let total = 0;
    
    if (apiResponse.results) {
      // Direct format from search API
      results = apiResponse.results;
      total = apiResponse.total || results.length;
    } else if (apiResponse.success && apiResponse.data && apiResponse.data.results) {
      // Wrapped format
      results = apiResponse.data.results;
      total = apiResponse.data.total || results.length;
    } else {
      console.warn('⚠️ Filtered search API returned unexpected format:', apiResponse);
      return { results: [], total: 0 };
    }

    if (!results || results.length === 0) {
      console.warn('⚠️ Filtered search API returned no results');
      return { results: [], total: 0 };
    }

    // Transform API search results to SearchResult format (inline transformation)
    const transformedResults = results.map((result: any) => {
      return {
        id: result.id?.toString() || Math.random().toString(),
        title: result.title || result.name || 'Untitled',
        content: result.content || result.search_text || result.bio || '',
        summary: result.summary || result.content?.substring(0, 200) || '',
        source: result.source || 'Unknown',
        author: result.author || 'Unknown',
        department: result.department || 'Unknown',
        content_type: result.content_type || result.document_type || 'document',
        tags: result.tags || [],
        timestamp: result.timestamp || result.indexed_at || new Date().toISOString(),
        url: result.url || '#',
        score: result.score || 0
      } as SearchResult;
    });

    console.log('✅ Filtered documents search transformed results:', transformedResults.length);

    return { results: transformedResults, total };
  } catch (error: unknown) {
    console.error('❌ Filtered documents search error:', error);
    return { results: [], total: 0 };
  }

  // New method: Search only employees
  async searchEmployeesOnly(
    query: string = '', 
    size: number = 10, 
    currentUser?: any,
    from: number = 0
  ): Promise<{results: SearchResult[], total: number}> {
    try {
      // Use the employee search API endpoint: /api/v1/employees/search
      const url = `${this.baseUrl}/employees/search`;
      
      // Build query parameters for the employee search endpoint
      const params = new URLSearchParams();
      if (query.trim()) {
        params.append('q', query);
      } else {
        params.append('q', '*'); // Search all employees
      }
      params.append('size', size.toString());
      
      const fullUrl = query.trim() ? `${url}?${params.toString()}` : `${url}?q=*&size=${size}`;
      console.log('👥 Making employee search API request:', { fullUrl, query });
      
      const headers = await this.getAuthHeaders(currentUser);
      delete headers['Content-Type']; // GET request doesn't need Content-Type
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Employee API Response Error:', { 
          status: response.status, 
          statusText: response.statusText,
          body: errorText 
        });
        throw new Error(`Employee API Error: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      console.log('✅ Employee Search API Response:', apiResponse);

      let employees = [];
      let total = 0;
      
      if (apiResponse.data && apiResponse.data.employees) {
        employees = apiResponse.data.employees;
        total = apiResponse.data.total || employees.length;
      } else if (apiResponse.employees) {
        employees = apiResponse.employees;
        total = apiResponse.total || employees.length;
      }

      // Transform employee data to SearchResult format
      const transformedResults = employees.map((emp: any) => {
        const id = emp.employeeId || emp.id || emp._id;
        const employee_data: Employee = {
          id: String(id), // Ensure id is string
          employeeId: id,
          name: emp.fullName || 'Unknown',
          title: emp.designations || '',
          email: emp.emailAddress || '',
          department: emp.departments || '',
          location: emp.city || '',
          phone: emp.contactNos || '',
          start_date: emp.startDate || '', // This field is not in the sample data
          manager_id: emp.managerEmpId ? parseInt(emp.managerEmpId) : undefined,
          level: emp.level || 0, // This field is not in the sample data
          has_reports: emp.has_reports || false,
          report_count: emp.report_count || 0,
          document_type: 'employee',
          indexed_at: emp.modified || new Date().toISOString(),
          search_text: `${emp.fullName} ${emp.designations} ${emp.departments}`
        };

        return {
          id: id || `emp_${Math.random()}`,
          employeeId: id,
          title: emp.fullName || 'Unknown Employee',
          content: `${emp.designations || 'Employee'} in ${emp.departments || 'Unknown Department'}${emp.city ? ` - ${emp.city}` : ''}`,
          summary: `${emp.fullName || 'Unknown'} - ${emp.designations || 'Employee'} in ${emp.departments || 'Unknown Department'}`,
          source: 'employee-directory',
          author: 'HR System',
          department: emp.departments || 'Unknown',
          content_type: 'employee',
          tags: [
            emp.departments?.toLowerCase().replace(/\s+/g, '-'),
            emp.designations?.toLowerCase().replace(/\s+/g, '-'),
            'employee'
          ].filter(Boolean),
          timestamp: emp.modified || new Date().toISOString(),
          url: emp.profileUrl || (emp.emailAddress ? `mailto:${emp.emailAddress}` : '#'),
          score: emp.score || emp._score || 100,
          employee_data
        } as SearchResult;
      });
      
      return { results: transformedResults, total };
    } catch (error) {
      console.error('❌ Failed to search employees:', error);
      return { results: [], total: 0 };
    }
  }

  // New method: Dual search - returns both employees and documents separately
  async dualSearch(
    query: string = '', 
    employeeSize: number = 5, 
    documentSize: number = 5,
    currentUser?: any,
    employeeFrom: number = 0,
    documentFrom: number = 0
  ): Promise<{
    employees: {results: SearchResult[], total: number},
    documents: {results: SearchResult[], total: number}
  }> {
    try {
  // Always use backend; if healthCheck fails, let subsequent calls error
      
      // Execute both searches in parallel
      const [employeeResponse, documentResponse] = await Promise.all([
        this.searchEmployeesOnly(query, employeeSize, currentUser, employeeFrom),
        this.searchDocumentsOnly(query, documentSize, currentUser, documentFrom)
      ]);

      console.log('✅ Dual search completed:', {
        employees: employeeResponse.results.length,
        employeesTotal: employeeResponse.total,
        documents: documentResponse.results.length,
        documentsTotal: documentResponse.total
      });

      return {
        employees: employeeResponse,
        documents: documentResponse
      };
    } catch (error) {
      console.error('❌ Dual search failed:', error);
      throw error;
    }
  }

  // New method: Load default landing page data with dual calls
  async loadLandingPageData(
    currentUser?: any,
    employeeSize: number = 5,
    documentSize: number = 5
  ): Promise<{
    employees: {results: SearchResult[], total: number},
    documents: {results: SearchResult[], total: number}
  }> {
    try {
  console.log('🚀 Loading landing page data with dual API calls...');
      
      // For landing page, we want:
      // 1. Either the logged-in user only OR top employees
      // 2. Recent/top documents
      
      let employeePromise: Promise<{results: SearchResult[], total: number}>;
      
      if (currentUser?.email) {
        // Get only the logged-in user for employees
        employeePromise = this.getDefaultRecords(currentUser, 1);
      } else {
        // Get top employees if no user is logged in
        employeePromise = this.searchEmployeesOnly('', employeeSize, currentUser, 0);
      }
      
      // Get recent documents (excluding employees)
      const documentPromise = this.searchDocumentsOnly('', documentSize, currentUser, 0);
      
      // Execute both calls in parallel
      const [employeeResponse, documentResponse] = await Promise.all([
        employeePromise,
        documentPromise
      ]);

      console.log('✅ Landing page data loaded:', {
        employees: employeeResponse.results.length,
        employeesTotal: employeeResponse.total,
        documents: documentResponse.results.length,
        documentsTotal: documentResponse.total
      });

      return {
        employees: employeeResponse,
        documents: documentResponse
      };
    } catch (error) {
      console.error('❌ Failed to load landing page data:', error);
      throw error;
    }
  }

  // Health check method to test API connectivity
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
