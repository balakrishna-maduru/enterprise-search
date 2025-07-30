// src/components/Layout/ConnectionStatus.tsx
import React from 'react';
import { useSearch } from '../../contexts/SearchContext';

const ConnectionStatus: React.FC = () => {
  const { connectionStatus } = useSearch();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'testing': return 'bg-yellow-500';
      case 'unauthenticated': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      case 'testing': return 'Testing';
      case 'unauthenticated': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-gray-600">{getStatusText()}</span>
    </div>
  );
};

export default ConnectionStatus;
