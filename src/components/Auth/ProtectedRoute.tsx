// src/components/Auth/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, login, isLoggedIn } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  console.log('🔍 ProtectedRoute render:', { 
    hasUser: !!user,
    isLoggedIn,
    isAuthenticating,
    authError,
    userEmail: user?.email || 'none'
  });

  // Auto-login for development mode
  useEffect(() => {
    console.log('🔍 ProtectedRoute useEffect triggered:', { isLoggedIn, user: !!user });
    
    // Check if user explicitly logged out
    const logoutRequested = localStorage.getItem('logout_requested');
    if (logoutRequested) {
      console.log('🚪 User logged out, not auto-authenticating');
      return;
    }
    
    if (!isLoggedIn || !user) {
      console.log('🔧 Development Mode: Auto-authenticating with real API...');
      setIsAuthenticating(true);
      setAuthError(null);
      
      // Use environment variable or config for default user email
      const defaultEmail = process.env.REACT_APP_DEFAULT_USER_EMAIL || 'admin@enterprise.com';
      
      // Get real JWT token from API
      fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: defaultEmail,
          name: 'Admin User',
          department: 'Administration',
          position: 'System Administrator',
          role: 'admin',
          company: 'Enterprise'
        })
      })
      .then(response => {
        console.log('🔍 Auth response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('🔍 Auth response data:', data);
        if (data.access_token && data.user) {
          console.log('✅ Real JWT token obtained:', data.access_token.substring(0, 20) + '...');
          
          const enhancedUser = {
            ...data.user,
            position: data.user.position || 'System Administrator',
            department: data.user.department || 'Engineering',
            role: data.user.role || 'admin',
            company: data.user.company || 'DBS Bank'
          };
          
          // Use centralized user management
          login(enhancedUser, data.access_token);
          localStorage.removeItem('logout_requested'); // Clear logout flag on successful auth
          
          console.log('🚀 Auto-login successful');
          // Removed automatic reload to test authentication flow
          // setTimeout(() => {
          //   window.location.reload();
          // }, 100);
        } else {
          console.error('❌ Authentication failed:', data);
          setAuthError('Authentication failed: ' + (data.detail || 'Unknown error'));
          setIsAuthenticating(false);
        }
      })
      .catch(error => {
        console.error('❌ Auth request failed:', error);
        setAuthError('Authentication request failed: ' + error.message);
        setIsAuthenticating(false);
      });
    }
  }, [isLoggedIn, user, login]);

  // Show loading while authenticating
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-800 font-medium">🔧 Setting up development environment...</p>
          <p className="text-red-600 text-sm mt-2">Getting real authentication token from API...</p>
          {authError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-700 text-sm max-w-md">
              {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isLoggedIn || !user) {
    if (authError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Authentication Error</h2>
            <div className="p-4 bg-red-100 border border-red-200 rounded text-red-700 mb-4">
              {authError}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-2"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload(); 
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Clear & Retry
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
