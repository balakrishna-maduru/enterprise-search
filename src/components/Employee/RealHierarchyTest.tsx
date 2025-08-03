import React, { useState, useEffect } from 'react';
import { EmployeeHierarchy } from '../../types';
import EmployeeHierarchyTree from './EmployeeHierarchyTree';
import { employeeService } from '../../services/employee_service';

const RealHierarchyTest: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<EmployeeHierarchy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState('14'); // Emily Zhang by default

  const testEmployees = [
    { id: '1', name: 'James Wilson (CEO)' },
    { id: '2', name: 'Sarah Chen (CTO)' },
    { id: '6', name: 'Lisa Rodriguez (Dir Engineering)' },
    { id: '14', name: 'Emily Zhang (Eng Manager)' },
    { id: '22', name: 'John Mitchell (Sr Engineer)' },
    { id: '5', name: 'Robert Brown (VP Sales)' },
    { id: '12', name: 'Jessica Wilson (Dir Sales)' }
  ];

  const fetchHierarchy = async (empId: string) => {
    setLoading(true);
    setError(null);
    try {
      const hierarchyData = await employeeService.getEmployeeHierarchy(empId);
      setHierarchy(hierarchyData);
    } catch (err) {
      setError(`Failed to load hierarchy: ${err}`);
      console.error('Hierarchy fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy(employeeId);
  }, [employeeId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🌳 Modern Organization Chart Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test the new modern org chart visualization with real employee data.
          </p>

          {/* Employee Selector */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee to View Hierarchy:
            </label>
            <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Custom Employee ID Input */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter Custom Employee ID:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter employee ID"
              />
              <button
                onClick={() => fetchHierarchy(employeeId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Load Hierarchy
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading org chart...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Hierarchy</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hierarchy Display */}
        {!loading && !error && hierarchy && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Organization Chart for {hierarchy.employee.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {hierarchy.employee.title} • {hierarchy.employee.department}
              </p>
            </div>
            
            <div className="p-6">
              <EmployeeHierarchyTree hierarchy={hierarchy} viewMode="modern" />
            </div>
          </div>
        )}

        {/* Debug Info */}
        {hierarchy && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Debug Information</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Total Employees:</strong> {hierarchy.total_employees}</p>
              <p><strong>Management Levels:</strong> {hierarchy.management_chain.length}</p>
              <p><strong>Target Employee:</strong> {hierarchy.employee.name} (Level {hierarchy.employee.level})</p>
              <p><strong>Hierarchy Tree Root:</strong> {hierarchy.hierarchy_tree?.name} (Level {hierarchy.hierarchy_tree?.level})</p>
              <p><strong>Direct Reports:</strong> {hierarchy.hierarchy_tree?.reports?.length || 0}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealHierarchyTest;
