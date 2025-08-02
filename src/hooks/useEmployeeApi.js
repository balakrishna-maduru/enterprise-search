// src/hooks/useEmployeeApi.js
import { useState, useCallback } from 'react';

export const useEmployeeApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchEmployees = useCallback(async (query, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        q: query,
        size: filters.size || 20,
        ...(filters.department && { department: filters.department }),
        ...(filters.location && { location: filters.location }),
        ...(filters.level && { level: filters.level })
      });

      const response = await fetch(`/api/v1/employees/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search employees: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.employees) {
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

      const response = await fetch(`/api/v1/employees/${employeeId}`);
      
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
