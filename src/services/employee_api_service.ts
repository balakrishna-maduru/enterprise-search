// src/services/employee_api_service.ts
import { apiClient, Employee } from './api_client';

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

export class EmployeeApiService {
  
  async searchEmployees(
    query: string, 
    filters: EmployeeSearchFilters = {}
  ): Promise<EmployeeSearchResult> {
    try {
      const response = await apiClient.searchEmployees(query, {
        size: filters.size || 20,
        ...(filters.department && { department: filters.department }),
        ...(filters.location && { location: filters.location }),
        ...(filters.level && { level: filters.level })
      });
      
      if (response.success && response.data && response.data.employees) {
        return {
          employees: response.data.employees,
          total: response.data.total,
          success: true
        };
      } else {
        return {
          employees: [],
          total: 0,
          success: false,
          error: response.error || 'Failed to search employees'
        };
      }
    } catch (error) {
      console.error('Employee search error:', error);
      return {
        employees: [],
        total: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search employees'
      };
    }
  }

  async getEmployee(employeeId: string): Promise<{ success: boolean; data?: Employee; error?: string }> {
    try {
      const response = await apiClient.getEmployee(employeeId);
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { 
          success: false, 
          error: response.error || 'Failed to get employee' 
        };
      }
    } catch (error) {
      console.error('Get employee error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get employee' 
      };
    }
  }

  formatEmployeeForDisplay(employee: Employee): any {
    return {
      id: employee.id,
      name: employee.name,
      title: employee.title,
      department: employee.department,
      location: employee.location,
      email: employee.email,
      phone: employee.phone,
      skills: employee.skills || [],
      bio: employee.bio,
      startDate: employee.start_date,
      level: employee.level,
      hasReports: employee.has_reports,
      reportCount: employee.report_count
    };
  }

  filterEmployeesByDepartment(employees: Employee[], department: string): Employee[] {
    return employees.filter(emp => 
      emp.department.toLowerCase().includes(department.toLowerCase())
    );
  }

  filterEmployeesByLocation(employees: Employee[], location: string): Employee[] {
    return employees.filter(emp => 
      emp.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  filterEmployeesBySkills(employees: Employee[], skills: string[]): Employee[] {
    return employees.filter(emp => 
      emp.skills && skills.some(skill => 
        emp.skills!.some(empSkill => 
          empSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  }

  sortEmployeesByName(employees: Employee[], ascending: boolean = true): Employee[] {
    return [...employees].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return ascending ? comparison : -comparison;
    });
  }

  sortEmployeesByLevel(employees: Employee[], ascending: boolean = true): Employee[] {
    return [...employees].sort((a, b) => {
      const comparison = a.level - b.level;
      return ascending ? comparison : -comparison;
    });
  }

  groupEmployeesByDepartment(employees: Employee[]): Record<string, Employee[]> {
    return employees.reduce((groups, employee) => {
      const dept = employee.department;
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(employee);
      return groups;
    }, {} as Record<string, Employee[]>);
  }

  getEmployeeStatistics(employees: Employee[]): {
    totalEmployees: number;
    departmentCounts: Record<string, number>;
    locationCounts: Record<string, number>;
    levelCounts: Record<string, number>;
    averageLevel: number;
  } {
    return {
      totalEmployees: employees.length,
      departmentCounts: this.countByField(employees, 'department'),
      locationCounts: this.countByField(employees, 'location'),
      levelCounts: this.countByField(employees, 'level'),
      averageLevel: employees.reduce((sum, emp) => sum + emp.level, 0) / employees.length || 0
    };
  }

  private countByField(employees: Employee[], field: keyof Employee): Record<string, number> {
    return employees.reduce((counts, employee) => {
      const value = String(employee[field]);
      counts[value] = (counts[value] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }
}

// Create singleton instance
export const employeeApiService = new EmployeeApiService();
