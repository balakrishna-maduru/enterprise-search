// src/services/api_client.ts
import { httpClient, ApiResponse } from './http_client';

// API Response Types
export interface SearchResult {
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
}

export interface Employee {
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
}

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

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  document?: any;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SummaryRequest {
  query: string;
  search_results: Array<{
    title: string;
    summary: string;
    source: string;
    content: string;
    relevance_score: number;
  }>;
}

export interface SummaryResponse {
  summary: string;
  sourceDistribution: Record<string, number>;
  confidenceScore: number;
}

export class ApiClient {
  // Authentication
  async login(email: string, userData?: { name?: string; department?: string; position?: string; role?: string; company?: string }): Promise<ApiResponse<{ access_token: string; token_type: string; user: any }>> {
    const loginData = {
      email,
      name: userData?.name || 'User',
      department: userData?.department || 'Unknown',
      position: userData?.position || 'Employee',
      role: userData?.role || 'employee',
      company: userData?.company || 'Enterprise'
    };
    return httpClient.post('/auth/login', loginData);
  }

  async logout(): Promise<ApiResponse<void>> {
    return httpClient.post('/auth/logout');
  }

  async validateToken(): Promise<ApiResponse<{ valid: boolean; user: any }>> {
    return httpClient.get('/auth/validate');
  }

  // Search APIs
  async searchDocuments(request: SearchRequest): Promise<ApiResponse<{ results: SearchResult[]; total: number; max_score?: number; took: number }>> {
    return httpClient.post('/search', request);
  }

  async searchEmployees(query: string, filters?: any): Promise<ApiResponse<{ employees: Employee[]; total: number; max_score?: number }>> {
    const params = { q: query, ...filters };
    return httpClient.get('/employees/search', { params });
  }

  async getEmployee(employeeId: string): Promise<ApiResponse<Employee>> {
    return httpClient.get(`/employees/${employeeId}`);
  }

  // Chat APIs
  async getChatSessions(): Promise<ApiResponse<ChatSession[]>> {
    return httpClient.get('/chats');
  }

  async saveChatSessions(sessions: ChatSession[]): Promise<ApiResponse<void>> {
    return httpClient.post('/chats', sessions);
  }

  async createChatSession(session: Omit<ChatSession, 'id'>): Promise<ApiResponse<ChatSession>> {
    return httpClient.post('/chats/create', session);
  }

  async deleteChatSession(chatId: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`/chats/${chatId}`);
  }

  async sendChatMessage(chatId: string, message: string): Promise<ApiResponse<ChatMessage>> {
    return httpClient.post(`/chats/${chatId}/messages`, { message });
  }

  // LLM APIs
  async generateSummary(request: SummaryRequest): Promise<ApiResponse<SummaryResponse>> {
    return httpClient.post('/llm/summary', request);
  }

  async generateComprehensiveSummary(documents: any[]): Promise<ApiResponse<{ summary: string }>> {
    return httpClient.post('/llm/comprehensive-summary', { selected_documents: documents });
  }

  async askQuestion(question: string, context?: any): Promise<ApiResponse<{ answer: string; sources: any[] }>> {
    return httpClient.post('/llm/question', { question, context });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return httpClient.get('/health');
  }

  // Generic method for custom endpoints
  async customRequest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any, params?: any): Promise<ApiResponse<T>> {
    switch (method) {
      case 'GET':
        return httpClient.get(endpoint, { params });
      case 'POST':
        return httpClient.post(endpoint, data, { params });
      case 'PUT':
        return httpClient.put(endpoint, data, { params });
      case 'DELETE':
        return httpClient.delete(endpoint, { params });
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
