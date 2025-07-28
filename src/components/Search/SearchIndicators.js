// src/components/Search/SearchIndicators.js
import React from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';

const SearchIndicators = () => {
  const { 
    searchQuery, 
    isConversationalMode, 
    connectionStatus, 
    searchMode, 
    testConnection,
    setSearchMode,
    setConnectionStatus 
  } = useSearch();

  const handleRetryConnection = () => {
    if (setSearchMode && setConnectionStatus && testConnection) {
      setSearchMode('live');
      setConnectionStatus('testing');
      testConnection();
    } else {
      console.warn('Connection retry functions not available');
      // Fallback: just call testConnection if available
      if (testConnection) {
        testConnection();
      }
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Conversational Mode Indicator */}
      {isConversationalMode && searchQuery && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <Bot className="w-4 h-4" />
          <span>AI-powered conversational search activated</span>
        </div>
      )}
      
      {/* Connection Error Warning */}
      {(connectionStatus === 'error' || searchMode === 'demo') && (
        <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium">Demo Mode Active:</span>
            <span className="ml-1">
              {connectionStatus === 'error' 
                ? 'Unable to connect to Elasticsearch. Using demo data.'
                : 'Using demo data for search results.'
              }
            </span>
            <button 
              onClick={handleRetryConnection}
              className="ml-2 text-orange-700 underline hover:text-orange-800 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchIndicators;