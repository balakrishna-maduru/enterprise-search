// Test component to check hierarchy functionality
import React, { useState } from 'react';
import { EmployeeHierarchy, HierarchyNode, Employee } from '../../types';
import EmployeeHierarchyTree from './EmployeeHierarchyTree';

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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Employee Hierarchy Test</h2>
        <p className="text-gray-600 mb-6">
          This is a test component to verify that the EmployeeHierarchyTree component works with mock data.
        </p>
        
        <button
          onClick={() => setShowHierarchy(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Show Test Hierarchy
        </button>

        {/* Mock Employee Card */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900">Mock Employee Data:</h3>
          <div className="mt-2 text-sm text-gray-600">
            <p><strong>Name:</strong> {mockEmployee.name}</p>
            <p><strong>Title:</strong> {mockEmployee.title}</p>
            <p><strong>Department:</strong> {mockEmployee.department}</p>
            <p><strong>Level:</strong> {mockEmployee.level}</p>
            <p><strong>Has Reports:</strong> {mockEmployee.has_reports ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Hierarchy Modal */}
      {showHierarchy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Test Employee Hierarchy</h2>
                <button
                  onClick={() => setShowHierarchy(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <EmployeeHierarchyTree hierarchy={mockHierarchy} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyTest;
