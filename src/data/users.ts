// src/data/users.ts
import { User } from '../types';
import { getCurrentUser } from '../store/userStore';

const getCompanyDomain = (): string => {
  // Return a default domain since it's not in the config anymore
  return 'enterprise-search.com';
};

// Get the current user with fallback for demo purposes
export const getCurrentUserData = (): User | null => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    return currentUser;
  }

  // Fallback demo user for development
  return {
    id: 'demo_user',
    name: 'Demo User',
    position: 'System Administrator',
    department: 'Administration',
    role: 'admin',
    company: 'DBS Bank',
    email: process.env.REACT_APP_DEFAULT_USER_EMAIL || 'admin@enterprise.com',
    preferences: {
      theme: 'light',
      notifications: true,
      searchMode: 'standard'
    }
  };
};

// Available users for demo/testing purposes only
// These should not be used for authentication or current user data
export const availableUsers: User[] = [
  {
    id: 'admin_user',
    name: 'Admin User',
    position: 'System Administrator',
    department: 'Administration',
    role: 'admin',
    company: 'DBS Bank',
    avatar: 'AU',
    email: `admin@${getCompanyDomain()}`,
    color: 'bg-red-800',
    preferences: {
      theme: 'light',
      notifications: true,
      searchMode: 'advanced'
    }
  },
  {
    id: 'sarah_chen',
    name: 'Sarah Chen',
    position: 'Senior Product Manager',
    department: 'Digital Banking',
    role: 'manager',
    company: 'DBS Bank',
    avatar: 'SC',
    email: `sarah.chen@${getCompanyDomain()}`,
    color: 'bg-red-600',
    preferences: {
      theme: 'light',
      notifications: true,
      searchMode: 'standard'
    }
  },
  {
    id: 'mike_rodriguez',
    name: 'Mike Rodriguez',
    position: 'Lead Software Engineer',
    department: 'Engineering',
    role: 'manager',
    company: 'DBS Bank',
    avatar: 'MR',
    email: `mike.rodriguez@${getCompanyDomain()}`,
    color: 'bg-red-600',
    preferences: {
      theme: 'dark',
      notifications: true,
      searchMode: 'advanced'
    }
  },
  {
    id: 'jennifer_tan',
    name: 'Jennifer Tan',
    position: 'VP Operations',
    department: 'Operations',
    role: 'executive',
    company: 'DBS Bank',
    avatar: 'JT',
    email: `jennifer.tan@${getCompanyDomain()}`,
    color: 'bg-green-600',
    preferences: {
      theme: 'light',
      notifications: true,
      searchMode: 'standard'
    }
  },
  {
    id: 'david_wong',
    name: 'David Wong',
    position: 'Security Architect',
    department: 'Information Security',
    role: 'manager',
    company: 'DBS Bank',
    avatar: 'DW',
    email: `david.wong@${getCompanyDomain()}`,
    color: 'bg-red-700',
    preferences: {
      theme: 'dark',
      notifications: true,
      searchMode: 'advanced'
    }
  },
  {
    id: 'lisa_kumar',
    name: 'Lisa Kumar',
    position: 'Marketing Director',
    department: 'Marketing',
    role: 'manager',
    company: 'DBS Bank',
    avatar: 'LK',
    email: `lisa.kumar@${getCompanyDomain()}`,
    color: 'bg-pink-600',
    preferences: {
      theme: 'light',
      notifications: true,
      searchMode: 'standard'
    }
  },
  {
    id: 'alex_thompson',
    name: 'Alex Thompson',
    position: 'Data Analyst',
    department: 'Business Intelligence',
    role: 'employee',
    company: 'DBS Bank',
    avatar: 'AT',
    email: `alex.thompson@${getCompanyDomain()}`,
    color: 'bg-red-800',
    preferences: {
      theme: 'light',
      notifications: true,
      searchMode: 'standard'
    }
  }
];
