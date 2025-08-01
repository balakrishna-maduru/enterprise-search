// src/components/Employees/EmployeeResults.tsx
import React, { useState } from 'react';
import { User } from '../../types';
import { EmployeeCard } from './EmployeeCard';

interface EmployeeResultsProps {
  employees: User[];
  maxInitialDisplay?: number;
  onContactEmployee?: (employee: User) => void;
}

export const EmployeeResults: React.FC<EmployeeResultsProps> = ({ 
  employees, 
  maxInitialDisplay = 2,
  onContactEmployee 
}) => {
  const [showAll, setShowAll] = useState(false);
  
  if (employees.length === 0) {
    return null;
  }

  const displayedEmployees = showAll ? employees : employees.slice(0, maxInitialDisplay);
  const hasMore = employees.length > maxInitialDisplay;

  return (
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
            {employees.length}
          </span>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="space-y-3">
        {displayedEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onContact={onContactEmployee}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !showAll && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            <span>Show {employees.length - maxInitialDisplay} more employees</span>
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
  );
};
