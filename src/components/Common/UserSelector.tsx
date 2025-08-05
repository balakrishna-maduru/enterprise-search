// src/components/User/UserSelector.tsx
import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { availableUsers } from '../../data/users';

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

      {showUserDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentUser.id === user.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.position}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
