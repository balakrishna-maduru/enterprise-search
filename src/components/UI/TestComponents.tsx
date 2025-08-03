// src/components/UI/TestComponents.tsx
import React, { useState } from 'react';

export const UITestComponents: React.FC = () => {
  const [showTest, setShowTest] = useState(false);

  if (!showTest) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowTest(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
        >
          🧪 Test Components
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">🧪 Debug Panel</h2>
          <button
            onClick={() => setShowTest(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-semibold mb-2">Current Status:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>🔑 Auth Token: {localStorage.getItem('access_token') ? 'Present' : 'Missing'}</div>
              <div>👤 User: {JSON.parse(localStorage.getItem('user') || '{}').name || 'None'}</div>
              <div>🌐 URL: {window.location.href}</div>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
          >
            🔄 Reset & Reload
          </button>
        </div>
      </div>
    </div>
  );
};
