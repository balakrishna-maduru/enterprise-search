// src/components/Layout/Layout.tsx
import React, { useState } from 'react';
import Header from './Header';
import { Footer } from './Footer';
import { SearchSection } from '../Search';
import { UnifiedDocumentsPage } from '../Documents';
import DocumentChatPage from '../Chat/DocumentChatPage';
import DocumentSummaryPage from '../Summary/DocumentSummaryPage';
import { UITestComponents } from '../UI/TestComponents';
import { useSearch } from '../../contexts/SearchContext';

const Layout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'main' | 'chat'>('main');
  const [chatDocument, setChatDocument] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryDocument, setSummaryDocument] = useState<any>(null);
  const { searchResults, searchQuery } = useSearch();

  // Debug logging
  console.log('🏗️ Layout component rendered:', {
    currentPage,
    searchResults: searchResults?.length || 0,
    searchQuery,
    showSummary
  });

  const navigateToChat = (document?: any) => {
    setChatDocument(document);
    setCurrentPage('chat');
  };

  const navigateToMain = () => {
    setCurrentPage('main');
    setChatDocument(null);
  };

  const navigateToSummary = (document?: any) => {
    setSummaryDocument(document);
    setShowSummary(true);
  };

  const closeSummary = () => {
    setShowSummary(false);
    setSummaryDocument(null);
  };

  if (currentPage === 'chat') {
    return (
      <DocumentChatPage 
        isOpen={true}
        onClose={navigateToMain}
        initialDocument={chatDocument}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col relative">
      {/* Debug Banner - Very Visible */}
      <div className="bg-purple-600 text-white px-4 py-3 text-center font-bold text-lg">
        🔧 DEBUG: Layout Component Loaded | Page: {currentPage} | Results: {searchResults?.length || 0} | Query: "{searchQuery}"
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-white/60"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <Header />
      
      <div className="flex flex-1 relative z-10">
        <div className="flex-1 max-w-7xl mx-auto px-6 py-8 transition-all duration-300">
          <SearchSection />
          
          {/* Unified Documents Page - handles both landing and search */}
          <div className="mt-8">
            <UnifiedDocumentsPage onNavigateToChat={navigateToChat} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* AI Chat icon at bottom left */}
      <div className="fixed bottom-20 left-8 z-50">
        <button
          onClick={() => navigateToChat()}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          title="🤖 AI Chat - Ask me anything!"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Removed AI Summary icon at bottom left */}

      {/* Summary Modal */}
      <DocumentSummaryPage
        isOpen={showSummary}
        onClose={closeSummary}
        initialDocument={summaryDocument}
        searchResults={searchResults}
        searchQuery={searchQuery}
      />

      {/* UI Test Components */}
      <UITestComponents />
    </div>
  );
};

export default Layout;
