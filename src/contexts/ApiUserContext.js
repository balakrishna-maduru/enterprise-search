import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const ApiUserContext = createContext();

export const useUser = () => {
  const context = useContext(ApiUserContext);
  if (!context) {
    throw new Error('useUser must be used within an ApiUserProvider');
  }
  return context;
};

export const ApiUserProvider = ({ children }) => {
  const { 
    user: authenticatedUser, 
    availableUsers, 
    fetchAvailableUsers, 
    login, 
    logout, 
    isAuthenticated 
  } = useAuth();
  
  const [currentUser, setCurrentUser] = useState(authenticatedUser);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    setCurrentUser(authenticatedUser);
  }, [authenticatedUser]);

  useEffect(() => {
    if (availableUsers.length === 0) {
      fetchAvailableUsers();
    }
  }, [availableUsers.length, fetchAvailableUsers]);

  // Auto-select first user (Balu) when users are loaded and no user is authenticated
  useEffect(() => {
    if (availableUsers.length > 0 && !authenticatedUser && !currentUser) {
      const firstUser = availableUsers[0]; // This should be Balu
      handleUserSelect(firstUser);
    }
  }, [availableUsers, authenticatedUser, currentUser]);

  const handleUserSelect = async (user) => {
    try {
      const result = await login(user.email);
      if (result.success) {
        setCurrentUser(result.user);
        setShowUserDropdown(false);
      } else {
        console.error('User selection failed:', result.error);
      }
    } catch (error) {
      console.error('User selection error:', error);
    }
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setShowUserDropdown(false);
  };

  const value = {
    currentUser: currentUser || {
      id: 'guest',
      name: 'Guest User',
      email: 'guest@example.com',
      department: 'General',
      position: 'Guest',
      role: 'employee',
      company: 'Test Bank'
    },
    availableUsers,
    showUserDropdown,
    isAuthenticated,
    handleUserSelect,
    toggleUserDropdown,
    setShowUserDropdown,
    logout: handleLogout,
    refreshUsers: fetchAvailableUsers
  };

  return (
    <ApiUserContext.Provider value={value}>
      {children}
    </ApiUserContext.Provider>
  );
};