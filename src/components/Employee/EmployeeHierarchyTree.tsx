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
  const hasChildren = node.reports && node.reports.length > 0;

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
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${getLevelColor(node.level)}`}>
          {node.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>
        
        {/* Employee Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {node.name}
            {isSelected && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Target
              </span>
            )}
          </h4>
          <p className="text-xs text-gray-600 truncate">
            {node.title}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {node.department}
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

        {/* Reports Count */}
        {hasChildren && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {node.reports.length} report{node.reports.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

const EmployeeHierarchyTree: React.FC<EmployeeHierarchyTreeProps> = ({ hierarchy }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([hierarchy.hierarchy_tree.id]));

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNode = (node: HierarchyNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.reports && node.reports.length > 0;

    return (
      <div key={node.id} className="relative">
        <TreeNode 
          node={node}
          isSelected={node.is_target}
          isExpanded={isExpanded}
          onToggle={hasChildren ? () => toggleNode(node.id) : undefined}
        />
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
            {node.reports.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

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

      {/* Hierarchy Tree */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Organization Structure</h4>
        {hierarchy.hierarchy_tree ? renderNode(hierarchy.hierarchy_tree) : (
          <div className="text-center py-4 text-gray-500">
            No hierarchy data available
          </div>
        )}
      </div>

      {/* Management Chain */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Management Chain</h4>
        
        <div className="flex flex-wrap items-center gap-2">
          {hierarchy.management_chain.map((node, index) => (
            <React.Fragment key={node.id}>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {node.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{node.name}</div>
                  <div className="text-xs text-gray-500">{node.title}</div>
                </div>
              </div>
              
              {index < hierarchy.management_chain.length - 1 && (
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{hierarchy.total_employees}</div>
            <div className="text-sm text-gray-600">Total Employees</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{hierarchy.management_chain.length}</div>
            <div className="text-sm text-gray-600">Management Levels</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHierarchyTree;
