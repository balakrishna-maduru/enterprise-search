// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { availableUsers } from '../data/users';

interface UserContextType {
  currentUser: User;
  availableUsers: User[];
  showUserDropdown: boolean;
  handleUserSelect: (user: User) => void;
  toggleUserDropdown: () => void;
  setShowUserDropdown: (show: boolean) => void;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(availableUsers[0]);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  const handleUserSelect = (user: User): void => {
    setCurrentUser(user);
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = (): void => {
    setShowUserDropdown(!showUserDropdown);
  };

  const value: UserContextType = {
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
