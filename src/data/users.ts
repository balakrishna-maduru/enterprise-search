// src/data/users.ts
import { User } from '../types';
import { userStore } from '../store/userStore';

const getCompanyDomain = (): string => {
  // Return a default domain since it's not in the config anymore
  return 'enterprise-search.com';
};

// Get the current user; do not fall back to demo users
export const getCurrentUserData = (): User | null => {
  const currentUser = userStore.getCurrentUser();
  return currentUser || null;
};

// Removed demo availableUsers; all user data must come from backend/auth store
