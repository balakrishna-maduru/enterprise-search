// API Request Types
export interface ApiSearchRequest {
  query: string;
  filters: {
    source: string[];
    date_range: string;
    content_type: string[];
    author?: string[];
    tags?: string[];
  };
  size?: number;
  from?: number;
}

export interface LLMRequest {
  user_id: string;
  query: string;
  results: Array<{
    id: string;
    title: string;
    content: string;
    summary: string;
    source: string;
    author: string;
    department: string;
    content_type: string;
    tags: string[];
    timestamp: string;
    url: string;
  }>;
  type: 'summary' | 'comprehensive' | 'chat';
  context?: string;
}

export interface ChatRequest {
  user_id: string;
  message: string;
  context: Array<{
    id: string;
    title: string;
    content: string;
    summary: string;
    source: string;
    author: string;
    department: string;
    content_type: string;
    tags: string[];
    timestamp: string;
    url: string;
  }>;
}

// API Response Types
export interface ApiSearchResponse {
  success: boolean;
  data: {
    results: Array<{
      id: string;
      title: string;
      content: string;
      summary: string;
      source: string;
      author: string;
      department: string;
      content_type: string;
      tags: string[];
      timestamp: string;
      url: string;
      score?: number;
    }>;
    total: number;
    took: number;
  };
  error?: string;
}

export interface LLMResponse {
  success: boolean;
  data: {
    summary: string;
    processing_time: number;
  };
  error?: string;
}

export interface ApiHealthResponse {
  status: string;
  elasticsearch: string;
  llm_service: string;
  timestamp: string;
  version: string;
}

export interface ApiUsersResponse {
  success: boolean;
  data: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      department: string;
      position: string;
      role: string;
      company: string;
      preferences: Record<string, any>;
      avatar?: string;
      color?: string;
    }>;
  };
  error?: string;
}

export interface ApiLoginRequest {
  email: string;
  password?: string;
}

export interface ApiLoginResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
    user: {
      id: string;
      name: string;
      email: string;
      department: string;
      position: string;
      role: string;
      company: string;
      preferences: Record<string, any>;
      avatar?: string;
      color?: string;
    };
  };
  error?: string;
}

// HTTP Client Types
export interface ApiClient {
  baseURL: string;
  headers: Record<string, string>;
  timeout: number;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}
