// src/components/Employees/EmployeeCard.tsx
import React from 'react';
import { User } from '../../types';

interface EmployeeCardProps {
  employee: User;
  onContact?: (employee: User) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  onContact 
}) => {
  const handleContact = () => {
    if (onContact) {
      onContact(employee);
    } else {
      // Default behavior - open email client
      window.location.href = `mailto:${employee.email}`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm ${employee.color || 'bg-gray-600'}`}>
          {employee.avatar || employee.name.charAt(0).toUpperCase()}
        </div>
        
        {/* Employee Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {employee.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {employee.position}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {employee.department}
              </p>
            </div>
            
            {/* Role Badge */}
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ 
              employee.role === 'admin' ? 'bg-red-100 text-red-800' :
              employee.role === 'executive' ? 'bg-purple-100 text-purple-800' :
              employee.role === 'manager' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {employee.role}
            </span>
          </div>
          
          {/* Contact Info */}
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={handleContact}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </button>
            <span className="text-sm text-gray-500 truncate">
              {employee.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
