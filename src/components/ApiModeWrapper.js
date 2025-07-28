import React from 'react';
import { config } from '../config';
import { AuthProvider } from '../hooks/useAuth';
import { ApiUserProvider } from '../contexts/ApiUserContext';
import { UserProvider } from '../contexts/UserContext';

const ApiModeWrapper = ({ children }) => {
  if (config.api.useApiLayer) {
    // Use new API layer with authentication
    return (
      <AuthProvider>
        <ApiUserProvider>
          {children}
        </ApiUserProvider>
      </AuthProvider>
    );
  } else {
    // Use legacy direct mode
    return (
      <UserProvider>
        {children}
      </UserProvider>
    );
  }
};

export default ApiModeWrapper;