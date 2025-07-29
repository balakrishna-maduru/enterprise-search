// src/components/Employee/EmployeeCard.tsx
import React from 'react';
import { Employee } from '../../types';

interface EmployeeCardProps {
  employee: Employee;
  onClick?: () => void;
  showHierarchyButton?: boolean;
  isSelected?: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  onClick, 
  showHierarchyButton = false,
  isSelected = false 
}) => {
  const getLevelColor = (level: number): string => {
    const colors = [
      'bg-purple-100 text-purple-800',  // Level 0 - CEO
      'bg-blue-100 text-blue-800',     // Level 1 - VPs
      'bg-green-100 text-green-800',   // Level 2 - Directors
      'bg-yellow-100 text-yellow-800', // Level 3 - Managers
      'bg-gray-100 text-gray-800',     // Level 4+ - Individual Contributors
    ];
    return colors[Math.min(level, colors.length - 1)];
  };

  const getDepartmentIcon = (department: string): string => {
    const icons: Record<string, string> = {
      'Engineering': '💻',
      'Sales': '💼',
      'Marketing': '📈',
      'Design': '🎨',
      'Executive': '👑',
      'HR': '👥',
      'Finance': '💰',
      'Operations': '⚙️',
      'Product': '📱',
      'Legal': '⚖️'
    };
    return icons[department] || '🏢';
  };

  const formatStartDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const calculateTenure = (startDate: string): string => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffYears > 0) {
      return `${diffYears}y ${diffMonths}m`;
    }
    return `${diffMonths}m`;
  };

  return (
    <div 
      className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-gray-300'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {employee.name}
              </h3>
              <p className="text-xs text-gray-600 truncate">
                {employee.title}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(employee.level)}`}>
            L{employee.level}
          </span>
        </div>

        {/* Department & Location */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">{getDepartmentIcon(employee.department)}</span>
            <span className="truncate">{employee.department}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{employee.location}</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="h-3 w-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{employee.email}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <svg className="h-3 w-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{employee.phone}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Started {formatStartDate(employee.start_date)}</span>
          <span>{calculateTenure(employee.start_date)}</span>
        </div>

        {/* Reports Badge */}
        {employee.has_reports && (
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {employee.report_count} Direct Report{employee.report_count !== 1 ? 's' : ''}
            </span>
            {showHierarchyButton && (
              <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                View Hierarchy →
              </button>
            )}
          </div>
        )}

        {/* Hierarchy Button for non-managers */}
        {!employee.has_reports && showHierarchyButton && (
          <div className="flex justify-end">
            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
              View Hierarchy →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeCard;
