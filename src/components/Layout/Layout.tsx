import React, { useState } from 'react';
import Header from './Header';
import { Footer } from './Footer';
import { FiChevronLeft, FiChevronRight, FiSearch, FiMessageCircle } from 'react-icons/fi';
import { SearchSection } from '../Search/SearchSection';
import { UnifiedDocumentsPage } from '../Documents/UnifiedDocumentsPage';
import ChatInterface from '../Chat/ChatInterface';
import DocumentChatPage from '../Chat/DocumentChatPage';
import DocumentSummaryPage from '../Summary/DocumentSummaryPage';

const Layout: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState<'main' | 'chat'>('main');
  const [chatDocument, setChatDocument] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryDocument, setSummaryDocument] = useState<any>(null);

  const navigateToChat = (document?: any, initialQuestion?: string) => {
    setChatDocument(document ? { ...document, initialQuestion } : null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col relative">
      <div className="absolute inset-0 opacity-40 pointer-events-none select-none">
        <div className="absolute inset-0 bg-white/60"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <Header />
      </div>

      <div className="flex flex-1 relative z-10 pt-20 pb-24">
        {/* Fixed Sidebar */}
        <div className={`flex flex-col bg-white border-r-2 border-red-600 shadow-lg transition-all duration-300 ${sidebarExpanded ? 'w-36' : 'w-10'} min-h-screen fixed top-20 left-0 z-40`} style={{height: 'calc(100vh - 5rem - 6rem)'}}>
          <button
            className="group flex items-center h-12 w-full hover:bg-red-700 focus:outline-none text-red-600 bg-white border-b border-red-600 px-2 transition-colors duration-150 justify-start"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            title={sidebarExpanded ? 'Collapse' : 'Expand'}
          >
            {sidebarExpanded
              ? <FiChevronLeft size={20} className="transition-colors group-hover:text-white" />
              : <FiChevronRight size={20} className="transition-colors group-hover:text-white" />}
            {sidebarExpanded && (
              <span className="ml-2 text-sm font-medium transition-colors px-2 py-1 rounded group-hover:bg-red-700 group-hover:text-white">
                K.U.T.E
              </span>
            )}
          </button>
          <button
            className={`flex items-center gap-2 px-2 py-3 w-full focus:outline-none transition-colors duration-150 justify-start ${currentPage === 'main' ? 'bg-white text-red-600 border-l-4 border-red-600 font-bold' : 'text-red-600 hover:bg-red-700'} `}
            onClick={() => setCurrentPage('main')}
            title="Search"
          >
            <FiSearch size={22} color={currentPage === 'main' ? '#ED1C24' : '#ED1C24'} />
            {sidebarExpanded && <span className="text-sm">Search</span>}
          </button>
          <button
            className={`flex items-center gap-2 px-2 py-3 w-full focus:outline-none transition-colors duration-150 justify-start ${currentPage === 'chat' ? 'bg-white text-red-600 border-l-4 border-red-600 font-bold' : 'text-red-600 hover:bg-red-700'} `}
            onClick={() => {
              setChatDocument(null);
              setCurrentPage('chat');
            }}
            title="Chat"
          >
            <FiMessageCircle size={22} color={currentPage === 'chat' ? '#ED1C24' : '#ED1C24'} />
            {sidebarExpanded && <span className="text-sm">Chat</span>}
          </button>
        </div>
  {/* Main Content */}
  <div className="flex-1 max-w-7xl mx-auto px-6 py-8 pb-60 transition-all duration-300 overflow-y-auto" style={{maxHeight: 'calc(100vh - 5rem - 10rem)', marginLeft: sidebarExpanded ? '9rem' : '2.5rem'}}>
          {currentPage === 'main' && (
            <>
              <SearchSection />
              <div className="mt-8">
                <UnifiedDocumentsPage 
                  onNavigateToChat={navigateToChat} 
                  onNavigateToSummary={navigateToSummary}
                />
              </div>
            </>
          )}
          {currentPage === 'chat' && !chatDocument && (
            <div className="h-full">
              <ChatInterface onClose={navigateToMain} />
            </div>
          )}
          {currentPage === 'chat' && chatDocument && (
            <DocumentChatPage 
              isOpen={true}
              onClose={navigateToMain}
              document={chatDocument}
            />
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed left-0 right-0 bottom-0 z-30">
        <Footer />
      </div>

      {/* Summary Modal */}
      <DocumentSummaryPage
        isOpen={showSummary}
        onClose={closeSummary}
        initialDocument={summaryDocument}
        onAskQuestion={(question, doc) => {
          setShowSummary(false);
          navigateToChat(doc, question);
        }}
      />
    </div>
  );
};

export default Layout;
