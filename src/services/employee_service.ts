// src/services/employee_service.ts
import { elasticsearchClient } from './elasticsearch_client';
import { Employee, EmployeeHierarchy, HierarchyNode } from '../types';

export interface EmployeeSearchFilters {
  size?: number;
  department?: string;
  location?: string;
  level?: string;
}

export interface EmployeeSearchResult {
  employees: Employee[];
  total: number;
  success: boolean;
  error?: string;
}

// Define the API response structure for hierarchy
interface HierarchyApiResponse {
  success: boolean;
  data: {
    employee: Employee;
    hierarchy_tree: HierarchyNode;
    management_chain: HierarchyNode[];
    total_employees: number;
  };
}

// Define the API response structure for employee search
interface EmployeeSearchApiResponse {
  success: boolean;
  data: {
    employees: Employee[];
    total: number;
    max_score: number | null;
  };
}

export class EmployeeService {
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';
    console.log('🏗️ EmployeeService initialized with API backend');
  }

  // Use backend API for employee search to get consistent Employee type
  async searchEmployees(query: string, size: number = 20): Promise<Employee[]> {
    try {
      console.log('🔍 EmployeeService searching employees:', { query, size });
      
      const response = await fetch(`${this.apiBaseUrl}/employees/search?q=${encodeURIComponent(query)}&size=${size}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: EmployeeSearchApiResponse = await response.json();
      
      if (result.success && result.data && result.data.employees) {
        console.log('✅ EmployeeService search successful:', result.data.employees.length, 'employees found');
        return result.data.employees;
      } else {
        throw new Error('Invalid response from search API');
      }
    } catch (error) {
      console.error('❌ EmployeeService search failed:', error);
      throw error;
    }
  }

  async getEmployeeById(id: string | number): Promise<Employee | null> {
    try {
      console.log('🔍 EmployeeService getting employee by ID:', id);
      
      const response = await fetch(`${this.apiBaseUrl}/employees/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.employee) {
        console.log('✅ EmployeeService getById result:', result.data.employee);
        return result.data.employee;
      }
      
      return null;
    } catch (error) {
      console.error('❌ EmployeeService getById failed:', error);
      return null;
    }
  }

  async getEmployeeHierarchy(employeeId: string | number): Promise<EmployeeHierarchy | null> {
    try {
      console.log('🔍 EmployeeService getting hierarchy for:', employeeId);
      
      // Use the backend API for hierarchy as it has complex logic
      const response = await fetch(`${this.apiBaseUrl}/employees/${employeeId}/hierarchy`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: HierarchyApiResponse = await response.json();
      
      if (result.success && result.data) {
        const hierarchy: EmployeeHierarchy = {
          employee: result.data.employee,
          hierarchy_tree: result.data.hierarchy_tree,
          management_chain: result.data.management_chain,
          total_employees: result.data.total_employees
        };
        
        console.log('✅ EmployeeService hierarchy result:', hierarchy);
        return hierarchy;
      } else {
        throw new Error('Invalid response from hierarchy API');
      }
    } catch (error) {
      console.error('❌ EmployeeService getHierarchy failed:', error);
      return null;
    }
  }

  async searchEmployeesWithFilters(
    query: string, 
    filters: EmployeeSearchFilters = {}
  ): Promise<EmployeeSearchResult> {
    try {
      console.log('🔍 EmployeeService searching with filters:', { query, filters });
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('size', (filters.size || 20).toString());
      
      if (filters.department) {
        params.append('department', filters.department);
      }
      if (filters.location) {
        params.append('location', filters.location);
      }
      if (filters.level) {
        params.append('level', filters.level);
      }
      
      const response = await fetch(`${this.apiBaseUrl}/employees/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: EmployeeSearchApiResponse = await response.json();
      
      if (result.success && result.data) {
        const searchResult: EmployeeSearchResult = {
          employees: result.data.employees,
          total: result.data.total,
          success: true
        };
        
        console.log('✅ EmployeeService filtered search successful:', searchResult);
        return searchResult;
      } else {
        throw new Error('Invalid response from search API');
      }
    } catch (error) {
      console.error('❌ EmployeeService filtered search failed:', error);
      
      return {
        employees: [],
        total: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  async validateEmployee(email: string): Promise<Employee | null> {
    try {
      console.log('🔍 EmployeeService validating employee:', email);
      
      // Use direct Elasticsearch for email validation as it's a simple lookup
      const esEmployee = await elasticsearchClient.validateUserEmail(email);
      
      if (!esEmployee) {
        return null;
      }
      
      // Convert ES Employee to main Employee type by adding missing properties
      const employee: Employee = {
        id: String(esEmployee.id), // Ensure id is string
        employeeId: String(esEmployee.id), // Add employeeId
        name: esEmployee.name,
        title: esEmployee.title,
        email: esEmployee.email,
        department: esEmployee.department,
        location: esEmployee.location || '',
        phone: esEmployee.phone || '',
        start_date: esEmployee.start_date || '',
        manager_id: esEmployee.manager_id ? parseInt(esEmployee.manager_id) : undefined,
        level: esEmployee.level || 0,
        has_reports: false, // Default value
        report_count: 0, // Default value
        document_type: 'employee', // Default value
        indexed_at: new Date().toISOString(), // Default value
        search_text: `${esEmployee.name} ${esEmployee.title} ${esEmployee.department} ${esEmployee.email}` // Generated
      };
      
      console.log('✅ EmployeeService validation result:', employee);
      return employee;
    } catch (error) {
      console.error('❌ EmployeeService validation failed:', error);
      return null;
    }
  }

  async getDirectReports(managerId: number): Promise<Employee[]> {
    try {
      console.log('🔍 EmployeeService getting direct reports for:', managerId);
      
      // Search for employees with this manager ID
      const employees = await this.searchEmployees(`manager_id:${managerId}`, 50);
      console.log('✅ EmployeeService direct reports result:', employees.length, 'reports found');
      
      return employees;
    } catch (error) {
      console.error('❌ EmployeeService getDirectReports failed:', error);
      return [];
    }
  }

  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    try {
      console.log('🔍 EmployeeService getting employees by department:', department);
      
      const employees = await this.searchEmployees(department, 100);
      const filteredEmployees = employees.filter(emp => 
        emp.department?.toLowerCase().includes(department.toLowerCase())
      );
      
      console.log('✅ EmployeeService department search result:', filteredEmployees.length, 'employees found');
      return filteredEmployees;
    } catch (error) {
      console.error('❌ EmployeeService getEmployeesByDepartment failed:', error);
      return [];
    }
  }

  // Additional methods for departments and locations (using API)
  async getDepartments(): Promise<string[]> {
    try {
      console.log('🔍 EmployeeService getting departments list');
      
      const response = await fetch(`${this.apiBaseUrl}/employees/departments/list`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.departments) {
        console.log('✅ EmployeeService departments result:', result.data.departments);
        return result.data.departments;
      }
      
      return [];
    } catch (error) {
      console.error('❌ EmployeeService getDepartments failed:', error);
      return [];
    }
  }

  async getLocations(): Promise<string[]> {
    try {
      console.log('🔍 EmployeeService getting locations list');
      
      const response = await fetch(`${this.apiBaseUrl}/employees/locations/list`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.locations) {
        console.log('✅ EmployeeService locations result:', result.data.locations);
        return result.data.locations;
      }
      
      return [];
    } catch (error) {
      console.error('❌ EmployeeService getLocations failed:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
export const employeeService = new EmployeeService();
export default employeeService;
