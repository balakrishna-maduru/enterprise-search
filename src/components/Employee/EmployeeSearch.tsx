// src/components/Employee/EmployeeSearch.tsx
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeHierarchy } from '../../types';
import { employeeService } from '../../services/employee_service';
import EmployeeCard from './EmployeeCard';
import EmployeeHierarchyTree from './EmployeeHierarchyTree';
import LoadingSpinner from '../Common/LoadingSpinner';

interface EmployeeSearchProps {
  initialQuery?: string;
  onEmployeeSelect?: (employee: Employee) => void;
}

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({ 
  initialQuery = '', 
  onEmployeeSelect 
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeHierarchy, setEmployeeHierarchy] = useState<EmployeeHierarchy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showHierarchy, setShowHierarchy] = useState<boolean>(false);

  useEffect(() => {
    if (query.trim()) {
      searchEmployees(query);
    } else {
      setEmployees([]);
    }
  }, [query]);

  const searchEmployees = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const results = await employeeService.searchEmployees(searchQuery);
      setEmployees(results);
    } catch (error) {
      console.error('Employee search failed:', error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeClick = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsLoading(true);
    
    try {
      const hierarchy = await employeeService.getEmployeeHierarchy(employee.id);
      setEmployeeHierarchy(hierarchy);
      setShowHierarchy(true);
      
      if (onEmployeeSelect) {
        onEmployeeSelect(employee);
      }
    } catch (error) {
      console.error('Failed to load employee hierarchy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeHierarchy = () => {
    setShowHierarchy(false);
    setSelectedEmployee(null);
    setEmployeeHierarchy(null);
  };

  return (
    <div className="employee-search">
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees by name, title, department..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !showHierarchy && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Search Results */}
      {!isLoading && !showHierarchy && employees.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Found {employees.length} employee{employees.length !== 1 ? 's' : ''}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onClick={() => handleEmployeeClick(employee)}
                showHierarchyButton={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !showHierarchy && query.trim() && employees.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try searching with different keywords or check the spelling.
            </p>
          </div>
        </div>
      )}

      {/* Employee Hierarchy Modal */}
      {showHierarchy && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Organization Hierarchy - {selectedEmployee.name}
              </h2>
              <button
                onClick={closeHierarchy}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : employeeHierarchy ? (
                <EmployeeHierarchyTree hierarchy={employeeHierarchy} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Failed to load hierarchy data
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSearch;
