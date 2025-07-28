// src/components/Layout/ConnectionStatus.js
import React from 'react';
import { Zap } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { config } from '../../config';

const ConnectionStatus = () => {
  const { connectionStatus, searchMode } = useSearch();

  const getStatusStyles = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'testing':
        return 'bg-blue-100 text-blue-800';
      case 'disconnected':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getDotStyles = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'testing':
        return 'bg-blue-500';
      case 'disconnected':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusStyles()}`}>
        <div className={`w-2 h-2 rounded-full ${getDotStyles()}`}></div>
        <span className="capitalize">{connectionStatus}</span>
        {searchMode === 'demo' && <span className="ml-1">(Demo)</span>}
      </div>
      
      {/* Semantic Search Indicator */}
      {config.elasticsearch.semanticEnabled && connectionStatus === 'connected' && searchMode !== 'demo' && (
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800" title="Semantic search enabled with e5 model">
          <Zap className="w-3 h-3" />
          <span>Semantic</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;