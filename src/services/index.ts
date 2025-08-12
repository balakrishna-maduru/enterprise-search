// src/services/index.ts
// Export all services
export { EmployeeService, employeeService } from './employee_service';
export { apiService } from './api_service';
export { httpClient, HttpClient } from './http_client';
export { apiClient, ApiClient } from './api_client';
export { summaryService, SummaryService } from './summary_service';
export { chatApiService } from './chatApiService';
export { employeeApiService, EmployeeApiService } from './employee_api_service';

// Export types
export type { ApiResponse, RequestConfig } from './http_client';
export type {
  SearchResult,
  Employee,
  SearchRequest,
  ChatMessage,
  ChatSession,
  SummaryRequest,
  SummaryResponse
} from './api_client';
export type { EmployeeSearchFilters, EmployeeSearchResult } from './employee_api_service';
