// Simple test component to debug search functionality
import React, { useState } from 'react';
import { EmployeeService } from '../../services/employee_service';

const SearchDebugger: React.FC = () => {
  const [testResults, setTestResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testEmployeeSearch = async () => {
    setIsLoading(true);
    setTestResults('Testing...');
    
    try {
      const employeeService = new EmployeeService();
      const results = await employeeService.searchEmployees('john', 10);
      setTestResults(`Success! Found ${results.length} employees: ${JSON.stringify(results, null, 2)}`);
    } catch (error) {
      setTestResults(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiDirectly = async () => {
    setIsLoading(true);
    setTestResults('Testing API directly...');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/employees/search?q=john&size=10');
      const data = await response.json();
      setTestResults(`API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResults(`API Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border border-red-500 bg-red-50 rounded-lg">
      <h3 className="text-lg font-bold text-red-700 mb-4">Search Debugger</h3>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={testEmployeeSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Employee Service
        </button>
        
        <button
          onClick={testApiDirectly}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test API Directly
        </button>
      </div>
      
      <div className="bg-white p-3 rounded border">
        <pre className="text-sm overflow-auto max-h-96">
          {testResults || 'Click a button to test...'}
        </pre>
      </div>
    </div>
  );
};

export default SearchDebugger;
