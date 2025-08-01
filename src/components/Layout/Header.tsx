// src/components/Layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import ConnectionStatus from './ConnectionStatus';
import CompanyLogo from '../Common/CompanyLogo';
import { useBranding } from '../../contexts/BrandingContext';
import { useSearch } from '../../contexts/SearchContext';
import { useDBSTheme } from '../../hooks/useDBSTheme';
import { useUnifiedUser } from '../../hooks/useUnifiedUser';

const Header: React.FC = () => {
  const { getCompanyName } = useBranding();
  const { setSearchQuery, setSelectedResults } = useSearch();
  const { company, classes } = useDBSTheme();
  const { currentUser } = useUnifiedUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogoClick = () => {
    // Reset search state to return to root page
    setSearchQuery('');
    setSelectedResults([]);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 relative z-20">
      {/* DBS Red gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 dbs-gradient-header"></div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <div 
              className={`cursor-pointer flex items-center space-x-4 group transition-all duration-200 ${classes.hover.scale}`}
              onClick={handleLogoClick}
            >
              <CompanyLogo />
              <div className="hidden sm:block">
                <h1 className={`text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:${classes.text.gradient} transition-all duration-300`}>
                  {getCompanyName('full')}
                </h1>
                <p className="text-xs text-gray-500 font-medium">{company.tagline}</p>
              </div>
            </div>
          </div>

          {/* Right Side - User Profile */}
          <div className="flex items-center space-x-6">
            <ConnectionStatus />
            <div className="relative" ref={userMenuRef}>
              <div 
                className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-blue-100">
                    <span className="text-white font-semibold text-sm">
                      {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  {/* Online status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900">{currentUser?.name || 'User'}</div>
                  <div className="text-xs text-gray-500">{currentUser?.position || 'Employee'}</div>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/30">
                          <span className="text-white font-semibold text-lg">
                            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-base">{currentUser?.name || 'User'}</h3>
                        <p className="text-blue-100 text-sm">{currentUser?.position || 'Employee'}</p>
                        <p className="text-blue-200 text-xs">{currentUser?.email || 'user@company.com'}</p>
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="p-4 border-b border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</label>
                        <p className="text-gray-700 mt-1">{currentUser?.department || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
                        <p className="text-gray-700 mt-1 capitalize">{currentUser?.role || 'Employee'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</label>
                        <p className="text-gray-700 mt-1">{currentUser?.company || 'Enterprise'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          <span className="text-green-600 text-sm font-medium">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        My Docs
                      </button>
                      <button className="flex items-center justify-center px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        History
                      </button>
                      <button className="flex items-center justify-center px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Favorites
                      </button>
                      <button className="flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 p-4">
                    <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
