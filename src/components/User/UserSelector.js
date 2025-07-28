// src/components/User/UserSelector.js
import React, { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useUnifiedUser } from '../../hooks/useUnifiedUser';

const UserSelector = () => {
  const { 
    currentUser, 
    availableUsers, 
    showUserDropdown, 
    handleUserSelect, 
    toggleUserDropdown,
    setShowUserDropdown
  } = useUnifiedUser();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown, setShowUserDropdown]);

  return (
    <div className="relative user-dropdown-container">
      <button
        onClick={toggleUserDropdown}
        className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <div className={`w-8 h-8 ${currentUser.color} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
          {currentUser.avatar}
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
          <div className="text-xs text-gray-600">{currentUser.position}</div>
          <div className="text-xs text-gray-500">{currentUser.department}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showUserDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Select User Profile</h3>
            <p className="text-xs text-gray-500">Switch context for different roles and departments</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`w-full flex items-center space-x-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left ${
                  currentUser.id === user.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className={`w-10 h-10 ${user.color} rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{user.name}</div>
                  <div className="text-xs text-gray-600 truncate">{user.position}</div>
                  <div className="text-xs text-gray-500 truncate">{user.department}</div>
                  <div className="text-xs text-gray-400 truncate">{user.email}</div>
                </div>
                {currentUser.id === user.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;