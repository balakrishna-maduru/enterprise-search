// src/components/Layout/Layout.tsx
import React from 'react';
import Header from './Header';
import SearchSection from '../Search/SearchSection';
import ResultsSection from '../Results/ResultsSection';
import { useSearch } from '../../contexts/SearchContext';

const Layout: React.FC = () => {
  const { searchResults } = useSearch();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <div className="flex-1 max-w-7xl mx-auto px-4 py-6 transition-all duration-300">
          <SearchSection />
          <ResultsSection />
        </div>
      </div>
    </div>
  );
};

export default Layout;
