import React, { ReactNode } from 'react';

interface ApiModeWrapperProps {
  children: ReactNode;
}

// This wrapper is now simplified since we use centralized user management
// All user management is handled by the userStore and useUser hook
const ApiModeWrapper: React.FC<ApiModeWrapperProps> = ({ children }) => {
  // Simply pass through children - user management is now centralized
  return <>{children}</>;
};

export default ApiModeWrapper;
