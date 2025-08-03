import React, { useEffect, useState } from 'react';
import { employeeService } from '../../services/employee_service';
import { EmployeeHierarchy } from '../../types';
import EmployeeHierarchyTree from './EmployeeHierarchyTree';

const QuickHierarchyDebug: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<EmployeeHierarchy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        console.log('🔍 Fetching hierarchy for employee 14...');
        const data = await employeeService.getEmployeeHierarchy('14');
        console.log('📊 Hierarchy data received:', data);
        setHierarchy(data);
      } catch (err) {
        console.error('❌ Error fetching hierarchy:', err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
        <p>Loading hierarchy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hierarchy) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600">No hierarchy data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">🐛 Hierarchy Debug View</h1>
          
          {/* Debug Info */}
          <div className="bg-gray-100 p-4 rounded mb-6 text-sm">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <ul className="space-y-1">
              <li><strong>Employee:</strong> {hierarchy.employee.name} (Level {hierarchy.employee.level})</li>
              <li><strong>Tree Root:</strong> {hierarchy.hierarchy_tree.name} (Level {hierarchy.hierarchy_tree.level})</li>
              <li><strong>Root Has Reports:</strong> {hierarchy.hierarchy_tree.reports?.length || 0}</li>
              <li><strong>Management Chain:</strong> {hierarchy.management_chain.length} levels</li>
              <li><strong>Total Employees:</strong> {hierarchy.total_employees}</li>
            </ul>
          </div>

          {/* Raw Data Display */}
          <details className="mb-6">
            <summary className="cursor-pointer font-semibold mb-2">View Raw Hierarchy Data</summary>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(hierarchy.hierarchy_tree, null, 2)}
            </pre>
          </details>
        </div>

        {/* Hierarchy Visualization */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Modern Org Chart</h2>
          <EmployeeHierarchyTree hierarchy={hierarchy} viewMode="modern" />
        </div>
      </div>
    </div>
  );
};

export default QuickHierarchyDebug;
