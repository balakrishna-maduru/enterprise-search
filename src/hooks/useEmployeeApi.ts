// src/hooks/useEmployeeApi.ts
import { useState, useCallback } from 'react';
import { Employee } from '../services/api_client';
import { employeeApiService, EmployeeSearchFilters } from '../services/employee_api_service';

interface EmployeeSearchResult {
  employees: Employee[];
  total: number;
  success: boolean;
}

export const useEmployeeApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchEmployees = useCallback(async (query: string, filters: EmployeeSearchFilters = {}): Promise<EmployeeSearchResult> => {
    try {
      setLoading(true);
      setError(null);

      const result = await employeeApiService.searchEmployees(query, filters);
      
      return {
        employees: result.employees,
        total: result.total,
        success: result.success
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search employees';
      setError(errorMessage);
      console.error('Employee search error:', err);
      return {
        employees: [],
        total: 0,
        success: false
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmployee = useCallback(async (employeeId: string): Promise<Employee | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await employeeApiService.getEmployee(employeeId);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get employee');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get employee';
      setError(errorMessage);
      console.error('Get employee error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    searchEmployees,
    getEmployee
  };
};
