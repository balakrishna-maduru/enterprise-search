import React from 'react';
import { HierarchyNode } from '../../types';

interface SimpleHierarchyViewProps {
  node: HierarchyNode;
  level?: number;
}

const SimpleHierarchyView: React.FC<SimpleHierarchyViewProps> = ({ node, level = 0 }) => {
  const indent = '  '.repeat(level);
  
  return (
    <div className="font-mono text-sm">
      <div className={`${node.is_target ? 'bg-yellow-200 font-bold' : ''} p-1`}>
        {indent}📁 {node.name} ({node.title}) - Level {node.level} 
        {node.reports && node.reports.length > 0 && ` - ${node.reports.length} reports`}
        {node.is_target && ' ⭐ TARGET'}
      </div>
      {node.reports && node.reports.map(child => (
        <SimpleHierarchyView key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );
};

export default SimpleHierarchyView;
