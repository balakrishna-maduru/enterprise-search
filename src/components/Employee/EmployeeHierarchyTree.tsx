import React, { useState } from 'react';
import { EmployeeHierarchy, HierarchyNode } from '../../types';
import ModernOrgChart from './ModernOrgChart';

type ViewMode = 'modern' | 'classic';

interface EmployeeHierarchyTreeProps {
  hierarchy: EmployeeHierarchy;
  viewMode?: ViewMode;
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

  const getLevelColor = (): string => {
    return 'bg-red-600 text-white';
  };

  return (
    <div className="relative">
      {/* Node */}
      <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
        isSelected 
          ? 'border-red-600 bg-red-50 shadow-md' 
          : 'border-red-200 bg-white hover:border-red-100 hover:shadow-sm'
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
  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${getLevelColor()}`}>
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
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
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

const EmployeeHierarchyTree: React.FC<EmployeeHierarchyTreeProps> = ({ hierarchy, viewMode = 'modern' }) => {
  // Safety check for hierarchy data
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    hierarchy && hierarchy.hierarchy_tree ? new Set([hierarchy.hierarchy_tree.id]) : new Set()
  );

  if (!hierarchy || !hierarchy.employee || !hierarchy.hierarchy_tree) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">Unable to load hierarchy data</div>
      </div>
    );
  }

  // Debug logging
  console.log('🌲 EmployeeHierarchyTree received data:', {
    viewMode,
    employee: hierarchy.employee.name,
    hierarchyTreeRoot: hierarchy.hierarchy_tree.name,
    hierarchyTreeReports: hierarchy.hierarchy_tree.reports?.length || 0,
    hierarchyTreeData: hierarchy.hierarchy_tree
  });

  // Use modern org chart by default
  if (currentViewMode === 'modern') {
    return <ModernOrgChart hierarchy={hierarchy} />;
  }

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
    // Safety check for node
    if (!node || !node.id) {
      return null;
    }

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
      {/* View Mode Toggle */}
  <div className="flex items-center justify-between bg-red-50 rounded-lg p-3 border border-red-200">
  <h4 className="text-lg font-semibold text-red-700">Organization Structure</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-red-600">View:</span>
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-red-100">
            <button
              onClick={() => setCurrentViewMode('modern')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                (currentViewMode as string) === 'modern' 
                  ? 'bg-red-600 text-white' 
                  : 'text-red-600 hover:text-red-800'
              }`}
            >
              Modern
            </button>
            <button
              onClick={() => setCurrentViewMode('classic')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  (currentViewMode as string) === 'classic' 
                    ? 'bg-red-600 text-white' 
                    : 'text-red-600 hover:text-red-800'
                }`}
            >
              Classic
            </button>
          </div>
        </div>
      </div>

      {/* Render based on current view mode */}
  {(currentViewMode as string) === 'modern' ? (
        <ModernOrgChart hierarchy={hierarchy} />
      ) : (
        <div className="space-y-6">
          {/* Employee Info Header */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {hierarchy.employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-700">{hierarchy.employee.name}</h3>
                <p className="text-red-600">{hierarchy.employee.title}</p>
                <p className="text-sm text-red-400">{hierarchy.employee.department} • {hierarchy.employee.location}</p>
              </div>
            </div>
          </div>

          {/* Classic Hierarchy Tree */}
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <h4 className="text-lg font-semibold text-red-700 mb-4">Organization Structure</h4>
            {hierarchy.hierarchy_tree ? renderNode(hierarchy.hierarchy_tree) : (
              <div className="text-center py-4 text-red-400">
                No hierarchy data available
              </div>
            )}
          </div>

          {/* Management Chain */}
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <h4 className="text-lg font-semibold text-red-700 mb-4">Management Chain</h4>
            
            <div className="flex flex-wrap items-center gap-2">
              {hierarchy.management_chain && hierarchy.management_chain.length > 0 ? (
                hierarchy.management_chain.map((node, index) => (
                  node && node.id ? (
                    <React.Fragment key={node.id}>
                      <div className="flex items-center space-x-2 bg-red-50 rounded-lg p-2 border border-red-100">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {node.name ? node.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '??'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-red-700">{node.name || 'Unknown'}</div>
                          <div className="text-xs text-red-400">{node.title || 'Unknown Title'}</div>
                        </div>
                      </div>
                      
                      {index < hierarchy.management_chain.length - 1 && (
                        <svg className="h-4 w-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </React.Fragment>
                  ) : null
                ))
              ) : (
                <div className="text-gray-500 text-sm">No management chain available</div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">{hierarchy.total_employees}</div>
                <div className="text-sm text-red-600">Total Employees</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{hierarchy.management_chain.length}</div>
                <div className="text-sm text-red-400">Management Levels</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeHierarchyTree;
