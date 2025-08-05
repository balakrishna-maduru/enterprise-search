// src/hooks/useUser.ts
import { useState, useEffect } from 'react';
import { userStore } from '../store/userStore';
import { User } from '../types/index';

export const useUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(userStore.getCurrentUser());

  useEffect(() => {
    // Subscribe to user changes
    const unsubscribe = userStore.subscribe((user) => {
      setCurrentUser(user);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const login = (user: User, token: string) => {
    console.log('🔒 Login called with token:', token ? token.substring(0, 20) + '...' : 'null');
    localStorage.setItem('access_token', token);
    console.log('✅ Token stored in localStorage');
    userStore.setCurrentUser(user);
  };

  const logout = () => {
    userStore.clearUser();
  };

  const updateUser = (user: User) => {
    userStore.setCurrentUser(user);
  };

  return {
    user: currentUser,
    email: currentUser?.email || null,
    name: currentUser?.name || '',
    role: currentUser?.role || 'employee',
    department: currentUser?.department || '',
    position: currentUser?.position || '',
    company: currentUser?.company || '',
    isLoggedIn: userStore.isLoggedIn(),
    login,
    logout,
    updateUser
  };
};
