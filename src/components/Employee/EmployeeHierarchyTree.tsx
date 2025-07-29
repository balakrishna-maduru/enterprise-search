// src/components/Employee/EmployeeHierarchyTree.tsx
import React, { useState } from 'react';
import { EmployeeHierarchy, HierarchyNode } from '../../types';

interface EmployeeHierarchyTreeProps {
  hierarchy: EmployeeHierarchy;
}

interface TreeNodeProps {
  node: HierarchyNode;
  isSelected?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  node, 
  isSelected = false, 
  isExpanded = true, 
  onToggle 
}) => {
  const hasChildren = node.children && node.children.length > 0;

  const getLevelColor = (level: number): string => {
    const colors = [
      'bg-purple-500 text-white',      // Level 0 - CEO
      'bg-blue-500 text-white',        // Level 1 - VPs
      'bg-green-500 text-white',       // Level 2 - Directors
      'bg-yellow-500 text-white',      // Level 3 - Managers
      'bg-gray-500 text-white',        // Level 4+ - Individual Contributors
    ];
    return colors[Math.min(level, colors.length - 1)];
  };

  return (
    <div className="relative">
      {/* Node */}
      <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}>
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={onToggle}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg 
              className={`h-4 w-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getLevelColor(node.level)}`}>
          {node.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {node.name}
          </h4>
          <p className="text-xs text-gray-600 truncate">
            {node.title}
          </p>
        </div>

        {/* Level Badge */}
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          node.level === 0 ? 'bg-purple-100 text-purple-800' :
          node.level === 1 ? 'bg-blue-100 text-blue-800' :
          node.level === 2 ? 'bg-green-100 text-green-800' :
          node.level === 3 ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          L{node.level}
        </span>

        {hasChildren && (
          <span className="text-xs text-gray-500">
            {node.children!.length} report{node.children!.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-8 mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
          {node.children!.map((child) => (
            <TreeNodeComponent key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeNodeComponent: React.FC<{ node: HierarchyNode }> = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  
  return (
    <TreeNode 
      node={node}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    />
  );
};

const EmployeeHierarchyTree: React.FC<EmployeeHierarchyTreeProps> = ({ hierarchy }) => {
  const [expandedSections, setExpandedSections] = useState({
    path: true,
    reports: true
  });

  const toggleSection = (section: 'path' | 'reports') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const buildHierarchyTree = (): HierarchyNode => {
    // Build a tree structure from the hierarchy path
    const pathNodes = hierarchy.hierarchy_path;
    const targetEmployee = hierarchy.employee;
    
    // Find the target employee in the path and add their reports
    const tree: HierarchyNode = {
      ...pathNodes[0],
      children: []
    };

    let currentNode = tree;
    
    // Build the path down to the target employee
    for (let i = 1; i < pathNodes.length; i++) {
      const child: HierarchyNode = {
        ...pathNodes[i],
        children: []
      };
      currentNode.children = [child];
      currentNode = child;
    }

    // Add direct reports to the target employee
    if (hierarchy.direct_reports.length > 0) {
      currentNode.children = hierarchy.direct_reports.map(report => ({
        ...report,
        children: []
      }));
    }

    return tree;
  };

  const hierarchyTree = buildHierarchyTree();

  return (
    <div className="space-y-6">
      {/* Employee Info Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {hierarchy.employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{hierarchy.employee.name}</h3>
            <p className="text-gray-600">{hierarchy.employee.title}</p>
            <p className="text-sm text-gray-500">{hierarchy.employee.department} • {hierarchy.employee.location}</p>
          </div>
        </div>
      </div>

      {/* Hierarchy Path */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Organization Hierarchy
          </h4>
          <button
            onClick={() => toggleSection('path')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {expandedSections.path ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {expandedSections.path && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <TreeNodeComponent node={hierarchyTree} />
          </div>
        )}
      </div>

      {/* Breadcrumb Path */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
          </svg>
          Reporting Chain
        </h4>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-wrap items-center space-x-2">
            {hierarchy.hierarchy_path.map((node, index) => (
              <React.Fragment key={node.id}>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  node.id === hierarchy.employee.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}>
                  <span>{node.name}</span>
                  <span className="ml-1 text-xs opacity-75">({node.title})</span>
                </div>
                {index < hierarchy.hierarchy_path.length - 1 && (
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{hierarchy.hierarchy_path.length}</div>
          <div className="text-sm text-gray-600">Levels to CEO</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{hierarchy.total_reports}</div>
          <div className="text-sm text-gray-600">Direct Reports</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{hierarchy.employee.level}</div>
          <div className="text-sm text-gray-600">Organization Level</div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHierarchyTree;
