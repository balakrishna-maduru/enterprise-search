import React, { ReactNode } from 'react';
import { config } from '../config';
// Remove the conflicting AuthProvider import
import { ApiUserProvider } from '../contexts/ApiUserContext';
import { UserProvider } from '../contexts/UserContext';

interface ApiModeWrapperProps {
  children: ReactNode;
}

const ApiModeWrapper: React.FC<ApiModeWrapperProps> = ({ children }) => {
  if (config.api.useApiLayer) {
    // Use new API layer - AuthProvider is already wrapped at App level
    return (
      <ApiUserProvider>
        {children}
      </ApiUserProvider>
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
