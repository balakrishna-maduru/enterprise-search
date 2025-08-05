// src/components/Auth/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, login, isLoggedIn } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔍 ProtectedRoute render:', { 
    hasUser: !!user,
    isLoggedIn,
    userEmail: user?.email || 'none'
  });

  // Check for existing authentication on mount
  useEffect(() => {
    console.log('🔍 ProtectedRoute useEffect triggered:', { isLoggedIn, user: !!user });
    
    // Check if user explicitly logged out
    const logoutRequested = localStorage.getItem('logout_requested');
    if (logoutRequested) {
      console.log('🚪 User logged out, redirecting to login');
      setIsLoading(false);
      return;
    }

    // Check if we already have a valid session
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData && !isLoggedIn) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('� Restoring user session from localStorage:', parsedUser);
        
        // Restore the user session without making API calls
        login(parsedUser, token);
      } catch (error) {
        console.error('❌ Failed to restore user session:', error);
        // Clear invalid data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('employee_data');
      }
    }
    
    setIsLoading(false);
  }, [isLoggedIn, user, login]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-800 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isLoggedIn || !user) {
    console.log('🚪 User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
