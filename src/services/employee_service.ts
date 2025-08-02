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

  async getEmployeeById(id: string | number): Promise<Employee | null> {
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

  async getEmployeeHierarchy(employeeId: string | number): Promise<EmployeeHierarchy | null> {
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

      const apiResponse = await response.json();
      
      if (!apiResponse.success || !apiResponse.data) {
        return null;
      }

      // Transform API response to match frontend expectations
      const data = apiResponse.data;
      const employee = data.employee;
      const managers = data.managers || [];
      const reports = data.reports || [];
      
      // Create hierarchy_tree (target employee with direct reports)
      const hierarchy_tree: HierarchyNode = {
        id: employee.id.toString(),
        name: employee.name,
        title: employee.title,
        department: employee.department || 'Human Resources',
        email: employee.email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        level: employee.level,
        is_target: true,
        reports: reports.map((report: any): HierarchyNode => ({
          id: report.id.toString(),
          name: report.name,
          title: report.title,
          department: report.department || employee.department || 'Human Resources',
          email: report.email || `${report.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          level: report.level,
          is_target: false,
          reports: []
        }))
      };

      // Create management_chain (reverse to get CEO -> ... -> Manager order)
      const management_chain: HierarchyNode[] = managers.reverse().map((manager: any): HierarchyNode => ({
        id: manager.id.toString(),
        name: manager.name,
        title: manager.title,
        department: manager.department || 'Executive',
        email: manager.email || `${manager.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        level: manager.level,
        is_target: false,
        reports: []
      }));

      const transformedHierarchy: EmployeeHierarchy = {
        employee: {
          id: parseInt(employee.id) || 0,
          name: employee.name,
          title: employee.title,
          email: employee.email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          department: employee.department || 'Human Resources',
          location: employee.location || 'Chicago, IL',
          phone: employee.phone || '+1-555-0000',
          start_date: employee.start_date || '2019-11-15',
          manager_id: employee.manager_id,
          level: employee.level,
          has_reports: reports.length > 0,
          report_count: reports.length,
          document_type: 'employee',
          indexed_at: new Date().toISOString(),
          search_text: `${employee.name} ${employee.title}`
        },
        hierarchy_tree,
        management_chain,
        total_employees: 1 + managers.length + reports.length
      };

      console.log('✅ Transformed hierarchy data for UI:', transformedHierarchy);
      return transformedHierarchy;
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
    const employeeMap = new Map<string, HierarchyNode>();
    const rootNodes: HierarchyNode[] = [];

    // Create nodes for all employees
    employees.forEach(employee => {
      employeeMap.set(employee.id.toString(), {
        id: employee.id.toString(),
        name: employee.name,
        title: employee.title,
        email: employee.email,
        department: employee.department,
        level: employee.level,
        is_target: false,
        reports: []
      });
    });

    // Build parent-child relationships
    employees.forEach(employee => {
      const node = employeeMap.get(employee.id.toString());
      if (node) {
        if (employee.manager_id && employeeMap.has(employee.manager_id.toString())) {
          const parentNode = employeeMap.get(employee.manager_id.toString());
          if (parentNode && parentNode.reports) {
            parentNode.reports.push(node);
          }
        } else {
          // Root node (CEO or top-level)
          rootNodes.push(node);
        }
      }
    });

    return rootNodes;
  }
}

// Create and export a singleton instance
export const employeeService = new EmployeeService();
