import React, { useState, useEffect } from 'react';
import { config } from '../../config';
import { useAuth } from '../../hooks/useAuth';

const AuthStatus = () => {
  // Don't show auth status if not using API layer
  if (!config.api.useApiLayer) {
    return null;
  }

  const { 
    isAuthenticated, 
    user, 
    availableUsers, 
    fetchAvailableUsers, 
    login, 
    logout 
  } = useAuth();
  
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showLogin && availableUsers.length === 0) {
      fetchAvailableUsers();
    }
  }, [showLogin, availableUsers.length, fetchAvailableUsers]);

  const handleLogin = async (selectedUser) => {
    setIsLoading(true);
    try {
      const result = await login(selectedUser.email);
      if (result.success) {
        setShowLogin(false);
      } else {
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogin(false);
  };

  // Don't show auth status if not using API layer
  if (!config.api.useApiLayer) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-3 w-3 rounded-full ${
              isAuthenticated ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-blue-800">
              {isAuthenticated ? (
                <>Authenticated as <strong>{user?.name}</strong> ({user?.position})</>
              ) : (
                'Not authenticated - using demo mode'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-red-100 hover:bg-red-200 text-red-800 text-xs px-3 py-1 rounded"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs px-3 py-1 rounded"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {showLogin && !isAuthenticated && (
        <div className="mt-4 border-t border-blue-200 pt-4">
          <p className="text-sm text-blue-700 mb-3">Select a user to authenticate:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {availableUsers.map((availableUser) => (
              <button
                key={availableUser.id}
                onClick={() => handleLogin(availableUser)}
                disabled={isLoading}
                className="text-left p-3 bg-white border rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium text-sm text-gray-900">
                  {availableUser.name}
                </div>
                <div className="text-xs text-gray-500">
                  {availableUser.position} • {availableUser.department}
                </div>
                <div className="text-xs text-blue-600 capitalize">
                  {availableUser.role}
                </div>
              </button>
            ))}
          </div>
          {isLoading && (
            <p className="text-sm text-blue-600 mt-2">Authenticating...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthStatus;