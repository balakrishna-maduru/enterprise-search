// src/components/Layout/Header.tsx
import React from 'react';
import UserSelector from '../User/UserSelector';
import ConnectionStatus from './ConnectionStatus';
import CompanyLogo from '../UI/CompanyLogo';
import { useBranding } from '../../contexts/BrandingContext';
import { useSearch } from '../../contexts/SearchContext';

const Header: React.FC = () => {
  const { getCompanyName } = useBranding();
  const { setSearchQuery, setSelectedResults } = useSearch();

  const handleLogoClick = () => {
    // Reset search state to return to root page
    setSearchQuery('');
    setSelectedResults([]);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <div 
              className="cursor-pointer flex items-center space-x-3"
              onClick={handleLogoClick}
            >
              <CompanyLogo />
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  {getCompanyName('full')}
                </h1>
              </div>
            </div>
          </div>

          {/* Right Side - User Controls */}
          <div className="flex items-center space-x-4">
            <ConnectionStatus />
            <UserSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
