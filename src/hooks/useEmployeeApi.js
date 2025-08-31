// src/hooks/useEmployeeApi.ts
import { useState, useCallback } from 'react';
import { apiClient, Employee } from '../services/api_client';

interface EmployeeFilters {
  size?: number;
  department?: string;
  location?: string;
  level?: string;
}

interface EmployeeSearchResult {
  employees: Employee[];
  total: number;
  success: boolean;
}

export const useEmployeeApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchEmployees = useCallback(async (query: string, filters: EmployeeFilters = {}): Promise<EmployeeSearchResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.searchEmployees(query, {
        size: filters.size || 20,
        ...(filters.department && { department: filters.department }),
        ...(filters.location && { location: filters.location }),
        ...(filters.level && { level: filters.level })
      });
      
      if (response.success && response.data && response.data.employees) {
        return {
          employees: data.data.employees,
          total: data.data.total,
          maxScore: data.data.max_score
        };
      } else {
        throw new Error('Invalid response format from employee API');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmployee = useCallback(async (employeeId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching employee details for:', JSON.stringify(employeeId));
      const response = await fetch(`/api/v1/employees/${employeeId.employeeId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get employee: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error('Invalid response format from employee API');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchEmployees,
    getEmployee,
    loading,
    error
  };
};
