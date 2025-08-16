import React, { useState, useRef } from 'react';
import { EmployeeHierarchy, HierarchyNode } from '../../types';

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
  const [isExpanded, setIsExpanded] = useState(true); // Always start expanded
  const hasReports = node.reports && node.reports.length > 0;

  // Debug logging for this node
  // (removed for production)
  return (
    <div className="flex flex-col">
      <div className="border border-red-200 rounded bg-white mb-2 p-2 cursor-pointer" onClick={() => onNodeClick?.(node)}>
        <div className="text-red-700 font-semibold text-sm">{node.name}</div>
        <div className="text-xs text-red-400">{node.title}</div>
        <div className="text-xs text-red-400">{node.department}</div>
        {hasReports && (
          <div className="mt-1 text-xs text-red-500">
            {node.reports.length} Direct Report{node.reports.length !== 1 ? 's' : ''}
            <button
              onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="ml-2 px-1 text-xs text-red-600 border border-red-200 rounded"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        )}
      </div>
      {hasReports && isExpanded && node.reports && node.reports.length > 0 && (
        <div className="ml-4">
          {node.reports.map(child => (
            <OrgNode
              key={child.id}
              node={child}
              isTarget={child.is_target || false}
              level={level + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
  <div className="w-full flex flex-row gap-4 items-start justify-center">
  <div className="max-w-sm w-full">
        <div className="mb-2">
          <h2 className="text-base font-bold text-red-700 mb-1">Organization Chart</h2>
          <p className="text-red-500 text-xs">
            Showing hierarchy for <span className="font-semibold text-red-600">{hierarchy.employee.name}</span>
          </p>
        </div>
        <div ref={chartRef} className="overflow-x-auto pb-2" style={{ minHeight: '100px' }}>
          <div className="inline-block w-full px-1">
            <OrgNode 
              node={ceoNode}
              isTarget={ceoNode.is_target}
              level={0}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>
        {selectedNode && (
          <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-white border border-red-200 rounded shadow-sm w-[140px] p-1 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-0.5">
                <h3 className="text-[10px] font-semibold text-red-700">Emp</h3>
                <button onClick={() => setSelectedNode(null)} className="text-red-400 hover:text-red-600 text-xs">×</button>
              </div>
              <div className="w-full text-center">
                <div className="text-red-700 font-semibold text-[10px]">{selectedNode.name}</div>
                <div className="text-[9px] text-red-400">{selectedNode.title}</div>
                <div className="text-[9px] text-red-400 mb-0.5">{selectedNode.department}</div>
                <div className="text-[9px] text-red-600">Email: {selectedNode.email}</div>
                <div className="text-[9px] text-red-600">Level: {selectedNode.level}</div>
                <div className="text-[9px] text-red-600">Reports: {selectedNode.reports?.length || 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="w-[180px] bg-gray-50 rounded-lg p-2 border border-gray-200 text-xs">
        <h3 className="font-semibold text-gray-800 mb-2 text-xs">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-600 rounded inline-block"></span> CEO (L0)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 rounded inline-block"></span> VP (L1)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-600 rounded inline-block"></span> Director (L2)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded inline-block"></span> Manager (L3)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-500 rounded inline-block"></span> IC (L4+)</div>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-yellow-400 rounded ring-2 ring-yellow-400 ring-opacity-60 inline-block"></span> Selected Employee</div>
          <div className="flex items-center gap-2"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg> Reporting Relationship</div>
        </div>
      </div>
    </div>

// Removed stats and trailing code for minimal, side-by-side layout
  );
};

export default ModernOrgChart;
