// src/components/Layout/ConnectionStatus.tsx
import React from 'react';

const ConnectionStatus: React.FC = () => {
  // For direct Elasticsearch setup, we'll show a simple "Online" status
  return (
    <div className="flex items-center space-x-2">
      <div className="bg-green-500 w-2 h-2 rounded-full"></div>
      <span className="text-xs text-gray-600">Online</span>
    </div>
  );
};

export default ConnectionStatus;
