// src/contexts/ApiUserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { availableUsers } from '../data/users';

interface ApiUserContextType {
  currentUser: User;
  availableUsers: User[];
  setCurrentUser: (user: User) => void;
  isLoading: boolean;
  showUserDropdown: boolean;
  handleUserSelect: (user: User) => void;
  toggleUserDropdown: () => void;
  setShowUserDropdown: (show: boolean) => void;
}

interface ApiUserProviderProps {
  children: ReactNode;
}

const ApiUserContext = createContext<ApiUserContextType | undefined>(undefined);

export const ApiUserProvider: React.FC<ApiUserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(availableUsers[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  useEffect(() => {
    // Initialize with first user
    setCurrentUser(availableUsers[0]);
  }, []);

  const handleUserSelect = (user: User): void => {
    setCurrentUser(user);
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = (): void => {
    setShowUserDropdown(!showUserDropdown);
  };

  const value: ApiUserContextType = {
    currentUser,
    availableUsers,
    setCurrentUser,
    isLoading,
    showUserDropdown,
    handleUserSelect,
    toggleUserDropdown,
    setShowUserDropdown,
  };

  return (
    <ApiUserContext.Provider value={value}>
      {children}
    </ApiUserContext.Provider>
  );
};

export const useUser = (): ApiUserContextType => {
  const context = useContext(ApiUserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an ApiUserProvider');
  }
  return context;
};
