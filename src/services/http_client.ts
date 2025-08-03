// src/services/http_client.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;
  private maxRetries: number;

  constructor(baseUrl: string = 'http://localhost:8000/api/v1') {
    this.baseUrl = baseUrl;
    this.defaultTimeout = 10000; // 10 seconds
    this.maxRetries = 3;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Log initialization
    console.log(`🚀 HttpClient initialized with baseUrl: ${this.baseUrl}`);
  }

  private getAuthToken(): string | null {
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('🔑 Auth token found and applied');
    }
    return token;
  }

  private getHeaders(config?: RequestConfig): Record<string, string> {
    const headers = {
      ...this.defaultHeaders,
      ...config?.headers,
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const finalUrl = url.toString();
    console.log(`🌐 Request URL: ${finalUrl}`);
    return finalUrl;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          return {
            success: false,
            data: null as T,
            error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        return {
          success: true,
          data: data.data || data,
          message: data.message,
        };
      } else {
        const text = await response.text();
        
        if (!response.ok) {
          return {
            success: false,
            data: null as T,
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        return {
          success: true,
          data: text as T,
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const retries = config?.retries ?? this.maxRetries;
    const retryDelay = config?.retryDelay ?? 1000;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const url = this.buildUrl(endpoint, config?.params);
        const requestOptions: RequestInit = {
          method,
          headers: this.getHeaders(config),
          signal: AbortSignal.timeout(config?.timeout ?? this.defaultTimeout),
        };

        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
          requestOptions.body = JSON.stringify(data);
        }

        console.log(`📡 ${method} request to ${endpoint} (attempt ${attempt + 1}/${retries + 1})`);
        const startTime = Date.now();
        
        const response = await fetch(url, requestOptions);
        const endTime = Date.now();
        
        console.log(`⏱️ Request completed in ${endTime - startTime}ms`);
        
        const result = await this.handleResponse<T>(response);
        
        if (result.success) {
          console.log(`✅ ${method} ${endpoint} succeeded`);
        } else {
          console.warn(`⚠️ ${method} ${endpoint} failed:`, result.error);
        }
        
        return result;
        
      } catch (error) {
        const isLastAttempt = attempt === retries;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        console.error(`❌ ${method} ${endpoint} attempt ${attempt + 1} failed:`, errorMessage);
        
        if (isLastAttempt) {
          return {
            success: false,
            data: null as T,
            error: `Request failed after ${retries + 1} attempts: ${errorMessage}`,
          };
        }
        
        // Wait before retrying
        if (retryDelay > 0) {
          console.log(`⏳ Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    return {
      success: false,
      data: null as T,
      error: 'Maximum retry attempts exceeded',
    };
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, config);
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, config);
  }
}

// Create singleton instance
export const httpClient = new HttpClient();