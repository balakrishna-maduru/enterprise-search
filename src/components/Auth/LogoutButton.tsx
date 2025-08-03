// src/components/Auth/LogoutButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = "w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors",
  children 
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Set a flag to prevent auto-login after logout
    localStorage.setItem('logout_requested', 'true');
    
    // Redirect to login
    navigate('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className={className}
    >
      {children || (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </>
      )}
    </button>
  );
};

export default LogoutButton;
