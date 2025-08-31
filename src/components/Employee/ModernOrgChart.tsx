import React from 'react';
import { EmployeeHierarchy, HierarchyNode } from '../../types';

// A single node in the chart
const OrgChartNode: React.FC<{ node: HierarchyNode }> = ({ node }) => {
  const hasChildren = node.reports && node.reports.length > 0;

  return (
    <div className="flex flex-col items-center text-center relative">
      {/* Node Card */}
      <div
                className={`relative p-3 rounded-lg shadow-lg min-w-[180px] bg-white border-4 cursor-pointer ${
          node.is_target ? 'border-red-500 ring-4 ring-red-200' : 'border-blue-500'
        }`}
        onClick={() => {
          if (node.profileUrl) {
            window.open(node.profileUrl, '_blank');
          }
        }}
      >
        <div className="flex items-center">
          {node.userImageUrl ? (
            <img src={node.userImageUrl} alt={node.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 mr-3" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl mr-3">
              {node.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
          )}
          <div className="flex-1 text-left">
            <div className="font-bold text-gray-800 text-base">{node.name}</div>
            <div className="text-sm text-gray-600">{node.title}</div>
            {node.country && <div className="text-xs text-gray-500 mt-1">{node.country}</div>}
          </div>
        </div>
      </div>

      {/* Children container */}
      {hasChildren && (
        <div className="flex justify-center pt-12 relative">
          {/* Vertical line from parent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-red-500" aria-hidden="true" />
          
          {/* Horizontal line connecting children */}
          {node.reports.length > 1 && <div className="absolute top-6 left-0 right-0 h-px bg-red-500" aria-hidden="true" />}

          {node.reports.map((childNode) => (
            <div key={childNode.id} className="px-4 relative">
              {/* Vertical line to child */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-red-500" aria-hidden="true" />
              <OrgChartNode node={childNode} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// The main chart component
const ModernOrgChart: React.FC<{ hierarchy: EmployeeHierarchy | null }> = ({ hierarchy }) => {
  if (!hierarchy || !hierarchy.hierarchy_tree) {
    return <div className="text-center text-gray-500 p-8">Hierarchy data is not available.</div>;
  }

  return (
    <section aria-labelledby="org-chart-heading">
      <h2 id="org-chart-heading" className="sr-only">Organization Chart</h2>
      <div className="p-4 bg-gray-50 rounded-lg overflow-scroll max-h-full">
        <div className="inline-block min-w-full py-8 px-4 text-center">
          <OrgChartNode node={hierarchy.hierarchy_tree} />
        </div>
      </div>
    </section>
  );
};

export default ModernOrgChart;
