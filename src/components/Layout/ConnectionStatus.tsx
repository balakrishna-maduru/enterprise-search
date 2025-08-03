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
};

export default ConnectionStatus;
