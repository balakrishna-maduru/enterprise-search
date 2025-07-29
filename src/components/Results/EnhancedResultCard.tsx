// src/components/Results/EnhancedResultCard.tsx
import React, { useState } from 'react';
import { SearchResult, Employee, EmployeeHierarchy } from '../../types';
import { EmployeeService } from '../../services/employee_service';
import EmployeeHierarchyTree from '../Employee/EmployeeHierarchyTree';
import LoadingSpinner from '../Common/LoadingSpinner';

interface EnhancedResultCardProps {
  result: SearchResult;
  isSelected: boolean;
  onSelect: (result: SearchResult) => void;
}

const EnhancedResultCard: React.FC<EnhancedResultCardProps> = ({
  result,
  isSelected,
  onSelect
}) => {
  const [showHierarchy, setShowHierarchy] = useState<boolean>(false);
  const [hierarchy, setHierarchy] = useState<EmployeeHierarchy | null>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState<boolean>(false);

  const isEmployee = result.content_type === 'employee' && result.employee_data;
  const employeeService = new EmployeeService();

  const handleViewHierarchy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isEmployee || !result.employee_data) return;
    
    setLoadingHierarchy(true);
    try {
      const hierarchyData = await employeeService.getEmployeeHierarchy(result.employee_data.id);
      setHierarchy(hierarchyData);
      setShowHierarchy(true);
    } catch (error) {
      console.error('Failed to load hierarchy:', error);
    } finally {
      setLoadingHierarchy(false);
    }
  };

  const getSourceIcon = (source: string): string => {
    const icons: Record<string, string> = {
      'confluence': '📚',
      'jira': '🎫',
      'sharepoint': '📁',
      'google-analytics': '📊',
      'employees': '👤',
      'teams': '💬',
      'slack': '💬',
      'email': '📧'
    };
    return icons[source] || '📄';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isEmployee && result.employee_data) {
    const employee = result.employee_data;
    
    return (
      <>
        {/* Employee Card */}
        <div 
          className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-lg cursor-pointer ${
            isSelected 
              ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSelect(result)}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {employee.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
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
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  L{employee.level}
                </span>
                <span className="text-lg">{getSourceIcon(result.source)}</span>
              </div>
            </div>

            {/* Department & Location */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">🏢</span>
                <span className="truncate">{employee.department}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">📍</span>
                <span className="truncate">{employee.location}</span>
              </div>
            </div>

            {/* Contact */}
            <div className="text-xs text-gray-500 mb-3">
              <div className="truncate">{employee.email}</div>
              <div>{employee.phone}</div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              {employee.has_reports && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {employee.report_count} Report{employee.report_count !== 1 ? 's' : ''}
                </span>
              )}
              
              <button
                onClick={handleViewHierarchy}
                disabled={loadingHierarchy}
                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
              >
                {loadingHierarchy ? (
                  <LoadingSpinner size="sm" className="mr-1" />
                ) : (
                  <span className="mr-1">🌳</span>
                )}
                View Hierarchy
              </button>
            </div>
          </div>
        </div>

        {/* Hierarchy Modal */}
        {showHierarchy && hierarchy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Organization Hierarchy - {employee.name}
                </h2>
                <button
                  onClick={() => setShowHierarchy(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <EmployeeHierarchyTree hierarchy={hierarchy} />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Regular document card
  return (
    <div 
      className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isSelected 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(result)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getSourceIcon(result.source)}</span>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
              {result.title}
            </h3>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {result.content_type}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {result.summary}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span>By {result.author}</span>
            <span>{result.department}</span>
          </div>
          <span>{formatDate(result.timestamp)}</span>
        </div>

        {/* Tags */}
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {result.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
            {result.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{result.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedResultCard;
