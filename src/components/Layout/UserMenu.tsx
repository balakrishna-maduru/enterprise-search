// src/components/Layout/UserMenu.tsx
import React from 'react';
import { User } from '../../types';
import { Button, Icon } from '../UI';
import { useClickOutside } from '../../hooks/useClickOutside';

interface UserMenuProps {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, isOpen, onToggle, onClose }) => {
  const menuRef = useClickOutside<HTMLDivElement>(onClose, isOpen);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200"
      >
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-blue-100">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</div>
          <div className="text-xs text-gray-500">{user?.position || 'Employee'}</div>
        </div>
        <Icon 
          name={isOpen ? "chevronUp" : "chevronDown"} 
          size="sm" 
          color="secondary" 
          className="transition-transform duration-200"
        />
      </button>

      {/* User Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/30">
                  <span className="text-white font-semibold text-lg">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div className="text-white">
                <div className="font-semibold">{user?.name || 'User'}</div>
                <div className="text-blue-100 text-sm">{user?.email || 'user@company.com'}</div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</label>
                <p className="text-gray-700 mt-1">{user?.department || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</label>
                <p className="text-gray-700 mt-1">{user?.company || 'Enterprise'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  <span className="text-green-600 text-sm font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <Icon name="menu" size="sm" color="primary" className="mr-2" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" className="justify-start">
                <Icon name="document" size="sm" className="mr-1" />
                My Docs
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <Icon name="user" size="sm" className="mr-1" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <Icon name="search" size="sm" className="mr-1" />
                History
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <Icon name="menu" size="sm" className="mr-1" />
                Settings
              </Button>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 p-4">
            <Button variant="danger" size="sm" className="w-full justify-center">
              <Icon name="close" size="sm" className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
