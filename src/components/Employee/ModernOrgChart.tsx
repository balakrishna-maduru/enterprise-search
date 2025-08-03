import React, { useState, useRef, useEffect } from 'react';
import { EmployeeHierarchy, HierarchyNode } from '../../types';
import SimpleHierarchyView from './SimpleHierarchyView';

interface ModernOrgChartProps {
  hierarchy: EmployeeHierarchy;
}

interface OrgNodeProps {
  node: HierarchyNode;
  isTarget?: boolean;
  level: number;
  onNodeClick?: (node: HierarchyNode) => void;
}

const OrgNode: React.FC<OrgNodeProps> = ({ node, isTarget = false, level, onNodeClick }) => {
  // Always expand nodes for the first 4 levels to show the complete hierarchy
  const [isExpanded, setIsExpanded] = useState(true); // Always start expanded for debugging
  
  const hasReports = node.reports && node.reports.length > 0;

  // Debug logging
  console.log(`🌳 OrgNode rendering:`, {
    name: node.name,
    level,
    hasReports,
    reportsCount: node.reports?.length || 0,
    isTarget: node.is_target,
    isExpanded
  });

  const getLevelConfig = (level: number) => {
    const configs = [
      { 
        bg: 'bg-gradient-to-r from-purple-600 to-purple-700', 
        border: 'border-purple-300',
        text: 'text-white',
        badge: 'bg-purple-100 text-purple-800',
        title: 'CEO'
      },
      { 
        bg: 'bg-gradient-to-r from-blue-600 to-blue-700', 
        border: 'border-blue-300',
        text: 'text-white',
        badge: 'bg-blue-100 text-blue-800',
        title: 'VP'
      },
      { 
        bg: 'bg-gradient-to-r from-green-600 to-green-700', 
        border: 'border-green-300',
        text: 'text-white',
        badge: 'bg-green-100 text-green-800',
        title: 'Director'
      },
      { 
        bg: 'bg-gradient-to-r from-amber-500 to-amber-600', 
        border: 'border-amber-300',
        text: 'text-white',
        badge: 'bg-amber-100 text-amber-800',
        title: 'Manager'
      },
      { 
        bg: 'bg-gradient-to-r from-gray-500 to-gray-600', 
        border: 'border-gray-300',
        text: 'text-white',
        badge: 'bg-gray-100 text-gray-800',
        title: 'IC'
      }
    ];
    return configs[Math.min(level, configs.length - 1)];
  };

  const config = getLevelConfig(level);
  const initials = node.name.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div 
        className={`
          relative min-w-[280px] max-w-[320px] 
          ${isTarget 
            ? 'ring-4 ring-yellow-400 ring-opacity-60 shadow-2xl transform scale-105' 
            : 'shadow-lg hover:shadow-xl'
          }
          rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:scale-102
          ${config.border} border-2
        `}
        onClick={() => onNodeClick?.(node)}
      >
        {/* Header with Avatar and Basic Info */}
        <div className={`${config.bg} px-4 py-3 ${config.text}`}>
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                {initials}
              </div>
              {isTarget && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Name and Title */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{node.name}</h3>
              <p className="text-sm opacity-90 truncate">{node.title}</p>
            </div>

            {/* Level Badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${config.badge}`}>
              L{level}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white px-4 py-3">
          {/* Department */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{node.department}</span>
          </div>

          {/* Reports Count - No expand/collapse for now */}
          {hasReports && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>{node.reports.length} Direct Report{node.reports.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Target Badge */}
          {isTarget && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Selected Employee
            </div>
          )}
        </div>
      </div>

      {/* Connection Lines and Children */}
      {hasReports && node.reports && node.reports.length > 0 && (
        <div className="mt-4 flex flex-col items-center">
          {/* Vertical line down */}
          <div className="w-px h-8 bg-gray-300"></div>
          
          {/* Horizontal line */}
          {node.reports.length > 1 && (
            <div className="relative w-full max-w-4xl">
              <div className="h-px bg-gray-300 w-full"></div>
              {/* T-junction */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-300"></div>
            </div>
          )}
          
          {/* Children Grid */}
          <div className={`
            mt-8 grid gap-8 
            ${node.reports.length === 1 ? 'grid-cols-1' : 
              node.reports.length === 2 ? 'grid-cols-2' : 
              node.reports.length <= 4 ? 'grid-cols-2 xl:grid-cols-4' : 
              'grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}
          `}>
            {node.reports.map((child, index) => {
              console.log(`🔄 Rendering child ${index}:`, {
                name: child.name,
                level: level + 1,
                hasOwnReports: child.reports?.length || 0,
                isTarget: child.is_target
              });
              return (
                <div key={child.id} className="relative">
                  {/* Vertical line up to child */}
                  {node.reports.length > 1 && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-300 -mt-8"></div>
                  )}
                  <OrgNode 
                    node={child} 
                    isTarget={child.is_target || false}
                    level={level + 1}
                    onNodeClick={onNodeClick}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ModernOrgChart: React.FC<ModernOrgChartProps> = ({ hierarchy }) => {
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Safety check for hierarchy data
  if (!hierarchy || !hierarchy.employee || !hierarchy.hierarchy_tree) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Unable to load hierarchy data</div>
      </div>
    );
  }

  // Debug logging
  console.log(`🌳 ModernOrgChart data:`, {
    employee: hierarchy.employee.name,
    hierarchyTree: hierarchy.hierarchy_tree.name,
    treeReports: hierarchy.hierarchy_tree.reports?.length || 0,
    managementChain: hierarchy.management_chain.length,
    totalEmployees: hierarchy.total_employees
  });

  // Find the CEO (root of the tree) by traversing up the management chain
  const findCEO = (): HierarchyNode => {
    // The hierarchy_tree from API already starts from CEO, so we can use it directly
    console.log(`🏢 CEO Node:`, hierarchy.hierarchy_tree);
    return hierarchy.hierarchy_tree;
  };

  const ceoNode = findCEO();

  const handleNodeClick = (node: HierarchyNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="w-full">
      {/* Debug Info */}
      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-sm">
        <strong>🐛 Debug:</strong> Showing hierarchy for {hierarchy.employee.name}. 
        Root: {ceoNode.name} with {ceoNode.reports?.length || 0} direct reports.
        
        <details className="mt-2">
          <summary className="cursor-pointer font-semibold">View Tree Structure</summary>
          <div className="mt-2 bg-yellow-50 p-2 rounded max-h-64 overflow-auto">
            <SimpleHierarchyView node={ceoNode} />
          </div>
        </details>
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Chart</h2>
        <p className="text-gray-600">
          Showing hierarchy for <span className="font-semibold text-blue-600">{hierarchy.employee.name}</span>
        </p>
      </div>

      {/* Management Chain Breadcrumb */}
      {hierarchy.management_chain && hierarchy.management_chain.length > 0 && (
        <div className="mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Management Chain</h3>
            <div className="flex flex-wrap items-center gap-2">
              {hierarchy.management_chain.map((manager, index) => (
                <React.Fragment key={manager.id}>
                  <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {manager.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                      <div className="text-xs text-gray-500">{manager.title}</div>
                    </div>
                  </div>
                  {index < hierarchy.management_chain.length - 1 && (
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Org Chart */}
      <div 
        ref={chartRef}
        className="overflow-x-auto pb-8"
        style={{ minHeight: '400px' }}
      >
        <div className="inline-block min-w-full px-4">
          <OrgNode 
            node={ceoNode}
            isTarget={ceoNode.is_target}
            level={0}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Employee Details</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedNode.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedNode.name}</h4>
                    <p className="text-gray-600">{selectedNode.title}</p>
                    <p className="text-sm text-gray-500">{selectedNode.department}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedNode.email}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-500">Level</label>
                      <p className="text-gray-900">Level {selectedNode.level}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-500">Reports</label>
                      <p className="text-gray-900">{selectedNode.reports?.length || 0} Direct Reports</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-500">Department</label>
                      <p className="text-gray-900">{selectedNode.department}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded"></div>
            <span>CEO (L0)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded"></div>
            <span>VP (L1)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-600 to-green-700 rounded"></div>
            <span>Director (L2)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded"></div>
            <span>Manager (L3)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded"></div>
            <span>IC (L4+)</span>
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-yellow-400 rounded ring-2 ring-yellow-400 ring-opacity-60"></div>
            <span>Selected Employee</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span>Reporting Relationship</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{hierarchy.total_employees}</div>
          <div className="text-xs text-gray-600">Total Employees</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{hierarchy.management_chain.length}</div>
          <div className="text-xs text-gray-600">Management Levels</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{hierarchy.employee.department}</div>
          <div className="text-xs text-gray-600">Department</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">L{hierarchy.employee.level}</div>
          <div className="text-xs text-gray-600">Employee Level</div>
        </div>
      </div>
    </div>
  );
};

export default ModernOrgChart;
