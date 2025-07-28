// src/components/Chat/ChatSidebar.js
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Search, Database } from 'lucide-react';
import { useUnifiedUser } from "../../hooks/useUnifiedUser";
import { useSearch } from '../../contexts/SearchContext';
import { useBranding } from '../../contexts/BrandingContext';
import { formatMarkdown } from '../../utils/markdownFormatter';

const ChatSidebar = ({ onClose }) => {
  const { currentUser } = useUnifiedUser();
  const { searchResults, generateChatResponse, searchElastic } = useSearch();
  const { getColor } = useBranding();

  // Early return if currentUser is not loaded
  if (!currentUser) {
    return null;
  }
  
  const [chatMessages, setChatMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [ragContext, setRagContext] = useState([]);
  const chatEndRef = useRef(null);

  // Initialize chat when component mounts or user changes
  useEffect(() => {
    setChatMessages([
      {
        type: 'bot',
        message: `Hello **${currentUser.name}**! As a *${currentUser.position}* in ${currentUser.department}, I can help you with questions about company documents and processes. I'll automatically search for relevant context when needed, or you can ask me about existing search results. What would you like to know?`,
        timestamp: new Date()
      }
    ]);
    setRagContext([]);
  }, [currentUser]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Prevent body scrolling when chat is open and handle keyboard shortcuts
  useEffect(() => {
    // Store original overflow value
    const originalOverflow = document.body.style.overflow;
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    
    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentInput.trim() || isLoading || !currentUser) return;

    const userMessage = {
      type: 'user',
      message: currentInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const userQuery = currentInput;
    setCurrentInput('');
    setIsLoading(true);

    try {
      let contextResults = searchResults;
      let searchedForContext = false;

      // If no search results are available, perform RAG search for context
      if (searchResults.length === 0) {
        setIsSearching(true);
        try {
          // Extract keywords from the user query for better search
          const searchQuery = extractSearchKeywords(userQuery);
          
          const ragResults = await searchElastic(searchQuery, {
            source: [],
            dateRange: 'all',
            contentType: []
          }, currentUser);
          
          contextResults = ragResults.slice(0, 10); // Limit to top 10 results
          setRagContext(contextResults);
          searchedForContext = true;
          
          // Add a system message about the search
          if (contextResults.length > 0) {
            setChatMessages(prev => [...prev, {
              type: 'system',
              message: `🔍 Searched for context and found ${contextResults.length} relevant documents to help answer your question.`,
              timestamp: new Date(),
              searchQuery: searchQuery,
              resultsCount: contextResults.length
            }]);
          }
        } catch (searchError) {
          console.error('RAG search error:', searchError);
          // Continue without context if search fails
        } finally {
          setIsSearching(false);
        }
      }

      // Get conversation history for context
      const conversationHistory = chatMessages.slice(-5).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.message
      }));

      const botResponse = await generateChatResponse(
        userQuery,
        contextResults,
        currentUser,
        conversationHistory
      );

      setChatMessages(prev => [...prev, {
        type: 'bot',
        message: botResponse,
        timestamp: new Date(),
        contextUsed: contextResults.length > 0,
        ragSearch: searchedForContext,
        contextSources: contextResults.length > 0 ? [...new Set(contextResults.map(r => r.source))] : []
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        type: 'bot',
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Helper function to extract search keywords from user query
  const extractSearchKeywords = (query) => {
    // Remove common question words and extract meaningful keywords
    const stopWords = ['what', 'how', 'why', 'when', 'where', 'who', 'tell', 'me', 'about', 'explain', 'show', 'find', 'help', 'can', 'you', 'please', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Return the most relevant keywords, prioritizing longer words
    return words.slice(0, 5).join(' ') || query;
  };

  return (
    <div className="fixed right-0 top-0 w-full sm:w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg h-full z-50 transform transition-transform duration-300 ease-out" style={{ height: '100vh' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" style={{ color: getColor('primary') }} />
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Hello {currentUser.name}, ask questions about documents and processes using AI
        </p>
        <div className="text-xs text-gray-500 mt-1">
          Context: {currentUser.position} in {currentUser.department}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-full">
        {chatMessages.map((message, index) => (
          <ChatMessage key={index} message={message} searchResultsCount={searchResults.length} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" style={{ color: getColor('primary') }} />
                <span className="text-xs font-medium">AI Assistant</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2" style={{ borderColor: getColor('primary') }}></div>
                <span className="text-sm">
                  {isSearching ? 'Searching for context...' : 'Analyzing with AI...'}
                </span>
              </div>
              {isSearching && (
                <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                  <Search className="w-3 h-3" />
                  <span>Finding relevant documents</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Ask me anything about company documents..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!currentInput.trim() || isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            style={{ backgroundColor: getColor('primary') }}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        
        {searchResults.length === 0 && ragContext.length === 0 && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            💡 Ask me anything - I'll search for relevant context automatically
          </div>
        )}
        
        {ragContext.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            🔍 Using {ragContext.length} documents from search as context
          </div>
        )}
      </div>
    </div>
  );
};

const ChatMessage = ({ message, searchResultsCount }) => {
  const { getColor } = useBranding();
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  
  // System messages (search notifications)
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg max-w-xs text-center border border-blue-200">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium">System</span>
          </div>
          <div className="text-sm">{message.message}</div>
          {message.searchQuery && (
            <div className="text-xs mt-1 opacity-75">
              Query: "{message.searchQuery}"
            </div>
          )}
          <div className="text-xs mt-1 opacity-50">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[280px] px-4 py-2 rounded-lg break-words ${
        isUser 
          ? 'bg-primary-600 text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}
        style={isUser ? { backgroundColor: getColor('primary') } : {}}
      >
        {/* Message header */}
        <div className="flex items-center space-x-2 mb-1">
          {isUser ? (
            <User className="w-4 h-4 text-white flex-shrink-0" />
          ) : (
            <Bot className="w-4 h-4" style={{ color: getColor('primary') }} />
          )}
          <span className="text-xs font-medium">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
        </div>
        
        {/* Message content with markdown formatting */}
        <div className={`text-sm ${isUser ? 'text-white' : 'text-gray-800'} overflow-wrap-anywhere`}>
          {isUser ? (
            // For user messages, keep simple text formatting but allow word breaking
            <div className="whitespace-pre-wrap break-words">{message.message}</div>
          ) : (
            // For bot messages, apply full markdown formatting with word breaking
            <div className="chat-message-content overflow-hidden">
              {formatMarkdown(message.message)}
            </div>
          )}
        </div>
        
        {/* Context indicator */}
        {message.contextUsed && (
          <div className="text-xs mt-1 opacity-75">
            {message.ragSearch ? (
              <div className="flex items-center space-x-1">
                <Search className="w-3 h-3" />
                <span>Found {searchResultsCount || message.contextSources?.length || 0} documents</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>Used {searchResultsCount} documents</span>
              </div>
            )}
          </div>
        )}
        
        {/* Context sources */}
        {message.contextSources && message.contextSources.length > 0 && (
          <div className="text-xs mt-1 opacity-75">
            Sources: {message.contextSources.join(', ')}
          </div>
        )}
        
        {/* Error indicator */}
        {message.error && (
          <div className="text-xs mt-1 text-red-300">
            ⚠️ Error occurred
          </div>
        )}
        
        {/* Timestamp */}
        <div className="text-xs mt-1 opacity-50">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;