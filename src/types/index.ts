// Employee Types
export interface Employee {
  id: number;
  name: string;
  title: string;
  email: string;
  department: string;
  location: string;
  phone: string;
  start_date: string;
  manager_id?: number;
  level: number;
  has_reports: boolean;
  report_count: number;
  document_type: string;
  indexed_at: string;
  search_text: string;
}

export interface EmployeeHierarchy {
  employee: Employee;
  hierarchy_tree: HierarchyNode;
  management_chain: HierarchyNode[];
  total_employees: number;
}

export interface HierarchyNode {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  level: number;
  reports: HierarchyNode[];
  is_target: boolean;
}

export interface EmployeeSearchResult extends SearchResult {
  employee_data?: Employee;
  hierarchy?: EmployeeHierarchy;
}

// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: 'admin' | 'manager' | 'employee' | 'executive';
  company: string;
  preferences: Record<string, any>;
  avatar?: string;
  color?: string;
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  availableUsers: User[];
  login: (email: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<User | null>;
  fetchAvailableUsers: () => Promise<User[]>;
  getAuthHeaders: () => Record<string, string>;
}

// Search Types
export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url: string;
  author: string;
  timestamp: string;
  department: string;
  tags: string[];
  content_type: string;
  score: number;
  employee_data?: Employee;
}

export interface SearchFilters {
  source: string[];
  dateRange: string;
  contentType: string[];
  author?: string[];
  tags?: string[];
}

export interface SearchRequest {
  query: string;
  filters: SearchFilters;
  size?: number;
  from?: number;
  page?: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
  pagination?: PaginationInfo;
}

// Search Context Types
export interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
  selectedResults: SearchResult[];
  setSelectedResults: (results: SearchResult[]) => void;
  
  // New dual API state
  employeeResults: SearchResult[];
  setEmployeeResults: (results: SearchResult[]) => void;
  documentResults: SearchResult[];
  setDocumentResults: (results: SearchResult[]) => void;
  employeeTotal: number;
  setEmployeeTotal: (total: number) => void;
  documentTotal: number;
  setDocumentTotal: (total: number) => void;
  isDualSearchMode: boolean;
  setIsDualSearchMode: (mode: boolean) => void;
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isConversationalMode: boolean;
  setIsConversationalMode: (mode: boolean) => void;
  conversationalSummary: string;
  setConversationalSummary: (summary: string) => void;
  generatedSummary: string;
  showSummary: boolean;
  setShowSummary: (show: boolean) => void;
  selectedFilters: SearchFilters;
  setSelectedFilters: (filters: SearchFilters) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  connectionStatus: 'connected' | 'error' | 'testing' | 'unauthenticated';
  searchMode: 'api' | 'demo' | 'live';
  testConnection: () => Promise<void>;
  setSearchMode: (mode: 'api' | 'demo' | 'live') => void;
  setConnectionStatus: (status: 'connected' | 'error' | 'testing' | 'unauthenticated') => void;
  executeSearch: (query: string, filters?: Partial<SearchFilters>) => Promise<void>;
  searchType: 'documents' | 'employees' | 'all';
  setSearchType: (type: 'documents' | 'employees' | 'all') => void;
  toggleResultSelection: (result: SearchResult) => void;
  selectAllResults: () => void;
  generateComprehensiveSummary: (results: SearchResult[], user: User) => Promise<string>;
  
  // New dual search methods
  executeDualSearch: (query?: string) => Promise<void>;
  
  // Pagination properties
  pagination: PaginationInfo;
  loadDefaultDocuments: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserListResponse {
  users: User[];
}

// Component Props Types
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ResultCardProps {
  result: SearchResult;
  isSelected: boolean;
  onSelect: (result: SearchResult) => void;
  currentUser: User;
}

export interface SearchBarProps {
  className?: string;
}

export interface UserSelectorProps {
  className?: string;
}

// Configuration Types
export interface Config {
  api: {
    baseUrl: string;
    useApiLayer: boolean;
  };
  elasticsearch: {
    endpoint: string;
    searchApplicationName: string;
    index: string;
    apiKey: string;
    useSearchApplication: boolean;
    semanticEnabled: boolean;
    semanticModel: string;
    semanticFieldPrefix: string;
    hybridSearchWeight: number;
  };
  openai: {
    endpoint: string;
    apiKey: string;
    model: string;
  };
  app: {
    environment: string;
    debug: boolean;
  };
}

// Branding Types
export interface BrandingConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  companyName: {
    short: string;
    full: string;
  };
  logo: {
    url: string;
    alt: string;
  };
}

// Hook Return Types
export interface UseElasticsearchReturn {
  searchElastic: (query: string, filters: SearchFilters, user: User, page?: number, pageSize?: number) => Promise<SearchResult[]>;
  connectionStatus: ConnectionStatus;
  searchMode: SearchMode;
  testConnection: () => Promise<void>;
  setSearchMode: (mode: SearchMode) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export interface UseApiSearchReturn {
  searchElastic: (query: string, filters: SearchFilters, user: User, page?: number, pageSize?: number) => Promise<SearchResult[]>;
  searchWithTotal: (query: string, filters: SearchFilters, user: User, page?: number, pageSize?: number) => Promise<{ results: SearchResult[], total: number }>;
  connectionStatus: ConnectionStatus;
  searchMode: SearchMode;
  testConnection: () => Promise<void>;
  setSearchMode: (mode: SearchMode) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export interface UseLLMReturn {
  generateSummary: (query: string, results: SearchResult[], user: User) => Promise<string>;
  generateComprehensiveSummary: (results: SearchResult[], user: User) => Promise<string>;
  generateChatResponse: (message: string, context: SearchResult[], user: User) => Promise<string>;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Utility Types
export type ConnectionStatus = 'connected' | 'error' | 'testing' | 'unauthenticated';
export type SearchMode = 'api' | 'demo' | 'live';
export type UserRole = 'admin' | 'manager' | 'employee' | 'executive';

// File Upload Types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  uploadedAt: Date;
}
