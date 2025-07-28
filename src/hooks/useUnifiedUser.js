import { useContext } from 'react';
import { useUser as useLegacyUser } from '../contexts/UserContext';
import { useUser as useApiUser } from '../contexts/ApiUserContext';
import { config } from '../config';

export const useUnifiedUser = () => {
  // Try to use the appropriate context based on configuration
  try {
    if (config.api.useApiLayer) {
      // Try API context first
      return useApiUser();
    } else {
      // Use legacy context
      return useLegacyUser();
    }
  } catch (error) {
    // If the expected context fails, try the other one as fallback
    try {
      if (config.api.useApiLayer) {
        return useLegacyUser();
      } else {
        return useApiUser();
      }
    } catch (fallbackError) {
      // If both fail, return a guest user
      console.warn('No user context available, using guest user');
      return {
        currentUser: {
          id: 'guest',
          name: 'Guest User',
          email: 'guest@example.com',
          department: 'General',
          position: 'Guest',
          role: 'employee',
          company: 'Test Bank'
        },
        availableUsers: [],
        showUserDropdown: false,
        isAuthenticated: false,
        handleUserSelect: () => {},
        toggleUserDropdown: () => {},
        setShowUserDropdown: () => {},
        logout: () => {},
        refreshUsers: () => {}
      };
    }
  }
};