import { Employee, EmployeeHierarchy, HierarchyNode } from '../types';
import { config } from '../config';

export class EmployeeService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Use API layer for employee search
  async searchEmployees(query: string, size: number = 20): Promise<Employee[]> {
    if (!config.api.useApiLayer) {
      console.warn('API layer not enabled, returning empty results');
      return [];
    }

    try {
      const url = `${this.baseUrl}/employees/search?q=${encodeURIComponent(query)}&size=${size}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const employees = data.data?.employees || [];
      console.log(`✅ Found ${employees.length} employees for query: "${query}"`);
      
      return employees;
    } catch (error) {
      console.error('❌ Employee search error:', error);
      return [];
    }
  }

  async getEmployeeById(id: number): Promise<Employee | null> {
    if (!config.api.useApiLayer) {
      console.warn('API layer not enabled, returning null');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/employees/${id}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.employee || null;
    } catch (error) {
      console.error('Employee fetch error:', error);
      return null;
    }
  }

  async getEmployeeHierarchy(employeeId: number): Promise<EmployeeHierarchy | null> {
    if (!config.api.useApiLayer) {
      console.warn('API layer not enabled, returning null');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/employees/${employeeId}/hierarchy`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.hierarchy || null;
    } catch (error) {
      console.error('Employee hierarchy fetch error:', error);
      return null;
    }
  }

  async getDirectReports(managerId: number): Promise<Employee[]> {
    if (!config.api.useApiLayer) {
      console.warn('API layer not enabled, returning empty results');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/employees/search?manager_id=${managerId}&size=100`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.employees || [];
    } catch (error) {
      console.error('Direct reports fetch error:', error);
      return [];
    }
  }

  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    if (!config.api.useApiLayer) {
      console.warn('API layer not enabled, returning empty results');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/employees/search?department=${encodeURIComponent(department)}&size=100`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.employees || [];
    } catch (error) {
      console.error('Department employees fetch error:', error);
      return [];
    }
  }

  async getOrgChart(): Promise<HierarchyNode[]> {
    if (!config.api.useApiLayer) {
      console.warn('API layer not enabled, returning empty results');
      return [];
    }

    try {
      // Get all employees
      const response = await fetch(`${this.baseUrl}/employees/search?size=1000`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const employees: Employee[] = data.employees || [];

      // Build hierarchical structure
      return this.buildOrgChart(employees);
    } catch (error) {
      console.error('Org chart fetch error:', error);
      return [];
    }
  }

  private buildOrgChart(employees: Employee[]): HierarchyNode[] {
    const employeeMap = new Map<number, HierarchyNode>();
    const rootNodes: HierarchyNode[] = [];

    // Create nodes for all employees
    employees.forEach(employee => {
      employeeMap.set(employee.id, {
        id: employee.id,
        name: employee.name,
        title: employee.title,
        level: employee.level,
        children: []
      });
    });

    // Build parent-child relationships
    employees.forEach(employee => {
      const node = employeeMap.get(employee.id);
      if (node) {
        if (employee.manager_id && employeeMap.has(employee.manager_id)) {
          const parentNode = employeeMap.get(employee.manager_id);
          if (parentNode && parentNode.children) {
            parentNode.children.push(node);
          }
        } else {
          // This is a root node (no manager or manager not found)
          rootNodes.push(node);
        }
      }
    });

    return rootNodes;
  }
}

// Create and export a singleton instance
export const employeeService = new EmployeeService();
