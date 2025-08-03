// Test component to check hierarchy functionality
import React, { useState, useEffect } from 'react';
import { EmployeeHierarchy, HierarchyNode, Employee } from '../../types';
import EmployeeHierarchyTree from './EmployeeHierarchyTree';
import { employeeService } from '../../services/employee_service';

const HierarchyTest: React.FC = () => {
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [realHierarchy, setRealHierarchy] = useState<EmployeeHierarchy | null>(null);
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState('14');

  const testEmployees = [
    { id: '1', name: 'James Wilson (CEO)' },
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

// Mock data for testing
const mockEmployee: Employee = {
  id: 1,
  name: "John Smith",
  title: "Senior Software Engineer",
  email: "john.smith@company.com",
  department: "Engineering",
  location: "New York",
  phone: "+1-555-0123",
  start_date: "2020-01-15",
  manager_id: 2,
  level: 3,
  has_reports: true,
  report_count: 2,
  document_type: "employee",
  indexed_at: "2024-01-01T00:00:00Z",
  search_text: "John Smith Senior Software Engineer"
};

const mockHierarchyTree: HierarchyNode = {
  id: "2",
  name: "Sarah Johnson",
  title: "Engineering Manager",
  department: "Engineering",
  email: "sarah.johnson@company.com",
  level: 2,
  is_target: false,
  reports: [
    {
      id: "1",
      name: "John Smith",
      title: "Senior Software Engineer",
      department: "Engineering",
      email: "john.smith@company.com",
      level: 3,
      is_target: true,
      reports: [
        {
          id: "4",
          name: "Alice Brown",
          title: "Junior Developer",
          department: "Engineering",
          email: "alice.brown@company.com",
          level: 4,
          is_target: false,
          reports: []
        },
        {
          id: "5",
          name: "Bob Wilson",
          title: "Junior Developer",
          department: "Engineering",
          email: "bob.wilson@company.com",
          level: 4,
          is_target: false,
          reports: []
        }
      ]
    }
  ]
};

const mockManagementChain: HierarchyNode[] = [
  {
    id: "3",
    name: "Michael Davis",
    title: "VP of Engineering",
    department: "Engineering",
    email: "michael.davis@company.com",
    level: 1,
    is_target: false,
    reports: []
  },
  {
    id: "2",
    name: "Sarah Johnson",
    title: "Engineering Manager",
    department: "Engineering",
    email: "sarah.johnson@company.com",
    level: 2,
    is_target: false,
    reports: []
  }
];

const mockHierarchy: EmployeeHierarchy = {
  employee: mockEmployee,
  hierarchy_tree: mockHierarchyTree,
  management_chain: mockManagementChain,
  total_employees: 5
};

const HierarchyTest: React.FC = () => {
  const [showHierarchy, setShowHierarchy] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🌳 Modern Organization Chart Test</h2>
        <p className="text-gray-600 mb-6">
          Test the new modern org chart visualization with real employee data.
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
            {loading ? 'Loading...' : 'Load Real Hierarchy'}
          </button>
        </div>
      </div>

      {/* Hierarchy Display */}
      {showHierarchy && realHierarchy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Real Employee Hierarchy - {realHierarchy.employee.name}
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
                <strong>Debug:</strong> Total: {realHierarchy.total_employees} employees, 
                Management levels: {realHierarchy.management_chain.length}, 
                Tree root: {realHierarchy.hierarchy_tree.name}
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
