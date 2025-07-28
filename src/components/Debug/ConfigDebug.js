// src/components/Debug/ConfigDebug.js
import React, { useState } from 'react';
import { Eye, EyeOff, Settings } from 'lucide-react';
import { config } from '../../config';

const ConfigDebug = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  // Only show in development
  if (config.app.environment !== 'development' || !config.app.debug) {
    return null;
  }

  const maskSensitive = (value) => {
    if (!value) return 'Not set';
    if (showSensitive) return value;
    if (value.length <= 8) return '*'.repeat(value.length);
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Debug Configuration"
      >
        <Settings className="w-5 h-5" />
      </button>

      {showDebug && (
        <div className="absolute bottom-12 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Configuration Debug</h3>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="text-gray-500 hover:text-gray-700"
              title={showSensitive ? "Hide sensitive values" : "Show sensitive values"}
            >
              {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-4 text-sm">
            {/* Elasticsearch Config */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Elasticsearch</h4>
              <div className="space-y-1 pl-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Endpoint:</span>
                  <span className="font-mono text-xs">{config.elasticsearch.endpoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Key:</span>
                  <span className="font-mono text-xs">{maskSensitive(config.elasticsearch.apiKey)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Search App:</span>
                  <span className="font-mono text-xs">{config.elasticsearch.searchApplicationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Index:</span>
                  <span className="font-mono text-xs">{config.elasticsearch.index}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Use Search App:</span>
                  <span className="font-mono text-xs">{config.elasticsearch.useSearchApplication ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* OpenAI Config */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">OpenAI</h4>
              <div className="space-y-1 pl-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Endpoint:</span>
                  <span className="font-mono text-xs">{config.openai.endpoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Key:</span>
                  <span className="font-mono text-xs">{maskSensitive(config.openai.apiKey)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-mono text-xs">{config.openai.model}</span>
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Environment Variables</h4>
              <div className="space-y-1 pl-3 text-xs">
                <div className="grid grid-cols-1 gap-1">
                  {Object.keys(process.env)
                    .filter(key => key.startsWith('REACT_APP_'))
                    .sort()
                    .map(key => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-mono">
                          {key.includes('KEY') || key.includes('SECRET') 
                            ? maskSensitive(process.env[key]) 
                            : process.env[key] || 'Not set'
                          }
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            Environment: {config.app.environment} | Debug: {config.app.debug ? 'On' : 'Off'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigDebug;