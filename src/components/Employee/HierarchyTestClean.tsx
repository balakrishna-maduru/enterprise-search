// Test component to check hierarchy functionality
import React, { useState } from 'react';
import { EmployeeHierarchy } from '../../types';
import EmployeeHierarchyTree from './EmployeeHierarchyTree';
import { employeeService } from '../../services/employee_service';

const HierarchyTest: React.FC = () => {
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [realHierarchy, setRealHierarchy] = useState<EmployeeHierarchy | null>(null);
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState('14');

  const testEmployees = [
    { id: '1', name: 'James Wilson (CEO)' },
    { id: '2', name: 'Sarah Chen (CTO)' },
    { id: '6', name: 'Lisa Rodriguez (Dir Engineering)' },
    { id: '14', name: 'Emily Zhang (Manager)' },
    { id: '22', name: 'John Mitchell (Engineer)' },
  ];

  const fetchRealHierarchy = async (empId: string) => {
    setLoading(true);
    try {
      const hierarchyData = await employeeService.getEmployeeHierarchy(empId);
      setRealHierarchy(hierarchyData);
      setShowHierarchy(true);
    } catch (error) {
      console.error('Failed to load real hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🌳 Modern Organization Chart Test</h2>
        <p className="text-gray-600 mb-6">
          Test the new modern org chart visualization with real employee data from the API.
        </p>
        
        {/* Employee Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Employee:
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {testEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setEmployeeId(emp.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  employeeId === emp.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {emp.name}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => fetchRealHierarchy(employeeId)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load Hierarchy for Employee ${employeeId}`}
          </button>
        </div>

        {/* API Test Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">API Endpoint Test</h3>
          <p className="text-sm text-blue-700">
          Development: <code className="bg-blue-100 px-1 rounded">GET /api/v1/employees/{employeeId}/hierarchy</code>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            This will fetch the complete organizational tree from CEO down to the selected employee.
          </p>
        </div>
      </div>

      {/* Hierarchy Display */}
      {showHierarchy && realHierarchy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Organization Chart - {realHierarchy.employee.name}
                </h2>
                <button
                  onClick={() => setShowHierarchy(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Debug Info */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <strong>Total Employees:</strong> {realHierarchy.total_employees}
                  </div>
                  <div>
                    <strong>Management Levels:</strong> {realHierarchy.management_chain.length}
                  </div>
                  <div>
                    <strong>Tree Root:</strong> {realHierarchy.hierarchy_tree.name}
                  </div>
                  <div>
                    <strong>Target Level:</strong> {realHierarchy.employee.level}
                  </div>
                </div>
              </div>
              
              <EmployeeHierarchyTree hierarchy={realHierarchy} viewMode="modern" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyTest;
