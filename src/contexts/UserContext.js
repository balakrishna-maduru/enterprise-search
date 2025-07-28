// src/contexts/UserContext.js
import React, { createContext, useContext, useState } from 'react';
import { availableUsers } from '../data/users';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(availableUsers[0]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleUserSelect = (user) => {
    setCurrentUser(user);
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const value = {
    currentUser,
    availableUsers,
    showUserDropdown,
    handleUserSelect,
    toggleUserDropdown,
    setShowUserDropdown
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};