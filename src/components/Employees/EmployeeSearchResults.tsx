// src/components/Employees/EmployeeSearchResults.tsx
import React, { useState } from 'react';
import { SearchResult, EmployeeHierarchy } from '../../types';
import { EmployeeService } from '../../services/employee_service';
import EmployeeHierarchyTree from '../Employee/EmployeeHierarchyTree';

interface EmployeeSearchResultsProps {
  employeeResults: SearchResult[];
  maxInitialDisplay?: number;
  onContactEmployee?: (employee: SearchResult) => void;
}

export const EmployeeSearchResults: React.FC<EmployeeSearchResultsProps> = ({ 
  employeeResults, 
  maxInitialDisplay = 2,
  onContactEmployee 
}) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedEmployeeHierarchy, setSelectedEmployeeHierarchy] = useState<EmployeeHierarchy | null>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState<string | null>(null);
  const employeeService = new EmployeeService();
  
  if (employeeResults.length === 0) {
    return null;
  }

  const displayedEmployees = showAll ? employeeResults : employeeResults.slice(0, maxInitialDisplay);
  const hasMore = employeeResults.length > maxInitialDisplay;

  const handleContact = (employee: SearchResult) => {
    if (onContactEmployee) {
      onContactEmployee(employee);
    } else {
      // Extract email from employee_data or use url field
      const email = employee.employee_data?.email || employee.url?.replace('mailto:', '') || '';
      if (email) {
        window.location.href = `mailto:${email}`;
      }
    }
  };

  const handleViewHierarchy = async (employee: SearchResult) => {
    const employeeId = employee.employee_data?.id;
    if (!employeeId) {
      console.warn('No employee ID found for hierarchy');
      return;
    }

    setLoadingHierarchy(employee.id);
    try {
      const hierarchy = await employeeService.getEmployeeHierarchy(Number(employeeId));
      if (hierarchy) {
        setSelectedEmployeeHierarchy(hierarchy);
      } else {
        alert('No hierarchy data available for this employee');
      }
    } catch (error) {
      console.error('Failed to load employee hierarchy:', error);
      alert('Failed to load employee hierarchy');
    } finally {
      setLoadingHierarchy(null);
    }
  };

  const closeHierarchyView = () => {
    setSelectedEmployeeHierarchy(null);
  };

  return (
    <>
      <div className="mb-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">
              Employees
            </h3>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
              {employeeResults.length}
            </span>
          </div>
        </div>

      {/* Employee Cards */}
      <div className="space-y-3">
        {displayedEmployees.map((employee) => {
          const employeeData = employee.employee_data;
          const name = employee.title || employeeData?.name || 'Unknown';
          const position = employeeData?.title || 'Unknown Position';
          const department = employee.department || employeeData?.department || 'Unknown Department';
          const email = employeeData?.email || employee.url?.replace('mailto:', '') || '';
          const location = employeeData?.location || '';
          
          // Generate avatar from name
          const avatar = name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
          
          return (
            <div key={employee.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                  {avatar}
                </div>
                
                {/* Employee Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {position}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {department}
                      </p>
                      {location && (
                        <p className="text-xs text-gray-400 truncate">
                          📍 {location}
                        </p>
                      )}
                    </div>
                    
                    {/* Score Badge */}
                    {employee.score && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {Math.round(employee.score)}%
                      </span>
                    )}
                  </div>
                  
                  {/* Summary */}
                  {employee.summary && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {employee.summary}
                    </p>
                  )}
                  
                  {/* Contact and Action Buttons */}
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() => handleContact(employee)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact
                    </button>
                    
                    <button
                      onClick={() => handleViewHierarchy(employee)}
                      disabled={loadingHierarchy === employee.id}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      {loadingHierarchy === employee.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                      {loadingHierarchy === employee.id ? 'Loading...' : 'View Hierarchy'}
                    </button>
                    
                    {email && (
                      <span className="text-sm text-gray-500 truncate flex-1">
                        {email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && !showAll && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            <span>Show {employeeResults.length - maxInitialDisplay} more employees</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Show Less Button */}
      {showAll && hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(false)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
          >
            <span>Show less</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      )}
      </div>

      {/* Hierarchy Modal */}
      {selectedEmployeeHierarchy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Employee Hierarchy</h2>
                <button
                  onClick={closeHierarchyView}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <EmployeeHierarchyTree hierarchy={selectedEmployeeHierarchy} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
