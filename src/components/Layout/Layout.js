// src/components/Layout/Layout.js
import React, { useState } from 'react';
import Header from './Header';
import SearchSection from '../Search/SearchSection';
import ResultsSection from '../Results/ResultsSection';
import ChatSidebar from '../Chat/ChatSidebar';
import SummaryModal from '../Summary/SummaryModal';
import ConfigDebug from '../Debug/ConfigDebug';
import { useSearch } from '../../contexts/SearchContext';

const Layout = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const { searchResults } = useSearch();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
      
      <div className="flex flex-1">
        <div className={`flex-1 max-w-7xl mx-auto px-4 py-6 transition-all duration-300 ${
          isChatOpen ? 'sm:mr-96' : ''
        }`}>
          <SearchSection />
          <ResultsSection 
            showSummaryModal={showSummaryModal}
            setShowSummaryModal={setShowSummaryModal}
          />
        </div>
      </div>

      {isChatOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity duration-300 sm:bg-opacity-20 bg-opacity-50"
            onClick={() => setIsChatOpen(false)}
          />
          <ChatSidebar onClose={() => setIsChatOpen(false)} />
        </>
      )}

      {showSummaryModal && (
        <SummaryModal onClose={() => setShowSummaryModal(false)} />
      )}

      <ConfigDebug />
    </div>
  );
};

export default Layout;