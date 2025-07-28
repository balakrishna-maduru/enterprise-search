// src/components/Layout/Header.js
import React from 'react';
import { MessageCircle } from 'lucide-react';
import UserSelector from '../User/UserSelector';
import ConnectionStatus from './ConnectionStatus';
import CompanyLogo from '../UI/CompanyLogo';
import { useBranding } from '../../contexts/BrandingContext';
import { useSearch } from '../../contexts/SearchContext';

const Header = ({ isChatOpen, setIsChatOpen }) => {
  const { getCompanyName, getColor } = useBranding();
  const { setSearchQuery, setSelectedResults } = useSearch();

  const handleLogoClick = () => {
    // Reset search state to return to root page
    // Setting searchQuery to empty string will trigger the useEffect in SearchContext
    // which automatically clears searchResults and conversationalSummary
    setSearchQuery('');
    setSelectedResults([]);
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
              title="Return to home page"
            >
              <CompanyLogo size="default" showText={false} />
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {getCompanyName()} Enterprise Search
                </h1>
                <p className="text-xs text-gray-500">
                  {getCompanyName('full')} - AI Powered
                </p>
              </div>
            </button>
            
            <ConnectionStatus />
          </div>
          
          <div className="flex items-center space-x-4">
            <UserSelector />
            
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isChatOpen 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={isChatOpen ? { backgroundColor: getColor('primary') } : {}}
            >
              <MessageCircle className="w-4 h-4" />
              <span>AI Chat</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;