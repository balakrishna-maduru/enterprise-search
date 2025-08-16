// src/components/User/UserSelector.tsx
import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useUser } from '../../hooks/useUser';
// Removed availableUsers mock list; only show current user profile, no mock switching

const UserSelector: React.FC = () => {
  const { user: currentUser, updateUser } = useUser();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleUserSelect = (user: any) => {
    updateUser(user);
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown && !(event.target as Element)?.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserDropdown]);

  // Don't render if no current user
  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative user-dropdown-container">
      <button
        onClick={toggleUserDropdown}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
          </div>
          <span className="hidden sm:block">{currentUser.name}</span>
        </div>
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

  {/* Dropdown removed as we no longer provide mock user switching */}
    </div>
  );
};

export default UserSelector;
